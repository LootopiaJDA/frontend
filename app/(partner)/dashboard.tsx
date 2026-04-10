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
  PENDING: Colors.gold,
  ACTIVE: '#4caf50',
  COMPLETED: Colors.textMuted,
};

// ─── Card chasse ──────────────────────────────────────────────────────────────
function ChasseCard({ chasse, onPress, onEdit, onDelete }: {
  chasse: Chasse;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const occ = chasse.occurence?.[0];
  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
  const etatColor = ETAT_COLOR[chasse.etat] ?? Colors.textMuted;

  return (
      <TouchableOpacity style={card.wrap} activeOpacity={0.88} onPress={onPress}>
        {chasse.image
            ? <Image source={{ uri: chasse.image }} style={card.img} resizeMode="cover" />
            : null}
        <View style={card.body}>
          <View style={card.row}>
            <Text style={card.name} numberOfLines={1}>{chasse.name}</Text>
            <View style={[card.badge, { borderColor: etatColor }]}>
              <Text style={[card.badgeTxt, { color: etatColor }]}>{chasse.etat}</Text>
            </View>
          </View>

          {chasse.localisation ? (
              <View style={card.row}>
                <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                <Text style={card.meta}>{chasse.localisation}</Text>
              </View>
          ) : null}

          {occ ? (
              <View style={card.row}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                <Text style={card.meta}>{fmt(occ.date_start)} → {fmt(occ.date_end)}</Text>
                <Ionicons name="people-outline" size={13} color={Colors.textMuted} style={{ marginLeft: 6 }} />
                <Text style={card.meta}>{occ.limit_user} places</Text>
              </View>
          ) : null}

          <View style={[card.row, { marginTop: Sp.sm, gap: Sp.sm }]}>
            <TouchableOpacity style={card.btnEdit} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={14} color={Colors.gold} />
              <Text style={card.btnEditTxt}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={card.btnDel} onPress={onDelete}>
              <Ionicons name="trash-outline" size={14} color={Colors.error} />
              <Text style={card.btnDelTxt}>Supprimer</Text>
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

  return (
      <View style={st.container}>
        {/* Header */}
        <View style={st.header}>
          <View>
            <Text style={st.company}>{user.partener?.company_name}</Text>
            <Text style={st.title}>Bienvenue, {user.username}</Text>
          </View>
          <TouchableOpacity style={st.addBtn} onPress={() => setCreateVisible(true)}>
            <Ionicons name="add" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {loading ? (
            <View style={st.center}>
              <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        ) : (
            <FlatList
                data={chasses}
                // key robuste : id_chasse est toujours un number depuis l'API
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
                ListEmptyComponent={
                  <View style={st.empty}>
                    <Ionicons name="map-outline" size={60} color={Colors.textMuted} />
                    <Text style={st.emptyTitle}>Aucune chasse créée</Text>
                    <Text style={st.emptySub}>Commencez votre première aventure</Text>
                    <TouchableOpacity style={st.createBtn} onPress={() => setCreateVisible(true)}>
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
    backgroundColor: Colors.bgCard, borderRadius: R.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: Sp.md,
  },
  img: { width: '100%', height: 160 },
  body: { padding: Sp.md, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textMuted },
  badge: { borderWidth: 1, borderRadius: R.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  btnEdit: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: R.md, borderWidth: 1,
    borderColor: Colors.gold + '55', backgroundColor: Colors.goldGlow, paddingVertical: 8,
  },
  btnEditTxt: { color: Colors.gold, fontSize: 13, fontWeight: '700' },
  btnDel: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: R.md, borderWidth: 1,
    borderColor: Colors.error + '55', backgroundColor: Colors.errorBg, paddingVertical: 8,
  },
  btnDelTxt: { color: Colors.error, fontSize: 13, fontWeight: '700' },
});

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Sp.lg, paddingTop: Sp.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Sp.lg, paddingVertical: Sp.md,
  },
  company: { fontSize: 12, color: Colors.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  addBtn: {
    width: 44, height: 44, borderRadius: R.full,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 14, color: Colors.textMuted },
  createBtn: {
    marginTop: 15, backgroundColor: Colors.gold,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: R.md,
  },
  createText: { fontWeight: '700', color: Colors.black },
});