import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { chasseService } from '@/services/api';
import { Chasse } from '@/constants/types';
import { Colors, Sp, R } from '@/constants/theme';

// ─── Types locaux ─────────────────────────────────────────────────────────────
type Difficulty = 'FACILE' | 'MOYEN' | 'DIFFICILE';

const DIFF_CONFIG: Record<Difficulty, { label: string; color: string; bg: string }> = {
    FACILE:    { label: 'Facile',    color: '#4ecb8a', bg: 'rgba(78,203,138,0.15)' },
    MOYEN:     { label: 'Moyen',     color: Colors.gold, bg: 'rgba(245,200,66,0.12)' },
    DIFFICILE: { label: 'Difficile', color: Colors.error, bg: Colors.errorBg },
};

// ─── Composant barre XP ───────────────────────────────────────────────────────
function XpBar({ xp = 3100, xpMax = 5000, level = 7 }: { xp?: number; xpMax?: number; level?: number }) {
    const pct = Math.min((xp / xpMax) * 100, 100);
    return (
        <View style={xp_.wrap}>
            <View style={xp_.top}>
                <Text style={xp_.label}>Niveau {level} — Chasseur confirmé 🏅</Text>
                <Text style={xp_.val}>{xp.toLocaleString()} / {xpMax.toLocaleString()} XP</Text>
            </View>
            <View style={xp_.track}>
                <View style={[xp_.fill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={xp_.next}>{(xpMax - xp).toLocaleString()} XP pour le niveau {level + 1}</Text>
        </View>
    );
}

const xp_ = StyleSheet.create({
    wrap:  { margin: Sp.lg, marginTop: 0, backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: Colors.border },
    top:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    label: { fontSize: 11, color: Colors.textMuted, letterSpacing: 0.3 },
    val:   { fontSize: 12, fontWeight: '700', color: Colors.gold },
    track: { height: 8, backgroundColor: Colors.bgElevated, borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
    fill:  { height: '100%', backgroundColor: Colors.gold, borderRadius: 99 },
    next:  { fontSize: 11, color: Colors.textMuted },
});

// ─── Composant stat card ──────────────────────────────────────────────────────
function StatCard({ value, label, accentColor }: { value: number; label: string; accentColor: string }) {
    return (
        <View style={[sc.card, { borderTopColor: accentColor }]}>
            <Text style={sc.val}>{value}</Text>
            <Text style={sc.label}>{label}</Text>
        </View>
    );
}

const sc = StyleSheet.create({
    card:  { flex: 1, backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 2, alignItems: 'center', gap: 4 },
    val:   { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
    label: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.3, textAlign: 'center' },
});

// ─── Composant chasse en cours ────────────────────────────────────────────────
function ActiveHuntCard({ chasse, onPress }: { chasse: Chasse; onPress: () => void }) {
    // Progression mock — à remplacer par les vraies données de l'API
    const done = 3;
    const total = 8;
    const pct = Math.round((done / total) * 100);

    return (
        <View style={ah.wrap}>
            <View style={ah.tagRow}>
                <View style={ah.dot} />
                <Text style={ah.tagText}>En cours</Text>
            </View>
            <Text style={ah.name} numberOfLines={1}>{chasse.name}</Text>
            {chasse.localisation ? (
                <View style={ah.metaRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                    <Text style={ah.meta}>{chasse.localisation}</Text>
                </View>
            ) : null}
            <View style={ah.progressWrap}>
                <View style={ah.progressTop}>
                    <Text style={ah.progressLabel}>Étape {done} / {total}</Text>
                    <Text style={ah.progressLabel}>{pct}%</Text>
                </View>
                <View style={ah.track}>
                    <View style={[ah.fill, { width: `${pct}%` as any }]} />
                </View>
            </View>
            <TouchableOpacity style={ah.btn} onPress={onPress} activeOpacity={0.85}>
                <Ionicons name="play" size={14} color={Colors.black} />
                <Text style={ah.btnText}>Continuer la chasse</Text>
            </TouchableOpacity>
        </View>
    );
}

const ah = StyleSheet.create({
    wrap:         { marginHorizontal: Sp.lg, marginBottom: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: Colors.border },
    tagRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    dot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ecb8a' },
    tagText:      { fontSize: 11, fontWeight: '700', color: '#4ecb8a', textTransform: 'uppercase', letterSpacing: 0.5 },
    name:         { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
    metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    meta:         { fontSize: 12, color: Colors.textMuted },
    progressWrap: { marginBottom: 14 },
    progressTop:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel:{ fontSize: 11, color: Colors.textMuted },
    track:        { height: 6, backgroundColor: Colors.bgElevated, borderRadius: 99, overflow: 'hidden' },
    fill:         { height: '100%', backgroundColor: Colors.gold, borderRadius: 99 },
    btn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.gold, borderRadius: R.md, paddingVertical: 13 },
    btnText:      { fontSize: 14, fontWeight: '800', color: Colors.black },
});

// ─── Composant chasse disponible (ligne compacte) ─────────────────────────────
function HuntRow({ chasse, onPress }: { chasse: Chasse; onPress: () => void }) {
    // Difficulté mock — à remplacer par chasse.difficulty quand l'API l'expose
    const diff: Difficulty = 'MOYEN';
    const cfg = DIFF_CONFIG[diff];

    return (
        <TouchableOpacity style={hr.wrap} onPress={onPress} activeOpacity={0.75}>
            <View style={hr.icon}>
                <Ionicons name="map-outline" size={20} color={Colors.gold} />
            </View>
            <View style={hr.info}>
                <Text style={hr.name} numberOfLines={1}>{chasse.name}</Text>
                {chasse.localisation ? <Text style={hr.meta}>{chasse.localisation}</Text> : null}
            </View>
            <View style={[hr.pill, { backgroundColor: cfg.bg }]}>
                <Text style={[hr.pillText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
        </TouchableOpacity>
    );
}

const hr = StyleSheet.create({
    wrap:     { backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border },
    icon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.goldGlow, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    info:     { flex: 1, minWidth: 0 },
    name:     { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    meta:     { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
    pill:     { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
    pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
});

// ─── Screen principal ─────────────────────────────────────────────────────────
export default function DashboardJoueurScreen() {
    const { user } = useAuth();
    const router = useRouter();

    const [chasses, setChasses] = useState<Chasse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await chasseService.getAll();
            setChasses(data.allChasse ?? []);
        } catch (err) {
            console.log('Erreur chargement chasses joueur:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (!user) return null;

    const initials = user.username.slice(0, 2).toUpperCase();

    // Séparation mock — à remplacer par les vraies données /chasse/my
    const chassesEnCours  = chasses.slice(0, 1);   // 1 en cours pour l'exemple
    const chassesDispo    = chasses.slice(1, 6);    // les autres

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
                {/* Header */}
                <View style={st.header}>
                    <View>
                        <Text style={st.greeting}>Espace joueur</Text>
                        <Text style={st.name}>
                            Salut, <Text style={{ color: Colors.gold }}>{user.username}</Text> ⚔️
                        </Text>
                    </View>
                    <View style={st.avatar}>
                        <Text style={st.avatarText}>{initials}</Text>
                        <View style={st.avatarDot} />
                    </View>
                </View>

                {/* XP bar ✅ */}
                <XpBar />

                {/* Stats */}
                <View style={st.statsRow}>
                    <StatCard value={12} label="Terminées"   accentColor="#4ecb8a" />
                    <StatCard value={chassesEnCours.length} label="En cours"    accentColor={Colors.gold} />
                    <StatCard value={47} label="Étapes faites" accentColor="#a78bfa" />
                </View>

                {loading ? (
                    <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Chasse en cours */}
                        {chassesEnCours.length > 0 && (
                            <>
                                <View style={st.sectionHd}>
                                    <Text style={st.sectionTitle}>En cours</Text>
                                    <TouchableOpacity onPress={() => router.push('/(app)/chasses')}>
                                        <Text style={st.sectionAction}>Voir tout →</Text>
                                    </TouchableOpacity>
                                </View>
                                <ActiveHuntCard
                                    chasse={chassesEnCours[0]}
                                    onPress={() => router.push({
                                        pathname: '/(app)/chasses/[id]',
                                        params: { id: chassesEnCours[0].id_chasse },
                                    })}
                                />
                            </>
                        )}

                        {/* Chasses disponibles — HuntRow compact */}
                        <View style={st.sectionHd}>
                            <Text style={st.sectionTitle}>Chasses disponibles</Text>
                            <TouchableOpacity onPress={() => router.push('/(app)/chasses')}>
                                <Text style={st.sectionAction}>Voir tout →</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={st.huntList}>
                            {chassesDispo.length === 0 ? (
                                <View style={st.empty}>
                                    <Ionicons name="map-outline" size={40} color={Colors.textMuted} />
                                    <Text style={st.emptyText}>Aucune chasse disponible</Text>
                                </View>
                            ) : (
                                chassesDispo.map(c => (
                                    <HuntRow
                                        key={`hunt-${c.id_chasse}`}
                                        chasse={c}
                                        onPress={() => router.push({
                                            pathname: '/(app)/chasses/[id]',
                                            params: { id: c.id_chasse },
                                        })}
                                    />
                                ))
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:        { flex: 1, backgroundColor: Colors.bg },
    scroll:      { paddingBottom: 40 },

    header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.lg, paddingBottom: Sp.md },
    greeting:    { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.5 },
    name:        { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },

    avatar:      { width: 44, height: 44, borderRadius: 14, backgroundColor: '#4c1d95', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    avatarText:  { fontSize: 15, fontWeight: '800', color: '#fff' },
    avatarDot:   { position: 'absolute', top: -3, right: -3, width: 11, height: 11, borderRadius: 6, backgroundColor: '#4ecb8a', borderWidth: 2, borderColor: Colors.bg },

    statsRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: Sp.lg, marginBottom: Sp.lg },

    sectionHd:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Sp.lg, marginBottom: 12 },
    sectionTitle:{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    sectionAction:{ fontSize: 12, color: Colors.gold, fontWeight: '500' },

    huntList:    { paddingHorizontal: Sp.lg, gap: 10 },

    empty:       { alignItems: 'center', gap: 10, paddingVertical: 40 },
    emptyText:   { fontSize: 14, color: Colors.textMuted },
});