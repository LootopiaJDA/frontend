import React, { useState, useCallback, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    ActivityIndicator, RefreshControl, SafeAreaView,
    TextInput, TouchableOpacity, Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService } from '@/services/api';
import { Chasse } from '@/constants/types';
import { Colors, Sp, R } from '@/constants/theme';
import ChasseCard from '@/components/ChasseCard';
import PageHeader from '@/components/PageHeader';

type SortKey = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
    { key: 'date_desc', label: 'Plus récentes en premier',  icon: 'time-outline' },
    { key: 'date_asc',  label: 'Plus anciennes en premier', icon: 'time-outline' },
    { key: 'name_asc',  label: 'Nom : A → Z',              icon: 'text-outline' },
    { key: 'name_desc', label: 'Nom : Z → A',              icon: 'text-outline' },
];

export default function ChassesScreen() {
    const router = useRouter();
    const [chasses, setChasses]       = useState<Chasse[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch]         = useState('');
    const [sort, setSort]             = useState<SortKey>('date_desc');
    const [filterOpen, setFilterOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await chasseService.getAll();
            setChasses(data.allChasse ?? []);
        } catch (err) {
            console.log('Erreur chargement chasses:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const filtered = useMemo(() => {
        let list = [...chasses];
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.localisation ?? '').toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            if (sort === 'name_asc')  return a.name.localeCompare(b.name);
            if (sort === 'name_desc') return b.name.localeCompare(a.name);
            const dA = new Date(a.created_at).getTime();
            const dB = new Date(b.created_at).getTime();
            return sort === 'date_asc' ? dA - dB : dB - dA;
        });
        return list;
    }, [chasses, search, sort]);

    const activeLabel = SORT_OPTIONS.find(o => o.key === sort)?.label ?? '';
    const hasFilter = sort !== 'date_desc';

    if (loading) {
        return (
            <View style={st.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        );
    }

    return (
        <SafeAreaView style={st.safe}>
            <PageHeader title="Chasses" subtitle={`${filtered.length} disponibles`} />

            {/* Barre recherche + bouton filtre */}
            <View style={st.bar}>
                <View style={st.searchWrap}>
                    <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                    <TextInput
                        style={st.searchInput}
                        placeholder="Rechercher..."
                        placeholderTextColor={Colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[st.filterBtn, hasFilter && st.filterBtnActive]}
                    onPress={() => setFilterOpen(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="options-outline"
                        size={20}
                        color={hasFilter ? Colors.black : Colors.textSecondary}
                    />
                    {hasFilter && <View style={st.filterDot} />}
                </TouchableOpacity>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => `chasse-${item.id_chasse}`}
                contentContainerStyle={st.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); load(); }}
                        tintColor={Colors.gold}
                    />
                }
                renderItem={({ item }) => (
                    <ChasseCard
                        chasse={item}
                        onPress={() => router.push({ pathname: '/(app)/chasse/[id]', params: { id: item.id_chasse } })}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: Sp.md }} />}
                ListEmptyComponent={
                    <View style={st.empty}>
                        <Ionicons name={search ? 'search-outline' : 'map-outline'} size={48} color={Colors.textMuted} />
                        <Text style={st.emptyTitle}>
                            {search ? 'Aucun résultat' : 'Aucune chasse disponible'}
                        </Text>
                        {search ? (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Text style={st.clearText}>Effacer la recherche</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                }
            />

            {/* Modal filtres */}
            <Modal
                visible={filterOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setFilterOpen(false)}
            >
                <TouchableOpacity
                    style={st.backdrop}
                    activeOpacity={1}
                    onPress={() => setFilterOpen(false)}
                >
                    <View style={st.sheet}>
                        <Text style={st.sheetTitle}>Trier par</Text>

                        {SORT_OPTIONS.map(opt => {
                            const active = sort === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[st.option, active && st.optionActive]}
                                    onPress={() => { setSort(opt.key); setFilterOpen(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={opt.icon as any}
                                        size={18}
                                        color={active ? Colors.gold : Colors.textMuted}
                                    />
                                    <Text style={[st.optionText, active && st.optionTextActive]}>
                                        {opt.label}
                                    </Text>
                                    {active && (
                                        <Ionicons name="checkmark" size={18} color={Colors.gold} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}

                        {hasFilter && (
                            <TouchableOpacity
                                style={st.resetBtn}
                                onPress={() => { setSort('date_desc'); setFilterOpen(false); }}
                            >
                                <Text style={st.resetText}>Réinitialiser</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:   { flex: 1, backgroundColor: Colors.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },

    bar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Sp.lg, marginBottom: Sp.md, gap: Sp.sm,
    },
    searchWrap: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
        backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
        borderRadius: R.lg, paddingHorizontal: Sp.md, height: 44,
    },
    searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },

    filterBtn: {
        width: 44, height: 44, borderRadius: R.lg,
        backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    filterBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
    filterDot: {
        position: 'absolute', top: 8, right: 8,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: Colors.error,
    },

    list:      { paddingHorizontal: Sp.lg, paddingBottom: 100 },
    empty:     { alignItems: 'center', gap: Sp.md, paddingTop: 80 },
    emptyTitle:{ fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
    clearText: { color: Colors.gold, fontSize: 13, fontWeight: '600' },

    backdrop: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center', justifyContent: 'center',
        padding: Sp.xl,
    },
    sheet: {
        width: '100%',
        backgroundColor: Colors.bgCard,
        borderRadius: R.xl,
        borderWidth: 1, borderColor: Colors.border,
        padding: Sp.lg, gap: Sp.sm,
    },
    sheetTitle: {
        fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: Sp.sm,
    },
    option: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.md,
        padding: Sp.md, borderRadius: R.md,
    },
    optionActive:     { backgroundColor: Colors.goldGlow },
    optionText:       { flex: 1, fontSize: 15, color: Colors.textSecondary },
    optionTextActive: { color: Colors.gold, fontWeight: '700' },

    resetBtn:  { marginTop: Sp.sm, alignItems: 'center', padding: Sp.md },
    resetText: { color: Colors.error, fontSize: 14, fontWeight: '600' },
});
