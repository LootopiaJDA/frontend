import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { userService, chasseService, partenaireService } from '../../services/api';
import { Colors, Sp, R } from '../../constants/theme';

function KpiCard({ icon, label, value, sub, color, onPress }: {
    icon: string; label: string; value: number | string; sub?: string; color: string; onPress?: () => void;
}) {
    return (
        <TouchableOpacity style={[kS.card, { borderColor: color + '30' }]} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.8 : 1}>
            <View style={[kS.iconWrap, { backgroundColor: color + '18' }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <Text style={kS.value}>{value}</Text>
            <Text style={kS.label}>{label}</Text>
            {sub ? <Text style={[kS.sub, { color }]}>{sub}</Text> : null}
        </TouchableOpacity>
    );
}
const kS = StyleSheet.create({
    card: { flex: 1, minWidth: '46%', backgroundColor: Colors.bgCard, borderRadius: R.xl, borderWidth: 1, padding: Sp.md, gap: 4, alignItems: 'center' },
    iconWrap: { width: 44, height: 44, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
    value: { color: Colors.textPrimary, fontSize: 28, fontWeight: '900' },
    label: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
    sub: { fontSize: 11, fontWeight: '700' },
});

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ users: 0, partenaires: 0, pendingPartenaires: 0, chasses: 0, chassesActive: 0 });
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [users, partenaires, chasses] = await Promise.allSettled([
                userService.getAll(),
                partenaireService.getAll(),
                chasseService.getAll(),
            ]);

            const usersData: any[] = users.status === 'fulfilled' ? (users.value ?? []) : [];
            const partenairesData: any[] = partenaires.status === 'fulfilled' ? (partenaires.value ?? []) : [];
            const chassesData: any[] = chasses.status === 'fulfilled' ? (chasses.value?.allChasse ?? []) : [];

            const pending = partenairesData.filter((p: any) => p.statut === 'VERIFICATION');
            setPendingList(pending);
            setStats({
                users: usersData.filter((u: any) => u.role === 'JOUEUR').length,
                partenaires: partenairesData.filter((p: any) => p.statut === 'ACTIVE').length,
                pendingPartenaires: pending.length,
                chasses: chassesData.length,
                chassesActive: chassesData.filter((c: any) => c.etat === 'ACTIVE').length,
            });
        } catch { /* silencieux */ }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useFocusEffect(useCallback(() => { load(true); }, [load]));

    return (
        <View style={styles.bg}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.gold} />}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerSub}>Administration</Text>
                            <Text style={styles.headerTitle}>Vue ensemble</Text>
                        </View>
                        <View style={styles.adminBadge}>
                            <Ionicons name="shield-checkmark" size={14} color={Colors.gold} />
                            <Text style={styles.adminBadgeText}>ADMIN</Text>
                        </View>
                    </View>

                    {loading ? <ActivityIndicator color={Colors.gold} style={{ marginTop: 60 }} /> : (
                        <>
                            {/* KPIs */}
                            <View style={styles.kpiGrid}>
                                <KpiCard icon="people" label="Joueurs" value={stats.users} color="#6366F1" onPress={() => router.push('/(admin)/users')} />
                                <KpiCard icon="business" label="Partenaires actifs" value={stats.partenaires} sub={stats.pendingPartenaires > 0 ? `${stats.pendingPartenaires} en attente` : undefined} color={Colors.gold} onPress={() => router.push('/(admin)/partenaires')} />
                                <KpiCard icon="map" label="Chasses totales" value={stats.chasses} color="#22C55E" onPress={() => router.push('/(admin)/chasses')} />
                                <KpiCard icon="flash" label="Chasses actives" value={stats.chassesActive} color="#F97316" onPress={() => router.push('/(admin)/chasses')} />
                            </View>

                            {/* Alertes partenaires en attente */}
                            {pendingList.length > 0 && (
                                <View style={styles.alertCard}>
                                    <View style={styles.alertHeader}>
                                        <View style={styles.alertIconWrap}>
                                            <Ionicons name="time" size={18} color={Colors.warning} />
                                        </View>
                                        <View style={styles.alertHeaderText}>
                                            <Text style={styles.alertTitle}>{pendingList.length} demande{pendingList.length > 1 ? 's' : ''} partenaire en attente</Text>
                                            <Text style={styles.alertSub}>À valider pour activation des comptes</Text>
                                        </View>
                                        <TouchableOpacity style={styles.alertCta} onPress={() => router.push('/(admin)/partenaires')}>
                                            <Text style={styles.alertCtaText}>Voir</Text>
                                            <Ionicons name="arrow-forward" size={12} color={Colors.warning} />
                                        </TouchableOpacity>
                                    </View>
                                    {pendingList.slice(0, 3).map((p: any) => (
                                        <View key={p.id_partenaire} style={styles.alertRow}>
                                            <View style={styles.alertRowIcon}>
                                                <Text style={styles.alertRowInitials}>{p.company_name?.slice(0, 2).toUpperCase()}</Text>
                                            </View>
                                            <View style={styles.alertRowInfo}>
                                                <Text style={styles.alertRowName}>{p.company_name}</Text>
                                                <Text style={styles.alertRowSiret}>SIRET : {p.siret}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.validateBtn}
                                                onPress={async () => {
                                                    try {
                                                        await partenaireService.updateStatut(p.id_partenaire, 'ACTIVE');
                                                        load(true);
                                                    } catch (e: any) {
                                                        const { Alert } = require('react-native');
                                                        Alert.alert('Erreur', e.message);
                                                    }
                                                }}
                                            >
                                                <Ionicons name="checkmark" size={14} color="#22C55E" />
                                                <Text style={styles.validateText}>Valider</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Raccourcis */}
                            <Text style={styles.sectionTitle}>Actions rapides</Text>
                            <View style={styles.quickGrid}>
                                {[
                                    { icon: 'people-outline', label: 'Gérer les utilisateurs', route: '/(admin)/users', color: '#6366F1' },
                                    { icon: 'business-outline', label: 'Gérer les partenaires', route: '/(admin)/partenaires', color: Colors.gold },
                                    { icon: 'map-outline', label: 'Gérer les chasses', route: '/(admin)/chasses', color: '#22C55E' },
                                ].map(item => (
                                    <TouchableOpacity
                                        key={item.label}
                                        style={styles.quickCard}
                                        onPress={() => router.push(item.route as any)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.quickIcon, { backgroundColor: item.color + '18' }]}>
                                            <Ionicons name={item.icon as any} size={22} color={item.color} />
                                        </View>
                                        <Text style={styles.quickLabel}>{item.label}</Text>
                                        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    scroll: { padding: Sp.lg, paddingBottom: 100, gap: Sp.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerSub: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
    headerTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
    adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 5 },
    adminBadgeText: { color: Colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Sp.sm },
    alertCard: { backgroundColor: Colors.warningBg, borderRadius: R.xl, borderWidth: 1, borderColor: Colors.warning + '44', padding: Sp.md, gap: Sp.md },
    alertHeader: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm },
    alertIconWrap: { width: 36, height: 36, borderRadius: R.md, backgroundColor: Colors.warning + '22', alignItems: 'center', justifyContent: 'center' },
    alertHeaderText: { flex: 1 },
    alertTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
    alertSub: { color: Colors.textSecondary, fontSize: 12 },
    alertCta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    alertCtaText: { color: Colors.warning, fontSize: 13, fontWeight: '700' },
    alertRow: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, backgroundColor: Colors.bgCard, borderRadius: R.md, padding: Sp.sm },
    alertRowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.warning + '22', alignItems: 'center', justifyContent: 'center' },
    alertRowInitials: { color: Colors.warning, fontSize: 13, fontWeight: '800' },
    alertRowInfo: { flex: 1 },
    alertRowName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
    alertRowSiret: { color: Colors.textMuted, fontSize: 11 },
    validateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E18', borderWidth: 1, borderColor: '#22C55E44', borderRadius: R.full, paddingHorizontal: Sp.sm, paddingVertical: 5 },
    validateText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
    sectionTitle: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
    quickGrid: { gap: Sp.sm },
    quickCard: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, padding: Sp.md },
    quickIcon: { width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
});