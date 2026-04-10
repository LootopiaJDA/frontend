import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, Image, SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../../../components/Input';
import Btn from '../../../components/Btn';
import { Colors, Sp, R } from '../../../constants/theme';
import { chasseService } from '../../../services/api';
import { useChasseForm, ChasseEtat } from '../../../hooks/useChasseForm';
import { useImagePicker } from '../../../hooks/useImagePicker';

export default function CreateChasse() {
  const router = useRouter();
  const { form, setForm, setField, errors, setErrors, resetForCreate, validate, buildCreateFormData } = useChasseForm();
  const { image, pick: pickImage, reset: resetImage } = useImagePicker();
  const [loading, setLoading] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  useFocusEffect(useCallback(() => {
    resetForCreate();
    resetImage();
    setLoading(false);
  }, []));

  const handleCreate = async () => {
    if (!validate({ requireImage: true, image })) return;
    setLoading(true);
    try {
      await chasseService.create(buildCreateFormData(image!));
      Alert.alert('Chasse créée !', 'Vous pouvez maintenant y ajouter des étapes depuis le tableau de bord.', [
        { text: 'Voir le dashboard', onPress: () => router.replace('/(partner)/dashboard') },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Création échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
      <View style={styles.bg}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <SafeAreaView>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <Ionicons name="map-outline" size={26} color={Colors.gold} />
                </View>
                <Text style={styles.title}>Nouvelle chasse</Text>
                <Text style={styles.sub}>Créez une expérience unique pour vos visiteurs</Text>
              </View>

              {/* Image */}
              <Text style={styles.fieldLabel}>Image de couverture *</Text>
              <TouchableOpacity
                  style={[styles.imagePicker, !!errors.image && styles.imagePickerErr]}
                  onPress={pickImage} activeOpacity={0.8}
              >
                {image ? (
                    <>
                      <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                      <View style={styles.imageOverlay}>
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.imageOverlayText}>Changer</Text>
                      </View>
                    </>
                ) : (
                    <View style={styles.imagePlaceholder}>
                      <View style={styles.imagePlaceholderIcon}>
                        <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                      </View>
                      <Text style={styles.imagePlaceholderText}>Sélectionner une image</Text>
                      <Text style={styles.imagePlaceholderSub}>Format 16:9 recommandé</Text>
                    </View>
                )}
              </TouchableOpacity>
              {errors.image ? <Text style={styles.errText}>{errors.image}</Text> : null}

              {/* Infos */}
              <Text style={styles.sectionLabel}>Informations</Text>
              <Input label="Nom de la chasse" placeholder="La Quête du Dragon Doré..." value={form.name} onChangeText={setField('name')} error={errors.name} icon="bookmark-outline" autoCapitalize="sentences" />
              <Input label="Localisation" placeholder="Paris, Musée du Louvre..." value={form.localisation} onChangeText={setField('localisation')} error={errors.localisation} icon="location-outline" autoCapitalize="sentences" />

              {/* Occurrence */}
              <Text style={styles.sectionLabel}>Occurrence</Text>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Date de début</Text>
                  <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowStart(true)}
                  >
                    <Text style={{ color: form.date_start ? Colors.textPrimary : Colors.textMuted }}>
                      {form.date_start || 'Sélectionnez la date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={Colors.gold} />
                  </TouchableOpacity>
                  {showStart && (
                      <DateTimePicker
                          value={form.date_start ? new Date(form.date_start) : new Date()}
                          mode="date"
                          display="calendar"
                          onChange={(_, d) => {
                            setShowStart(Platform.OS === 'ios');
                            if (d) setForm(f => ({ ...f, date_start: d.toISOString().split('T')[0] }));
                          }}
                      />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Date de fin</Text>
                  <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowEnd(true)}
                  >
                    <Text style={{ color: form.date_end ? Colors.textPrimary : Colors.textMuted }}>
                      {form.date_end || 'Sélectionnez la date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={Colors.gold} />
                  </TouchableOpacity>
                  {showEnd && (
                      <DateTimePicker
                          value={form.date_end ? new Date(form.date_end) : new Date()}
                          mode="date"
                          display="calendar"
                          onChange={(_, d) => {
                            setShowEnd(Platform.OS === 'ios');
                            if (d) setForm(f => ({ ...f, date_end: d.toISOString().split('T')[0] }));
                          }}
                      />
                  )}
                </View>
              </View>

              {/* Statut */}
              <Text style={styles.sectionLabel}>Statut initial</Text>
              <View style={styles.etatGrid}>
                {[
                  { key: 'PENDING' as ChasseEtat, icon: 'time-outline', title: 'En attente', desc: 'Invisible pour les joueurs' },
                  { key: 'ACTIVE' as ChasseEtat, icon: 'checkmark-circle-outline', title: 'Active', desc: 'Jouable immédiatement' },
                ].map(opt => {
                  const on = form.etat === opt.key;
                  return (
                      <TouchableOpacity
                          key={opt.key}
                          style={[styles.etatCard, on && styles.etatCardActive]}
                          onPress={() => setForm(f => ({ ...f, etat: opt.key }))}
                      >
                        <Ionicons name={opt.icon as any} size={22} color={on ? Colors.gold : Colors.textMuted} />
                        <Text style={[styles.etatTitle, on && styles.etatTitleActive]}>{opt.title}</Text>
                        <Text style={styles.etatDesc}>{opt.desc}</Text>
                      </TouchableOpacity>
                  );
                })}
              </View>

              {/* Info tip */}
              <View style={styles.infoBox}>
                <Ionicons name="bulb-outline" size={16} color={Colors.gold} />
                <Text style={styles.infoText}>
                  Après création, ajoutez des étapes depuis le tableau de bord en cliquant sur votre chasse.
                </Text>
              </View>

              <Btn label="Créer la chasse" onPress={handleCreate} loading={loading} style={{ marginBottom: Sp.xxl }} />
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Sp.lg, paddingTop: 60, flexGrow: 1 },
  header: { marginBottom: Sp.xl },
  iconWrap: { width: 56, height: 56, borderRadius: R.lg, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '30', alignItems: 'center', justifyContent: 'center', marginBottom: Sp.md },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  sub: { color: Colors.textSecondary, fontSize: 14 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: Sp.sm },
  sectionLabel: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.sm, marginTop: Sp.lg },
  imagePicker: { borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: R.lg, overflow: 'hidden', marginBottom: Sp.sm, height: 180 },
  imagePickerErr: { borderColor: Colors.error },
  imagePreview: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', gap: 6 },
  imageOverlayText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Sp.sm },
  imagePlaceholderIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { color: Colors.textSecondary, fontSize: 14 },
  imagePlaceholderSub: { color: Colors.textMuted, fontSize: 12 },
  errText: { color: Colors.error, fontSize: 12, marginTop: -Sp.xs, marginBottom: Sp.sm },
  row2: { flexDirection: 'row', gap: Sp.sm },
  etatGrid: { flexDirection: 'row', gap: Sp.md, marginBottom: Sp.lg },
  etatCard: { flex: 1, backgroundColor: Colors.bgElevated, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, padding: Sp.md, alignItems: 'center', gap: 4 },
  etatCardActive: { backgroundColor: Colors.goldGlow, borderColor: Colors.gold },
  etatTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  etatTitleActive: { color: Colors.gold },
  etatDesc: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
  infoBox: { flexDirection: 'row', gap: Sp.sm, backgroundColor: Colors.goldGlow, borderRadius: R.md, borderWidth: 1, borderColor: Colors.gold + '30', padding: Sp.md, marginBottom: Sp.lg, alignItems: 'flex-start' },
  infoText: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 20 },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: R.md,
    padding: Sp.sm,
    height: 44,
  },
});