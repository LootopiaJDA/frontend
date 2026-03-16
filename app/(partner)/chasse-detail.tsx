import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, SafeAreaView, ActivityIndicator, Dimensions, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { chasseService, etapeService } from '../../services/api';
import { Chasse, Etape } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const ETAT_CFG: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE:    { label: 'Active',     color: '#22C55E', bg: '#22C55E18' },
    PENDING:   { label: 'En attente', color: Colors.warning, bg: Colors.warningBg },
    COMPLETED: { label: 'Terminée',   color: Colors.textMuted, bg: Colors.bgElevated },
};

// ─── Marker custom ────────────────────────────────────────────────────────────

function EtapeMarker({ index, isFirst, isLast }: { index: number; isFirst: boolean; isLast: boolean }) {
    const bg = isFirst ? Colors.gold : isLast ? '#22C55E' : Colors.bgCard;
    const borderColor = isFirst ? Colors.gold : isLast ? '#22C55E' : Colors.gold;
    const textColor = isFirst || isLast ? Colors.black : Colors.gold;
    return (
        <View style={mkS.wrap}>
            <View style={[mkS.bubble, { backgroundColor: bg, borderColor }]}>
                {isFirst ? <Ionicons name="flag" size={14} color={Colors.black} />
                    : isLast ? <Ionicons name="trophy" size={14} color={Colors.black} />
                        : <Text style={[mkS.text, { color: textColor }]}>{index + 1}</Text>}
            </View>
            <View style={[mkS.arrow, { borderTopColor: borderColor }]} />
        </View>
    );
}
const mkS = StyleSheet.create({
    wrap: { alignItems: 'center' },
    bubble: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: 13, fontWeight: '800' },
    arrow: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
});

// ─── Etape row dans le scroll ─────────────────────────────────────────────────

function EtapeRow({ etape, index, total, onDelete }: { etape: Etape; index: number; total: number; onDelete: () => void }) {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const accentColor = isFirst ? Colors.gold : isLast ? '#22C55E' : Colors.textSecondary;
    return (
        <View style={eS.row}>
            <View style={eS.timeline}>
                <View style={[eS.dot, { borderColor: accentColor, backgroundColor: accentColor + '22' }]}>
                    <Text style={[eS.dotNum, { color: accentColor }]}>{index + 1}</Text>
                </View>
                {index < total - 1 && <View style={eS.line} />}
            </View>
            <View style={eS.card}>
                <View style={eS.cardTop}>
                    <Text style={eS.cardName} numberOfLines={1}>{etape.name}</Text>
                    <TouchableOpacity style={eS.delBtn} onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="trash-outline" size={14} color={Colors.error} />
                    </TouchableOpacity>
                </View>
                {etape.address ? (
                    <View style={eS.addrRow}>
                        <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                        <Text style={eS.addrText} numberOfLines={1}>{etape.address}</Text>
                    </View>
                ) : null}
                {etape.description ? (
                    <Text style={eS.desc} numberOfLines={2}>{etape.description}</Text>
                ) : null}
                <View style={eS.meta}>
                    <View style={eS.metaChip}>
                        <Ionicons name="navigate-outline" size={10} color={Colors.textMuted} />
                        <Text style={eS.metaText}>{parseFloat(etape.lat).toFixed(4)}, {parseFloat(etape.long).toFixed(4)}</Text>
                    </View>
                    <View style={eS.metaChip}>
                        <Ionicons name="radio-button-on-outline" size={10} color={Colors.textMuted} />
                        <Text style={eS.metaText}>r = {etape.rayon}m</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
const eS = StyleSheet.create({
    row: { flexDirection: 'row', gap: Sp.sm },
    timeline: { alignItems: 'center', width: 32 },
    dot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    dotNum: { fontSize: 12, fontWeight: '800' },
    line: { flex: 1, width: 1.5, backgroundColor: Colors.border, marginVertical: 3 },
    card: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, padding: Sp.sm, gap: 4, marginBottom: Sp.sm },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', flex: 1 },
    delBtn: { width: 26, height: 26, borderRadius: R.sm, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
    addrRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    addrText: { color: Colors.textMuted, fontSize: 11, flex: 1 },
    desc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
    meta: { flexDirection: 'row', gap: Sp.sm, flexWrap: 'wrap', marginTop: 2 },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.bgElevated, borderRadius: R.sm, paddingHorizontal: 6, paddingVertical: 3 },
    metaText: { color: Colors.textMuted, fontSize: 10 },
});

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ChasseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const chasseId = parseInt(id ?? '0');

    const [chasse, setChasse] = useState<Chasse | null>(null);
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapExpanded, setMapExpanded] = useState(false);

    const load = useCallback(async () => {
        try {
            const [c, e] = await Promise.all([
                chasseService.getById(chasseId),
                etapeService.getAll(chasseId),
            ]);
            setChasse(c);
            const sorted = [...(Array.isArray(e) ? e : [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
            setEtapes(sorted);
        } catch {
            Alert.alert('Erreur', 'Impossible de charger la chasse');
        } finally {
            setLoading(false);
        }
    }, [chasseId]);

    useEffect(() => { load(); }, [load]);

    const validEtapes = etapes.filter(e => {
        const lat = parseFloat(e.lat);
        const lng = parseFloat(e.long);
        return !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);
    });

    const coords = validEtapes.map(e => ({
        latitude: parseFloat(e.lat),
        longitude: parseFloat(e.long),
    }));

    // Calcul region auto
    const mapRegion = coords.length > 0 ? (() => {
        const lats = coords.map(c => c.latitude);
        const lngs = coords.map(c => c.longitude);
        const minLat = Math.min(...lats), maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
        const padLat = Math.max((maxLat - minLat) * 0.4, 0.005);
        const padLng = Math.max((maxLng - minLng) * 0.4, 0.005);
        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: (maxLat - minLat) + padLat * 2,
            longitudeDelta: (maxLng - minLng) + padLng * 2,
        };
    })() : { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.1, longitudeDelta: 0.1 };

    const handleDeleteEtape = (etape: Etape) => {
        Alert.alert('Supprimer l\'étape', `Supprimer "${etape.name}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive',
                onPress: async () => {
                    try {
                        await etapeService.delete(chasseId, etape.id);
                        setEtapes(prev => prev.filter(e => e.id !== etape.id));
                    } catch { Alert.alert('Erreur', 'Suppression échouée'); }
                },
            },
        ]);
    };

    if (loading) return (
        <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.gold} size="large" />
        </View>
    );

    const cfg = ETAT_CFG[chasse?.etat ?? 'PENDING'] ?? ETAT_CFG.PENDING;

    // ─── Mode carte plein écran ───────────────────────────────────────────────
    if (mapExpanded) {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={mapRegion}
                    userInterfaceStyle="dark"
                    showsUserLocation
                    showsCompass
                >
                    {coords.length > 1 && (
                        <Polyline coordinates={coords} strokeColor={Colors.gold} strokeWidth={3} lineDashPattern={[10, 5]} />
                    )}
                    {validEtapes.map((e, idx) => (
                        <React.Fragment key={e.id}>
                            <Marker
                                coordinate={{ latitude: parseFloat(e.lat), longitude: parseFloat(e.long) }}
                                title={`${idx + 1}. ${e.name}`}
                                description={e.address}
                            >
                                <EtapeMarker index={idx} isFirst={idx === 0} isLast={idx === validEtapes.length - 1} />
                            </Marker>
                            {e.rayon > 0 && (
                                <Circle
                                    center={{ latitude: parseFloat(e.lat), longitude: parseFloat(e.long) }}
                                    radius={e.rayon}
                                    fillColor={Colors.gold + '18'}
                                    strokeColor={Colors.gold + '66'}
                                    strokeWidth={1.5}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </MapView>

                {/* Overlay top */}
                <SafeAreaView style={mapS.overlay}>
                    <View style={mapS.topBar}>
                        <TouchableOpacity style={mapS.btn} onPress={() => setMapExpanded(false)}>
                            <Ionicons name="chevron-down" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <View style={mapS.titleChip}>
                            <Text style={mapS.titleText} numberOfLines={1}>{chasse?.name}</Text>
                        </View>
                        <View style={[mapS.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '66' }]}>
                            <Text style={[mapS.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Légende bottom */}
                <View style={mapS.legend}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={mapS.legendScroll}>
                        {validEtapes.map((e, idx) => (
                            <TouchableOpacity
                                key={e.id}
                                style={mapS.legendItem}
                                onPress={() => mapRef.current?.animateToRegion({
                                    latitude: parseFloat(e.lat), longitude: parseFloat(e.long),
                                    latitudeDelta: 0.003, longitudeDelta: 0.003,
                                }, 600)}
                            >
                                <View style={[mapS.legendDot, {
                                    backgroundColor: idx === 0 ? Colors.gold : idx === validEtapes.length - 1 ? '#22C55E' : Colors.bgCard,
                                    borderColor: idx === 0 ? Colors.gold : idx === validEtapes.length - 1 ? '#22C55E' : Colors.gold,
                                }]}>
                                    <Text style={[mapS.legendNum, { color: idx === 0 || idx === validEtapes.length - 1 ? Colors.black : Colors.gold }]}>
                                        {idx + 1}
                                    </Text>
                                </View>
                                <Text style={mapS.legendName} numberOfLines={1}>{e.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    }

    // ─── Vue normale ──────────────────────────────────────────────────────────
    return (
        <View style={styles.bg}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{chasse?.name}</Text>
                    <View style={[styles.etatBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '55' }]}>
                        <Text style={[styles.etatText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <TouchableOpacity style={styles.mapContainer} onPress={() => setMapExpanded(true)} activeOpacity={0.95}>
                        <MapView
                            style={styles.map}
                            provider={PROVIDER_DEFAULT}
                            region={mapRegion}
                            userInterfaceStyle="dark"
                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                            pointerEvents="none"
                        >
                            {coords.length > 1 && (
                                <Polyline coordinates={coords} strokeColor={Colors.gold} strokeWidth={2.5} lineDashPattern={[8, 4]} />
                            )}
                            {validEtapes.map((e, idx) => (
                                <React.Fragment key={e.id}>
                                    <Marker coordinate={{ latitude: parseFloat(e.lat), longitude: parseFloat(e.long) }}>
                                        <EtapeMarker index={idx} isFirst={idx === 0} isLast={idx === validEtapes.length - 1} />
                                    </Marker>
                                    {e.rayon > 0 && (
                                        <Circle
                                            center={{ latitude: parseFloat(e.lat), longitude: parseFloat(e.long) }}
                                            radius={e.rayon}
                                            fillColor={Colors.gold + '15'}
                                            strokeColor={Colors.gold + '55'}
                                            strokeWidth={1}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </MapView>
                        <View style={styles.mapOverlayBtn}>
                            <Ionicons name="expand" size={14} color={Colors.textPrimary} />
                            <Text style={styles.mapOverlayText}>Plein écran</Text>
                        </View>
                        <View style={styles.mapBadge}>
                            <Ionicons name="flag" size={11} color={Colors.gold} />
                            <Text style={styles.mapBadgeText}>{etapes.length} étape{etapes.length !== 1 ? 's' : ''}</Text>
                        </View>
                    </TouchableOpacity>

                    {(chasse?.occurence?.date_start || chasse?.occurence?.limit_user) ? (
                        <View style={styles.occCard}>
                            {chasse.occurence?.date_start ? (
                                <View style={styles.occItem}>
                                    <Ionicons name="calendar-outline" size={14} color={Colors.gold} />
                                    <Text style={styles.occText}>
                                        {chasse.occurence.date_start}
                                        {chasse.occurence.date_end ? ` → ${chasse.occurence.date_end}` : ''}
                                    </Text>
                                </View>
                            ) : null}
                            {chasse.occurence?.limit_user ? (
                                <View style={styles.occItem}>
                                    <Ionicons name="people-outline" size={14} color={Colors.gold} />
                                    <Text style={styles.occText}>Max {chasse.occurence.limit_user} joueurs</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    {/* Section étapes */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Parcours · {etapes.length} étape{etapes.length !== 1 ? 's' : ''}</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => router.push({ pathname: '/(partner)/add-etape', params: { chasseId: chasseId } })}
                            >
                                <Ionicons name="add" size={16} color={Colors.gold} />
                                <Text style={styles.addBtnText}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>

                        {etapes.length === 0 ? (
                            <View style={styles.emptyEtapes}>
                                <Ionicons name="flag-outline" size={32} color={Colors.textMuted} />
                                <Text style={styles.emptyTitle}>Aucune étape</Text>
                                <Text style={styles.emptyText}>Ajoutez des étapes pour définir le parcours.</Text>
                            </View>
                        ) : (
                            etapes.map((e, idx) => (
                                <EtapeRow
                                    key={e.id}
                                    etape={e}
                                    index={idx}
                                    total={etapes.length}
                                    onDelete={() => handleDeleteEtape(e)}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const mapS = StyleSheet.create({
    overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, margin: Sp.md },
    btn: { width: 40, height: 40, borderRadius: R.md, backgroundColor: Colors.bgCard + 'EE', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
    titleChip: { flex: 1, backgroundColor: Colors.bgCard + 'EE', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
    titleText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
    badge: { borderWidth: 1, borderRadius: R.full, paddingHorizontal: Sp.sm, paddingVertical: 5 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    legend: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.bgCard + 'F0', borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: Sp.sm },
    legendScroll: { paddingHorizontal: Sp.lg, gap: Sp.sm },
    legendItem: { alignItems: 'center', gap: 4, minWidth: 60 },
    legendDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    legendNum: { fontSize: 11, fontWeight: '800' },
    legendName: { color: Colors.textSecondary, fontSize: 10, textAlign: 'center', maxWidth: 60 },
});

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, paddingHorizontal: Sp.lg, paddingVertical: Sp.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
    backBtn: { width: 36, height: 36, borderRadius: R.sm, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
    etatBadge: { borderWidth: 1, borderRadius: R.full, paddingHorizontal: Sp.sm, paddingVertical: 4 },
    etatText: { fontSize: 11, fontWeight: '700' },
    scroll: { paddingBottom: 100 },
    mapContainer: { margin: Sp.lg, borderRadius: R.xl, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: Colors.border },
    map: { width: '100%', height: 240 },
    mapOverlayBtn: { position: 'absolute', bottom: Sp.sm, right: Sp.sm, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bgCard + 'EE', borderWidth: 1, borderColor: Colors.border, borderRadius: R.full, paddingHorizontal: Sp.sm, paddingVertical: 5 },
    mapOverlayText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '600' },
    mapBadge: { position: 'absolute', top: Sp.sm, right: Sp.sm, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bgCard + 'EE', borderWidth: 1, borderColor: Colors.border, borderRadius: R.full, paddingHorizontal: Sp.sm, paddingVertical: 4 },
    mapBadgeText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '600' },
    occCard: { marginHorizontal: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, padding: Sp.md, gap: Sp.sm, marginBottom: Sp.md },
    occItem: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm },
    occText: { color: Colors.textSecondary, fontSize: 13 },
    section: { paddingHorizontal: Sp.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Sp.md },
    sectionTitle: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 5 },
    addBtnText: { color: Colors.gold, fontSize: 12, fontWeight: '700' },
    emptyEtapes: { alignItems: 'center', gap: Sp.sm, paddingVertical: Sp.xl },
    emptyTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
    emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});