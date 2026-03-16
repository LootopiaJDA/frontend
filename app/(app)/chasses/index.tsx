import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput, SafeAreaView, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService } from '../../../services/api';
import { Chasse } from '../../../constants/types';
import { Colors, Sp, R } from '../../../constants/theme';

const FILTERS = ['Toutes', 'Actives', 'Proches'] as const;
type Filter = typeof FILTERS[number];

function ChasseCard({ chasse, onPress }: { chasse: Chasse; onPress: () => void }) {
  const occ = chasse.occurence?.[0];
  return (
      <TouchableOpacity style={cS.card} onPress={onPress} activeOpacity={0.82}>
        {/* Image */}
        <View style={cS.imgWrap}>
          {chasse.image
              ? <Image source={{ uri: chasse.image }} style={cS.img} />
              : <View style={cS.imgPlaceholder}><Ionicons name="map" size={32} color={Colors.textMuted} /></View>
          }
          <View style={cS.imgOverlay}>
            <View style={cS.etatBadge}>
              <View style={[cS.dot, { backgroundColor: chasse.etat === 'ACTIVE' ? '#22C55E' : Colors.warning }]} />
              <Text style={cS.etatText}>{chasse.etat === 'ACTIVE' ? 'Active' : 'En attente'}</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={cS.body}>
          <Text style={cS.name} numberOfLines={1}>{chasse.name}</Text>
          <View style={cS.locRow}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={cS.locText} numberOfLines={1}>{chasse.localisation}</Text>
          </View>

          <View style={cS.meta}>
            {occ?.date_start ? (
                <View style={cS.metaChip}>
                  <Ionicons name="calendar-outline" size={11} color={Colors.gold} />
                  <Text style={cS.metaText}>{occ.date_start.split('T')[0]}</Text>
                </View>
            ) : null}
            {occ?.limit_user ? (
                <View style={cS.metaChip}>
                  <Ionicons name="people-outline" size={11} color={Colors.gold} />
                  <Text style={cS.metaText}>Max {occ.limit_user}</Text>
                </View>
            ) : null}
          </View>
        </View>

        <View style={cS.footer}>
          <Text style={cS.footerCta}>Voir la chasse</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.gold} />
        </View>
      </TouchableOpacity>
  );
}

const cS = StyleSheet.create({
  card: { backgroundColor: Colors.bgCard, borderRadius: R.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  imgWrap: { height: 160, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { flex: 1, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  imgOverlay: { position: 'absolute', top: Sp.sm, left: Sp.sm },
  etatBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.bgCard + 'DD', borderRadius: R.full, paddingHorizontal: Sp.sm, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  etatText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '600' },
  body: { padding: Sp.md, gap: Sp.xs },
  name: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  meta: { flexDirection: 'row', gap: Sp.sm, flexWrap: 'wrap', marginTop: 4 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.goldGlow, borderRadius: R.full, paddingHorizontal: Sp.sm, paddingVertical: 3 },
  metaText: { color: Colors.gold, fontSize: 11, fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Sp.md, paddingVertical: Sp.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  footerCta: { color: Colors.gold, fontSize: 13, fontWeight: '700' },
});

export default function ChassesScreen() {
  const router = useRouter();
  const [chasses, setChasses] = useState<Chasse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('Toutes');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await chasseService.getAll();
      setChasses(data.allChasse ?? []);
    } catch { /* silencieux */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(true); }, [load]));

  const filtered = chasses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.localisation.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Toutes' || filter === 'Actives' && c.etat === 'ACTIVE';
    return matchSearch && matchFilter;
  });

  return (
      <View style={styles.bg}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Bienvenue</Text>
              <Text style={styles.headerTitle}>Chasses disponibles</Text>
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={() => router.push('/(app)/map')}>
              <Ionicons name="navigate" size={20} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
            <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une chasse, une ville..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
            />
            {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
            ) : null}
          </View>

          {/* Filtres */}
          <View style={styles.filters}>
            {FILTERS.map(f => (
                <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, filter === f && styles.filterChipActive]}
                    onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
            ))}
            <View style={styles.countChip}>
              <Text style={styles.countText}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</Text>
            </View>
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
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                      <Text style={styles.emptyTitle}>Aucune chasse trouvée</Text>
                      <Text style={styles.emptySub}>Essayez un autre terme ou revenez plus tard.</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                      <ChasseCard
                          chasse={item}
                          onPress={() => router.push({ pathname: '/(app)/chasse-detail', params: { id: item.id_chasse } })}
                      />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: Sp.md }} />}
              />
          )}
        </SafeAreaView>
      </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Sp.lg, paddingTop: Sp.md, paddingBottom: Sp.sm },
  headerSub: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  mapBtn: { width: 44, height: 44, borderRadius: R.full, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Sp.md, paddingVertical: Sp.sm, marginBottom: Sp.sm },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  filters: { flexDirection: 'row', gap: Sp.sm, paddingHorizontal: Sp.lg, paddingBottom: Sp.md, flexWrap: 'wrap', alignItems: 'center' },
  filterChip: { paddingHorizontal: Sp.md, paddingVertical: 6, borderRadius: R.full, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.goldGlow, borderColor: Colors.gold },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.gold },
  countChip: { marginLeft: 'auto' },
  countText: { color: Colors.textMuted, fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Sp.lg, paddingBottom: 100 },
  empty: { alignItems: 'center', gap: Sp.sm, paddingTop: 60 },
  emptyTitle: { color: Colors.textSecondary, fontSize: 17, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
});