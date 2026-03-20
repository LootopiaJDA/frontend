/**
 * edit-etape.tsx
 * Page dédiée à la modification d'une étape existante.
 * Paramètres de route : chasseId (number) + etapeId (number)
 *
 * Flux :
 *  1. On charge l'étape depuis l'API (etapeService.getAll → filtre par id)
 *  2. Formulaire pré-rempli
 *  3. Bouton "Choisir sur carte" → fullscreen EtapeMapPicker
 *  4. PATCH avec les nouvelles valeurs
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator,
    SafeAreaView, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { etapeService } from '../../../services/api';
import { Etape } from '../../../constants/types';
import { Colors, Sp, R } from '../../../constants/theme';
import Input from '../../../components/Input';
import Btn from '../../../components/Btn';
import EtapeMapPicker from '../../../components/EtapeMapPicker';

export default function EditEtape() {
    const { chasseId, etapeId } = useLocalSearchParams<{ chasseId?: string; etapeId?: string }>();
    const router = useRouter();

    const [etape, setEtape] = useState<Etape | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    // Formulaire
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [rayon, setRayon] = useState('50');
    const [rank, setRank] = useState('1');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);

    const [mapOpen, setMapOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Chargement étape ───────────────────────────────────────────────────────
    const load = useCallback(async () => {
        if (!chasseId || !etapeId) return;
        try {
            const etapes = await etapeService.getAll(Number(chasseId));
            const found = etapes.find(e => String(e.id_etape) === etapeId);
            if (!found) throw new Error('Étape introuvable');
            setEtape(found);
            setName(found.name ?? '');
            setAddress(found.address ?? '');
            setDescription(found.description ?? '');
            setRayon(found.rayon ? String(found.rayon) : '50');
            setRank(found.rank ? String(found.rank) : '1');
            setLat(found.lat ?? '');
            setLng(found.long ?? '');
        } catch (err: any) {
            Alert.alert('Erreur', err.message);
            router.back();
        } finally {
            setLoadingData(false);
        }
    }, [chasseId, etapeId]);

    useEffect(() => { load(); }, [load]);

    // ── Image picker ───────────────────────────────────────────────────────────
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission requise'); return; }
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.85,
        });
        if (!res.canceled && res.assets[0]) {
            const a = res.assets[0];
            setImage({ uri: a.uri, name: a.fileName || `etape_${Date.now()}.jpg`, type: a.mimeType || 'image/jpeg' });
        }
    };

    // ── Callback map picker ────────────────────────────────────────────────────
    const handleMapConfirm = (
        newLat: number, newLng: number, newAddress: string, newRayon: number
    ) => {
        setLat(String(newLat));
        setLng(String(newLng));
        if (newAddress) setAddress(newAddress);
        setRayon(String(newRayon));
        setErrors(e => ({ ...e, lat: '' }));
        setMapOpen(false);
    };

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Nom requis';
        if (!lat || !lng) e.lat = 'Position GPS requise';
        if (!address.trim()) e.address = 'Adresse requise';
        if (!description.trim()) e.description = 'Description requise';
        const r = Number(rayon);
        if (!rayon || isNaN(r) || r < 1) e.rayon = 'Rayon invalide (min 1m)';
        const rk = Number(rank);
        if (!rank || isNaN(rk) || rk < 1) e.rank = 'Rang invalide';
        setErrors(e);
        return Object.keys(e).every(k => !e[k]);
    };

    // ── Sauvegarde ─────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate() || !etape || !chasseId) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('name', name.trim());
            fd.append('lat', lat);
            fd.append('long', lng);
            fd.append('address', address.trim());
            fd.append('description', description.trim());
            // Envoyer comme number string propre
            fd.append('rayon', String(Math.round(Number(rayon))));
            fd.append('rank', String(Math.round(Number(rank))));
            if (image) {
                fd.append('image', { uri: image.uri, name: image.name, type: image.type } as any);
            }
            await etapeService.update(Number(chasseId), etape.id_etape, fd);
            Alert.alert('Étape modifiée ✅', '', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (err: any) {
            Alert.alert('Erreur', err.message ?? 'Modification échouée');
        } finally {
            setSaving(false);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loadingData) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.gold} />
        </View>
    );

    const hasPos = !!(lat && lng);

    // ── Map fullscreen ─────────────────────────────────────────────────────────
    if (mapOpen) {
        return (
            <EtapeMapPicker
                initialLat={hasPos ? parseFloat(lat) : undefined}
                initialLng={hasPos ? parseFloat(lng) : undefined}
                initialRayon={Number(rayon) || 50}
                onConfirm={handleMapConfirm}
                onClose={() => setMapOpen(false)}
            />
        );
    }

    // ── Formulaire ─────────────────────────────────────────────────────────────
    return (
        <View style={styles.bg}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <SafeAreaView>
                        {/* Back */}
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="pencil-outline" size={24} color={Colors.gold} />
                            </View>
                            <Text style={styles.title}>Modifier l'étape</Text>
                            <Text style={styles.sub}>Chasse #{chasseId}</Text>
                        </View>

                        {/* Rang + Rayon */}
                        <View style={styles.row2}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Rang"
                                    placeholder="1"
                                    value={rank}
                                    onChangeText={setRank}
                                    keyboardType="numeric"
                                    error={errors.rank}
                                    icon="layers-outline"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Rayon (m)"
                                    placeholder="50"
                                    value={rayon}
                                    onChangeText={setRayon}
                                    keyboardType="numeric"
                                    error={errors.rayon}
                                    icon="radio-outline"
                                />
                            </View>
                        </View>

                        <Input
                            label="Nom de l'étape"
                            placeholder="La vieille fontaine..."
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                            icon="bookmark-outline"
                            autoCapitalize="sentences"
                        />

                        {/* Position GPS */}
                        <Text style={styles.sectionLabel}>Position GPS</Text>
                        <TouchableOpacity style={styles.mapBtn} onPress={() => setMapOpen(true)} activeOpacity={0.8}>
                            <Ionicons name="map" size={16} color={Colors.black} />
                            <Text style={styles.mapBtnTxt}>
                                {hasPos ? 'Modifier la position sur la carte' : 'Choisir sur la carte'}
                            </Text>
                        </TouchableOpacity>

                        {errors.lat ? <Text style={styles.errText}>{errors.lat}</Text> : null}

                        {hasPos && (
                            <View style={styles.coordBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                                <Text style={styles.coordTxt}>
                                    {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
                                </Text>
                                <Text style={styles.coordRayon}> · r={rayon}m</Text>
                            </View>
                        )}

                        <Input
                            label="Adresse"
                            placeholder="Remplie automatiquement par la carte..."
                            value={address}
                            onChangeText={setAddress}
                            error={errors.address}
                            icon="location-outline"
                            autoCapitalize="sentences"
                        />

                        <Input
                            label="Description / Indice"
                            placeholder="Cherchez près de la fontaine en pierre..."
                            value={description}
                            onChangeText={setDescription}
                            error={errors.description}
                            icon="eye-outline"
                            autoCapitalize="sentences"
                            multiline
                            lines={3}
                        />

                        {/* Image */}
                        <Text style={styles.sectionLabel}>Photo de l'étape</Text>
                        <TouchableOpacity
                            style={styles.imagePicker}
                            onPress={pickImage}
                            activeOpacity={0.8}
                        >
                            {image ? (
                                <>
                                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                                    <View style={styles.imageOverlay}>
                                        <Ionicons name="camera" size={20} color="#fff" />
                                        <Text style={styles.imageOverlayTxt}>Changer</Text>
                                    </View>
                                </>
                            ) : etape?.image ? (
                                <>
                                    <Image source={{ uri: etape.image }} style={styles.imagePreview} />
                                    <View style={styles.imageOverlay}>
                                        <Ionicons name="camera" size={20} color="#fff" />
                                        <Text style={styles.imageOverlayTxt}>Changer l'image</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera-outline" size={28} color={Colors.textMuted} />
                                    <Text style={styles.imagePlaceholderTxt}>Sélectionner une image</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Btn
                            label="Enregistrer les modifications"
                            onPress={handleSave}
                            loading={saving}
                            style={{ marginTop: Sp.md, marginBottom: Sp.xxl }}
                        />
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    scroll: { padding: Sp.lg, paddingTop: 60, flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    backBtn: {
        width: 38, height: 38, borderRadius: R.sm,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1, borderColor: Colors.border,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Sp.lg,
    },
    header: { marginBottom: Sp.xl },
    iconWrap: {
        width: 56, height: 56, borderRadius: R.lg,
        backgroundColor: Colors.goldGlow,
        borderWidth: 1, borderColor: Colors.gold + '30',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Sp.md,
    },
    title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
    sub: { color: Colors.textSecondary, fontSize: 14 },

    row2: { flexDirection: 'row', gap: Sp.md },

    sectionLabel: {
        color: Colors.gold, fontSize: 10, fontWeight: '700',
        letterSpacing: 1.5, textTransform: 'uppercase',
        marginBottom: Sp.sm, marginTop: Sp.xs,
    },

    mapBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: Colors.gold,
        borderRadius: R.md, paddingVertical: 12,
        marginBottom: Sp.sm,
    },
    mapBtnTxt: { color: Colors.black, fontSize: 14, fontWeight: '700' },

    errText: { color: Colors.error, fontSize: 12, marginBottom: Sp.sm },

    coordBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#22C55E18',
        borderRadius: R.sm,
        paddingHorizontal: Sp.md, paddingVertical: 8,
        marginBottom: Sp.md,
        borderWidth: 1, borderColor: '#22C55E44',
    },
    coordTxt: { color: '#22C55E', fontSize: 12, fontWeight: '600' },
    coordRayon: { color: Colors.textMuted, fontSize: 11 },

    imagePicker: {
        borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
        borderRadius: R.lg, overflow: 'hidden', height: 160, marginBottom: Sp.sm,
    },
    imagePreview: { width: '100%', height: '100%' },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    imageOverlayTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Sp.sm },
    imagePlaceholderTxt: { color: Colors.textSecondary, fontSize: 14 },
});