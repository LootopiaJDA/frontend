import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, Modal, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { chasseService } from '../../services/api';
import { Chasse } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';
import Input from '../../components/Input';

type Etat = 'PENDING' | 'ACTIVE';

const EMPTY_FORM = {
  name: '', localisation: '', etat: 'PENDING' as Etat,
  date_start: '', date_end: '', limit_user: '30',
};

const ETAT_COLOR: Record<string, string> = {
  PENDING: Colors.gold,
  ACTIVE: '#4caf50',
  COMPLETED: Colors.textMuted,
};

// ─── Modal création ───────────────────────────────────────────────────────────
function CreateChasseModal({ visible, onClose, onCreated }: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const s = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  React.useEffect(() => {
    if (visible) { setForm(EMPTY_FORM); setImage(null); setErrors({}); }
  }, [visible]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [16, 9], quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setImage({ uri: a.uri, name: a.fileName || `chasse_${Date.now()}.jpg`, type: a.mimeType || 'image/jpeg' });
      setErrors(e => ({ ...e, image: '' }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.localisation.trim()) e.localisation = 'Localisation requise';
    if (!image) e.image = 'Image requise';
    setErrors(e);
    return Object.keys(e).every(k => !e[k]);
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('localisation', form.localisation.trim());
      fd.append('etat', form.etat);
      fd.append('occurrence', JSON.stringify({
        date_start: form.date_start,
        date_end: form.date_end,
        limit_user: Number(form.limit_user) || 30,
      }));
      fd.append('image', { uri: image!.uri, name: image!.name, type: image!.type } as any);
      await chasseService.create(fd);
      onCreated(); // reload la liste
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Création échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <SafeAreaView style={cm.safe}>
          <View style={cm.header}>
            <TouchableOpacity onPress={onClose} style={cm.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={cm.title}>Nouvelle chasse</Text>
            <TouchableOpacity onPress={handleCreate} disabled={loading} style={[cm.saveBtn, loading && { opacity: 0.5 }]}>
              <Text style={cm.saveBtnText}>{loading ? '...' : 'Créer'}</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={cm.scroll} keyboardShouldPersistTaps="handled">

              <Text style={cm.label}>Image de couverture *</Text>
              <TouchableOpacity style={[cm.imagePicker, !!errors.image && cm.imagePickerErr]} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image.uri }} style={cm.imagePreview} />
                ) : (
                    <View style={cm.imagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                      <Text style={cm.imagePlaceholderText}>Sélectionner une image</Text>
                    </View>
                )}
              </TouchableOpacity>
              {errors.image ? <Text style={cm.errText}>{errors.image}</Text> : null}

              <Input label="Nom de la chasse" placeholder="La Quête du Dragon..." value={form.name} onChangeText={s('name')} error={errors.name} icon="bookmark-outline" autoCapitalize="sentences" />
              <Input label="Localisation" placeholder="Paris, Musée du Louvre..." value={form.localisation} onChangeText={s('localisation')} error={errors.localisation} icon="location-outline" autoCapitalize="sentences" />

              <Text style={cm.sectionLabel}>Occurrence</Text>
              <View style={cm.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={cm.label}>Date début</Text>
                  <TouchableOpacity style={cm.dateInput} onPress={() => setShowStart(true)}>
                    <Text style={{ color: form.date_start ? Colors.textPrimary : Colors.textMuted }}>
                      {form.date_start || 'Choisir'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color={Colors.gold} />
                  </TouchableOpacity>
                  {showStart && (
                      <DateTimePicker
                          value={form.date_start ? new Date(form.date_start) : new Date()}
                          mode="date" display="calendar"
                          onChange={(_, d) => {
                            setShowStart(Platform.OS === 'ios');
                            if (d) setForm(f => ({ ...f, date_start: d.toISOString().split('T')[0] }));
                          }}
                      />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={cm.label}>Date fin</Text>
                  <TouchableOpacity style={cm.dateInput} onPress={() => setShowEnd(true)}>
                    <Text style={{ color: form.date_end ? Colors.textPrimary : Colors.textMuted }}>
                      {form.date_end || 'Choisir'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color={Colors.gold} />
                  </TouchableOpacity>
                  {showEnd && (
                      <DateTimePicker
                          value={form.date_end ? new Date(form.date_end) : new Date()}
                          mode="date" display="calendar"
                          onChange={(_, d) => {
                            setShowEnd(Platform.OS === 'ios');
                            if (d) setForm(f => ({ ...f, date_end: d.toISOString().split('T')[0] }));
                          }}
                      />
                  )}
                </View>
              </View>

              <Text style={cm.sectionLabel}>Statut initial</Text>
              <View style={cm.etatRow}>
                {(['PENDING', 'ACTIVE'] as Etat[]).map(key => {
                  const on = form.etat === key;
                  const icon = key === 'PENDING' ? 'time-outline' : 'checkmark-circle-outline';
                  const label = key === 'PENDING' ? 'En attente' : 'Active';
                  return (
                      <TouchableOpacity key={key} style={[cm.etatBtn, on && cm.etatBtnActive]} onPress={() => setForm(f => ({ ...f, etat: key }))}>
                        <Ionicons name={icon as any} size={18} color={on ? Colors.gold : Colors.textMuted} />
                        <Text style={[cm.etatLabel, on && cm.etatLabelActive]}>{label}</Text>
                      </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
  );
}

// ─── Modal modification ───────────────────────────────────────────────────────
function EditChasseModal({ visible, chasse, onClose, onUpdated }: {
  visible: boolean;
  chasse: Chasse | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const s = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  React.useEffect(() => {
    if (visible && chasse) {
      const occ = chasse.occurence?.[0];
      setForm({
        name: chasse.name ?? '',
        localisation: chasse.localisation ?? '',
        etat: (chasse.etat === 'ACTIVE' ? 'ACTIVE' : 'PENDING') as Etat,
        date_start: occ?.date_start ? occ.date_start.slice(0, 10) : '',
        date_end: occ?.date_end ? occ.date_end.slice(0, 10) : '',
        limit_user: occ?.limit_user ? String(occ.limit_user) : '30',
      });
      setImage(null);
    }
  }, [visible, chasse]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [16, 9], quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setImage({ uri: a.uri, name: a.fileName || `chasse_${Date.now()}.jpg`, type: a.mimeType || 'image/jpeg' });
    }
  };

  const handleUpdate = async () => {
    if (!form.name.trim()) { Alert.alert('Erreur', 'Le nom est requis'); return; }
    if (!chasse) return;
    setLoading(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        localisation: form.localisation.trim(),
        etat: form.etat,
        occurrence: {
          date_start: form.date_start,
          date_end: form.date_end,
          limit_user: Number(form.limit_user) || 30,
        },
      };
      await chasseService.update(chasse.id_chasse, payload);
      onUpdated();
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Mise à jour échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <SafeAreaView style={cm.safe}>
          <View style={cm.header}>
            <TouchableOpacity onPress={onClose} style={cm.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={cm.title}>Modifier la chasse</Text>
            <TouchableOpacity onPress={handleUpdate} disabled={loading} style={[cm.saveBtn, loading && { opacity: 0.5 }]}>
              <Text style={cm.saveBtnText}>{loading ? '...' : 'Sauver'}</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={cm.scroll} keyboardShouldPersistTaps="handled">

              <Text style={cm.label}>Image de couverture</Text>
              <TouchableOpacity style={cm.imagePicker} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image.uri }} style={cm.imagePreview} />
                ) : chasse?.image ? (
                    <>
                      <Image source={{ uri: chasse.image }} style={cm.imagePreview} />
                      <View style={cm.imageOverlay}>
                        <Ionicons name="camera" size={18} color="#fff" />
                        <Text style={cm.imageOverlayText}>Changer</Text>
                      </View>
                    </>
                ) : (
                    <View style={cm.imagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                      <Text style={cm.imagePlaceholderText}>Sélectionner une image</Text>
                    </View>
                )}
              </TouchableOpacity>

              <Input label="Nom de la chasse" placeholder="La Quête du Dragon..." value={form.name} onChangeText={s('name')} icon="bookmark-outline" autoCapitalize="sentences" />
              <Input label="Localisation" placeholder="Paris..." value={form.localisation} onChangeText={s('localisation')} icon="location-outline" autoCapitalize="sentences" />

              <Text style={cm.sectionLabel}>Occurrence</Text>
              <View style={cm.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={cm.label}>Date début</Text>
                  <TouchableOpacity style={cm.dateInput} onPress={() => setShowStart(true)}>
                    <Text style={{ color: form.date_start ? Colors.textPrimary : Colors.textMuted }}>
                      {form.date_start || 'Choisir'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color={Colors.gold} />
                  </TouchableOpacity>
                  {showStart && (
                      <DateTimePicker
                          value={form.date_start ? new Date(form.date_start) : new Date()}
                          mode="date" display="calendar"
                          onChange={(_, d) => {
                            setShowStart(Platform.OS === 'ios');
                            if (d) setForm(f => ({ ...f, date_start: d.toISOString().split('T')[0] }));
                          }}
                      />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={cm.label}>Date fin</Text>
                  <TouchableOpacity style={cm.dateInput} onPress={() => setShowEnd(true)}>
                    <Text style={{ color: form.date_end ? Colors.textPrimary : Colors.textMuted }}>
                      {form.date_end || 'Choisir'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color={Colors.gold} />
                  </TouchableOpacity>
                  {showEnd && (
                      <DateTimePicker
                          value={form.date_end ? new Date(form.date_end) : new Date()}
                          mode="date" display="calendar"
                          onChange={(_, d) => {
                            setShowEnd(Platform.OS === 'ios');
                            if (d) setForm(f => ({ ...f, date_end: d.toISOString().split('T')[0] }));
                          }}
                      />
                  )}
                </View>
              </View>

              <Input label="Limite participants" placeholder="30" value={form.limit_user} onChangeText={s('limit_user')} keyboardType="numeric" icon="people-outline" />

              <Text style={cm.sectionLabel}>Statut</Text>
              <View style={cm.etatRow}>
                {(['PENDING', 'ACTIVE'] as Etat[]).map(key => {
                  const on = form.etat === key;
                  const icon = key === 'PENDING' ? 'time-outline' : 'checkmark-circle-outline';
                  const label = key === 'PENDING' ? 'En attente' : 'Active';
                  return (
                      <TouchableOpacity key={key} style={[cm.etatBtn, on && cm.etatBtnActive]} onPress={() => setForm(f => ({ ...f, etat: key }))}>
                        <Ionicons name={icon as any} size={18} color={on ? Colors.gold : Colors.textMuted} />
                        <Text style={[cm.etatLabel, on && cm.etatLabelActive]}>{label}</Text>
                      </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
  );
}

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

        <CreateChasseModal
            visible={createVisible}
            onClose={() => setCreateVisible(false)}
            onCreated={loadChasses}
        />
        <EditChasseModal
            visible={!!editTarget}
            chasse={editTarget}
            onClose={() => setEditTarget(null)}
            onUpdated={loadChasses}
        />
      </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const cm = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Sp.lg, paddingVertical: Sp.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.gold, borderRadius: R.sm, paddingHorizontal: Sp.md, paddingVertical: 7 },
  saveBtnText: { color: Colors.black, fontWeight: '700', fontSize: 14 },
  scroll: { padding: Sp.lg, paddingBottom: 60, gap: Sp.sm },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4, marginTop: Sp.sm },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.gold,
    letterSpacing: 1.5, textTransform: 'uppercase', marginTop: Sp.lg, marginBottom: Sp.sm,
  },
  imagePicker: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: R.lg, height: 160, overflow: 'hidden', marginBottom: Sp.sm,
  },
  imagePickerErr: { borderColor: Colors.error },
  imagePreview: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  imageOverlayText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderText: { color: Colors.textMuted, fontSize: 14 },
  errText: { color: Colors.error, fontSize: 12, marginBottom: Sp.sm },
  row2: { flexDirection: 'row', gap: Sp.sm },
  dateInput: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: R.md,
    paddingHorizontal: Sp.md, paddingVertical: Sp.sm, height: 44,
    backgroundColor: Colors.bgCard,
  },
  etatRow: { flexDirection: 'row', gap: Sp.md, marginBottom: Sp.lg },
  etatBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.bgElevated, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.border, padding: Sp.md,
  },
  etatBtnActive: { backgroundColor: Colors.goldGlow, borderColor: Colors.gold },
  etatLabel: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  etatLabelActive: { color: Colors.gold },
});

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