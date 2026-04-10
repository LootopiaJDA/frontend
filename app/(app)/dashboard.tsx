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

// ─── Composant chasse disponible (ligne compacte) ─────────────────────────────
function HuntRow({ chasse, onPress }: { chasse: Chasse; onPress: () => void }) {
    return (
        <TouchableOpacity style={hr.wrap} onPress={onPress} activeOpacity={0.75}>
            <View style={hr.icon}>
                <Ionicons name="map-outline" size={20} color={Colors.gold} />
            </View>
            <View style={hr.info}>
                <Text style={hr.name} numberOfLines={1}>{chasse.name}</Text>
                {chasse.localisation ? <Text style={hr.meta}>{chasse.localisation}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
    );
}

const hr = StyleSheet.create({
    wrap:     { backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border },
    icon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.goldGlow, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    info:     { flex: 1, minWidth: 0 },
    name:     { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    meta:     { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
});

// ─── Screen principal ─────────────────────────────────────────────────────────
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

    const initials = user.username.slice(0, 2).toUpperCase();
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
                {/* Header */}
                <View style={st.header}>
                    <View>
                        <Text style={st.greeting}>Espace joueur</Text>
                        <Text style={st.name}>
                            Salut, <Text style={{ color: Colors.gold }}>{user.username}</Text>
                        </Text>
                    </View>
                    <View style={st.avatar}>
                        <Text style={st.avatarText}>{initials}</Text>
                        <View style={st.avatarDot} />
                    </View>
                </View>

                {/* Stat unique */}
                <View style={st.statCard}>
                    <Ionicons name="map-outline" size={22} color={Colors.gold} />
                    <Text style={st.statVal}>{chassesActives.length}</Text>
                    <Text style={st.statLabel}>Chasses disponibles</Text>
                </View>

                {/* Liste des chasses */}
                {loading ? (
                    <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
                ) : chassesActives.length === 0 ? (
                    <View style={st.empty}>
                        <Ionicons name="map-outline" size={40} color={Colors.textMuted} />
                        <Text style={st.emptyText}>Aucune chasse disponible pour l'instant</Text>
                    </View>
                ) : (
                    <>
                        <View style={st.sectionHd}>
                            <Text style={st.sectionTitle}>Chasses disponibles</Text>
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
    safe:          { flex: 1, backgroundColor: Colors.bg },
    scroll:        { paddingBottom: 40 },

    header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.lg, paddingBottom: Sp.md },
    greeting:      { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.5 },
    name:          { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },

    avatar:        { width: 44, height: 44, borderRadius: 14, backgroundColor: '#4c1d95', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    avatarText:    { fontSize: 15, fontWeight: '800', color: '#fff' },
    avatarDot:     { position: 'absolute', top: -3, right: -3, width: 11, height: 11, borderRadius: 6, backgroundColor: '#4ecb8a', borderWidth: 2, borderColor: Colors.bg },

    statCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: Sp.lg, marginBottom: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: Colors.border },
    statVal:       { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
    statLabel:     { fontSize: 12, color: Colors.textMuted, flex: 1 },

    sectionHd:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Sp.lg, marginBottom: 12 },
    sectionTitle:  { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    sectionAction: { fontSize: 12, color: Colors.gold, fontWeight: '500' },

    huntList:      { paddingHorizontal: Sp.lg, gap: 10 },

    empty:         { alignItems: 'center', gap: 10, paddingVertical: 40 },
    emptyText:     { fontSize: 14, color: Colors.textMuted },
});
