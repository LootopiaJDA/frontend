import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors, Design, Fonts, Sp, R } from '@/constants/theme';
import PageHeader from '@/components/PageHeader';
import ScreenBackground from '@/components/ScreenBackground';
import { chasseService, scoreService } from '@/services/api';
import { UserChasse, ScoreBoard } from '@/constants/types';

interface PlayerStats {
    completed: number;
    inProgress: number;
    totalPoints: number;
}

export default function ProfilJoueurScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<PlayerStats>({ completed: 0, inProgress: 0, totalPoints: 0 });
    const [completedHunts, setCompletedHunts] = useState<UserChasse[]>([]);

    useEffect(() => {
        if (!user) return;
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const [{ chasses }, scores] = await Promise.all([
                chasseService.getMe(),
                scoreService.getAll().catch(() => [] as ScoreBoard[]),
            ]);

            let completed = 0;
            let inProgress = 0;
            const done: UserChasse[] = [];

            chasses.forEach(uc => {
                if (uc.statut === 'COMPLETED') {
                    completed++;
                    done.push(uc);
                } else if (uc.statut === 'IN_PROGRESS') {
                    inProgress++;
                }
            });

            const myScores = (scores as ScoreBoard[]).filter(s => s.id_user === user!.id_user);
            const totalPoints = myScores.reduce((acc, s) => acc + s.score * 100, 0);

            setStats({ completed, inProgress, totalPoints });
            setCompletedHunts(done.sort((a, b) => {
                const da = a.completed_at ? new Date(a.completed_at).getTime() : 0;
                const db = b.completed_at ? new Date(b.completed_at).getTime() : 0;
                return db - da;
            }));
        } catch {
            /* silently fail */
        }
    };

    if (!user) return null;

    const initials = user.username.slice(0, 2).toUpperCase();

    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Déconnexion',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/(auth)/welcome');
                },
            },
        ]);
    };

    const menuItems = [
        { icon: 'podium-outline',  label: 'Scores & Résultats',  onPress: () => router.push('/(app)/resultats') },
        { icon: 'map-outline',     label: 'Chasses en cours',    onPress: () => router.push('/(app)/map') },
    ];

    return (
        <ScreenBackground style={st.safe}>
            <ScrollView
                contentContainerStyle={st.scroll}
                showsVerticalScrollIndicator={false}
            >
                <PageHeader title="Mon profil" subtitle="Joueur" />

                {/* Hero avatar */}
                <View style={st.hero}>
                    <View style={st.avatarWrap}>
                        <View style={st.avatar}>
                            <Text style={st.avatarText}>{initials}</Text>
                        </View>
                        <View style={st.avatarRing} />
                    </View>

                    <Text style={st.username}>{user.username}</Text>
                    <Text style={st.email}>{user.email}</Text>
                </View>

                {/* Stats rapides */}
                <View style={st.statsRow}>
                    <View style={st.statItem}>
                        <Text style={st.statVal}>{stats.completed}</Text>
                        <Text style={st.statLabel}>Chasses{'\n'}terminées</Text>
                    </View>
                    <View style={[st.statItem, st.statBorder]}>
                        <Text style={st.statVal}>{stats.inProgress}</Text>
                        <Text style={st.statLabel}>En{'\n'}cours</Text>
                    </View>
                    <View style={st.statItem}>
                        <Text style={[st.statVal, st.statValGold]}>{stats.totalPoints}</Text>
                        <Text style={st.statLabel}>Points{'\n'}gagnés</Text>
                    </View>
                </View>

                {/* Chasses terminées */}
                {completedHunts.length > 0 && (
                    <>
                        <View style={st.sectionHeader}>
                            <View style={st.sectionLine} />
                            <Text style={st.sectionTitle}>CHASSES TERMINÉES</Text>
                            <View style={st.sectionLine} />
                        </View>

                        <View style={st.huntsList}>
                            {completedHunts.map((uc) => (
                                <View key={uc.id_userchasse} style={st.huntCard}>
                                    <View style={st.huntIcon}>
                                        <Ionicons name="trophy" size={18} color={Colors.gold} />
                                    </View>
                                    <View style={st.huntInfo}>
                                        <Text style={st.huntName} numberOfLines={1}>
                                            {uc.chasse?.name ?? `Chasse #${uc.id_chasse}`}
                                        </Text>
                                        {uc.completed_at && (
                                            <Text style={st.huntDate}>
                                                Terminée le {new Date(uc.completed_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                })}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={st.huntBadge}>
                                        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Menu */}
                <View style={st.menuCard}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[st.menuItem, i < menuItems.length - 1 && st.menuBorder]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={st.menuIcon}>
                                <Ionicons name={item.icon as any} size={18} color={Design.text.label} />
                            </View>
                            <Text style={st.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={15} color={Design.text.meta} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={st.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenBackground>
    );
}

const st = StyleSheet.create({
    safe: { flex: 1 },

    scroll: {
        flexGrow: 1,
        paddingBottom: Sp.xl,
    },

    hero:       { alignItems: 'center', paddingVertical: Sp.xl, gap: Sp.sm },
    avatarWrap: { position: 'relative', marginBottom: Sp.sm },
    avatar:     {
        width: 88, height: 88, borderRadius: 28,
        backgroundColor: Design.bg.elevated,
        borderWidth: 2, borderColor: Colors.gold + '44',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
    },
    avatarRing: {
        position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
        borderRadius: 34, borderWidth: 1, borderColor: Colors.gold + '20',
    },
    avatarText: { fontFamily: Fonts.display, fontSize: 26, color: Design.text.accent },
    username:   { fontFamily: Fonts.display, fontSize: 20, color: Design.text.heading, letterSpacing: 1 },
    email:      { fontFamily: Fonts.title,   fontSize: 12, color: Design.text.accent, letterSpacing: 1 },

    statsRow:   {
        flexDirection: 'row',
        marginHorizontal: Sp.lg, marginBottom: Sp.lg,
        backgroundColor: Design.bg.card,
        borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm,
        overflow: 'hidden',
    },
    statItem:    { flex: 1, alignItems: 'center', padding: Sp.md, gap: 4 },
    statBorder:  { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Design.border.warm },
    statVal:     { fontFamily: Fonts.display, fontSize: 22, color: Design.text.accent },
    statValGold: { color: Colors.gold },
    statLabel:   { fontFamily: Fonts.title, fontSize: 10, color: Design.text.meta, textAlign: 'center', lineHeight: 16 },

    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.md,
        marginHorizontal: Sp.lg, marginBottom: Sp.md,
    },
    sectionLine:  { flex: 1, height: 1, backgroundColor: Design.border.warm },
    sectionTitle: {
        fontFamily: Fonts.title, fontSize: 10, color: Colors.gold,
        letterSpacing: 2, textAlign: 'center',
    },

    huntsList: { marginHorizontal: Sp.lg, marginBottom: Sp.lg, gap: Sp.sm },
    huntCard:  {
        flexDirection: 'row', alignItems: 'center', gap: Sp.md,
        backgroundColor: Design.bg.card, borderRadius: R.lg,
        borderWidth: 1, borderColor: Design.border.warm,
        padding: Sp.md,
    },
    huntIcon: {
        width: 36, height: 36, borderRadius: R.sm,
        backgroundColor: Colors.goldGlow,
        borderWidth: 1, borderColor: Colors.gold + '44',
        alignItems: 'center', justifyContent: 'center',
    },
    huntInfo:  { flex: 1 },
    huntName:  { fontFamily: Fonts.title, fontSize: 13, color: Design.text.heading },
    huntDate:  { fontFamily: Fonts.title, fontSize: 10, color: Design.text.meta, marginTop: 2 },
    huntBadge: { paddingLeft: Sp.sm },

    menuCard:   {
        marginHorizontal: Sp.lg, marginBottom: Sp.lg,
        backgroundColor: Design.bg.card,
        borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm,
        overflow: 'hidden',
    },
    menuItem:   { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: Design.border.warm },
    menuIcon:   {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: Design.bg.elevated,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel:  { flex: 1, fontFamily: Fonts.title, fontSize: 13, color: Design.text.heading },

    logoutBtn:  {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Sp.sm, marginHorizontal: Sp.lg,
        backgroundColor: Design.bg.danger,
        borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44',
        padding: Sp.md,
    },
    logoutText: { fontFamily: Fonts.title, color: Colors.error, fontSize: 14 },
});
