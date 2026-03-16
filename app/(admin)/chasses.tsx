import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
    TextInput, SafeAreaView, RefreshControl, ActivityIndicator, Modal, ScrollView, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService, etapeService } from '../../services/api';
import { Chasse, Etape } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';

type StatutChasse = 'PENDING' | 'ACTIVE' | 'COMPLETED';
type FilterKey = 'Tous' | StatutChasse;

const ETAT_CFG: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE:    { label: 'Active',     color: '#22C55E', bg: '#22C55E18' },
    PENDING:   { label: 'En attente', color: Colors.warning, bg: Colors.warningBg },
    COMPLETED: { label: 'Terminée',   color: Colors.textMuted, bg: Colors.bgElevated },
};

export default function AdminChasses() {
    const router = useRouter();
    const [chasses, setChasses] = useState<Chasse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterKey>('Tous');
    const [selected, setSelected] = useState<Chasse | null>(null);
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [detailModal, setDetailModal] = useState(false);
    const [etapesLoading, setEtapesLoading] = useState(false);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await chasseService.getAll();
            setChasses(data.allChasse ?? []);
        } catch {

        }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useFocusEffect(useCallback(() => { load(true); }, [load]));

    const openDetail = async (c: Chasse) => {
        setSelected(c);
        setDetailModal(true);
        setEtapesLoading(true);
        setEtapes([]);
        try {
            const e = await etapeService.getAll(c.id_chasse);
            setEtapes([...(Array.isArray(e) ? e : [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)));
        } catch { }
        finally { setEtapesLoading(false); }
    };

    const changeEtat = async (c: Chasse, etat: StatutChasse) => {
        try {
            await chasseService.update(c.id_chasse, { etat });
            setChasses(prev => prev.map(x => x.id_chasse === c.id_chasse ? { ...x, etat } : x));
            if (selected?.id_chasse === c.id_chasse) setSelected(s => s ? { ...s, etat } : s);
        } catch (e: any) { Alert.alert('Erreur', e.message); }
    };

    const confirmDelete = (c: Chasse) => {
        Alert.alert('Supprimer', `Supprimer « ${c.name} » et toutes ses étapes ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive',
                onPress: async () => {
                    try {
                        await chasseService.delete(c.id_chasse);
                        setChasses(prev => prev.filter(x => x.id_chasse !== c.id_chasse));
                        setDetailModal(false);
                    } catch (e: any) { Alert.alert('Erreur', e.message); }
                },
            },
        ]);
    };

    const filtered = chasses.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.localisation.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'Tous' || c.etat === filter;
        return matchSearch && matchFilter;
    });

    const counts = {
        ACTIVE: chasses.filter(c => c.etat === 'ACTIVE').length,
        PENDING: chasses.filter(c => c.etat === 'PENDING').length,
        COMPLETED: chasses.filter(c => c.etat === 'COMPLETED').length,
    };

    return (
        <View style={styles.bg}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>Chasses</Text>
                    <View style={styles.totalBadge}><Text style={styles.totalText}>{chasses.length}</Text></View>
                </View>

                {/* Mini stats */}
                <View style={styles.miniStats}>
                    {([
                        { key: 'ACTIVE', label: 'Actives', color: '#22C55E' },
                        { key: 'PENDING', label: 'En attente', color: Colors.warning },
                        { key: 'COMPLETED', label: 'Terminées', color: Colors.textMuted },
                    ] as const).map(s => (
                        <TouchableOpacity
                            key={s.key}
                            style={[styles.miniStat, filter === s.key && { borderColor: s.color }]}
                            onPress={() => setFilter(filter === s.key ? 'Tous' : s.key)}
                        >
                            <Text style={[styles.miniStatValue, { color: s.color }]}>{counts[s.key]}</Text>
                            <Text style={styles.miniStatLabel}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                    <TextInput style={styles.searchInput} placeholder="Chasse, ville..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
                </View>

                {loading ? (
                    <View style={styles.center}><ActivityIndicator color={Colors.gold} size="large" /></View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={c => String(c.id_chasse)}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.gold} />}
                        ListEmptyComponent={<View style={styles.empty}><Ionicons name="map-outline" size={40} color={Colors.textMuted} /><Text style={styles.emptyText}>Aucune chasse</Text></View>}
                        renderItem={({ item: c }) => {
                            const cfg = ETAT_CFG[c.etat] ?? ETAT_CFG.PENDING;
                            return (
                                <TouchableOpacity style={styles.row} onPress={() => openDetail(c)} activeOpacity={0.8}>
                                    {c.image
                                        ? <Image source={{ uri: c.image }} style={styles.rowImg} />
                                        : <View style={[styles.rowImg, styles.rowImgPlaceholder]}><Ionicons name="map" size={20} color={Colors.textMuted} /></View>
                                    }
                                    <View style={styles.rowInfo}>
                                        <Text style={styles.rowName} numberOfLines={1}>{c.name}</Text>
                                        <View style={styles.rowLoc}>
                                            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                                            <Text style={styles.rowLocText} numberOfLines={1}>{c.localisation}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => confirmDelete(c)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="trash-outline" size={15} color={Colors.error} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </SafeAreaView>

            {/* Modal détail chasse admin */}
            <Modal visible={detailModal} animationType="slide" transparent onRequestClose={() => setDetailModal(false)}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        {selected && (() => {
                            const cfg = ETAT_CFG[selected.etat] ?? ETAT_CFG.PENDING;
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Header */}
                                    <View style={styles.sheetHeader}>
                                        <View style={styles.sheetTitleRow}>
                                            <Text style={styles.sheetTitle} numberOfLines={1}>{selected.name}</Text>
                                            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setDetailModal(false)}>
                                                <Ionicons name="close" size={18} color={Colors.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.sheetMeta}>
                                            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                                            <Text style={styles.sheetMetaText}>{selected.localisation}</Text>
                                            <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                                <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Infos */}
                                    <View style={styles.infoTable}>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>ID</Text>
                                            <Text style={styles.infoValue}>#{selected.id_chasse}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Partenaire ID</Text>
                                            <Text style={styles.infoValue}>#{selected.idPartenaire}</Text>
                                        </View>
                                        {selected.occurence?.[0] && (
                                            <>
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>Période</Text>
                                                    <Text style={styles.infoValue}>
                                                        {selected.occurence[0].date_start?.split('T')[0]} → {selected.occurence[0].date_end?.split('T')[0]}
                                                    </Text>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>Limite joueurs</Text>
                                                    <Text style={styles.infoValue}>{selected.occurence[0].limit_user}</Text>
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    {/* Changer statut */}
                                    <Text style={styles.sectionLabel}>Modifier le statut</Text>
                                    <View style={styles.etatBtns}>
                                        {(['PENDING', 'ACTIVE', 'COMPLETED'] as StatutChasse[]).map(etat => {
                                            const c = ETAT_CFG[etat];
                                            const active = selected.etat === etat;
                                            return (
                                                <TouchableOpacity
                                                    key={etat}
                                                    style={[styles.etatBtn, active && { backgroundColor: c.bg, borderColor: c.color }]}
                                                    onPress={() => changeEtat(selected, etat)}
                                                >
                                                    <Text style={[styles.etatBtnText, active && { color: c.color }]}>{c.label}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Étapes */}
                                    <Text style={styles.sectionLabel}>Étapes ({etapes.length})</Text>
                                    {etapesLoading ? (
                                        <ActivityIndicator color={Colors.gold} style={{ marginVertical: Sp.lg }} />
                                    ) : etapes.length === 0 ? (
                                        <Text style={styles.noEtapes}>Aucune étape pour cette chasse</Text>
                                    ) : (
                                        etapes.map((e, idx) => (
                                            <View key={e.id} style={styles.etapeRow}>
                                                <View style={styles.etapeNum}>
                                                    <Text style={styles.etapeNumText}>{idx + 1}</Text>
                                                </View>
                                                <View style={styles.etapeInfo}>
                                                    <Text style={styles.etapeName}>{e.name}</Text>
                                                    <Text style={styles.etapeAddr}>{e.address}</Text>
                                                </View>
                                                <Text style={styles.etapeRayon}>r={e.rayon}m</Text>
                                            </View>
                                        ))
                                    )}

                                    {/* Delete */}
                                    <TouchableOpacity style={styles.deleteFullBtn} onPress={() => confirmDelete(selected)}>
                                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                                        <Text style={styles.deleteFullBtnText}>Supprimer cette chasse</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, paddingHorizontal: Sp.lg, paddingTop: Sp.md, paddingBottom: Sp.sm },
    title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '900', flex: 1 },
    totalBadge: { backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 4 },
    totalText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
    miniStats: { flexDirection: 'row', gap: Sp.sm, paddingHorizontal: Sp.lg, marginBottom: Sp.sm },
    miniStat: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, padding: Sp.sm, alignItems: 'center', gap: 2 },
    miniStatValue: { fontSize: 20, fontWeight: '800' },
    miniStatLabel: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Sp.md, paddingVertical: Sp.sm, marginBottom: Sp.sm },
    searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { paddingHorizontal: Sp.lg, paddingBottom: 100 },
    empty: { alignItems: 'center', gap: Sp.sm, paddingTop: 60 },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingVertical: Sp.sm },
    rowImg: { width: 52, height: 52, borderRadius: R.lg },
    rowImgPlaceholder: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
    rowInfo: { flex: 1 },
    rowName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
    rowLoc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    rowLocText: { color: Colors.textMuted, fontSize: 11, flex: 1 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    deleteBtn: { width: 32, height: 32, borderRadius: R.sm, backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error + '44', alignItems: 'center', justifyContent: 'center' },
    separator: { height: 1, backgroundColor: Colors.border, marginLeft: 68 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, borderTopWidth: 1, borderColor: Colors.border, padding: Sp.lg, maxHeight: '88%' },
    handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Sp.md },
    sheetHeader: { marginBottom: Sp.md },
    sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, marginBottom: 4 },
    sheetTitle: { flex: 1, color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
    sheetCloseBtn: { width: 32, height: 32, borderRadius: R.sm, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
    sheetMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    sheetMetaText: { color: Colors.textMuted, fontSize: 13, flex: 1 },
    infoTable: { backgroundColor: Colors.bgElevated, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Sp.md },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
    infoLabel: { color: Colors.textMuted, fontSize: 13 },
    infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
    sectionLabel: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.sm, marginTop: Sp.xs },
    etatBtns: { flexDirection: 'row', gap: Sp.sm, marginBottom: Sp.md },
    etatBtn: { flex: 1, paddingVertical: 8, borderRadius: R.md, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
    etatBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
    noEtapes: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: Sp.md },
    etapeRow: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, backgroundColor: Colors.bgElevated, borderRadius: R.md, padding: Sp.sm, marginBottom: Sp.xs, borderWidth: 1, borderColor: Colors.border },
    etapeNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44', alignItems: 'center', justifyContent: 'center' },
    etapeNumText: { color: Colors.gold, fontSize: 11, fontWeight: '800' },
    etapeInfo: { flex: 1 },
    etapeName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
    etapeAddr: { color: Colors.textMuted, fontSize: 11 },
    etapeRayon: { color: Colors.textMuted, fontSize: 11 },
    deleteFullBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.errorBg, borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44', paddingVertical: 13, marginTop: Sp.md, marginBottom: Sp.xxl },
    deleteFullBtnText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});