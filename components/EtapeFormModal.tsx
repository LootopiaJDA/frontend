import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Etape } from '../constants/types';
import { useImagePicker } from '../hooks/useImagePicker';
import { etapeService } from '../services/api';
import { Colors, Sp, R } from '../constants/theme';
import Input from './Input';
import EtapeMapPicker from './EtapeMapPicker';

interface EtapeForm {
  name: string;
  address: string;
  description: string;
  lat: string;
  lng: string;
  rayon: string;
  rank: string;
}

const EMPTY_FORM: EtapeForm = {
  name: '', address: '', description: '',
  lat: '', lng: '', rayon: '50', rank: '1',
};

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
  chasseId: number;
  etape?: Etape | null;
  nextRank?: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function EtapeFormModal({
  visible, mode, chasseId, etape, nextRank = 1, onClose, onSaved,
}: Props) {
  const [form, setForm] = useState<EtapeForm>(EMPTY_FORM);
  const { image, pickOrShoot: pickImage, reset: resetImage } = useImagePicker('etape');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Efface l'erreur image dès qu'une image est choisie
  useEffect(() => {
    if (image) setErrors(e => ({ ...e, image: '' }));
  }, [image]);

  // Reset form when modal opens
  useEffect(() => {
    if (!visible) return;
    setErrors({});
    resetImage();
    setMapOpen(false);
    if (mode === 'create') {
      setForm({ ...EMPTY_FORM, rank: String(nextRank) });
    } else if (mode === 'edit' && etape) {
      setForm({
        name: etape.name ?? '',
        address: etape.address ?? '',
        description: etape.description ?? '',
        lat: etape.lat ?? '',
        lng: etape.long ?? '',
        rayon: etape.rayon ? String(etape.rayon) : '50',
        rank: etape.rank ? String(etape.rank) : '1',
      });
    }
  }, [visible]);

  const setField = (key: keyof EtapeForm) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleMapConfirm = (lat: number, lng: number, address: string, rayon: number) => {
    setForm(f => ({
      ...f,
      lat: String(lat),
      lng: String(lng),
      address: address || f.address,
      rayon: String(rayon),
    }));
    setErrors(e => ({ ...e, lat: '' }));
    setMapOpen(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.lat || !form.lng) e.lat = 'Position GPS requise — utilisez la carte';
    if (!form.address.trim()) e.address = 'Adresse requise';
    if (!form.description.trim()) e.description = 'Description / indice requis';
    const r = Number(form.rayon);
    if (!form.rayon || isNaN(r) || r < 1) e.rayon = 'Rayon invalide (min 1m)';
    const rk = Number(form.rank);
    if (!form.rank || isNaN(rk) || rk < 1) e.rank = 'Rang invalide';
    if (mode === 'create' && !image) e.image = 'Image requise';
    setErrors(e);
    return Object.keys(e).every(k => !e[k]);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('lat', form.lat);
    fd.append('long', form.lng);
    fd.append('address', form.address.trim());
    fd.append('description', form.description.trim());
    fd.append('rayon', String(Math.round(Number(form.rayon))));
    fd.append('rank', String(Math.round(Number(form.rank))));
    if (image) {
      fd.append('image', { uri: image.uri, name: image.name, type: image.type } as any);
    }
    return fd;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'create') {
        await etapeService.create(chasseId, buildFormData());
      } else if (etape) {
        await etapeService.update(chasseId, etape.id_etape, buildFormData());
      }
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? (mode === 'create' ? 'Création échouée' : 'Modification échouée'));
    } finally {
      setLoading(false);
    }
  };

  const isCreate = mode === 'create';
  const hasPos = !!(form.lat && form.lng);

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <SafeAreaView style={s.safe}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={s.title}>{isCreate ? 'Nouvelle étape' : "Modifier l'étapeOk"}</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading} style={[s.saveBtn, loading && { opacity: 0.5 }]}>
              <Text style={s.saveBtnText}>{loading ? '...' : isCreate ? 'Créer' : 'Sauver'}</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

              {/* Rang + Rayon */}
              <View style={s.row2}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Rang"
                    value={form.rank}
                    onChangeText={setField('rank')}
                    keyboardType={"numeric"}
                    error={errors.rank}
                    icon="layers-outline"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Rayon (m)"
                    value={form.rayon}
                    onChangeText={setField('rayon')}
                    keyboard={"numeric"}
                    error={errors.rayon}
                    icon="radio-outline"
                  />
                </View>
              </View>

              <Input
                label="Nom de l'étape"
                placeholder="La vieille fontaine..."
                value={form.name}
                onChangeText={setField('name')}
                error={errors.name}
                icon="bookmark-outline"
                autoCapitalize="sentences"
              />

              {/* Position GPS */}
              <Text style={s.sectionLabel}>Position GPS *</Text>
              <TouchableOpacity style={s.mapBtn} onPress={() => setMapOpen(true)} activeOpacity={0.8}>
                <Ionicons name="map" size={16} color={Colors.black} />
                <Text style={s.mapBtnTxt}>
                  {hasPos ? 'Modifier la position sur la carte' : 'Choisir sur la carte'}
                </Text>
              </TouchableOpacity>
              {errors.lat ? <Text style={s.errText}>{errors.lat}</Text> : null}
              {hasPos && (
                <View style={s.coordBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Text style={s.coordTxt}>
                    {parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}
                  </Text>
                  <Text style={s.coordRayon}> · r={form.rayon}m</Text>
                </View>
              )}

              <Input
                label="Adresse"
                placeholder="Remplie automatiquement par la carte..."
                value={form.address}
                onChangeText={setField('address')}
                error={errors.address}
                icon="location-outline"
                autoCapitalize="sentences"
              />

              <Input
                label="Description / Indice"
                placeholder="Cherchez près de la fontaine en pierre..."
                value={form.description}
                onChangeText={setField('description')}
                error={errors.description}
                icon="eye-outline"
                autoCapitalize="sentences"
                multiline
                lines={3}
              />

              {/* Image */}
              <Text style={s.sectionLabel}>Photo de l'étape {isCreate ? '*' : ''}</Text>
              <TouchableOpacity
                style={[s.imagePicker, !!errors.image && s.imagePickerErr]}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {image ? (
                  <>
                    <Image source={{ uri: image.uri }} style={s.imagePreview} />
                    <View style={s.imageOverlay}>
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={s.imageOverlayTxt}>Changer</Text>
                    </View>
                  </>
                ) : !isCreate && etape?.image ? (
                  <>
                    <Image source={{ uri: etape.image }} style={s.imagePreview} />
                    <View style={s.imageOverlay}>
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={s.imageOverlayTxt}>Changer l'image</Text>
                    </View>
                  </>
                ) : (
                  <View style={s.imagePlaceholder}>
                    <View style={s.imagePlaceholderIcon}>
                      <Ionicons name="camera-outline" size={28} color={Colors.textMuted} />
                    </View>
                    <Text style={s.imagePlaceholderTxt}>Galerie ou appareil photo</Text>
                    <Text style={s.imagePlaceholderSub}>Format carré recommandé</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.image ? <Text style={s.errText}>{errors.image}</Text> : null}

              {/* Info tip */}
              <View style={s.infoBox}>
                <Ionicons name="bulb-outline" size={15} color={Colors.gold} />
                <Text style={s.infoTxt}>
                  Le rayon définit la distance à laquelle le joueur doit se trouver pour détecter l'étape.
                </Text>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Map picker — second modal stacked on top */}
      <Modal visible={mapOpen} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setMapOpen(false)}>
        <EtapeMapPicker
          initialLat={hasPos ? parseFloat(form.lat) : undefined}
          initialLng={hasPos ? parseFloat(form.lng) : undefined}
          initialRayon={Number(form.rayon) || 50}
          onConfirm={handleMapConfirm}
          onClose={() => setMapOpen(false)}
        />
      </Modal>
    </>
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

  row2: { flexDirection: 'row', gap: Sp.md },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.gold,
    letterSpacing: 1.5, textTransform: 'uppercase', marginTop: Sp.md, marginBottom: Sp.sm,
  },

  mapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.gold, borderRadius: R.md, paddingVertical: 12, marginBottom: Sp.sm,
  },
  mapBtnTxt: { color: Colors.black, fontSize: 14, fontWeight: '700' },

  errText: { color: Colors.error, fontSize: 12, marginBottom: Sp.sm },

  coordBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#22C55E18', borderRadius: R.sm,
    paddingHorizontal: Sp.md, paddingVertical: 8, marginBottom: Sp.md,
    borderWidth: 1, borderColor: '#22C55E44',
  },
  coordTxt: { color: '#22C55E', fontSize: 12, fontWeight: '600' },
  coordRayon: { color: Colors.textMuted, fontSize: 11 },

  imagePicker: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: R.lg, overflow: 'hidden', height: 160, marginBottom: Sp.sm,
  },
  imagePickerErr: { borderColor: Colors.error },
  imagePreview: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  imageOverlayTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Sp.sm },
  imagePlaceholderIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderTxt: { color: Colors.textSecondary, fontSize: 14 },
  imagePlaceholderSub: { color: Colors.textMuted, fontSize: 12 },

  infoBox: {
    flexDirection: 'row', gap: Sp.sm,
    backgroundColor: Colors.goldGlow, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.gold + '30',
    padding: Sp.md, marginTop: Sp.sm,
    alignItems: 'flex-start',
  },
  infoTxt: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 20 },
});
