import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { chasseService } from '../../services/api';
import { Chasse } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';
import ChasseFormModal from '../../components/ChasseFormModal';

const ETAT_COLOR: Record<string, string> = {
  PENDING:   Colors.warning,
  ACTIVE:    '#4ecb8a',
  COMPLETED: Colors.textMuted,
};

// ─── Card chasse ──────────────────────────────────────────────────────────────
function ChasseCard({ chasse, onPress, onEdit, onDelete }: {
  chasse: Chasse;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const occ        = chasse.occurence?.[0];
  const fmt        = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
  const etatColor  = ETAT_COLOR[chasse.etat] ?? Colors.textMuted;
  const isActive   = chasse.etat === 'ACTIVE';

  return (
    <TouchableOpacity style={card.wrap} activeOpacity={0.88} onPress={onPress}>
      {/* Image avec titre en overlay */}
      <View style={card.imageWrap}>
        {chasse.image ? (
          <Image source={{ uri: chasse.image }} style={card.image} resizeMode="cover" />
        ) : (
          <View style={[card.image, card.imageFallback]}>
            <Ionicons name="map-outline" size={36} color={Colors.textMuted} />
          </View>
        )}
        {/* Overlay sombre bas */}
        <View style={card.overlayContent}>
          <Text style={card.overlayTitle} numberOfLines={2}>{chasse.name}</Text>
        </View>
        {/* Badge statut */}
        <View style={card.statusBadge}>
          <View style={[card.statusDot, { backgroundColor: etatColor }]} />
          <Text style={card.statusText}>{isActive ? 'Active' : chasse.etat === 'PENDING' ? 'En attente' : 'Terminée'}</Text>
        </View>
      </View>

      {/* Footer infos + actions */}
      <View style={card.footer}>
        <View style={card.footerMeta}>
          {chasse.localisation ? (
            <View style={card.metaRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
              <Text style={card.metaText} numberOfLines={1}>{chasse.localisation}</Text>
            </View>
          ) : null}
          {occ ? (
            <View style={card.metaRow}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
              <Text style={card.metaText}>{fmt(occ.date_start)} → {fmt(occ.date_end)}</Text>
              <Text style={card.metaSep}>·</Text>
              <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
              <Text style={card.metaText}>{occ.limit_user}</Text>
            </View>
          ) : null}
        </View>
        <View style={card.actions}>
          <TouchableOpacity style={card.btnEdit} onPress={onEdit} activeOpacity={0.75}>
            <Ionicons name="pencil-outline" size={15} color={Colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity style={card.btnDel} onPress={onDelete} activeOpacity={0.75}>
            <Ionicons name="trash-outline" size={15} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [chasses, setChasses] = useState<Chasse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Chasse | null>(null);

  const loadChasses = useCallback(async () => {
    if (!user?.partener?.id_partenaire) return;
    try {
      const data = await chasseService.getByPartenaire(user.partener.id_partenaire);
      setChasses(data.chasseByPart ?? []);
    } catch (err) {
      console.log('Erreur chargement chasses :', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);


  useFocusEffect(useCallback(() => { loadChasses(); }, [loadChasses]));

  const handleDelete = (chasse: Chasse) => {
    Alert.alert(
        'Supprimer la chasse',
        `Voulez-vous supprimer "${chasse.name}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer', style: 'destructive',
            onPress: async () => {
              try {
                await chasseService.delete(chasse.id_chasse);
                await loadChasses();
              } catch (e: any) {
                Alert.alert('Erreur suppression', e.message ?? 'Échec');
              }
            },
          },
        ]
    );
  };

  if (!user) return null;

  const active    = chasses.filter(c => c.etat === 'ACTIVE').length;
  const pending   = chasses.filter(c => c.etat === 'PENDING').length;
  const initials  = user.username.slice(0, 2).toUpperCase();

  return (
      <View style={st.container}>
        {/* Header */}
        <View style={st.header}>
          <View style={st.headerLeft}>
            <Text style={st.company}>{user.partener?.company_name ?? 'Mon espace'}</Text>
            <Text style={st.greeting}>Bonjour, <Text style={st.greetingAccent}>{user.username}</Text></Text>
          </View>
          <View style={st.headerRight}>
            <TouchableOpacity style={st.addBtn} onPress={() => setCreateVisible(true)} activeOpacity={0.85}>
              <Ionicons name="add" size={22} color={Colors.black} />
            </TouchableOpacity>
            <View style={st.avatar}>
              <Text style={st.avatarText}>{initials}</Text>
            </View>
          </View>
        </View>

        {/* Stats rapides */}
        <View style={st.statsRow}>
          <View style={st.statItem}>
            <Text style={st.statVal}>{chasses.length}</Text>
            <Text style={st.statLabel}>Total</Text>
          </View>
          <View style={[st.statItem, st.statBorder]}>
            <Text style={[st.statVal, { color: '#4ecb8a' }]}>{active}</Text>
            <Text style={st.statLabel}>Actives</Text>
          </View>
          <View style={st.statItem}>
            <Text style={[st.statVal, { color: Colors.warning }]}>{pending}</Text>
            <Text style={st.statLabel}>En attente</Text>
          </View>
        </View>

        {/* Label section */}
        {chasses.length <0 && (
          <View style={st.sectionHd}>
            <Text style={st.sectionTitle}>Mes chasses</Text>
            <TouchableOpacity onPress={() => setCreateVisible(true)}>
              <Text style={st.sectionAction}>+ Nouvelle</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
            <View style={st.center}>
              <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        ) : (
            <FlatList
                data={chasses}
                keyExtractor={item => `chasse-${item.id_chasse}`}
                contentContainerStyle={[
                  st.list,
                  chasses.length === 0 && { flex: 1, justifyContent: 'center' },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => { setRefreshing(true); loadChasses(); }}
                      tintColor={Colors.gold}
                  />
                }
                renderItem={({ item }) => (
                    <ChasseCard
                        chasse={item}
                        onPress={() => router.push({
                          pathname: '/(partner)/(components)/chasse-detail',
                          params: { id: item.id_chasse },
                        })}
                        onEdit={() => setEditTarget(item)}
                        onDelete={() => handleDelete(item)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: Sp.md }} />}
                ListEmptyComponent={
                  <View style={st.empty}>
                    <View style={st.emptyIcon}>
                      <Ionicons name="map-outline" size={44} color={Colors.gold} />
                    </View>
                    <Text style={st.emptyTitle}>Aucune chasse créée</Text>
                    <Text style={st.emptySub}>Lancez votre première aventure</Text>
                    <TouchableOpacity style={st.createBtn} onPress={() => setCreateVisible(true)} activeOpacity={0.85}>
                      <Ionicons name="add-circle-outline" size={18} color={Colors.black} />
                      <Text style={st.createText}>Créer une chasse</Text>
                    </TouchableOpacity>
                  </View>
                }
            />
        )}

        <ChasseFormModal
            mode="create"
            visible={createVisible}
            onClose={() => setCreateVisible(false)}
            onSaved={loadChasses}
        />
        <ChasseFormModal
            mode="edit"
            visible={!!editTarget}
            chasse={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={loadChasses}
        />
      </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bgCard, borderRadius: R.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },

  imageWrap:     { position: 'relative' },
  image:         { width: '100%', height: 160 },
  imageFallback: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },

  overlayContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Sp.md, paddingTop: Sp.xl,
    backgroundColor: 'rgba(8,8,16,0.65)',
  },
  overlayTitle: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  statusBadge: {
    position: 'absolute', top: Sp.sm, right: Sp.sm,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(8,8,16,0.75)',
    borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  statusDot:  { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },

  footer:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Sp.md, paddingVertical: 10, gap: Sp.sm },
  footerMeta: { flex: 1, gap: 3 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:   { fontSize: 11, color: Colors.textMuted },
  metaSep:    { fontSize: 11, color: Colors.textMuted, marginHorizontal: 2 },

  actions: { flexDirection: 'row', gap: Sp.sm },
  btnEdit: {
    width: 34, height: 34, borderRadius: R.md,
    backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  btnDel: {
    width: 34, height: 34, borderRadius: R.md,
    backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error + '44',
    alignItems: 'center', justifyContent: 'center',
  },
});

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Sp.lg, paddingTop: Sp.lg, paddingBottom: Sp.md,
  },
  headerLeft:      { flex: 1, gap: 2 },
  headerRight:     { flexDirection: 'row', alignItems: 'center', gap: Sp.sm },
  company:         { fontSize: 11, color: Colors.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  greeting:        { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  greetingAccent:  { color: Colors.gold },

  addBtn: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.gold + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.gold, fontSize: 14, fontWeight: '800' },

  // Stats bar
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Sp.lg, marginBottom: Sp.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  statItem:   { flex: 1, alignItems: 'center', paddingVertical: Sp.md, gap: 2 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statVal:    { fontSize: 20, fontWeight: '800', color: Colors.gold },
  statLabel:  { fontSize: 11, color: Colors.textMuted },

  // Section header
  sectionHd: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Sp.lg, marginBottom: Sp.sm,
  },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionAction: { fontSize: 12, color: Colors.gold, fontWeight: '600' },

  list:   { paddingHorizontal: Sp.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  empty:     { alignItems: 'center', gap: Sp.md, paddingVertical: Sp.xxl },
  emptyIcon: {
    width: 80, height: 80, borderRadius: R.xl,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.gold + '33',
    alignItems: 'center', justifyContent: 'center', marginBottom: Sp.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub:   { fontSize: 14, color: Colors.textMuted },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
    marginTop: Sp.sm, backgroundColor: Colors.gold,
    paddingHorizontal: Sp.lg, paddingVertical: Sp.md, borderRadius: R.md,
  },
  createText: { fontWeight: '700', color: Colors.black, fontSize: 14 },
});