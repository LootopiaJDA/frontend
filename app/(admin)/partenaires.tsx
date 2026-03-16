import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
    TextInput, SafeAreaView, RefreshControl, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { partenaireService } from '../../services/api';
import { Colors, Sp, R } from '../../constants/theme';

type StatutPartenaire = 'VERIFICATION' | 'ACTIVE' | 'INACTIVE';

const STATUT_CFG: Record<StatutPartenaire, { label: string; color: string; bg: string; icon: string }> = {
    VERIFICATION: { label: 'En attente', color: Colors.warning, bg: Colors.warningBg, icon: 'time' },
    ACTIVE:       { label: 'Actif',      color: '#22C55E',      bg: '#22C55E18',      icon: 'checkmark-circle' },
    INACTIVE:     { label: 'Inactif',    color: Colors.textMuted, bg: Colors.bgElevated, icon: 'pause-circle' },
};

interface Partenaire {
    id_partenaire: number;
    company_name: string;
    siret: string;
    adresse?: string;
    statut: StatutPartenaire;
    created_at?: string;
    users?: { username: string; email: string }[];
}

type FilterKey = 'Tous' | StatutPartenaire;

export default function AdminPartenaires() {
    const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterKey>('Tous');
    const [selected, setSelected] = useState<Partenaire | null>(null);
    const [detailModal, setDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await partenaireService.getAll();
            setPartenaires(Array.isArray(data) ? data : []);
        } catch { /* silencieux */ }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useFocusEffect(useCallback(() => { load(true); }, [load]));

    const updateStatut = async (p: Partenaire, statut: StatutPartenaire) => {
        setActionLoading(true);
        try {
            await partenaireService.updateStatut(p.id_partenaire, statut);
            setPartenaires(prev => prev.map(x => x.id_partenaire === p.id_partenaire ? { ...x, statut } : x));
            if (selected?.id_partenaire === p.id_partenaire) setSelected(s => s ? { ...s, statut } : s);
            const msg = statut === 'ACTIVE' ? 'Partenaire activé ✅' : statut === 'INACTIVE' ? 'Partenaire désactivé' : '';
            if (msg) Alert.alert(msg);
        } catch (e: any) { Alert.alert('Erreur', e.message); }
        finally { setActionLoading(false); }
    };

    const filtered = partenaires.filter(p => {
        const matchSearch = p.company_name.toLowerCase().includes(search.toLowerCase()) || p.siret.includes(search);
        const matchFilter = filter === 'Tous' || p.statut === filter;
        return matchSearch && matchFilter;
    });

    const pending = partenaires.filter(p => p.statut === 'VERIFICATION').length;

    return (
        <View style={styles.bg}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Partenaires</Text>
                        {pending > 0 && (
                            <Text style={styles.pendingAlert}>{pending} demande{pending > 1 ? 's' : ''} en attente de validation</Text>
                        )}
                    </View>
                    <View style={styles.totalBadge}><Text style={styles.totalText}>{partenaires.length}</Text></View>
                </View>

                {/* Filtres statut */}
                <View style={styles.filters}>
                    {(['Tous', 'VERIFICATION', 'ACTIVE', 'INACTIVE'] as FilterKey[]).map(f => {
                        const cfg = f !== 'Tous' ? STATUT_CFG[f as StatutPartenaire] : null;
                        const active = filter === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                style={[styles.chip, active && { backgroundColor: cfg?.bg ?? Colors.goldGlow, borderColor: cfg?.color ?? Colors.gold }]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[styles.chipText, active && { color: cfg?.color ?? Colors.gold }]}>
                                    {cfg?.label ?? 'Tous'}
                                    {f === 'VERIFICATION' && pending > 0 ? ` (${pending})` : ''}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                    <TextInput style={styles.searchInput} placeholder="Société, SIRET..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
                </View>

                {loading ? (
                    <View style={styles.center}><ActivityIndicator color={Colors.gold} size="large" /></View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={p => String(p.id_partenaire)}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.gold} />}
                        ListEmptyComponent={<View style={styles.empty}><Ionicons name="business-outline" size={40} color={Colors.textMuted} /><Text style={styles.emptyText}>Aucun partenaire</Text></View>}
                        renderItem={({ item: p }) => {
                            const cfg = STATUT_CFG[p.statut];
                            return (
                                <TouchableOpacity style={styles.row} onPress={() => { setSelected(p); setDetailModal(true); }} activeOpacity={0.8}>
                                    <View style={[styles.avatar, { backgroundColor: cfg.bg }]}>
                                        <Text style={[styles.avatarText, { color: cfg.color }]}>{p.company_name.slice(0, 2).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.rowInfo}>
                                        <Text style={styles.rowName}>{p.company_name}</Text>
                                        <Text style={styles.rowSiret}>SIRET : {p.siret}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                        <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
                                        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                                    </View>
                                    {/* Boutons rapides pour VERIFICATION */}
                                    {p.statut === 'VERIFICATION' && (
                                        <View style={styles.quickBtns}>
                                            <TouchableOpacity style={styles.acceptBtn} onPress={() => updateStatut(p, 'ACTIVE')}>
                                                <Ionicons name="checkmark" size={14} color="#22C55E" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.refuseBtn} onPress={() => updateStatut(p, 'INACTIVE')}>
                                                <Ionicons name="close" size={14} color={Colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </SafeAreaView>

            {/* Modal détail */}
            <Modal visible={detailModal} animationType="slide" transparent onRequestClose={() => setDetailModal(false)}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        {selected && (() => {
                            const cfg = STATUT_CFG[selected.statut];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.sheetHero}>
                                        <View style={[styles.sheetAvatar, { backgroundColor: cfg.bg }]}>
                                            <Ionicons name="business" size={28} color={cfg.color} />
                                        </View>
                                        <Text style={styles.sheetName}>{selected.company_name}</Text>
                                        <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
                                            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoTable}>
                                        {[
                                            { label: 'ID', value: `#${selected.id_partenaire}` },
                                            { label: 'SIRET', value: selected.siret },
                                            { label: 'Adresse', value: selected.adresse ?? 'Non renseignée' },
                                        ].map(row => (
                                            <View key={row.label} style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>{row.label}</Text>
                                                <Text style={styles.infoValue}>{row.value}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Actions */}
                                    <Text style={styles.actionSectionLabel}>Actions</Text>
                                    <View style={styles.actionBtns}>
                                        {selected.statut !== 'ACTIVE' && (
                                            <TouchableOpacity
                                                style={styles.activateBtn}
                                                onPress={() => updateStatut(selected, 'ACTIVE')}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? <ActivityIndicator size="small" color="#22C55E" /> : <Ionicons name="checkmark-circle" size={16} color="#22C55E" />}
                                                <Text style={styles.activateBtnText}>Activer</Text>
                                            </TouchableOpacity>
                                        )}
                                        {selected.statut !== 'INACTIVE' && (
                                            <TouchableOpacity
                                                style={styles.deactivateBtn}
                                                onPress={() => updateStatut(selected, 'INACTIVE')}
                                                disabled={actionLoading}
                                            >
                                                <Ionicons name="pause-circle" size={16} color={Colors.error} />
                                                <Text style={styles.deactivateBtnText}>Désactiver</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailModal(false)}>
                                        <Text style={styles.closeBtnText}>Fermer</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            );
                        })()}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: Sp.lg, paddingTop: Sp.md, paddingBottom: Sp.xs },
    title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '900' },
    pendingAlert: { color: Colors.warning, fontSize: 12, fontWeight: '600', marginTop: 2 },
    totalBadge: { backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 4 },
    totalText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
    filters: { flexDirection: 'row', gap: Sp.sm, paddingHorizontal: Sp.lg, paddingBottom: Sp.sm, flexWrap: 'wrap' },
    chip: { paddingHorizontal: Sp.md, paddingVertical: 6, borderRadius: R.full, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
    chipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Sp.md, paddingVertical: Sp.sm, marginBottom: Sp.sm },
    searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { paddingHorizontal: Sp.lg, paddingBottom: 100 },
    empty: { alignItems: 'center', gap: Sp.sm, paddingTop: 60 },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingVertical: Sp.sm },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 15, fontWeight: '800' },
    rowInfo: { flex: 1 },
    rowName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
    rowSiret: { color: Colors.textMuted, fontSize: 11 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    quickBtns: { flexDirection: 'row', gap: 6 },
    acceptBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#22C55E18', borderWidth: 1, borderColor: '#22C55E44', alignItems: 'center', justifyContent: 'center' },
    refuseBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error + '44', alignItems: 'center', justifyContent: 'center' },
    separator: { height: 1, backgroundColor: Colors.border, marginLeft: 60 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, borderTopWidth: 1, borderColor: Colors.border, padding: Sp.lg, maxHeight: '80%' },
    handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Sp.lg },
    sheetHero: { alignItems: 'center', gap: Sp.sm, marginBottom: Sp.lg },
    sheetAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    sheetName: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
    infoTable: { backgroundColor: Colors.bgElevated, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Sp.lg },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
    infoLabel: { color: Colors.textMuted, fontSize: 13 },
    infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
    actionSectionLabel: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.sm },
    actionBtns: { flexDirection: 'row', gap: Sp.md, marginBottom: Sp.md },
    activateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#22C55E18', borderRadius: R.md, borderWidth: 1, borderColor: '#22C55E44', paddingVertical: 12 },
    activateBtnText: { color: '#22C55E', fontSize: 15, fontWeight: '600' },
    deactivateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.errorBg, borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44', paddingVertical: 12 },
    deactivateBtnText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
    closeBtn: { backgroundColor: Colors.bgElevated, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, paddingVertical: 13, alignItems: 'center', marginBottom: Sp.xl },
    closeBtnText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
});