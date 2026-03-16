import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, SafeAreaView, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { chasseService, etapeService } from '../../services/api';
import { Chasse, Etape } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function ChasseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const chasseId = parseInt(id ?? '0');

    const [chasse, setChasse] = useState<Chasse | null>(null);
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [c, e] = await Promise.all([
                    chasseService.getById(chasseId),
                    etapeService.getAll(chasseId),
                ]);
                setChasse(c);
                setEtapes([...(Array.isArray(e) ? e : [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)));
            } catch { Alert.alert('Erreur', 'Impossible de charger la chasse'); }
            finally { setLoading(false); }
        })();
    }, [chasseId]);

    const handleJoin = async () => {
        Alert.alert('Rejoindre', `Participer à "${chasse?.name}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Rejoindre', onPress: async () => {
                    setJoining(true);
                    try {
                        await chasseService.join(chasseId);
                        setJoined(true);
                        Alert.alert('Aventure démarrée ! 🎉', 'Bonne chance dans votre quête !');
                    } catch (e: any) {
                        Alert.alert('Erreur', e.message);
                    } finally { setJoining(false); }
                },
            },
        ]);
    };

    if (loading) return (
        <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.gold} size="large" />
        </View>
    );

    const occ = chasse?.occurence?.[0];

    // Centre de la map sur la 1ère étape si dispo
    const firstEtape = etapes.find(e => !isNaN(parseFloat(e.lat)));
    const mapRegion = firstEtape ? {
        latitude: parseFloat(firstEtape.lat),
        longitude: parseFloat(firstEtape.long),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.1, longitudeDelta: 0.1 };

    return (
        <View style={styles.bg}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Hero image */}
                <View style={styles.hero}>
                    {chasse?.image
                        ? <Image source={{ uri: chasse.image }} style={styles.heroImg} />
                        : <View style={[styles.heroImg, styles.heroPlaceholder]}><Ionicons name="map" size={64} color={Colors.textMuted} /></View>
                    }
                    <SafeAreaView style={styles.heroOverlay}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={20} color="#fff" />
                        </TouchableOpacity>
                    </SafeAreaView>
                    <View style={styles.heroBottom}>
                        <View style={[styles.etatBadge, { backgroundColor: chasse?.etat === 'ACTIVE' ? '#22C55E22' : Colors.warningBg }]}>
                            <View style={[styles.dot, { backgroundColor: chasse?.etat === 'ACTIVE' ? '#22C55E' : Colors.warning }]} />
                            <Text style={[styles.etatText, { color: chasse?.etat === 'ACTIVE' ? '#22C55E' : Colors.warning }]}>
                                {chasse?.etat === 'ACTIVE' ? 'Active' : 'En attente'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Titre */}
                    <Text style={styles.name}>{chasse?.name}</Text>
                    <View style={styles.locRow}>
                        <Ionicons name="location" size={14} color={Colors.gold} />
                        <Text style={styles.locText}>{chasse?.localisation}</Text>
                    </View>

                    {/* Infos occurrence */}
                    {(occ?.date_start || occ?.limit_user) ? (
                        <View style={styles.occCard}>
                            {occ?.date_start ? (
                                <View style={styles.occItem}>
                                    <View style={styles.occIcon}><Ionicons name="calendar" size={16} color={Colors.gold} /></View>
                                    <View>
                                        <Text style={styles.occLabel}>Période</Text>
                                        <Text style={styles.occValue}>
                                            {occ.date_start.split('T')[0]}
                                            {occ.date_end ? ` → ${occ.date_end.split('T')[0]}` : ''}
                                        </Text>
                                    </View>
                                </View>
                            ) : null}
                            {occ?.limit_user ? (
                                <View style={styles.occItem}>
                                    <View style={styles.occIcon}><Ionicons name="people" size={16} color={Colors.gold} /></View>
                                    <View>
                                        <Text style={styles.occLabel}>Participants max</Text>
                                        <Text style={styles.occValue}>{occ.limit_user} joueurs</Text>
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    {/* Stats étapes */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Ionicons name="flag" size={20} color={Colors.gold} />
                            <Text style={styles.statValue}>{etapes.length}</Text>
                            <Text style={styles.statLabel}>Étapes</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="navigate" size={20} color={Colors.gold} />
                            <Text style={styles.statValue}>—</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="time" size={20} color={Colors.gold} />
                            <Text style={styles.statValue}>~{Math.max(etapes.length * 15, 30)}min</Text>
                            <Text style={styles.statLabel}>Durée est.</Text>
                        </View>
                    </View>

                    {/* Aperçu map (premier point seulement - les autres restent secrets) */}
                    {firstEtape && (
                        <View style={styles.mapSection}>
                            <Text style={styles.sectionTitle}>Point de départ</Text>
                            <View style={styles.mapWrap}>
                                <MapView
                                    style={styles.map}
                                    provider={PROVIDER_DEFAULT}
                                    initialRegion={mapRegion}
                                    userInterfaceStyle="dark"
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    pointerEvents="none"
                                >
                                    <Marker coordinate={{ latitude: parseFloat(firstEtape.lat), longitude: parseFloat(firstEtape.long) }}>
                                        <View style={styles.markerWrap}>
                                            <View style={styles.marker}>
                                                <Ionicons name="flag" size={14} color={Colors.black} />
                                            </View>
                                            <View style={styles.markerArrow} />
                                        </View>
                                    </Marker>
                                </MapView>
                                <View style={styles.mapHintOverlay}>
                                    <Ionicons name="eye-off-outline" size={14} color={Colors.textMuted} />
                                    <Text style={styles.mapHintText}>Les autres étapes sont secrètes</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Liste des étapes (noms seulement, positions masquées) */}
                    <View style={styles.etapesSection}>
                        <Text style={styles.sectionTitle}>Aperçu du parcours ({etapes.length} étapes)</Text>
                        {etapes.map((e, idx) => (
                            <View key={e.id} style={styles.etapeRow}>
                                <View style={[styles.etapeNum, idx === 0 && styles.etapeNumFirst]}>
                                    <Text style={[styles.etapeNumText, idx === 0 && { color: Colors.black }]}>{idx + 1}</Text>
                                </View>
                                <View style={styles.etapeInfo}>
                                    <Text style={styles.etapeName}>{e.name}</Text>
                                    {idx === 0
                                        ? <Text style={styles.etapeHint}>{e.address}</Text>
                                        : <Text style={styles.etapeSecret}><Ionicons name="lock-closed" size={10} /> Position secrète</Text>
                                    }
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* CTA rejoindre */}
            <View style={styles.ctaWrap}>
                <TouchableOpacity
                    style={[styles.ctaBtn, joined && styles.ctaBtnJoined]}
                    onPress={joined ? undefined : handleJoin}
                    disabled={joining || joined || chasse?.etat !== 'ACTIVE'}
                    activeOpacity={0.85}
                >
                    {joining
                        ? <ActivityIndicator color={Colors.black} />
                        : joined
                            ? <><Ionicons name="checkmark-circle" size={20} color={Colors.black} /><Text style={styles.ctaText}>Chasse rejointe !</Text></>
                            : chasse?.etat !== 'ACTIVE'
                                ? <Text style={styles.ctaText}>Chasse non disponible</Text>
                                : <><Ionicons name="compass" size={20} color={Colors.black} /><Text style={styles.ctaText}>Rejoindre l'aventure</Text></>
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    scroll: { paddingBottom: 100 },
    hero: { height: 280, position: 'relative' },
    heroImg: { width: '100%', height: '100%' },
    heroPlaceholder: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
    backBtn: { margin: Sp.md, width: 40, height: 40, borderRadius: R.md, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    heroBottom: { position: 'absolute', bottom: Sp.md, left: Sp.md },
    etatBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 5 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    etatText: { fontSize: 12, fontWeight: '700' },
    content: { padding: Sp.lg, gap: Sp.md },
    name: { color: Colors.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    locText: { color: Colors.textSecondary, fontSize: 14 },
    occCard: { backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, padding: Sp.md, gap: Sp.md },
    occItem: { flexDirection: 'row', alignItems: 'center', gap: Sp.md },
    occIcon: { width: 36, height: 36, borderRadius: R.sm, backgroundColor: Colors.goldGlow, alignItems: 'center', justifyContent: 'center' },
    occLabel: { color: Colors.textMuted, fontSize: 11 },
    occValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
    statsRow: { flexDirection: 'row', gap: Sp.sm },
    statCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, padding: Sp.md, alignItems: 'center', gap: 4 },
    statValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
    statLabel: { color: Colors.textMuted, fontSize: 11 },
    sectionTitle: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.sm },
    mapSection: {},
    mapWrap: { borderRadius: R.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
    map: { height: 200 },
    mapHintOverlay: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border, padding: Sp.sm, justifyContent: 'center' },
    mapHintText: { color: Colors.textMuted, fontSize: 12 },
    markerWrap: { alignItems: 'center' },
    marker: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    markerArrow: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.gold },
    etapesSection: {},
    etapeRow: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingVertical: Sp.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
    etapeNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.bgElevated, borderWidth: 1.5, borderColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
    etapeNumFirst: { backgroundColor: Colors.gold },
    etapeNumText: { color: Colors.gold, fontSize: 12, fontWeight: '800' },
    etapeInfo: { flex: 1 },
    etapeName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
    etapeHint: { color: Colors.textSecondary, fontSize: 12 },
    etapeSecret: { color: Colors.textMuted, fontSize: 11 },
    ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Sp.lg, paddingBottom: 34, backgroundColor: Colors.bgCard + 'F5', borderTopWidth: 1, borderTopColor: Colors.border },
    ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm, backgroundColor: Colors.gold, borderRadius: R.lg, paddingVertical: 16 },
    ctaBtnJoined: { backgroundColor: '#22C55E' },
    ctaText: { color: Colors.black, fontSize: 16, fontWeight: '800' },
});