/**
 * EtapeMapPicker
 * Composant fullscreen qui permet de choisir une position sur la carte.
 * Utilisable dans une page dédiée ou en modal pageSheet.
 *
 * Props :
 *   initialLat / initialLng  — position pré-remplie (édition)
 *   initialRayon              — rayon pré-rempli
 *   onConfirm(lat, lng, address, rayon) — callback quand l'utilisateur valide
 *   onClose                   — fermer sans confirmer
 */
import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Platform, SafeAreaView, StatusBar,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sp, R } from '../constants/theme';

interface Props {
    initialLat?: number;
    initialLng?: number;
    initialRayon?: number;
    onConfirm: (lat: number, lng: number, address: string, rayon: number) => void;
    onClose: () => void;
}

const RAYON_PRESETS = [10, 25, 50, 100, 200];

export default function EtapeMapPicker({
                                           initialLat, initialLng, initialRayon = 50,
                                           onConfirm, onClose,
                                       }: Props) {
    const mapRef = useRef<MapView>(null);

    const hasInit = !!(initialLat && initialLng);

    const [region, setRegion] = useState<Region>({
        latitude: initialLat ?? 48.8566,
        longitude: initialLng ?? 2.3522,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    });

    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
        hasInit ? { lat: initialLat!, lng: initialLng! } : null
    );
    const [address, setAddress] = useState('');
    const [rayon, setRayon] = useState(initialRayon);
    const [locating, setLocating] = useState(false);
    const [geocoding, setGeocoding] = useState(false);

    // ── Géocodage inverse ──────────────────────────────────────────────────────
    const reverseGeocode = async (lat: number, lng: number) => {
        setGeocoding(true);
        try {
            const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (results[0]) {
                const r = results[0];
                const parts = [r.streetNumber, r.street, r.city, r.country].filter(Boolean);
                setAddress(parts.join(', '));
            }
        } catch { /* silencieux */ } finally {
            setGeocoding(false);
        }
    };

    // ── Tap sur la carte ───────────────────────────────────────────────────────
    const handleMapPress = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setPin({ lat: latitude, lng: longitude });
        await reverseGeocode(latitude, longitude);
    };

    // ── Ma position ────────────────────────────────────────────────────────────
    const useMyLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const { latitude, longitude } = loc.coords;
            const newRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
            setPin({ lat: latitude, lng: longitude });
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 600);
            await reverseGeocode(latitude, longitude);
        } finally {
            setLocating(false);
        }
    };

    // ── Confirmer ──────────────────────────────────────────────────────────────
    const handleConfirm = () => {
        if (!pin) return;
        onConfirm(pin.lat, pin.lng, address, rayon);
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            {/* Carte */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_DEFAULT}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
                userInterfaceStyle="dark"
                showsUserLocation
                showsCompass
            >
                {pin && (
                    <>
                        <Marker coordinate={{ latitude: pin.lat, longitude: pin.lng }}>
                            <View style={s.pin}>
                                <Ionicons name="flag" size={16} color={Colors.black} />
                            </View>
                        </Marker>
                        <Circle
                            center={{ latitude: pin.lat, longitude: pin.lng }}
                            radius={rayon}
                            fillColor={Colors.gold + '28'}
                            strokeColor={Colors.gold + 'AA'}
                            strokeWidth={2}
                        />
                    </>
                )}
            </MapView>

            {/* Top bar */}
            <SafeAreaView style={s.topSafe}>
                <View style={s.topBar}>
                    {/* Fermer */}
                    <TouchableOpacity style={s.iconBtn} onPress={onClose}>
                        <Ionicons name="close" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Hint */}
                    <View style={s.hint}>
                        <Text style={s.hintText} numberOfLines={1}>
                            {geocoding
                                ? 'Géocodage...'
                                : pin
                                    ? address || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`
                                    : 'Appuyez pour placer l\'étape'}
                        </Text>
                    </View>

                    {/* Ma position */}
                    <TouchableOpacity style={s.iconBtn} onPress={useMyLocation} disabled={locating}>
                        {locating
                            ? <ActivityIndicator size="small" color={Colors.gold} />
                            : <Ionicons name="locate" size={20} color={Colors.gold} />
                        }
                    </TouchableOpacity>
                </View>

                {/* Badge coordonnées */}
                {pin && (
                    <View style={s.coordBadge}>
                        <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
                        <Text style={s.coordText}>{pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}</Text>
                        <Text style={s.coordSep}>·</Text>
                        <Text style={s.coordRayon}>r = {rayon}m</Text>
                    </View>
                )}
            </SafeAreaView>

            {/* Bottom bar — rayon + confirmer */}
            <View style={s.bottom}>
                {/* Presets rayon */}
                <View style={s.rayonRow}>
                    <Ionicons name="radio-button-on-outline" size={14} color={Colors.gold} />
                    <Text style={s.rayonLabel}>Zone de détection</Text>
                </View>
                <View style={s.rayonPresets}>
                    {RAYON_PRESETS.map(v => (
                        <TouchableOpacity
                            key={v}
                            style={[s.presetBtn, rayon === v && s.presetBtnActive]}
                            onPress={() => setRayon(v)}
                        >
                            <Text style={[s.presetTxt, rayon === v && s.presetTxtActive]}>{v}m</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bouton confirmer */}
                <TouchableOpacity
                    style={[s.confirmBtn, !pin && s.confirmBtnDisabled]}
                    onPress={handleConfirm}
                    disabled={!pin}
                    activeOpacity={0.8}
                >
                    <Ionicons name="checkmark" size={18} color={Colors.black} />
                    <Text style={s.confirmTxt}>Confirmer la position</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    pin: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: Colors.gold,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2.5, borderColor: '#fff',
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
    },

    // Top
    topSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
    topBar: {
        flexDirection: 'row', alignItems: 'center',
        gap: Sp.sm, margin: Sp.md,
    },
    iconBtn: {
        width: 42, height: 42, borderRadius: R.md,
        backgroundColor: Colors.bgCard + 'EE',
        borderWidth: 1, borderColor: Colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    hint: {
        flex: 1,
        backgroundColor: Colors.bgCard + 'EE',
        borderRadius: R.full,
        paddingHorizontal: Sp.md, paddingVertical: 10,
        borderWidth: 1, borderColor: Colors.border,
        alignItems: 'center',
    },
    hintText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },

    coordBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        marginHorizontal: Sp.md,
        backgroundColor: Colors.bgCard + 'EE',
        borderRadius: R.full,
        paddingHorizontal: Sp.md, paddingVertical: 7,
        borderWidth: 1, borderColor: Colors.border,
        alignSelf: 'flex-start',
    },
    coordText: { color: '#22C55E', fontSize: 12, fontWeight: '600' },
    coordSep: { color: Colors.textMuted, fontSize: 12 },
    coordRayon: { color: Colors.gold, fontSize: 12, fontWeight: '600' },

    // Bottom
    bottom: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.bgCard + 'F5',
        borderTopWidth: 1, borderTopColor: Colors.border,
        padding: Sp.md,
        paddingBottom: Platform.OS === 'ios' ? 34 : Sp.md,
        gap: Sp.sm,
    },
    rayonRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rayonLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
    rayonPresets: { flexDirection: 'row', gap: Sp.sm },
    presetBtn: {
        flex: 1, paddingVertical: 8, borderRadius: R.sm,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1, borderColor: Colors.border,
        alignItems: 'center',
    },
    presetBtnActive: { backgroundColor: Colors.goldGlow, borderColor: Colors.gold },
    presetTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
    presetTxtActive: { color: Colors.gold },

    confirmBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: Colors.gold,
        borderRadius: R.md, paddingVertical: 14,
    },
    confirmBtnDisabled: { opacity: 0.4 },
    confirmTxt: { color: Colors.black, fontWeight: '800', fontSize: 15 },
});