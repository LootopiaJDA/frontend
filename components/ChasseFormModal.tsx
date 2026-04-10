import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Chasse } from '../constants/types';
import { chasseService } from '../services/api';
import { Colors, Sp, R } from '../constants/theme';
import Input from './Input';
import { useChasseForm, ChasseEtat } from '../hooks/useChasseForm';
import { useImagePicker } from '../hooks/useImagePicker';

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
  chasse?: Chasse | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ChasseFormModal({ visible, mode, chasse, onClose, onSaved }: Props) {
  const { form, setForm, setField, errors, setErrors, resetForCreate, resetForEdit, validate, buildCreateFormData, buildUpdatePayload } = useChasseForm();
  const { image, pick: pickImage, reset: resetImage } = useImagePicker();
  const [loading, setLoading] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (mode === 'create') {
      resetForCreate();
      resetImage();
    } else if (mode === 'edit' && chasse) {
      resetForEdit(chasse);
      resetImage();
    }
  }, [visible]);

  const handleSave = async () => {
    if (mode === 'create') {
      if (!validate({ requireImage: true, image })) return;
      setLoading(true);
      try {
        await chasseService.create(buildCreateFormData(image!));
        onSaved();
        onClose();
      } catch (err: any) {
        Alert.alert('Erreur', err.message ?? 'Création échouée');
      } finally {
        setLoading(false);
      }
    } else {
      if (!validate({ requireImage: false, image })) return;
      if (!chasse) return;
      setLoading(true);
      try {
        await chasseService.update(chasse.id_chasse, buildUpdatePayload());
        onSaved();
        onClose();
      } catch (err: any) {
        Alert.alert('Erreur', err.message ?? 'Mise à jour échouée');
      } finally {
        setLoading(false);
      }
    }
  };

  const isCreate = mode === 'create';
  const title = isCreate ? 'Nouvelle chasse' : 'Modifier la chasse';
  const saveLabel = isCreate ? 'Créer' : 'Sauver';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={s.title}>{title}</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading} style={[s.saveBtn, loading && { opacity: 0.5 }]}>
            <Text style={s.saveBtnText}>{loading ? '...' : saveLabel}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

            <Text style={s.label}>Image de couverture {isCreate ? '*' : ''}</Text>
            <TouchableOpacity
              style={[s.imagePicker, isCreate && !!errors.image && s.imagePickerErr]}
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image.uri }} style={s.imagePreview} />
              ) : !isCreate && chasse?.image ? (
                <>
                  <Image source={{ uri: chasse.image }} style={s.imagePreview} />
                  <View style={s.imageOverlay}>
                    <Ionicons name="camera" size={18} color="#fff" />
                    <Text style={s.imageOverlayText}>Changer</Text>
                  </View>
                </>
              ) : (
                <View style={s.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                  <Text style={s.imagePlaceholderText}>Sélectionner une image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.image ? <Text style={s.errText}>{errors.image}</Text> : null}

            <Input
              label="Nom de la chasse"
              placeholder="La Quête du Dragon..."
              value={form.name}
              onChangeText={setField('name')}
              error={errors.name}
              icon="bookmark-outline"
              autoCapitalize="sentences"
            />
            <Input
              label="Localisation"
              placeholder="Paris, Musée du Louvre..."
              value={form.localisation}
              onChangeText={setField('localisation')}
              error={errors.localisation}
              icon="location-outline"
              autoCapitalize="sentences"
            />

              <Input
                label="Limite participants"
                placeholder="30"
                value={form.limit_user}
                onChangeText={setField('limit_user')}
                keyboardType="numeric"
                icon="people-outline"
              />

            {isCreate && (
              <>
                <Text style={s.sectionLabel}>Occurrence</Text>
                <View style={s.row2}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>Date début</Text>
                    <TouchableOpacity style={s.dateInput} onPress={() => setShowStart(true)}>
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
                    <Text style={s.label}>Date fin</Text>
                    <TouchableOpacity style={s.dateInput} onPress={() => setShowEnd(true)}>
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
              </>
            )}

            <Text style={s.sectionLabel}>Statut</Text>
            <View style={s.etatRow}>
              {(['PENDING', 'ACTIVE'] as ChasseEtat[]).map(key => {
                const on = form.etat === key;
                const icon = key === 'PENDING' ? 'time-outline' : 'checkmark-circle-outline';
                const label = key === 'PENDING' ? 'En attente' : 'Active';
                return (
                  <TouchableOpacity
                    key={key}
                    style={[s.etatBtn, on && s.etatBtnActive]}
                    onPress={() => setForm(f => ({ ...f, etat: key }))}
                  >
                    <Ionicons name={icon as any} size={18} color={on ? Colors.gold : Colors.textMuted} />
                    <Text style={[s.etatLabel, on && s.etatLabelActive]}>{label}</Text>
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

const s = StyleSheet.create({
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
