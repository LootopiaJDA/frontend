import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors, Fonts, Sp, R } from '@/constants/theme';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import ScreenBackground from '@/components/ScreenBackground';
import { chasseService } from '@/services/api';

const PIECE = require('../../assets/images/piece.png');

interface PlayerStats {
    completed: number;
    inProgress: number;
}

export default function ProfilJoueurScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<PlayerStats>({ completed: 0, inProgress: 0 });

    useEffect(() => {
        if (!user) return;
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const { chasses } = await chasseService.getMe();
            let completed = 0;
            let inProgress = 0;
            chasses.forEach(uc => {
                if (uc.statut === 'COMPLETED') completed++;
                else if (uc.statut === 'IN_PROGRESS') inProgress++;
            });
            setStats({ completed, inProgress });
        } catch {
            // Silently fail
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
        { icon: 'trophy-outline',         label: 'Mes scores & récompenses', onPress: () => {} },
        { icon: 'map-outline',            label: 'Chasses en cours',         onPress: () => router.push('/(app)/chasses') },
        { icon: 'notifications-outline',  label: 'Notifications',            onPress: () => {} },
        { icon: 'settings-outline',       label: 'Paramètres',               onPress: () => {} },
        { icon: 'help-circle-outline',    label: 'Aide & Support',           onPress: () => {} },
    ];

    return (
        <ScreenBackground style={st.safe}>
            <ScrollView showsVerticalScrollIndicator={false}>
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

                    <View style={st.badgeRow}>
                        <StatusBadge status={user.role} />
                    </View>
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
                        <Text style={st.statVal}>{stats.completed + stats.inProgress}</Text>
                        <Text style={st.statLabel}>Total{'\n'}rejointes</Text>
                    </View>
                </View>

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
                                <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
                            </View>
                            <Text style={st.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={st.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={st.version}>Lootopia v1.0.0</Text>
            </ScrollView>
        </ScreenBackground>
    );
}

const st = StyleSheet.create({
    safe: { flex: 1 },

    hero:       { alignItems: 'center', paddingVertical: Sp.xl, gap: Sp.sm },
    avatarWrap: { position: 'relative', marginBottom: Sp.sm },
    avatar:     {
        width: 88, height: 88, borderRadius: 28,
        backgroundColor: Colors.bgElevated,
        borderWidth: 2, borderColor: Colors.gold + '44',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
    },
    avatarRing: {
        position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
        borderRadius: 34, borderWidth: 1, borderColor: Colors.gold + '20',
    },
    avatarText: { fontFamily: Fonts.display, fontSize: 26, color: Colors.gold },
    username:   { fontFamily: Fonts.display, fontSize: 20, color: Colors.textPrimary, letterSpacing: 1 },
    email:      { fontFamily: Fonts.title,   fontSize: 12, color: Colors.textMuted },
    badgeRow:   { flexDirection: 'row', gap: Sp.sm, marginTop: Sp.xs },

    statsRow:   {
        flexDirection: 'row',
        marginHorizontal: Sp.lg, marginBottom: Sp.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
        overflow: 'hidden',
    },
    statItem:   { flex: 1, alignItems: 'center', padding: Sp.md, gap: 4 },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.borderWarm },
    pieceIcon:  { width: 22, height: 22, opacity: 0.85 },
    statVal:    { fontFamily: Fonts.display, fontSize: 22, color: Colors.gold },
    statLabel:  { fontFamily: Fonts.title,   fontSize: 10, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },

    menuCard:   {
        marginHorizontal: Sp.lg, marginBottom: Sp.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
        overflow: 'hidden',
    },
    menuItem:   { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderWarm },
    menuIcon:   {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel:  { flex: 1, fontFamily: Fonts.title, fontSize: 13, color: Colors.textPrimary },

    logoutBtn:  {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Sp.sm, marginHorizontal: Sp.lg,
        backgroundColor: Colors.errorBg,
        borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44',
        padding: Sp.md,
    },
    logoutText: { fontFamily: Fonts.title, color: Colors.error, fontSize: 14 },
    version:    { fontFamily: Fonts.title, color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: Sp.lg, paddingBottom: Sp.xl },
});
