import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, Image, SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { Colors, Sp, R } from '../../constants/theme';
import { chasseService } from '../../services/api';

type Etat = 'PENDING' | 'ACTIVE';

const EMPTY_FORM = {
  name: '', localisation: '', etat: 'PENDING' as Etat,
  date_start: '', date_end: '', limit_user: '30',
};

export default function CreateChasse() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const s = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  // Reset complet à chaque fois qu'on arrive sur la page
  useFocusEffect(useCallback(() => {
    setForm(EMPTY_FORM);
    setImage(null);
    setErrors({});
    setLoading(false);
  }, []));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise', 'Accès à la galerie nécessaire'); return; }
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
    if (!image) e.image = 'Image de couverture requise';
    setErrors(e);
    return !Object.keys(e).filter(k => e[k]).length;
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
      Alert.alert('Chasse créée ! 🎉', 'Vous pouvez maintenant y ajouter des étapes depuis le tableau de bord.', [
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
              <Input label="Nom de la chasse" placeholder="La Quête du Dragon Doré..." value={form.name} onChangeText={s('name')} error={errors.name} icon="bookmark-outline" autoCapitalize="sentences" />
              <Input label="Localisation" placeholder="Paris, Musée du Louvre..." value={form.localisation} onChangeText={s('localisation')} error={errors.localisation} icon="location-outline" autoCapitalize="sentences" />

              {/* Occurrence */}
              <Text style={styles.sectionLabel}>Occurrence</Text>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Input label="Date de début" placeholder="2026-05-01" value={form.date_start} onChangeText={s('date_start')} icon="calendar-outline" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Date de fin" placeholder="2026-05-31" value={form.date_end} onChangeText={s('date_end')} icon="calendar-outline" />
                </View>
              </View>
              <Input label="Limite de joueurs" placeholder="30" value={form.limit_user} onChangeText={s('limit_user')} icon="people-outline" keyboard="numeric" />

              {/* Statut */}
              <Text style={styles.sectionLabel}>Statut initial</Text>
              <View style={styles.etatGrid}>
                {[
                  { key: 'PENDING' as Etat, icon: 'time-outline', title: 'En attente', desc: 'Invisible pour les joueurs' },
                  { key: 'ACTIVE' as Etat, icon: 'checkmark-circle-outline', title: 'Active', desc: 'Jouable immédiatement' },
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
});