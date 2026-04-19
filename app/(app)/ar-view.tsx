/**
 * ar-view.tsx — Réalité augmentée GPS + boussole
 *
 * Principe :
 *  1. Caméra en fond d'écran (expo-camera)
 *  2. Magnétomètre (expo-sensors) → cap boussole en temps réel
 *  3. Calcul du bearing GPS user → étape
 *  4. Quand le téléphone pointe vers l'étape (< 30°), le coffre apparaît
 *  5. Validation → retour carte
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Dimensions, SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sp, R } from '@/constants/theme';
import { useHuntStore } from '@/store/huntStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const FOV_DEG = 60; // champ de vision horizontal estimé (degrés)

// ─── Maths AR ─────────────────────────────────────────────────────────────────

/** Bearing GPS de (lat1,lon1) vers (lat2,lon2), retourne 0-360° */
function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Cap boussole depuis le magnétomètre (0-360°, 0 = Nord) */
function getMagHeading(mx: number, my: number): number {
  return ((Math.atan2(-my, mx) * 180) / Math.PI + 360) % 360;
}

/** Différence angulaire signée normalisée entre -180 et 180 */
function angleDiff(a: number, b: number): number {
  let d = ((a - b + 180) % 360) - 180;
  if (d < -180) d += 360;
  return d;
}

// ─── Coffre au trésor ─────────────────────────────────────────────────────────
function TreasureChest({ scale }: { scale: Animated.Value }) {
  return (
    <Animated.View style={[ch.wrap, { transform: [{ scale }] }]}>
      <View style={ch.lid}>
        <View style={ch.lidBand} />
        <View style={ch.lockWrap}>
          <View style={ch.lockCircle} />
          <View style={ch.lockSlot} />
        </View>
        <View style={[ch.rivet, { left: 8, top: 8 }]} />
        <View style={[ch.rivet, { right: 8, top: 8 }]} />
      </View>
      <View style={ch.hinge}>
        <View style={ch.hingeKnob} />
        <View style={ch.hingeKnob} />
        <View style={ch.hingeKnob} />
      </View>
      <View style={ch.base}>
        <View style={ch.band} />
        <View style={ch.band} />
        <View style={[ch.rivet, { left: 8, bottom: 8 }]} />
        <View style={[ch.rivet, { right: 8, bottom: 8 }]} />
      </View>
    </Animated.View>
  );
}

const ch = StyleSheet.create({
  wrap:       { alignItems: 'center', width: 160 },
  lid: {
    width: 160, height: 55, backgroundColor: '#5C2E0A',
    borderRadius: 12, borderWidth: 2, borderColor: Colors.gold + '88',
    borderBottomWidth: 0, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  lidBand:    { position: 'absolute', height: 10, left: 0, right: 0, backgroundColor: Colors.gold + '55', borderRadius: 2 },
  lockWrap:   { alignItems: 'center', marginTop: 6 },
  lockCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, borderColor: Colors.gold, backgroundColor: '#3a1a05' },
  lockSlot:   { width: 7, height: 10, backgroundColor: Colors.gold, borderRadius: 3, marginTop: -4 },
  rivet:      { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold },
  hinge:      { flexDirection: 'row', justifyContent: 'space-around', width: 120, height: 10, marginBottom: -2 },
  hingeKnob:  { width: 14, height: 10, backgroundColor: Colors.gold, borderRadius: 2 },
  base: {
    width: 160, height: 80, backgroundColor: '#7A3D12',
    borderRadius: 8, borderWidth: 2, borderColor: Colors.gold + '88',
    borderTopWidth: 1, justifyContent: 'space-evenly', alignItems: 'center',
    overflow: 'hidden', position: 'relative',
  },
  band: { height: 10, width: '90%', backgroundColor: Colors.gold + '44', borderRadius: 2 },
});

// ─── Indicateur de direction ──────────────────────────────────────────────────
function CompassArrow({ diff }: { diff: number }) {
  const clamp = Math.max(-90, Math.min(90, diff));
  return (
    <View style={ca.wrap}>
      <Ionicons
        name="arrow-up"
        size={28}
        color={Math.abs(diff) < 15 ? '#4ecb8a' : Colors.gold}
        style={{ transform: [{ rotate: `${clamp}deg` }] }}
      />
      <Text style={[ca.label, Math.abs(diff) < 15 && ca.labelOk]}>
        {Math.abs(diff) < 15 ? 'Dans la bonne direction !' : diff > 0 ? 'Tournez à droite' : 'Tournez à gauche'}
      </Text>
    </View>
  );
}

const ca = StyleSheet.create({
  wrap:     { alignItems: 'center', gap: 6 },
  label:    { fontSize: 13, fontWeight: '700', color: Colors.gold, letterSpacing: 0.5 },
  labelOk:  { color: '#4ecb8a' },
});

// ─── Écran AR principal ───────────────────────────────────────────────────────
export default function ArViewScreen() {
  const { chasseId, etapeId, etapeName, lat, lng } = useLocalSearchParams<{
    chasseId: string; etapeId: string; etapeName: string; lat: string; lng: string;
  }>();
  const router = useRouter();
  const { setPendingValidation } = useHuntStore();

  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [heading, setHeading]           = useState<number | null>(null);
  const [userPos, setUserPos]           = useState<{ lat: number; lng: number } | null>(null);
  const [bearing, setBearing]           = useState<number | null>(null);
  const [diff, setDiff]                 = useState<number>(180);
  const [chestVisible, setChestVisible] = useState(false);
  const [validating, setValidating]     = useState(false);
  const [validated, setValidated]       = useState(false);

  // Animations
  const chestOpacity  = useRef(new Animated.Value(0)).current;
  const chestScale    = useRef(new Animated.Value(0.5)).current;
  const chestY        = useRef(new Animated.Value(0)).current;
  const chestX        = useRef(new Animated.Value(0)).current;
  const glowOpacity   = useRef(new Animated.Value(0)).current;
  const btnOpacity    = useRef(new Animated.Value(0)).current;
  const flashOpacity  = useRef(new Animated.Value(0)).current;
  const floatLoop     = useRef<Animated.CompositeAnimation | null>(null);

  // ─── Permissions caméra ───────────────────────────────────────────────────
  useEffect(() => {
    if (!camPermission?.granted) requestCamPermission();
  }, []);

  // ─── Position GPS utilisateur ─────────────────────────────────────────────
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 2 },
        (loc) => setUserPos({ lat: loc.coords.latitude, lng: loc.coords.longitude }),
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  // ─── Calcul du bearing GPS vers l'étape ──────────────────────────────────
  useEffect(() => {
    if (!userPos || !lat || !lng) return;
    const b = getBearing(userPos.lat, userPos.lng, parseFloat(lat), parseFloat(lng));
    setBearing(b);
  }, [userPos, lat, lng]);

  // ─── Magnétomètre → cap boussole ─────────────────────────────────────────
  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      setHeading(getMagHeading(x, y));
    });
    return () => sub.remove();
  }, []);

  // ─── Calcul diff heading/bearing → position du coffre ────────────────────
  useEffect(() => {
    if (heading === null || bearing === null) return;
    const d = angleDiff(heading, bearing);
    setDiff(d);

    // Position horizontale du coffre (décalage selon l'angle)
    const xOffset = (d / FOV_DEG) * SCREEN_W * 0.8;
    Animated.spring(chestX, { toValue: xOffset, useNativeDriver: true, tension: 60, friction: 8 }).start();

    // Coffre visible si < 30°
    const visible = Math.abs(d) < 30;
    if (visible && !chestVisible) {
      setChestVisible(true);
      showChest();
    } else if (!visible && chestVisible && !validated) {
      hideChest();
      setChestVisible(false);
    }
  }, [heading, bearing]);

  // ─── Animation apparition coffre ─────────────────────────────────────────
  const showChest = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.parallel([
      Animated.spring(chestOpacity, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(chestScale,   { toValue: 1, useNativeDriver: true, tension: 55, friction: 7 }),
      Animated.timing(glowOpacity,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // Float loop
      floatLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(chestY, { toValue: -12, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(chestY, { toValue: 0,   duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      floatLoop.current.start();

      // Bouton valider
      setTimeout(() => {
        Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }, 500);
    });
  }, []);

  const hideChest = useCallback(() => {
    floatLoop.current?.stop();
    Animated.parallel([
      Animated.timing(chestOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(glowOpacity,  { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(btnOpacity,   { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    Animated.spring(chestScale, { toValue: 0.5, useNativeDriver: true, tension: 80 }).start();
  }, []);

  // ─── Validation ───────────────────────────────────────────────────────────
  const handleValidate = async () => {
    if (validating || validated) return;
    setValidating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Flash
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.9, duration: 120, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0,   duration: 400, useNativeDriver: true }),
    ]).start();

    setValidated(true);
    setPendingValidation(true);
    setTimeout(() => router.navigate({ pathname: '/(app)/map', params: { chasseId } }), 600);
  };

  // ─── Écran de permission ──────────────────────────────────────────────────
  if (!camPermission?.granted) {
    return (
      <SafeAreaView style={st.permScreen}>
        <Ionicons name="camera-outline" size={52} color={Colors.gold} />
        <Text style={st.permTitle}>Caméra requise</Text>
        <Text style={st.permSub}>La réalité augmentée nécessite l'accès à la caméra</Text>
        <TouchableOpacity style={st.permBtn} onPress={requestCamPermission}>
          <Text style={st.permBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const proximityPct = Math.max(0, 1 - Math.abs(diff) / 30);

  return (
    <View style={st.fill}>
      {/* ─── Caméra en fond ─────────────────────────────────────────────── */}
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />

      {/* ─── Vignette sombre sur les bords ──────────────────────────────── */}
      <View style={st.vignette} pointerEvents="none" />

      <SafeAreaView style={st.overlay}>
        {/* Header */}
        <View style={st.header}>
          <TouchableOpacity style={st.closeBtn} onPress={() => router.navigate({ pathname: '/(app)/map', params: { chasseId } })}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={st.headerCenter}>
            <Text style={st.headerTitle}>RÉALITÉ AUGMENTÉE</Text>
            <Text style={st.headerSub}>{etapeName}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Réticule central */}
        <View style={st.reticleWrap} pointerEvents="none">
          <View style={[st.reticle, { borderColor: proximityPct > 0.5 ? '#4ecb8a' : Colors.gold + '88' }]}>
            <View style={[st.reticleDot, { backgroundColor: proximityPct > 0.5 ? '#4ecb8a' : Colors.gold }]} />
          </View>
        </View>

        {/* Coffre AR — positionné selon l'angle boussole */}
        <Animated.View
          style={[st.chestContainer, {
            opacity: chestOpacity,
            transform: [
              { translateX: chestX },
              { translateY: chestY },
            ],
          }]}
          pointerEvents="none"
        >
          {/* Halo */}
          <Animated.View style={[st.glow, { opacity: glowOpacity }]} />
          <TreasureChest scale={chestScale} />
          <Text style={st.chestLabel}>Trésor localisé !</Text>
        </Animated.View>

        {/* Indicateur de direction (bas) */}
        <View style={st.bottom}>
          {!chestVisible && heading !== null && (
            <View style={st.compassCard}>
              <CompassArrow diff={diff} />
              <Text style={st.compassHint}>
                Pointez votre téléphone vers le trésor
              </Text>
            </View>
          )}

          {/* Bouton valider */}
          <Animated.View style={[st.btnWrap, { opacity: btnOpacity }]}>
            <TouchableOpacity
              style={[st.validateBtn, validated && st.validateBtnDone]}
              onPress={handleValidate}
              disabled={validating || validated}
              activeOpacity={0.85}
            >
              <Ionicons
                name={validated ? 'checkmark-circle' : 'checkmark-done-outline'}
                size={22}
                color={Colors.black}
              />
              <Text style={st.validateBtnText}>
                {validated ? 'Étape validée !' : 'Valider cette étape'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* Flash de validation */}
      <Animated.View style={[st.flash, { opacity: flashOpacity }]} pointerEvents="none" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  fill: { flex: 1 },

  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Dégradé simulé via bordures sombres
    borderWidth: 60,
    borderColor: 'rgba(0,0,0,0.35)',
  },

  overlay: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Sp.lg, paddingTop: Sp.md,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: R.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle:  { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  headerSub:    { fontSize: 13, color: Colors.gold, fontWeight: '600', marginTop: 2 },

  // Réticule central
  reticleWrap: {
    position: 'absolute',
    top: SCREEN_H / 2 - 40,
    left: SCREEN_W / 2 - 40,
  },
  reticle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  reticleDot: { width: 8, height: 8, borderRadius: 4 },

  // Coffre
  chestContainer: {
    position: 'absolute',
    top: SCREEN_H * 0.25,
    left: SCREEN_W / 2 - 80,
    alignItems: 'center',
    gap: 12,
  },
  glow: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    top: -30, left: -30,
    backgroundColor: Colors.gold + '25',
    shadowColor: Colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  chestLabel: { fontSize: 16, fontWeight: '800', color: Colors.gold, textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

  // Bas de l'écran
  bottom: {
    position: 'absolute',
    bottom: 40,
    left: Sp.lg,
    right: Sp.lg,
    gap: Sp.md,
  },

  compassCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
    padding: Sp.lg,
    alignItems: 'center',
    gap: Sp.sm,
  },
  compassHint: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },

  btnWrap: {},
  validateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.gold, borderRadius: R.full,
    paddingVertical: 16, paddingHorizontal: 32,
    shadowColor: Colors.gold, shadowOpacity: 0.5,
    shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  validateBtnDone: { backgroundColor: '#4ecb8a' },
  validateBtnText: { fontSize: 16, fontWeight: '800', color: Colors.black },

  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 200 },

  // Écran permission
  permScreen: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: Sp.lg, padding: Sp.xl },
  permTitle:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  permSub:     { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  permBtn:     { backgroundColor: Colors.gold, paddingHorizontal: 32, paddingVertical: 14, borderRadius: R.full },
  permBtnText: { fontSize: 15, fontWeight: '800', color: Colors.black },
});
