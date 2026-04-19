import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    SafeAreaView, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { chasseService } from '@/services/api';
import { Chasse } from '@/constants/types';
import { Colors, Sp, R } from '@/constants/theme';

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 6)  return 'Bonne nuit';
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
}

function HuntRow({ chasse, onPress }: { chasse: Chasse; onPress: () => void }) {
    return (
        <TouchableOpacity style={hr.wrap} onPress={onPress} activeOpacity={0.75}>
            {chasse.image ? (
                <Image source={{ uri: chasse.image }} style={hr.thumb} />
            ) : (
                <View style={[hr.thumb, hr.thumbFallback]}>
                    <Ionicons name="map-outline" size={18} color={Colors.gold} />
                </View>
            )}
            <View style={hr.info}>
                <Text style={hr.name} numberOfLines={1}>{chasse.name}</Text>
                {chasse.localisation
                    ? <Text style={hr.meta} numberOfLines={1}>{chasse.localisation}</Text>
                    : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
    );
}

const hr = StyleSheet.create({
    wrap: {
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        gap: Sp.md,
        paddingRight: Sp.md,
    },
    thumb: { width: 56, height: 56 },
    thumbFallback: {
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info:  { flex: 1, paddingVertical: Sp.sm },
    name:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    meta:  { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
});

export default function DashboardJoueurScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [allChasses, setAllChasses] = useState<Chasse[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await chasseService.getAll();
            setAllChasses(data.allChasse ?? []);
        } catch (err) {
            console.log('Erreur chargement dashboard:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (!user) return null;

    const initials      = user.username.slice(0, 2).toUpperCase();
    const chassesActives = allChasses.filter(c => c.etat === 'ACTIVE');

    return (
        <SafeAreaView style={st.safe}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={st.scroll}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); load(); }}
                        tintColor={Colors.gold}
                    />
                }
            >
                {/* ── Header ── */}
                <View style={st.header}>
                    <View>
                        <Text style={st.greeting}>{getGreeting()},</Text>
                        <Text style={st.name}>
                            <Text style={st.nameAccent}>{user.username}</Text> 👋
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={st.avatar}
                        onPress={() => router.push('/(app)/profil')}
                        activeOpacity={0.8}
                    >
                        <Text style={st.avatarText}>{initials}</Text>
                        <View style={st.avatarDot} />
                    </TouchableOpacity>
                </View>

                {/* ── Bannière hero ── */}
                <View style={st.heroBanner}>
                    <View style={st.heroLeft}>
                        <Text style={st.heroTitle}>Prêt pour{'\n'}l'aventure ?</Text>
                        <Text style={st.heroSub}>
                            {chassesActives.length} chasse{chassesActives.length !== 1 ? 's' : ''} disponible{chassesActives.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <View style={st.heroIcon}>
                        <Ionicons name="compass" size={48} color={Colors.gold} style={{ opacity: 0.9 }} />
                    </View>
                </View>

                {/* ── Actions rapides ── */}
                <View style={st.quickRow}>
                    <TouchableOpacity
                        style={[st.quickCard, { borderColor: Colors.gold + '44' }]}
                        onPress={() => router.push('/(app)/chasses')}
                        activeOpacity={0.75}
                    >
                        <View style={[st.quickIcon, { backgroundColor: Colors.goldGlow }]}>
                            <Ionicons name="search-outline" size={22} color={Colors.gold} />
                        </View>
                        <Text style={st.quickLabel}>Explorer</Text>
                        <Text style={st.quickSub}>Toutes les chasses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[st.quickCard, { borderColor: '#4FC3F744' }]}
                        onPress={() => router.push('/(app)/map')}
                        activeOpacity={0.75}
                    >
                        <View style={[st.quickIcon, { backgroundColor: 'rgba(79,195,247,0.12)' }]}>
                            <Ionicons name="navigate-outline" size={22} color="#4FC3F7" />
                        </View>
                        <Text style={st.quickLabel}>Ma carte</Text>
                        <Text style={st.quickSub}>Chasse en cours</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Liste des chasses ── */}
                {loading ? (
                    <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
                ) : chassesActives.length === 0 ? (
                    <View style={st.empty}>
                        <Ionicons name="map-outline" size={44} color={Colors.textMuted} />
                        <Text style={st.emptyTitle}>Aucune chasse disponible</Text>
                        <Text style={st.emptySub}>Revenez bientôt pour de nouvelles aventures</Text>
                    </View>
                ) : (
                    <>
                        <View style={st.sectionHd}>
                            <Text style={st.sectionTitle}>Disponibles maintenant</Text>
                            <TouchableOpacity onPress={() => router.push('/(app)/chasses')}>
                                <Text style={st.sectionAction}>Voir tout →</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={st.huntList}>
                            {chassesActives.slice(0, 5).map(c => (
                                <HuntRow
                                    key={`hunt-${c.id_chasse}`}
                                    chasse={c}
                                    onPress={() => router.push({
                                        pathname: '/(app)/chasse/[id]',
                                        params: { id: c.id_chasse },
                                    })}
                                />
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:   { flex: 1, backgroundColor: Colors.bg },
    scroll: { paddingBottom: 60 },

    // Header
    header:     {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Sp.lg, paddingTop: Sp.md, paddingBottom: Sp.sm,
    },
    greeting:   { fontSize: 13, color: Colors.textMuted, letterSpacing: 0.3 },
    name:       { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
    nameAccent: { color: Colors.gold },

    avatar: {
        width: 46, height: 46, borderRadius: 15,
        backgroundColor: Colors.bgElevated,
        borderWidth: 2, borderColor: Colors.gold + '33',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gold },
    avatarDot:  {
        position: 'absolute', top: -2, right: -2,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#4ecb8a', borderWidth: 2, borderColor: Colors.bg,
    },

    // Hero banner
    heroBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginHorizontal: Sp.lg, marginVertical: Sp.md,
        backgroundColor: Colors.bgCard,
        borderRadius: R.xl, borderWidth: 1, borderColor: Colors.gold + '33',
        padding: Sp.lg,
        overflow: 'hidden',
    },
    heroLeft:  { flex: 1, gap: 6 },
    heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28 },
    heroSub:   { fontSize: 13, color: Colors.gold, fontWeight: '600' },
    heroIcon:  { opacity: 0.85 },

    // Quick actions
    quickRow: {
        flexDirection: 'row', gap: Sp.md,
        paddingHorizontal: Sp.lg, marginBottom: Sp.lg,
    },
    quickCard: {
        flex: 1, backgroundColor: Colors.bgCard,
        borderRadius: R.xl, borderWidth: 1,
        padding: Sp.md, gap: 6,
    },
    quickIcon:  {
        width: 44, height: 44, borderRadius: R.md,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
    },
    quickLabel: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
    quickSub:   { fontSize: 11, color: Colors.textMuted },

    // Section
    sectionHd:     {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Sp.lg, marginBottom: Sp.sm,
    },
    sectionTitle:  { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
    sectionAction: { fontSize: 12, color: Colors.gold, fontWeight: '600' },

    huntList: { paddingHorizontal: Sp.lg, gap: Sp.sm },

    // Empty
    empty:      { alignItems: 'center', gap: Sp.sm, paddingVertical: Sp.xl, paddingHorizontal: Sp.xl },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
    emptySub:   { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
