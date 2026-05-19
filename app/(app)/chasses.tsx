import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    ActivityIndicator, RefreshControl,
    TextInput, TouchableOpacity, Modal, Image, ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { chasseService } from '@/services/api';
import { Chasse, UserChasse } from '@/constants/types';
import { Colors, Fonts, Sp, R } from '@/constants/theme';
import ChasseCard from '@/components/ChasseCard';
import PageHeader from '@/components/PageHeader';
import ScreenBackground from '@/components/ScreenBackground';

type SortKey = 'date_desc' | 'date_asc';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
    { key: 'date_desc', label: 'Plus récentes en premier',  icon: 'time-outline' },
    { key: 'date_asc',  label: 'Plus anciennes en premier', icon: 'time-outline' },
];

interface CityResult {
    label: string;
    context: string;
}

export default function ChassesScreen() {
    const router = useRouter();
    const [chasses, setChasses]             = useState<Chasse[]>([]);
    const [userStatusMap, setUserStatusMap] = useState<Record<number, string>>({});
    const [loading, setLoading]             = useState(true);
    const [refreshing, setRefreshing]       = useState(false);
    const [search, setSearch]               = useState('');
    const [sort, setSort]                   = useState<SortKey>('date_desc');
    const [filterOpen, setFilterOpen]       = useState(false);

    // ── Filtre localisation ──────────────────────────────────────────────────────
    const [cityFilter, setCityFilter]       = useState<string | null>(null);
    const [geoLoading, setGeoLoading]       = useState(false);
    const [cityModalOpen, setCityModalOpen] = useState(false);
    const [cityQuery, setCityQuery]         = useState('');
    const [cityResults, setCityResults]     = useState<CityResult[]>([]);
    const [citySearching, setCitySearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = useCallback(async (city?: string | null) => {
        try {
            const filter = city !== undefined ? city : cityFilter;
            const [data, meData] = await Promise.all([
                chasseService.getAll(filter ?? undefined),
                chasseService.getMe().catch(() => ({ chasses: [] as UserChasse[] })),
            ]);
            setChasses(data.allChasse ?? []);
            const map: Record<number, string> = {};
            (meData.chasses ?? []).forEach(uc => {
                if (!map[uc.id_chasse] || uc.statut === 'IN_PROGRESS') {
                    map[uc.id_chasse] = uc.statut;
                }
            });
            setUserStatusMap(map);
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [cityFilter]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    // ── Géolocalisation automatique au premier montage ───────────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                autoDetect(false);
            }
        })();
    }, []);

    const autoDetect = async (askPermission = true) => {
        setGeoLoading(true);
        try {
            let { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted' && askPermission) {
                const req = await Location.requestForegroundPermissionsAsync();
                status = req.status;
            }
            if (status !== 'granted') return;

            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const [geo] = await Location.reverseGeocodeAsync({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
            const city = geo?.city ?? geo?.subregion ?? geo?.district ?? null;
            setCityFilter(city);
            load(city);
        } catch {
            // Si géoloc échoue, on reste sur "toutes"
        } finally {
            setGeoLoading(false);
        }
    };

    // ── Recherche de villes (api-adresse.data.gouv.fr) ──────────────────────────
    const searchCities = (text: string) => {
        setCityQuery(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (text.length < 2) { setCityResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setCitySearching(true);
            try {
                const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(text)}&type=municipality&limit=6`;
                const res  = await fetch(url);
                const json = await res.json();
                setCityResults(
                    (json.features ?? []).map((f: any) => ({
                        label: f.properties.city ?? f.properties.label,
                        context: f.properties.context,
                    }))
                );
            } catch {
                setCityResults([]);
            } finally {
                setCitySearching(false);
            }
        }, 300);
    };

    const selectCity = (label: string) => {
        setCityFilter(label);
        setCityModalOpen(false);
        setCityQuery('');
        setCityResults([]);
        load(label);
    };

    const clearCity = () => {
        setCityFilter(null);
        load(null);
    };

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
            const dA = new Date(a.created_at).getTime();
            const dB = new Date(b.created_at).getTime();
            return sort === 'date_asc' ? dA - dB : dB - dA;
        });
        return list;
    }, [chasses, search, sort]);

    const hasFilter = sort !== 'date_desc';

    if (loading) {
        return (
            <ScreenBackground style={st.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground style={st.safe}>
            <PageHeader title="Chasses" subtitle={`${filtered.length} disponibles`} />

            {/* ── Barre recherche + tri ── */}
            <View style={st.bar}>
                <View style={st.searchWrap}>
                    <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                    <TextInput
                        style={st.searchInput}
                        placeholder="Rechercher nom de la chasse..."
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
                    <Ionicons name="options-outline" size={20} color={hasFilter ? Colors.black : Colors.textSecondary} />
                    {hasFilter && <View style={st.filterDot} />}
                </TouchableOpacity>
            </View>

            {/* ── Barre de localisation ── */}
            <View style={st.locBar}>
                <TouchableOpacity style={st.locPill} onPress={() => setCityModalOpen(true)} activeOpacity={0.7}>
                    {geoLoading
                        ? <ActivityIndicator size="small" color={Colors.gold} style={{ marginRight: 6 }} />
                        : <Ionicons name={cityFilter ? 'location' : 'location-outline'} size={14} color={cityFilter ? Colors.gold : Colors.textMuted} />
                    }
                    <Text style={[st.locText, !!cityFilter && st.locTextActive]} numberOfLines={1}>
                        {geoLoading ? 'Localisation...' : cityFilter ?? 'Toutes les villes'}
                    </Text>
                    <Ionicons name="chevron-down" size={12} color={Colors.textMuted} style={{ marginLeft: 2 }} />
                </TouchableOpacity>

                {cityFilter ? (
                    <TouchableOpacity onPress={clearCity} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={st.locClear}>
                        <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => autoDetect(true)} disabled={geoLoading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={st.locClear}>
                        <Ionicons name="navigate" size={18} color={geoLoading ? Colors.textMuted : Colors.gold} />
                    </TouchableOpacity>
                )}
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
                        userStatus={userStatusMap[item.id_chasse] as any ?? null}
                        onPress={() => router.push({ pathname: '/(app)/chasse/[id]', params: { id: item.id_chasse } })}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: Sp.md }} />}
                ListEmptyComponent={
                    <View style={st.empty}>
                        <Text style={st.emptyTitle}>
                            {search ? 'Aucun résultat' : cityFilter ? `Aucune chasse à ${cityFilter}` : 'Aucune chasse disponible'}
                        </Text>
                        <Text style={st.emptySub}>
                            {search ? 'Essaie un autre mot-clé' : cityFilter ? 'Essaie une autre ville' : 'Les aventures arrivent bientôt...'}
                        </Text>
                        {(search || cityFilter) ? (
                            <TouchableOpacity onPress={() => { setSearch(''); clearCity(); }}>
                                <Text style={st.clearText}>Effacer les filtres</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                }
            />

            <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
                <TouchableOpacity style={st.backdrop} activeOpacity={1} onPress={() => setFilterOpen(false)}>
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
                                    <Ionicons name={opt.icon as any} size={18} color={active ? Colors.gold : Colors.textMuted} />
                                    <Text style={[st.optionText, active && st.optionTextActive]}>{opt.label}</Text>
                                    {active && <Ionicons name="checkmark" size={18} color={Colors.gold} />}
                                </TouchableOpacity>
                            );
                        })}
                        {hasFilter && (
                            <TouchableOpacity style={st.resetBtn} onPress={() => { setSort('date_desc'); setFilterOpen(false); }}>
                                <Text style={st.resetText}>Réinitialiser</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── Modal sélection ville ── */}
            <Modal visible={cityModalOpen} transparent animationType="slide" onRequestClose={() => setCityModalOpen(false)}>
                <TouchableOpacity style={st.backdrop} activeOpacity={1} onPress={() => setCityModalOpen(false)}>
                    <View style={[st.sheet, st.citySheet]} onStartShouldSetResponder={() => true}>
                        <Text style={st.sheetTitle}>Choisir une ville</Text>

                        <View style={st.citySearchRow}>
                            <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                            <TextInput
                                style={st.cityInput}
                                placeholder="Paris, Lyon, Bordeaux..."
                                placeholderTextColor={Colors.textMuted}
                                value={cityQuery}
                                onChangeText={searchCities}
                                autoFocus
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                            {citySearching && <ActivityIndicator size="small" color={Colors.gold} />}
                        </View>

                        {cityResults.length > 0 ? (
                            <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
                                {cityResults.map((item, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[st.cityOption, i < cityResults.length - 1 && st.cityOptionBorder]}
                                        onPress={() => selectCity(item.label)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={st.cityOptionName}>{item.label}</Text>
                                            <Text style={st.cityOptionCtx} numberOfLines={1}>{item.context}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : cityQuery.length === 0 ? (
                            <TouchableOpacity style={st.allCitiesBtn} onPress={() => { setCityFilter(null); setCityModalOpen(false); load(null); }}>
                                <Ionicons name="globe-outline" size={16} color={Colors.gold} />
                                <Text style={st.allCitiesText}>Toutes les villes</Text>
                            </TouchableOpacity>
                        ) : cityQuery.length >= 2 && !citySearching ? (
                            <Text style={st.noCity}>Aucune ville trouvée</Text>
                        ) : null}
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScreenBackground>
    );
}

const st = StyleSheet.create({
    safe:   { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    bar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Sp.lg, marginBottom: Sp.sm, gap: Sp.sm,
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
        width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.error,
    },

    // Barre localisation
    locBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Sp.lg, marginBottom: Sp.md, gap: Sp.sm,
    },
    locPill: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.gold,
        borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 8,
    },
    locText:       { flex: 1, fontSize: 13, color: Colors.textMuted },
    locTextActive: { color: Colors.gold, fontWeight: '600' },
    locClear:      { padding: 4 },

    list:      { paddingHorizontal: Sp.lg, paddingBottom: 100 },
    empty:     { alignItems: 'center', gap: Sp.md, paddingTop: 80 },
    emptyTitle:{ fontSize: 20, fontWeight: '700', color: Colors.textSecondary },
    emptySub:  { fontSize: 18, color: Colors.textSecondary, textAlign: 'center' },
    clearText: { color: Colors.gold, fontSize: 13, fontWeight: '600' },
    backdrop: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center', justifyContent: 'center', padding: Sp.xl,
    },
    sheet: {
        width: '100%', backgroundColor: Colors.bgCard,
        borderRadius: R.xl, borderWidth: 1, borderColor: Colors.gold,
        padding: Sp.lg, gap: Sp.sm,
    },
    citySheet: { maxHeight: '80%' },
    sheetTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: Sp.sm },
    option: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.md,
        padding: Sp.md, borderRadius: R.md,
    },
    optionActive:     { backgroundColor: Colors.goldGlow },
    optionText:       { flex: 1, fontSize: 15, color: Colors.textSecondary },
    optionTextActive: { color: Colors.gold, fontWeight: '700' },
    resetBtn:  { marginTop: Sp.sm, alignItems: 'center', padding: Sp.md },
    resetText: { color: Colors.error, fontSize: 14, fontWeight: '600' },

    citySearchRow: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
        backgroundColor: Colors.bgElevated, borderRadius: R.md,
        borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Sp.md, height: 44, marginBottom: Sp.sm,
    },
    cityInput: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
    cityOption: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
        paddingVertical: 10, paddingHorizontal: Sp.sm,
    },
    cityOptionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    cityOptionName:   { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
    cityOptionCtx:    { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
    allCitiesBtn: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
        padding: Sp.md, borderRadius: R.md, backgroundColor: Colors.goldGlow,
    },
    allCitiesText: { color: Colors.gold, fontSize: 14, fontWeight: '600' },
    noCity: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', padding: Sp.md },
});
