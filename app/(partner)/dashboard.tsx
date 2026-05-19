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
import { Colors, Design, Fonts, Sp, R } from '../../constants/theme';
import ChasseFormModal from '../../components/ChasseFormModal';
import ScreenBackground from '../../components/ScreenBackground';

const ETAT_COLOR: Record<string, string> = {
  PENDING:   Colors.warning,
  ACTIVE:    Design.status.ACTIVE.color,
  COMPLETED: Design.text.meta,
};

// ─── Card chasse ──────────────────────────────────────────────────────────────
function ChasseCard({ chasse, onPress, onEdit, onDelete, isDeleting }: {
  chasse: Chasse;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}) {
  const occ        = chasse.occurence?.[0];
  const fmt        = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
  const etatColor  = ETAT_COLOR[chasse.etat] ?? Design.text.meta;
  const isActive   = chasse.etat === 'ACTIVE';

  return (
    <TouchableOpacity style={card.wrap} activeOpacity={0.88} onPress={onPress}>
      {/* Image avec titre en overlay */}
      <View style={card.imageWrap}>
        {chasse.image ? (
          <Image source={{ uri: chasse.image }} style={card.image} resizeMode="cover" />
        ) : (
          <View style={[card.image, card.imageFallback]}>
            <Ionicons name="map-outline" size={36} color={Design.text.meta} />
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
              <Ionicons name="location-outline" size={12} color={Design.text.meta} />
              <Text style={card.metaText} numberOfLines={1}>{chasse.localisation}</Text>
            </View>
          ) : null}
          {occ ? (
            <View style={card.metaRow}>
              <Ionicons name="calendar-outline" size={12} color={Design.text.meta} />
              <Text style={card.metaText}>{fmt(occ.date_start)} → {fmt(occ.date_end)}</Text>
              <Text style={card.metaSep}>·</Text>
              <Ionicons name="people-outline" size={12} color={Design.text.meta} />
              <Text style={card.metaText}>{occ.limit_user}</Text>
            </View>
          ) : null}
        </View>
        <View style={card.actions}>
          <TouchableOpacity style={card.btnEdit} onPress={onEdit} activeOpacity={0.75}>
            <Ionicons name="pencil-outline" size={15} color={Design.text.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={[card.btnDel, isDeleting && { opacity: 0.6 }]} onPress={onDelete} activeOpacity={0.75} disabled={isDeleting}>
            {isDeleting
              ? <ActivityIndicator size="small" color={Colors.error} />
              : <Ionicons name="trash-outline" size={15} color={Colors.error} />
            }
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
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadChasses = useCallback(async () => {
    if (!user?.partener?.id_partenaire) return;
    try {
      const data = await chasseService.getByPartenaire(user.partener.id_partenaire);
      setChasses(data.chasseByPart ?? []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);


  useFocusEffect(useCallback(() => { loadChasses(); }, [loadChasses]));

  const handleDelete = (chasse: Chasse) => {
    Alert.alert(
        'Supprimer la chasse',
        `Voulez-vous vraiment supprimer "${chasse.name}" ?\nCette action est irréversible.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer', style: 'destructive',
            onPress: async () => {
              setDeletingId(chasse.id_chasse);
              try {
                await chasseService.delete(chasse.id_chasse);
                await loadChasses();
              } catch (e: any) {
                Alert.alert('Erreur suppression', e.message ?? 'Échec');
              } finally {
                setDeletingId(null);
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
      <ScreenBackground style={st.container}>
        {/* Header */}
        <View style={st.header}>
          <View style={st.headerLeft}>
            <Text style={st.company}>{user.partener?.company_name ?? 'Mon espace'}</Text>
            <Text style={st.greeting}>Bonjour, <Text style={st.greetingAccent}>{user.username}</Text></Text>
          </View>
          <View style={st.headerRight}>
            <TouchableOpacity style={st.addBtn} onPress={() => setCreateVisible(true)} activeOpacity={0.85}>
              <Ionicons name="add" size={22} color={Design.text.onSolid} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats rapides */}
        <View style={st.statsRow}>
          <View style={st.statItem}>
            <Text style={st.statVal}>{chasses.length}</Text>
            <Text style={st.statLabel}>Total</Text>
          </View>
          <View style={[st.statItem, st.statBorder]}>
            <Text style={[st.statVal, { color: Design.status.ACTIVE.color }]}>{active}</Text>
            <Text style={st.statLabel}>Actives</Text>
          </View>
          <View style={st.statItem}>
            <Text style={[st.statVal, { color: Design.text.warning }]}>{pending}</Text>
            <Text style={st.statLabel}>En attente</Text>
          </View>
        </View>

        {/* Label section */}
        {chasses.length > 0 && (
          <View style={st.sectionHd}>
            <Text style={st.sectionTitle}>Mes chasses</Text>
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
                        isDeleting={deletingId === item.id_chasse}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: Sp.md }} />}
                ListEmptyComponent={
                  <View style={st.empty}>
                    <View style={st.emptyIcon}>
                      <Ionicons name="map-outline" size={44} color={Design.text.accent} />
                    </View>
                    <Text style={st.emptyTitle}>Aucune chasse créée</Text>
                    <Text style={st.emptySub}>Lancez votre première aventure</Text>
                    <TouchableOpacity style={st.createBtn} onPress={() => setCreateVisible(true)} activeOpacity={0.85}>
                      <Ionicons name="add-circle-outline" size={18} color={Design.text.onSolid} />
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
      </ScreenBackground>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Design.bg.card, borderRadius: R.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: Design.border.warm,
  },

  imageWrap:     { position: 'relative' },
  image:         { width: '100%', height: 160 },
  imageFallback: { backgroundColor: Design.bg.elevated, alignItems: 'center', justifyContent: 'center' },

  overlayContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Sp.md, paddingTop: Sp.xl,
    backgroundColor: 'rgba(8,8,16,0.65)',
  },
  overlayTitle: { fontFamily: Fonts.title, fontSize: 15, color: '#EDEAF3', letterSpacing: 0.5 },

  statusBadge: {
    position: 'absolute', top: Sp.sm, right: Sp.sm,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(8,8,16,0.75)',
    borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Design.border.warm,
  },
  statusDot:  { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: Fonts.title, fontSize: 10, color: Design.text.heading },

  footer:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Sp.md, paddingVertical: 10, gap: Sp.sm },
  footerMeta: { flex: 1, gap: 3 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:   { fontFamily: Fonts.title, fontSize: 10, color: Design.text.meta },
  metaSep:    { fontSize: 10, color: Design.text.meta, marginHorizontal: 2 },

  actions: { flexDirection: 'row', gap: Sp.sm },
  btnEdit: {
    width: 34, height: 34, borderRadius: R.md,
    backgroundColor: Design.bg.gold, borderWidth: 1, borderColor: Colors.gold + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  btnDel: {
    width: 34, height: 34, borderRadius: R.md,
    backgroundColor: Design.bg.danger, borderWidth: 1, borderColor: Colors.error + '44',
    alignItems: 'center', justifyContent: 'center',
  },
});

const st = StyleSheet.create({
  container: { flex: 1, paddingTop: 10 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Sp.lg, paddingTop: Sp.lg, paddingBottom: Sp.md,
  },
  headerLeft:      { flex: 1, gap: 2 },
  headerRight:     { flexDirection: 'row', alignItems: 'center', gap: Sp.sm },
  company:         { fontFamily: Fonts.title, fontSize: 15, color: Design.text.heading, textTransform: 'uppercase', letterSpacing: 1.5 },
  greeting:        { fontFamily: Fonts.display, fontSize: 18, color: Design.text.heading, letterSpacing: 0.5 },
  greetingAccent:  { color: Design.text.accent },

  addBtn: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Design.button.primary.bg, alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Design.bg.elevated, borderWidth: 1, borderColor: Colors.gold + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.display, color: Design.text.accent, fontSize: 13 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Sp.lg, marginBottom: Sp.lg,
    backgroundColor: Design.bg.card,
    borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm,
    overflow: 'hidden',
  },
  statItem:   { flex: 1, alignItems: 'center', paddingVertical: Sp.md, gap: 2 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Design.border.warm },
  statVal:    { fontFamily: Fonts.display, fontSize: 20, color: Design.text.accent },
  statLabel:  { fontFamily: Fonts.title,   fontSize: 10, color: Design.text.meta },

  sectionHd: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Sp.lg, marginBottom: Sp.sm,
  },
  sectionTitle:  { fontFamily: Fonts.title, fontSize: 15, color: Design.text.label, textTransform: 'uppercase', letterSpacing: 1.5 },
  sectionAction: { fontFamily: Fonts.title, fontSize: 11, color: Design.text.accent },

  list:   { paddingHorizontal: Sp.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  empty:     { alignItems: 'center', gap: Sp.md, paddingVertical: Sp.xxl },
  emptyIcon: {
    width: 80, height: 80, borderRadius: R.xl,
    backgroundColor: Design.bg.card, borderWidth: 1, borderColor: Colors.gold + '33',
    alignItems: 'center', justifyContent: 'center', marginBottom: Sp.sm,
  },
  emptyTitle: { fontFamily: Fonts.display, fontSize: 16, color: Design.text.heading, letterSpacing: 0.5 },
  emptySub:   { fontFamily: Fonts.title,   fontSize: 12, color: Design.text.meta },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
    marginTop: Sp.sm, backgroundColor: Design.button.primary.bg,
    paddingHorizontal: Sp.lg, paddingVertical: Sp.md, borderRadius: R.md,
  },
  createText: { fontFamily: Fonts.title, color: Design.text.onSolid, fontSize: 13 },
});
