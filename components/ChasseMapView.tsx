/**
 * ChasseMapView
 * Affiche toutes les étapes d'une chasse sur une carte.
 * Chaque étape = un marker numéroté + un cercle de rayon.
 * Tap sur un marker → callout avec nom + adresse.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Etape } from '../constants/types';
import { Colors, Sp, R } from '../constants/theme';

interface Props {
    etapes: Etape[];
    /** hauteur de la carte, défaut 280 */
    height?: number;
}

function getBounds(etapes: Etape[]) {
    const lats = etapes.map(e => parseFloat(e.lat));
    const lngs = etapes.map(e => parseFloat(e.long));
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = Math.max((maxLat - minLat) * 0.4, 0.005);
    const padLng = Math.max((maxLng - minLng) * 0.4, 0.005);
    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: maxLat - minLat + padLat,
        longitudeDelta: maxLng - minLng + padLng,
    };
}

// Couleurs par ordre (cycled)
const MARKER_COLORS = [
    Colors.gold,
    '#4FC3F7',
    '#81C784',
    '#FF8A65',
    '#CE93D8',
    '#F06292',
];

export default function ChasseMapView({ etapes, height = 280 }: Props) {
    const mapRef = useRef<MapView>(null);

    const validEtapes = etapes.filter(
        e => e.lat && e.long && !isNaN(parseFloat(e.lat)) && !isNaN(parseFloat(e.long))
    );

    useEffect(() => {
        if (validEtapes.length === 0) return;
        const region = getBounds(validEtapes);
        // Petit délai pour laisser la map se monter
        setTimeout(() => {
            mapRef.current?.animateToRegion(region, 500);
        }, 400);
    }, [validEtapes.length]);

    if (validEtapes.length === 0) {
        return (
            <View style={[s.empty, { height }]}>
                <Ionicons name="map-outline" size={32} color={Colors.textMuted} />
                <Text style={s.emptyTxt}>Aucune étape géolocalisée</Text>
            </View>
        );
    }

    const initialRegion = getBounds(validEtapes);

    return (
        <View style={[s.wrap, { height }]}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                userInterfaceStyle="dark"
                showsUserLocation={false}
                showsCompass={false}
                scrollEnabled
                zoomEnabled
                pitchEnabled={false}
                rotateEnabled={false}
            >
                {validEtapes.map((etape, index) => {
                    const lat = parseFloat(etape.lat);
                    const lng = parseFloat(etape.long);
                    const rayon = etape.rayon ?? 50;
                    const color = MARKER_COLORS[index % MARKER_COLORS.length];
                    const rank = etape.rank ?? index + 1;

                    return (
                        <React.Fragment key={etape.id_etape}>
                            {/* Cercle de rayon */}
                            <Circle
                                center={{ latitude: lat, longitude: lng }}
                                radius={rayon}
                                fillColor={color + '22'}
                                strokeColor={color + '88'}
                                strokeWidth={2}
                            />

                            {/* Marker numéroté */}
                            <Marker coordinate={{ latitude: lat, longitude: lng }}>
                                {/* Marker custom */}
                                <View style={[s.markerWrap, { borderColor: color }]}>
                                    <Text style={[s.markerRank, { color }]}>{rank}</Text>
                                </View>

                                {/* Callout au tap */}
                                <Callout tooltip>
                                    <View style={s.callout}>
                                        <Text style={s.calloutName}>{etape.name}</Text>
                                        {etape.address ? (
                                            <Text style={s.calloutAddr}>{etape.address}</Text>
                                        ) : null}
                                        <Text style={s.calloutMeta}>
                                            {lat.toFixed(5)}, {lng.toFixed(5)}  ·  r={rayon}m
                                        </Text>
                                    </View>
                                </Callout>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapView>

            {/* Légende */}
            <View style={s.legend}>
                <Ionicons name="information-circle-outline" size={12} color={Colors.textMuted} />
                <Text style={s.legendTxt}>{validEtapes.length} étape{validEtapes.length > 1 ? 's' : ''} · Appuyez sur un marqueur</Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    wrap: {
        borderRadius: R.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    empty: {
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyTxt: { color: Colors.textMuted, fontSize: 13 },

    // Marker
    markerWrap: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: Colors.bgCard,
        borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3, elevation: 4,
    },
    markerRank: { fontSize: 13, fontWeight: '800' },

    // Callout
    callout: {
        backgroundColor: Colors.bgCard,
        borderRadius: R.md,
        padding: Sp.sm,
        minWidth: 160,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 3,
    },
    calloutName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    calloutAddr: { fontSize: 11, color: Colors.textMuted },
    calloutMeta: { fontSize: 10, color: Colors.textMuted },

    // Légende
    legend: {
        position: 'absolute', bottom: Sp.sm, right: Sp.sm,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.bgCard + 'EE',
        borderRadius: R.full,
        paddingHorizontal: 10, paddingVertical: 5,
        borderWidth: 1, borderColor: Colors.border,
    },
    legendTxt: { fontSize: 10, color: Colors.textMuted },
});