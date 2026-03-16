import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
    KeyboardAvoidingView, Platform, Image, ActivityIndicator,
    SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { Colors, Sp, R } from '../../constants/theme';
import { etapeService } from '../../services/api';

const { width, height } = Dimensions.get('window');

const EMPTY_FORM = {
    name: '', address: '', description: '',
    lat: '', long: '', rayon: '50', rank: '1',
};

export default function AddEtape() {
    const { chasseId } = useLocalSearchParams<{ chasseId?: string }>();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const [form, setForm] = useState(EMPTY_FORM);
    const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [mapRegion, setMapRegion] = useState({
        latitude: 48.8566, longitude: 2.3522,
        latitudeDelta: 0.04, longitudeDelta: 0.04,
    });

    const s = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

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
            setErrors(e => ({ ...e, image: '' }));
        }
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geo[0]) {
                const addr = [geo[0].streetNumber, geo[0].street, geo[0].city].filter(Boolean).join(' ');
                if (addr) setForm(f => ({ ...f, address: addr }));
            }
        } catch { /* silencieux */ }
    };

    const useMyLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const { latitude, longitude } = loc.coords;
            const latStr = latitude.toFixed(7);
            const lngStr = longitude.toFixed(7);
            setForm(f => ({ ...f, lat: latStr, long: lngStr }));
            const newRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
            setMapRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 600);
            await reverseGeocode(latitude, longitude);
        } catch (e: any) {
            Alert.alert('Erreur', e.message);
        } finally {
            setLocating(false);
        }
    };

    const handleMapPress = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setForm(f => ({ ...f, lat: latitude.toFixed(7), long: longitude.toFixed(7) }));
        setErrors(prev => ({ ...prev, lat: '' }));
        setGeocoding(true);
        await reverseGeocode(latitude, longitude);
        setGeocoding(false);
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Nom requis';
        if (!form.lat || !form.long) e.lat = 'Position GPS requise — utilisez la carte ou "Ma position"';
        if (!form.address.trim()) e.address = 'Adresse requise';
        if (!form.description.trim()) e.description = 'Description / indice requis';
        if (!form.rayon || isNaN(Number(form.rayon)) || Number(form.rayon) < 1) e.rayon = 'Rayon invalide (min. 1m)';
        if (!form.rank || isNaN(Number(form.rank)) || Number(form.rank) < 1) e.rank = 'Rang invalide';
        if (!image) e.image = 'Image requise';
        setErrors(e);
        return Object.keys(e).every(k => !e[k]);
    };

    const handleCreate = async () => {
        if (!validate()) return;
        if (!chasseId) { Alert.alert('Erreur', 'ID de chasse manquant'); return; }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('lat', form.lat);
            fd.append('long', form.long);
            fd.append('address', form.address);
            fd.append('description', form.description);
            fd.append('rayon', form.rayon);
            fd.append('rank', form.rank);
            fd.append('image', { uri: image!.uri, name: image!.name, type: image!.type } as any);
            await etapeService.create(Number(chasseId), fd);
            Alert.alert('Étape ajoutée ! ✅', '', [
                {
                    text: 'Ajouter une autre', onPress: () => {
                        setForm(f => ({ ...EMPTY_FORM, rank: String(Number(f.rank) + 1) }));
                        setImage(null);
                        setErrors({});
                    },
                },
                {
                    text: 'Voir la chasse', onPress: () =>
                        router.replace({ pathname: '/(partner)/chasse-detail', params: { id: chasseId } }),
                },
            ]);
        } catch (err: any) {
            Alert.alert('Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    const hasPos = !!(form.lat && form.long);
    const lat = hasPos ? parseFloat(form.lat) : 0;
    const lng = hasPos ? parseFloat(form.long) : 0;
    const rayon = Number(form.rayon) || 50;

    // ─── Mode carte plein écran ───────────────────────────────────────────────
    if (mapOpen) {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={mapRegion}
                    onRegionChangeComplete={setMapRegion}
                    onPress={handleMapPress}
                    userInterfaceStyle="dark"
                    showsUserLocation
                    showsCompass
                >
                    {hasPos && (
                        <>
                            <Marker coordinate={{ latitude: lat, longitude: lng }}>
                                <View style={mapS.pin}>
                                    <Ionicons name="flag" size={16} color={Colors.black} />
                                </View>
                            </Marker>
                            <Circle
                                center={{ latitude: lat, longitude: lng }}
                                radius={rayon}
                                fillColor={Colors.gold + '28'}
                                strokeColor={Colors.gold + '99'}
                                strokeWidth={2}
                            />
                        </>
                    )}
                </MapView>

                {/* Header overlay */}
                <SafeAreaView style={mapS.overlay}>
                    <View style={mapS.topBar}>
                        <TouchableOpacity style={mapS.topBtn} onPress={() => setMapOpen(false)}>
                            <Ionicons name="checkmark" size={20} color={Colors.gold} />
                        </TouchableOpacity>
                        <View style={mapS.hint}>
                            <Text style={mapS.hintText}>
                                {geocoding ? 'Géocodage...' : 'Appuyez pour placer l\'étape'}
                            </Text>
                        </View>
                        <TouchableOpacity style={mapS.topBtn} onPress={useMyLocation} disabled={locating}>
                            {locating
                                ? <ActivityIndicator size="small" color={Colors.gold} />
                                : <Ionicons name="locate" size={18} color={Colors.gold} />
                            }
                        </TouchableOpacity>
                    </View>

                    {hasPos && (
                        <View style={mapS.coordBadge}>
                            <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
                            <Text style={mapS.coordText}>
                                {lat.toFixed(5)}, {lng.toFixed(5)}
                            </Text>
                            {form.address ? <Text style={mapS.coordAddr} numberOfLines={1}> · {form.address}</Text> : null}
                        </View>
                    )}
                </SafeAreaView>

                {/* Rayon slider bottom */}
                <View style={mapS.bottom}>
                    <View style={mapS.rayonRow}>
                        <Ionicons name="radio-button-on-outline" size={14} color={Colors.gold} />
                        <Text style={mapS.rayonLabel}>Zone de détection : {rayon}m</Text>
                    </View>
                    <View style={mapS.rayonBtns}>
                        {[10, 25, 50, 100, 200].map(v => (
                            <TouchableOpacity
                                key={v}
                                style={[mapS.rayonBtn, rayon === v && mapS.rayonBtnActive]}
                                onPress={() => setForm(f => ({ ...f, rayon: String(v) }))}
                            >
                                <Text style={[mapS.rayonBtnText, rayon === v && mapS.rayonBtnTextActive]}>{v}m</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    // ─── Formulaire principal ─────────────────────────────────────────────────
    return (
        <View style={styles.bg}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <SafeAreaView>
                        {/* Back */}
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="flag-outline" size={26} color={Colors.gold} />
                            </View>
                            <Text style={styles.title}>Ajouter une étape</Text>
                            <Text style={styles.sub}>Chasse #{chasseId}</Text>
                        </View>

                        {/* Rang + Rayon */}
                        <View style={styles.row2}>
                            <View style={{ flex: 1 }}>
                                <Input label="Rang" placeholder="1" value={form.rank} onChangeText={s('rank')} keyboard="numeric" error={errors.rank} icon="layers-outline" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input label="Rayon (m)" placeholder="50" value={form.rayon} onChangeText={s('rayon')} keyboard="numeric" error={errors.rayon} icon="radio-outline" />
                            </View>
                        </View>

                        <Input label="Nom de l'étape" placeholder="La vieille fontaine..." value={form.name} onChangeText={s('name')} error={errors.name} icon="bookmark-outline" autoCapitalize="sentences" />

                        {/* GPS */}
                        <Text style={styles.sectionLabel}>Position GPS</Text>
                        <View style={styles.posActions}>
                            <TouchableOpacity style={styles.posBtn} onPress={useMyLocation} disabled={locating}>
                                {locating
                                    ? <ActivityIndicator size="small" color={Colors.gold} />
                                    : <Ionicons name="locate" size={16} color={Colors.gold} />
                                }
                                <Text style={styles.posBtnText}>Ma position</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.posBtn, styles.posBtnMap]}
                                onPress={() => setMapOpen(true)}
                            >
                                <Ionicons name="map" size={16} color={Colors.black} />
                                <Text style={[styles.posBtnText, { color: Colors.black }]}>Choisir sur carte</Text>
                            </TouchableOpacity>
                        </View>

                        {errors.lat ? <Text style={styles.errText}>{errors.lat}</Text> : null}

                        {hasPos && (
                            <View style={styles.coordsBadge}>
                                <Ionicons name="checkmark-circle" size={15} color="#22C55E" />
                                <Text style={styles.coordsText}>{lat.toFixed(5)}, {lng.toFixed(5)}</Text>
                                <Text style={styles.coordsRayon}> · r={rayon}m</Text>
                            </View>
                        )}

                        <Input label="Adresse" placeholder="1 rue de la Paix, Paris" value={form.address} onChangeText={s('address')} error={errors.address} icon="location-outline" autoCapitalize="sentences" />
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
                        <Text style={styles.sectionLabel}>Photo de l'étape *</Text>
                        <TouchableOpacity style={[styles.imagePicker, !!errors.image && styles.imagePickerErr]} onPress={pickImage}>
                            {image ? (
                                <>
                                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                                    <View style={styles.imageOverlay}>
                                        <Ionicons name="camera" size={20} color="#fff" />
                                    </View>
                                </>
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera-outline" size={28} color={Colors.textMuted} />
                                    <Text style={styles.imagePlaceholderText}>Choisir une image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {errors.image ? <Text style={styles.errText}>{errors.image}</Text> : null}

                        <Btn label="Ajouter l'étape" onPress={handleCreate} loading={loading} style={{ marginTop: Sp.md, marginBottom: Sp.xxl }} />
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const mapS = StyleSheet.create({
    overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, margin: Sp.md },
    topBtn: { width: 42, height: 42, borderRadius: R.md, backgroundColor: Colors.bgCard + 'EE', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
    hint: { flex: 1, backgroundColor: Colors.bgCard + 'EE', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
    hintText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
    coordBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: Sp.md, backgroundColor: Colors.bgCard + 'EE', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border },
    coordText: { color: '#22C55E', fontSize: 12, fontWeight: '600' },
    coordAddr: { color: Colors.textMuted, fontSize: 11, flex: 1 },
    pin: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.bgCard + 'F0', borderTopWidth: 1, borderTopColor: Colors.border, padding: Sp.md, paddingBottom: Platform.OS === 'ios' ? 34 : Sp.md },
    rayonRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Sp.sm },
    rayonLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
    rayonBtns: { flexDirection: 'row', gap: Sp.sm },
    rayonBtn: { flex: 1, paddingVertical: 8, borderRadius: R.sm, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
    rayonBtnActive: { backgroundColor: Colors.goldGlow, borderColor: Colors.gold },
    rayonBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
    rayonBtnTextActive: { color: Colors.gold },
});

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    scroll: { padding: Sp.lg, paddingTop: 60, flexGrow: 1 },
    backBtn: { width: 38, height: 38, borderRadius: R.sm, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Sp.lg },
    header: { marginBottom: Sp.xl },
    iconWrap: { width: 56, height: 56, borderRadius: R.lg, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '30', alignItems: 'center', justifyContent: 'center', marginBottom: Sp.md },
    title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
    sub: { color: Colors.textSecondary, fontSize: 14 },
    row2: { flexDirection: 'row', gap: Sp.md },
    sectionLabel: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.sm, marginTop: Sp.xs },
    posActions: { flexDirection: 'row', gap: Sp.md, marginBottom: Sp.sm },
    posBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44', borderRadius: R.md, paddingVertical: Sp.sm },
    posBtnMap: { backgroundColor: Colors.gold, borderColor: Colors.gold },
    posBtnText: { color: Colors.gold, fontSize: 13, fontWeight: '600' },
    coordsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#22C55E18', borderRadius: R.sm, paddingHorizontal: Sp.md, paddingVertical: 8, marginBottom: Sp.md, borderWidth: 1, borderColor: '#22C55E44' },
    coordsText: { color: '#22C55E', fontSize: 12, fontWeight: '600' },
    coordsRayon: { color: Colors.textMuted, fontSize: 11 },
    errText: { color: Colors.error, fontSize: 12, marginTop: -Sp.xs, marginBottom: Sp.sm },
    imagePicker: { borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: R.lg, overflow: 'hidden', height: 140, marginBottom: Sp.sm },
    imagePickerErr: { borderColor: Colors.error },
    imagePreview: { width: '100%', height: '100%' },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Sp.sm },
    imagePlaceholderText: { color: Colors.textSecondary, fontSize: 14 },
});