/**
 * add-etape.tsx
 * Modal pageSheet pour ajouter une étape à une chasse.
 * Params route : chasseId (number)
 *
 * Flux :
 *  - Formulaire + image picker
 *  - Bouton "Choisir sur la carte" → EtapeMapPicker fullscreen
 *  - POST multipart via etapeService.create
 */
import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, KeyboardAvoidingView, Platform, Image, SafeAreaView, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { etapeService } from '../../../services/api';
import { Colors, Sp, R } from '../../../constants/theme';
import Input from '../../../components/Input';
import Btn from '../../../components/Btn';
import EtapeMapPicker from '../../../components/EtapeMapPicker';

const EMPTY = {
    name: '', address: '', description: '',
    lat: '', lng: '', rayon: '50', rank: '1',
};

export default function AddEtape() {
    const { chasseId } = useLocalSearchParams<{ chasseId?: string }>();
    const router = useRouter();

    const [form, setForm] = useState(EMPTY);
    const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);

    const s = (k: keyof typeof EMPTY) => (v: string) =>
        setForm(f => ({ ...f, [k]: v }));

    // Reset complet à chaque ouverture de la page
    useFocusEffect(useCallback(() => {
        setForm(EMPTY);
        setImage(null);
        setErrors({});
        setLoading(false);
        setMapOpen(false);
    }, []));

    // ── Image picker ───────────────────────────────────────────────────────────
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission requise', 'Accès galerie nécessaire'); return; }
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.85,
        });
        if (!res.canceled && res.assets[0]) {
            const a = res.assets[0];
            setImage({ uri: a.uri, name: a.fileName || `etape_${Date.now()}.jpg`, type: a.mimeType || 'image/jpeg' });
            setErrors(e => ({ ...e, image: '' }));
        }
    };

    // ── Callback map ───────────────────────────────────────────────────────────
    const handleMapConfirm = (
        lat: number, lng: number, address: string, rayon: number
    ) => {
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

    // ── Validation ─────────────────────────────────────────────────────────────
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
        if (!image) e.image = 'Image requise';
        setErrors(e);
        return Object.keys(e).every(k => !e[k]);
    };


    const handleCreate = async () => {
        if (!validate()) return;
        if (!chasseId) { Alert.alert('Erreur', 'ID chasse manquant'); return; }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name.trim());
            fd.append('lat', form.lat);
            fd.append('long', form.lng);
            fd.append('address', form.address.trim());
            fd.append('description', form.description.trim());
            fd.append('rayon', String(Math.round(Number(form.rayon))));
            fd.append('rank', String(Math.round(Number(form.rank))));
            fd.append('image', { uri: image!.uri, name: image!.name, type: image!.type } as any);
            await etapeService.create(Number(chasseId), fd);
            Alert.alert('Étape ajoutée ! ✅', '', [
                {
                    text: 'Ajouter une autre',
                    onPress: () => {
                        setForm(f => ({ ...EMPTY, rank: String(Number(f.rank) + 1) }));
                        setImage(null);
                        setErrors({});
                    },
                },
                { text: 'Retour à la chasse', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert('Erreur', err.message ?? 'Création échouée');
        } finally {
            setLoading(false);
        }
    };

    const hasPos = !!(form.lat && form.lng);


    if (mapOpen) {
        return (
            <EtapeMapPicker
                initialLat={hasPos ? parseFloat(form.lat) : undefined}
                initialLng={hasPos ? parseFloat(form.lng) : undefined}
                initialRayon={Number(form.rayon) || 50}
                onConfirm={handleMapConfirm}
                onClose={() => setMapOpen(false)}
            />
        );
    }


    return (
        <View style={st.bg}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={st.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <SafeAreaView>
                        {/* Back */}
                        <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={st.header}>
                            <View style={st.iconWrap}>
                                <Ionicons name="flag-outline" size={26} color={Colors.gold} />
                            </View>
                            <Text style={st.title}>Ajouter une étape</Text>
                            <Text style={st.sub}>Chasse #{chasseId}</Text>
                        </View>

                        {/* Rang + Rayon */}
                        <View style={st.row2}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Rang"
                                    value={form.rank}
                                    onChangeText={s('rank')}
                                    keyboardType="numeric"
                                    error={errors.rank}
                                    icon="layers-outline"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Rayon (m)"
                                    value={form.rayon}
                                    onChangeText={s('rayon')}
                                    keyboardType="numeric"
                                    error={errors.rayon}
                                    icon="radio-outline"
                                />
                            </View>
                        </View>

                        <Input
                            label="Nom de l'étape"
                            placeholder="La vieille fontaine..."
                            value={form.name}
                            onChangeText={s('name')}
                            error={errors.name}
                            icon="bookmark-outline"
                            autoCapitalize="sentences"
                        />

                        {/* Position GPS */}
                        <Text style={st.sectionLabel}>Position GPS *</Text>

                        <TouchableOpacity
                            style={st.mapBtn}
                            onPress={() => setMapOpen(true)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="map" size={16} color={Colors.black} />
                            <Text style={st.mapBtnTxt}>
                                {hasPos ? 'Modifier la position sur la carte' : 'Choisir sur la carte'}
                            </Text>
                        </TouchableOpacity>

                        {errors.lat ? <Text style={st.errText}>{errors.lat}</Text> : null}

                        {hasPos && (
                            <View style={st.coordBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                                <Text style={st.coordTxt}>
                                    {parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}
                                </Text>
                                <Text style={st.coordRayon}> · r={form.rayon}m</Text>
                            </View>
                        )}

                        {/* Adresse — pré-remplie par la carte, éditable */}
                        <Input
                            label="Adresse"
                            placeholder="Remplie automatiquement par la carte..."
                            value={form.address}
                            onChangeText={s('address')}
                            error={errors.address}
                            icon="location-outline"
                            autoCapitalize="sentences"
                        />

                        <Input
                            label="Description / Indice"
                            placeholder="Cherchez près de la fontaine en pierre..."
                            value={form.description}
                            onChangeText={s('description')}
                            error={errors.description}
                            icon="eye-outline"
                            autoCapitalize="sentences"
                            multiline
                            lines={3}
                        />

                        {/* Image */}
                        <Text style={st.sectionLabel}>Photo de l'étape *</Text>
                        <TouchableOpacity
                            style={[st.imagePicker, !!errors.image && st.imagePickerErr]}
                            onPress={pickImage}
                            activeOpacity={0.8}
                        >
                            {image ? (
                                <>
                                    <Image source={{ uri: image.uri }} style={st.imagePreview} />
                                    <View style={st.imageOverlay}>
                                        <Ionicons name="camera" size={20} color="#fff" />
                                        <Text style={st.imageOverlayTxt}>Changer</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={st.imagePlaceholder}>
                                    <View style={st.imagePlaceholderIcon}>
                                        <Ionicons name="camera-outline" size={28} color={Colors.textMuted} />
                                    </View>
                                    <Text style={st.imagePlaceholderTxt}>Sélectionner une image</Text>
                                    <Text style={st.imagePlaceholderSub}>Format carré recommandé</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {errors.image ? <Text style={st.errText}>{errors.image}</Text> : null}

                        {/* Info tip */}
                        <View style={st.infoBox}>
                            <Ionicons name="bulb-outline" size={15} color={Colors.gold} />
                            <Text style={st.infoTxt}>
                                La zone de détection (rayon) définit la distance à laquelle le joueur doit se trouver pour voir l'étape.
                            </Text>
                        </View>

                        <Btn
                            label="Ajouter l'étape"
                            onPress={handleCreate}
                            loading={loading}
                            style={{ marginBottom: Sp.xxl }}
                        />
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const st = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    scroll: { padding: Sp.lg, paddingTop: 60, flexGrow: 1 },

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
    title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
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
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
    },
    imagePlaceholderTxt: { color: Colors.textSecondary, fontSize: 14 },
    imagePlaceholderSub: { color: Colors.textMuted, fontSize: 12 },

    infoBox: {
        flexDirection: 'row', gap: Sp.sm,
        backgroundColor: Colors.goldGlow,
        borderRadius: R.md,
        borderWidth: 1, borderColor: Colors.gold + '30',
        padding: Sp.md, marginBottom: Sp.lg,
        alignItems: 'flex-start',
    },
    infoTxt: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 20 },
});