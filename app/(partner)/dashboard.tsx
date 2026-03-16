import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  RefreshControl, ActivityIndicator, Modal, ScrollView,
  SafeAreaView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { chasseService } from '../../services/api';
import { Chasse } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';
import Input from '../../components/Input';
import Btn from '../../components/Btn';

type EtatKey = 'PENDING' | 'ACTIVE' | 'COMPLETED';

const ETAT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: 'Active',     color: '#22C55E', bg: '#22C55E18' },
  PENDING:   { label: 'En attente', color: Colors.warning, bg: Colors.warningBg },
  COMPLETED: { label: 'Terminée',   color: Colors.textMuted, bg: Colors.bgElevated },
};

const EMPTY_EDIT = {
  name: '', localisation: '', etat: 'PENDING' as EtatKey,
  date_start: '', date_end: '', limit_user: '30',
};

function Stat({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
      <View style={[sS.card, { borderColor: color + '30' }]}>
        <View style={[sS.icon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={sS.val}>{value}</Text>
        <Text style={sS.label}>{label}</Text>
      </View>
  );
}
const sS = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, padding: Sp.sm, alignItems: 'center', gap: 4 },
  icon: { width: 36, height: 36, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  val: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  label: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },
});

function ChasseRow({ chasse, onDetail, onEdit, onDelete }: {
  chasse: Chasse; onDetail: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const cfg = ETAT_CFG[chasse.etat] ?? ETAT_CFG.PENDING;
  return (
      <TouchableOpacity style={rS.card} onPress={onDetail} activeOpacity={0.78}>
        <View style={rS.top}>
          <View style={rS.nameCol}>
            <Text style={rS.name} numberOfLines={1}>{chasse.name}</Text>
            {chasse.localisation ? (
                <View style={rS.loc}>
                  <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                  <Text style={rS.locText} numberOfLines={1}>{chasse.localisation}</Text>
                </View>
            ) : null}
          </View>
          <View style={[rS.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '55' }]}>
            <Text style={[rS.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {(chasse.occurence?.date_start || chasse.occurence?.limit_user) ? (
            <View style={rS.occ}>
              {chasse.occurence?.date_start ? (
                  <View style={rS.occItem}>
                    <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
                    <Text style={rS.occText}>
                      {chasse.occurence.date_start}
                      {chasse.occurence.date_end ? ` → ${chasse.occurence.date_end}` : ''}
                    </Text>
                  </View>
              ) : null}
              {chasse.occurence?.limit_user ? (
                  <View style={rS.occItem}>
                    <Ionicons name="people-outline" size={11} color={Colors.textMuted} />
                    <Text style={rS.occText}>Max {chasse.occurence.limit_user} joueurs</Text>
                  </View>
              ) : null}
            </View>
        ) : null}

        <View style={rS.actions}>
          <TouchableOpacity style={rS.actionBtn} onPress={onDetail}>
            <Ionicons name="map-outline" size={13} color={Colors.gold} />
            <Text style={[rS.actionText, { color: Colors.gold }]}>Parcours & étapes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={rS.actionBtn} onPress={onEdit}>
            <Ionicons name="pencil-outline" size={13} color={Colors.textSecondary} />
            <Text style={rS.actionText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[rS.actionBtn, rS.delBtn]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={13} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
  );
}
const rS = StyleSheet.create({
  card: { backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, padding: Sp.md, gap: Sp.sm },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Sp.sm },
  nameCol: { flex: 1, gap: 3 },
  name: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locText: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  badge: { borderWidth: 1, borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  occ: { flexDirection: 'row', gap: Sp.md, flexWrap: 'wrap', paddingTop: Sp.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  occItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  occText: { color: Colors.textMuted, fontSize: 11 },
  actions: { flexDirection: 'row', gap: Sp.sm, paddingTop: Sp.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.bgElevated, borderRadius: R.sm, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border },
  actionText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  delBtn: { flex: 0, paddingHorizontal: Sp.md },
});

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [chasses, setChasses] = useState<Chasse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Chasse | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [editLoading, setEditLoading] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (!user?.partenaire?.id_partenaire) return;
      const data = await chasseService.getByPartenaire(user.partenaire.id_partenaire);
      setChasses(data.chasseByPart ?? []);
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de charger vos chasses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Recharge à chaque focus
  useFocusEffect(useCallback(() => { load(true); }, [load]));

  const openEdit = (c: Chasse) => {
    setEditTarget(c);
    setEditForm({
      name: c.name ?? '',
      localisation: c.localisation ?? '',
      etat: (c.etat ?? 'PENDING') as EtatKey,
      date_start: c.occurence?.date_start ?? '',
      date_end: c.occurence?.date_end ?? '',
      limit_user: String(c.occurence?.limit_user ?? 30),
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await chasseService.update(editTarget.id_chasse, {
        name: editForm.name,
        localisation: editForm.localisation,
        etat: editForm.etat,
        occurence: {
          date_start: editForm.date_start,
          date_end: editForm.date_end,
          limit_user: Number(editForm.limit_user) || 30,
        },
      });
      setEditModal(false);
      load(true);
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Modification échouée');
    } finally {
      setEditLoading(false);
    }
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
          } catch (e: any) { Alert.alert('Erreur', e.message); }
        },
      },
    ]);
  };

  const stats = {
    total: chasses.length,
    active: chasses.filter(c => c.etat === 'ACTIVE').length,
    pending: chasses.filter(c => c.etat === 'PENDING').length,
  };
  const ef = (k: string) => (v: string) => setEditForm(f => ({ ...f, [k]: v }));

  return (
      <View style={styles.bg}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>{user?.partenaire?.company_name}</Text>
              <Text style={styles.headerTitle}>Tableau de bord</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(partner)/create-chasse')}>
              <Ionicons name="add" size={22} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <Stat icon="map" value={stats.total} label="Total" color={Colors.gold} />
            <Stat icon="checkmark-circle" value={stats.active} label="Actives" color="#22C55E" />
            <Stat icon="time" value={stats.pending} label="En attente" color={Colors.warning} />
          </View>

          {loading ? (
              <View style={styles.center}><ActivityIndicator color={Colors.gold} size="large" /></View>
          ) : (
              <FlatList
                  data={chasses}
                  keyExtractor={c => String(c.id_chasse)}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.gold} />
                  }
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Ionicons name="map-outline" size={52} color={Colors.textMuted} />
                      <Text style={styles.emptyTitle}>Aucune chasse créée</Text>
                      <Text style={styles.emptySub}>Commencez votre première aventure</Text>
                      <Btn label="Créer une chasse" onPress={() => router.push('/(partner)/create-chasse')} style={{ marginTop: Sp.md }} />
                    </View>
                  }
                  renderItem={({ item }) => (
                      <ChasseRow
                          chasse={item}
                          onDetail={() => router.push({ pathname: '/(partner)/chasse-detail', params: { id: item.id_chasse } })}
                          onEdit={() => openEdit(item)}
                          onDelete={() => confirmDelete(item)}
                      />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: Sp.sm }} />}
              />
          )}
        </SafeAreaView>

        {/* Modal Modification */}
        <Modal visible={editModal} animationType="slide" transparent onRequestClose={() => setEditModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Modifier la chasse</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setEditModal(false)}>
                    <Ionicons name="close" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <Input label="Nom" placeholder="Nom de la chasse" value={editForm.name} onChangeText={ef('name')} icon="bookmark-outline" />
                  <Input label="Localisation" placeholder="Paris, Musée..." value={editForm.localisation} onChangeText={ef('localisation')} icon="location-outline" />
                  <Text style={styles.sectLabel}>Occurrence</Text>
                  <View style={styles.row2}>
                    <View style={{ flex: 1 }}>
                      <Input label="Date début" placeholder="2026-05-01" value={editForm.date_start} onChangeText={ef('date_start')} icon="calendar-outline" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input label="Date fin" placeholder="2026-05-31" value={editForm.date_end} onChangeText={ef('date_end')} icon="calendar-outline" />
                    </View>
                  </View>
                  <Input label="Limite joueurs" placeholder="30" value={editForm.limit_user} onChangeText={ef('limit_user')} keyboard="numeric" icon="people-outline" />
                  <Text style={styles.sectLabel}>Statut</Text>
                  <View style={styles.etatRow}>
                    {(['PENDING', 'ACTIVE', 'COMPLETED'] as EtatKey[]).map(key => {
                      const cfg = ETAT_CFG[key];
                      const on = editForm.etat === key;
                      return (
                          <TouchableOpacity
                              key={key}
                              style={[styles.etatChip, on && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                              onPress={() => setEditForm(f => ({ ...f, etat: key }))}
                          >
                            <Text style={[styles.etatChipText, on && { color: cfg.color }]}>{cfg.label}</Text>
                          </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Btn label="Enregistrer" onPress={saveEdit} loading={editLoading} style={{ marginTop: Sp.md, marginBottom: Sp.xxl }} />
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Sp.lg, paddingTop: Sp.md, paddingBottom: Sp.sm },
  headerSub: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { width: 44, height: 44, borderRadius: R.full, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: Sp.sm, paddingHorizontal: Sp.lg, paddingBottom: Sp.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Sp.lg, paddingBottom: 100 },
  empty: { alignItems: 'center', gap: Sp.sm, paddingTop: 60 },
  emptyTitle: { color: Colors.textSecondary, fontSize: 17, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, borderTopWidth: 1, borderColor: Colors.border, padding: Sp.lg, paddingBottom: 0, maxHeight: '90%' },
  handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Sp.md },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Sp.md },
  sheetTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: R.sm, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  sectLabel: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.sm, marginTop: Sp.sm },
  row2: { flexDirection: 'row', gap: Sp.sm },
  etatRow: { flexDirection: 'row', gap: Sp.sm, marginBottom: Sp.md },
  etatChip: { flex: 1, paddingVertical: Sp.sm, borderRadius: R.md, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  etatChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
});