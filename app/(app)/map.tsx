import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sp, R } from '@/constants/theme';
import { useHuntTracker } from '@/hooks/useHuntTracker';
import { useHuntStore } from '@/store/huntStore';

// ─── Overlay victoire ─────────────────────────────────────────────────────────
function VictoryOverlay({ onDismiss }: { onDismiss: () => void }) {
  const scale   = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[vc.overlay, { opacity }]}>
      <Animated.View style={[vc.card, { transform: [{ scale }] }]}>
        <Ionicons name="trophy" size={64} color={Colors.gold} />
        <Text style={vc.title}>Félicitations !</Text>
        <Text style={vc.sub}>Vous avez terminé toutes les étapes</Text>
        <TouchableOpacity style={vc.btn} onPress={onDismiss}>
          <Text style={vc.btnText}>Retour aux chasses</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const vc = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,16,0.92)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: R.xl,
    borderWidth: 1, borderColor: Colors.gold + '44',
    padding: Sp.xxl, alignItems: 'center', gap: 12,
    marginHorizontal: Sp.xl,
  },
  title:   { fontSize: 28, fontWeight: '800', color: Colors.gold },
  sub:     { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  btn:     { marginTop: Sp.md, backgroundColor: Colors.gold, paddingHorizontal: 32, paddingVertical: 14, borderRadius: R.full },
  btnText: { fontSize: 15, fontWeight: '800', color: Colors.black },
});

// ─── Écran carte ──────────────────────────────────────────────────────────────
export default function MapScreen() {
  const params = useLocalSearchParams<{ chasseId?: string }>();
  const router = useRouter();
  const { pendingValidation, setPendingValidation } = useHuntStore();

  const [activeChasseId, setActiveChasseId] = useState<number | null>(null);
  const [loadingChasse, setLoadingChasse] = useState(true);
  const [showVictory, setShowVictory] = useState(false);

  const digPanelY = useRef(new Animated.Value(220)).current;

  // ─── Résolution de la chasse active ─────────────────────────────────────────
  useEffect(() => {
    if (params.chasseId) {
      setActiveChasseId(Number(params.chasseId));
    }
    setLoadingChasse(false);
  }, [params.chasseId]);

  const tracker = useHuntTracker(activeChasseId ?? 0);

  // ─── Retour depuis l'écran AR : avancer l'étape ──────────────────────────────
  useFocusEffect(useCallback(() => {
    if (pendingValidation) {
      setPendingValidation(false);
      tracker.advanceOnly();
    }
  }, [pendingValidation, tracker.advanceOnly]));

  // ─── Affichage panel Creuser ─────────────────────────────────────────────────
  useEffect(() => {
    Animated.spring(digPanelY, {
      toValue: tracker.isInRadius ? 0 : 220,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [tracker.isInRadius]);

  // ─── Victoire ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tracker.completed) setShowVictory(true);
  }, [tracker.completed]);

  const handleLaunchAR = () => {
    if (!tracker.currentEtape || !activeChasseId) return;
    router.push({
      pathname: '/(app)/ar-view',
      params: {
        chasseId: String(activeChasseId),
        etapeId: String(tracker.currentEtape.id_etape),
        etapeName: tracker.currentEtape.name ?? `Étape ${tracker.currentIndex + 1}`,
        lat: tracker.currentEtape.lat,
        lng: tracker.currentEtape.long,
      },
    });
  };

  // ─── États vide / chargement ─────────────────────────────────────────────────
  if (!loadingChasse && !activeChasseId) {
    return (
      <SafeAreaView style={st.safe}>
        <View style={st.empty}>
          <Ionicons name="map-outline" size={52} color={Colors.textMuted} />
          <Text style={st.emptyTitle}>Aucune chasse en cours</Text>
          <Text style={st.emptySub}>
            Rejoignez une chasse depuis l'onglet Chasses pour la voir ici.
          </Text>
          <TouchableOpacity style={st.emptyBtn} onPress={() => router.push('/(app)/chasses')}>
            <Text style={st.emptyBtnText}>Voir les chasses</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingChasse || tracker.loading || !tracker.position) {
    return (
      <View style={[st.safe, st.center]}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={st.loadingText}>
          {tracker.loading ? 'Chargement des étapes...' : 'Localisation en cours...'}
        </Text>
      </View>
    );
  }

  const { etapes, currentEtape, currentIndex, position, distance } = tracker;

  return (
    <View style={st.fill}>
      {/* ─── Carte ──────────────────────────────────────────────────────────── */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {etapes.length > 1 && (
          <Polyline
            coordinates={etapes.map(e => ({ latitude: parseFloat(e.lat), longitude: parseFloat(e.long) }))}
            strokeColor={Colors.gold + '50'}
            strokeWidth={2}
            lineDashPattern={[6, 5]}
          />
        )}

        {etapes.map((etape, i) => {
          const coord = { latitude: parseFloat(etape.lat), longitude: parseFloat(etape.long) };
          const isDone    = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <React.Fragment key={etape.id_etape}>
              <Marker coordinate={coord} title={etape.name ?? `Étape ${i + 1}`}>
                <View style={[mk.pin, isDone && mk.pinDone, isCurrent && mk.pinCurrent]}>
                  {isDone
                    ? <Ionicons name="checkmark" size={14} color="#fff" />
                    : <Text style={[mk.pinText, isCurrent && mk.pinTextCurrent]}>{i + 1}</Text>
                  }
                </View>
              </Marker>
              {isCurrent && (
                <Circle
                  center={coord}
                  radius={etape.rayon ?? 30}
                  strokeColor={Colors.gold + '99'}
                  fillColor={Colors.gold + '20'}
                  strokeWidth={2}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapView>

      {/* ─── HUD ────────────────────────────────────────────────────────────── */}
      {currentEtape && (
        <SafeAreaView style={st.hudWrap} pointerEvents="none">
          <View style={st.hud}>
            <View style={st.hudStep}>
              <Text style={st.hudStepLabel}>ÉTAPE</Text>
              <Text style={st.hudStepNum}>{currentIndex + 1}/{etapes.length}</Text>
            </View>
            <View style={st.hudDivider} />
            <View style={st.hudInfo}>
              <Text style={st.hudName} numberOfLines={1}>{currentEtape.name}</Text>
              {currentEtape.address
                ? <Text style={st.hudAddr} numberOfLines={1}>{currentEtape.address}</Text>
                : null}
            </View>
            <View style={st.hudDivider} />
            <View style={st.hudDist}>
              <Text style={[st.hudDistNum, tracker.isInRadius && st.hudDistInRange]}>
                {distance !== null ? `${distance}m` : '—'}
              </Text>
              <Text style={st.hudDistLabel}>
                {tracker.isInRadius ? 'Zone !' : 'distance'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* ─── Panel Creuser → Lancer AR ──────────────────────────────────────── */}
      <Animated.View
        style={[st.digPanel, { transform: [{ translateY: digPanelY }] }]}
        pointerEvents={tracker.isInRadius ? 'auto' : 'none'}
      >
        <View style={st.digHandle} />
        <View style={st.digRow}>
          <Ionicons name="location" size={18} color={Colors.gold} />
          <Text style={st.digTitle}>Zone atteinte !</Text>
        </View>
        <Text style={st.digSub}>{currentEtape?.name}</Text>

        <TouchableOpacity
          style={st.arBtn}
          onPress={handleLaunchAR}
          activeOpacity={0.85}
        >
          <Ionicons name="cube-outline" size={20} color={Colors.black} />
          <Text style={st.arBtnText}>Lancer la Réalité Augmentée</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ─── Overlay victoire ───────────────────────────────────────────────── */}
      {showVictory && (
        <VictoryOverlay onDismiss={() => {
          setShowVictory(false);
          router.push('/(app)/chasses');
        }} />
      )}
    </View>
  );
}

const mk = StyleSheet.create({
  pin: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  pinCurrent: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg, borderColor: Colors.gold, borderWidth: 2 },
  pinDone: { backgroundColor: '#4ecb8a', borderColor: '#4ecb8a' },
  pinText: { fontSize: 13, fontWeight: '800', color: Colors.textMuted },
  pinTextCurrent: { color: Colors.gold },
});

const st = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textMuted, fontSize: 14 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: Sp.xl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  emptySub:   { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn:   { marginTop: Sp.sm, backgroundColor: Colors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: R.full },
  emptyBtnText: { fontWeight: '700', color: Colors.black, fontSize: 14 },

  hudWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
  hud: {
    margin: Sp.lg, marginTop: Sp.md,
    backgroundColor: Colors.bg + 'EE',
    borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  hudStep:      { paddingVertical: Sp.md, paddingHorizontal: Sp.md, alignItems: 'center' },
  hudStepLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1.5, fontWeight: '700' },
  hudStepNum:   { fontSize: 18, fontWeight: '800', color: Colors.gold },
  hudDivider:   { width: 1, height: '60%', backgroundColor: Colors.border },
  hudInfo:      { flex: 1, paddingHorizontal: Sp.md, paddingVertical: Sp.md },
  hudName:      { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  hudAddr:      { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  hudDist:      { paddingHorizontal: Sp.md, alignItems: 'center' },
  hudDistNum:     { fontSize: 16, fontWeight: '800', color: Colors.textSecondary },
  hudDistInRange: { color: '#4ecb8a' },
  hudDistLabel:   { fontSize: 9, color: Colors.textMuted, letterSpacing: 0.5 },

  digPanel: {
    position: 'absolute', bottom: 30, left: Sp.lg, right: Sp.lg,
    backgroundColor: Colors.bgCard, borderRadius: R.xl,
    borderWidth: 1, borderColor: Colors.gold + '55',
    padding: Sp.lg, paddingTop: Sp.md,
    alignItems: 'center', gap: Sp.sm,
    shadowColor: Colors.gold, shadowOpacity: 0.25,
    shadowRadius: 24, shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  digHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: Sp.xs },
  digRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  digTitle:  { fontSize: 18, fontWeight: '800', color: Colors.gold },
  digSub:    { fontSize: 13, color: Colors.textSecondary },
  arBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.gold, borderRadius: R.full,
    paddingHorizontal: 28, paddingVertical: 14, marginTop: 4,
  },
  arBtnText: { fontSize: 15, fontWeight: '800', color: Colors.black },
});
