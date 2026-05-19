/**
 * ar-view.tsx — AR chasse au trésor
 *
 * seeking : boussole + flèches → trouve le bon angle
 * found   : pelle animée + bouton "Creuser"
 * digging : tremblement d'écran
 * chest   : coffre flottant + bouton "Ouvrir"
 * opening : coffre s'ouvre + confettis
 * scroll  : parchemin avec indice
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import LottieView from 'lottie-react-native';
import { DeviceMotion } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sp, R } from '@/constants/theme';
import { useHuntStore } from '@/store/huntStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLon  = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function angleDiff(a: number, b: number): number {
  let d = ((a - b + 180) % 360) - 180;
  if (d < -180) d += 360;
  return d;
}

type Phase = 'seeking' | 'found' | 'digging' | 'chest' | 'opening' | 'scroll';

// ─── Aiguille de boussole ─────────────────────────────────────────────────────
const CompassNeedle = React.memo(({ diff }: { diff: number }) => {
  const inRange = Math.abs(diff) < 30;
  const color   = inRange ? '#4ecb8a' : Colors.gold;
  const rot     = Math.max(-80, Math.min(80, diff));
  return (
    <View style={{ alignItems: 'center', transform: [{ rotate: `${rot}deg` }] }}>
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 30,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color,
      }} />
      <View style={{ width: 4, height: 48, backgroundColor: color, borderRadius: 2 }} />
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 16,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color + '44',
      }} />
    </View>
  );
});

// ─── Flèches latérales pulsantes ─────────────────────────────────────────────
function SideArrows({ side }: { side: 'left' | 'right' }) {
  const a1 = useRef(new Animated.Value(0.2)).current;
  const a2 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const makeLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, { toValue: 1,   duration: 380, useNativeDriver: true }),
        Animated.timing(val, { toValue: 0.2, duration: 380, useNativeDriver: true }),
      ]));
    const l1 = makeLoop(a1, 0);
    const l2 = makeLoop(a2, 220);
    l1.start(); l2.start();
    return () => { l1.stop(); l2.stop(); };
  }, []);

  const icon = side === 'left' ? 'chevron-back' : 'chevron-forward';
  const pair = side === 'left' ? [a2, a1] : [a1, a2];

  return (
    <View style={[sa.wrap, side === 'left' ? sa.left : sa.right]}>
      <Animated.View style={{ opacity: pair[0] }}>
        <Ionicons name={icon} size={46} color={Colors.gold} />
      </Animated.View>
      <Animated.View style={{ opacity: pair[1], marginHorizontal: -12 }}>
        <Ionicons name={icon} size={46} color={Colors.gold} />
      </Animated.View>
    </View>
  );
}

const sa = StyleSheet.create({
  wrap:  { position: 'absolute', flexDirection: 'row', alignItems: 'center', top: '35%' },
  left:  { left: Sp.sm },
  right: { right: Sp.sm },
});

// ─── UI boussole — phase seeking ──────────────────────────────────────────────
function SeekingUI({ diff }: { diff: number | null }) {
  const inRange   = diff !== null && Math.abs(diff) < 30;
  const proximity = diff !== null ? Math.max(0, 1 - Math.abs(diff) / 90) : 0;

  const ringPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(ringPulse, { toValue: inRange ? 1.2 : 1.06, duration: 650, useNativeDriver: true }),
      Animated.timing(ringPulse, { toValue: 1,                     duration: 650, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [inRange]);

  if (diff === null) {
    return (
      <View style={se.loading}>
        <ActivityIndicator color={Colors.gold} size="large" />
        <Text style={se.loadingText}>Localisation en cours...</Text>
      </View>
    );
  }

  return (
    <View style={se.container}>
      {/* Flèches côté gauche / droit */}
      {diff < -22 && !inRange && <SideArrows side="left" />}
      {diff >  22 && !inRange && <SideArrows side="right" />}

      {/* Boussole */}
      <View style={se.compassArea}>
        <Animated.View style={[se.outerRing, {
          borderColor: inRange ? '#4ecb8a55' : Colors.gold + '33',
          transform: [{ scale: ringPulse }],
        }]} />
        <View style={[se.innerRing, { borderColor: inRange ? '#4ecb8a99' : Colors.gold + '66' }]} />
        <CompassNeedle diff={diff} />
      </View>

      {/* Carte statut */}
      <View style={[se.card, inRange && se.cardGreen]}>
        <Text style={[se.cardText, inRange && se.cardTextGreen]}>
          {inRange
            ? '✦  Vous y êtes !'
            : diff < 0
              ? '◀  Tournez à gauche'
              : 'Tournez à droite  ▶'}
        </Text>

        {/* Barre de proximité */}
        <View style={se.barTrack}>
          <View style={[se.barFill, {
            flex: proximity,
            backgroundColor: inRange ? '#4ecb8a' : Colors.gold,
          }]} />
          <View style={{ flex: Math.max(0, 1 - proximity) }} />
        </View>

        <Text style={se.barLabel}>
          {inRange ? 'Trésor localisé — prêt à creuser !' : 'Cherchez le trésor...'}
        </Text>
      </View>
    </View>
  );
}

const se = StyleSheet.create({
  container: {
    position: 'absolute', left: 0, right: 0,
    top: SCREEN_H * 0.12, bottom: 130,
    alignItems: 'center', justifyContent: 'space-between',
  },
  loading: {
    position: 'absolute', left: 0, right: 0,
    top: '38%', alignItems: 'center', gap: Sp.md,
  },
  loadingText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },

  compassArea: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center' },
  outerRing: {
    position: 'absolute', width: 190, height: 190, borderRadius: 95,
    borderWidth: 2,
  },
  innerRing: {
    position: 'absolute', width: 144, height: 144, borderRadius: 72,
    borderWidth: 1.5,
  },

  card: {
    width: SCREEN_W - Sp.xl * 2,
    backgroundColor: 'rgba(8,5,0,0.78)',
    borderRadius: R.xl, borderWidth: 1, borderColor: Colors.gold + '40',
    padding: Sp.lg, alignItems: 'center', gap: Sp.sm,
  },
  cardGreen: { borderColor: '#4ecb8a44' },
  cardText:      { fontSize: 16, fontWeight: '800', color: Colors.gold, letterSpacing: 0.4 },
  cardTextGreen: { color: '#4ecb8a' },

  barTrack: {
    width: '100%', height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row', overflow: 'hidden',
  },
  barFill:  { borderRadius: 3 },
  barLabel: { fontSize: 11, color: Colors.textMuted, letterSpacing: 0.8, fontWeight: '600' },
});

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ArViewScreen() {
  const { chasseId, etapeName, lat, lng, description } = useLocalSearchParams<{
    chasseId: string; etapeName: string; lat: string; lng: string; description?: string;
  }>();
  const router = useRouter();
  const { setPendingValidation } = useHuntStore();

  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [phase,          setPhase]          = useState<Phase>('seeking');
  const [heading,        setHeading]        = useState<number | null>(null);
  const [bearing,        setBearing]        = useState<number | null>(null);
  const [diff,           setDiff]           = useState<number | null>(null);
  const [detectionReady, setDetectionReady] = useState(false);
  const inRangeRef = useRef(false);

  // Grace period : on montre toujours la boussole seeking au moins 2.5s
  useEffect(() => {
    const t = setTimeout(() => setDetectionReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Tremblement
  const shakeX    = useRef(new Animated.Value(0)).current;
  const shakeLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Pelle
  const shovelOpacity = useRef(new Animated.Value(0)).current;
  const shovelScale   = useRef(new Animated.Value(0.75)).current;

  // Coffre
  const chestY       = useRef(new Animated.Value(SCREEN_H * 0.65)).current;
  const chestOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;
  const floatY       = useRef(new Animated.Value(0)).current;
  const floatLoop    = useRef<Animated.CompositeAnimation | null>(null);

  // Confettis
  const confettiOpacity = useRef(new Animated.Value(0)).current;

  // Parchemin
  const scrollTranslate = useRef(new Animated.Value(SCREEN_H)).current;
  const scrollOpacity   = useRef(new Animated.Value(0)).current;
  const scrollScale     = useRef(new Animated.Value(0.88)).current;

  // Bouton
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale   = useRef(new Animated.Value(0.85)).current;
  const btnY       = useRef(new Animated.Value(50)).current;

  const chestRef = useRef<LottieView>(null);

  // ── Permissions ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!camPermission?.granted) requestCamPermission();
  }, []);

  // ── GPS ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 2 },
        loc => {
          if (!lat || !lng) return;
          setBearing(getBearing(
            loc.coords.latitude, loc.coords.longitude,
            parseFloat(lat), parseFloat(lng),
          ));
        },
      );
    })();
    return () => { sub?.remove(); };
  }, [lat, lng]);

  // ── Boussole ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    DeviceMotion.setUpdateInterval(100);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (rotation) setHeading(((rotation.alpha * 180) / Math.PI + 360) % 360);
    });
    return () => sub.remove();
  }, []);

  // ── Calcul diff + zone ────────────────────────────────────────────────────────
  useEffect(() => {
    if (heading === null || bearing === null) return;
    const d = angleDiff(heading, bearing);
    setDiff(d);

    if (phase !== 'seeking' && phase !== 'found') return;
    if (!detectionReady) return; // grace period — boussole seeking toujours visible d'abord

    const nowInRange = Math.abs(d) < 30;
    const was = inRangeRef.current;

    if (nowInRange && !was) {
      inRangeRef.current = true;
      if (phase === 'seeking') {
        setPhase('found');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else if (!nowInRange && was && phase === 'found' && Math.abs(d) > 45) {
      inRangeRef.current = false;
      setPhase('seeking');
    }
  }, [heading, bearing, phase]);

  // ── Pelle : entrée / sortie zone ──────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'found') {
      Animated.parallel([
        Animated.spring(shovelOpacity, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.spring(shovelScale,   { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 }),
        Animated.spring(btnOpacity,    { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
        Animated.spring(btnScale,      { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
        Animated.spring(btnY,          { toValue: 0, useNativeDriver: true, tension: 55, friction: 10 }),
      ]).start();
    } else if (phase === 'seeking') {
      Animated.parallel([
        Animated.timing(shovelOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(btnOpacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(btnY,          { toValue: 50, duration: 200, useNativeDriver: true }),
      ]).start();
      Animated.spring(shovelScale, { toValue: 0.75, useNativeDriver: true, tension: 120 }).start();
    }
  }, [phase]);

  // ── "Creuser" ─────────────────────────────────────────────────────────────────
  const handleDig = useCallback(() => {
    if (phase !== 'found') return;
    setPhase('digging');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.parallel([
      Animated.timing(btnOpacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(shovelOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
    Animated.spring(shovelScale, { toValue: 1.12, useNativeDriver: true, tension: 200 }).start();

    // Tremblement
    shakeLoop.current = Animated.loop(Animated.sequence([
      Animated.timing(shakeX, { toValue:  13, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -13, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   4, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   0, duration: 45, useNativeDriver: true }),
      Animated.delay(90),
    ]));
    shakeLoop.current.start();

    setTimeout(() => {
      shakeLoop.current?.stop();
      Animated.timing(shakeX, { toValue: 0, duration: 180, useNativeDriver: true })
        .start(() => setPhase('chest'));
    }, 2800);
  }, [phase]);

  // ── Phase "chest" ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'chest') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.parallel([
      Animated.spring(chestY,       { toValue: 0, useNativeDriver: true, tension: 42, friction: 9 }),
      Animated.timing(chestOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(glowOpacity,  { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start(() => {
      floatLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(floatY, { toValue: -13, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatY, { toValue:   0, duration: 1800, useNativeDriver: true }),
      ]));
      floatLoop.current.start();

      Animated.parallel([
        Animated.spring(btnOpacity, { toValue: 1, useNativeDriver: true, tension: 70 }),
        Animated.spring(btnScale,   { toValue: 1, useNativeDriver: true, tension: 70 }),
        Animated.spring(btnY,       { toValue: 0, useNativeDriver: true, tension: 60, friction: 9 }),
      ]).start();
    });
  }, [phase]);

  // ── "Ouvrir" ──────────────────────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    if (phase !== 'chest') return;
    setPhase('opening');
    floatLoop.current?.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(floatY,          { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(btnOpacity,      { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(confettiOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => chestRef.current?.play());
  }, [phase]);

  // ── Coffre ouvert → parchemin ─────────────────────────────────────────────────
  const handleChestOpen = useCallback(() => {
    setPhase('scroll');
    Animated.timing(confettiOpacity, { toValue: 0, duration: 2200, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (phase !== 'scroll') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(scrollTranslate, { toValue: 0, useNativeDriver: true, tension: 50, friction: 12 }),
      Animated.timing(scrollOpacity,   { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(scrollScale,     { toValue: 1, useNativeDriver: true, tension: 50, friction: 12 }),
    ]).start();
  }, [phase]);

  // ── Valider ───────────────────────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    setPendingValidation(true);
    router.back();
  }, []);

  // ── Permission ────────────────────────────────────────────────────────────────
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

  const hintText =
    description && description !== 'undefined' && description.trim() !== ''
      ? description
      : 'Aucun indice disponible pour cette étape.';

  const isDigging = phase === 'digging';
  const isOpening = phase === 'opening';

  return (
    <View style={st.fill}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      <View style={st.vignette} pointerEvents="none" />

      {/* Wrapper de tremblement */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: shakeX }] }]}
        pointerEvents="box-none"
      >
        <SafeAreaView style={st.overlay}>
          {/* Header */}
          <View style={st.header}>
            <TouchableOpacity
              style={st.closeBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={st.headerCenter}>
              <Text style={st.headerTitle}>
                {phase === 'seeking' ? 'CHERCHEZ LE TRÉSOR' : 'RÉALITÉ AUGMENTÉE'}
              </Text>
              <Text style={st.headerSub}>{etapeName}</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          {/* Boussole — phase seeking seulement */}
          {phase === 'seeking' && <SeekingUI diff={diff} />}

          {/* Pelle — found et digging */}
          {(phase === 'found' || phase === 'digging') && (
            <Animated.View
              style={[st.shovelWrap, {
                opacity: shovelOpacity,
                transform: [{ scale: shovelScale }],
              }]}
              pointerEvents="none"
            >
              <LottieView
                source={require('@/assets/animations/seeds.json')}
                autoPlay loop
                style={{ width: SCREEN_W * 0.80, height: SCREEN_W * 0.80 }}
              />
              <Text style={st.shovelHint}>
                {isDigging ? 'Creusage en cours...' : 'Creusez ici !'}
              </Text>
            </Animated.View>
          )}

          {/* Coffre — chest et opening */}
          {(phase === 'chest' || phase === 'opening') && (
            <Animated.View
              style={[st.chestWrap, {
                opacity: chestOpacity,
                transform: [{ translateY: chestY }, { translateY: floatY }],
              }]}
              pointerEvents="none"
            >
              <Animated.View style={[st.glow, { opacity: glowOpacity }]} />
              <LottieView
                ref={chestRef}
                source={require('@/assets/animations/ChestOpening.json')}
                autoPlay={false}
                loop={false}
                style={{ width: 270, height: 270 }}
                onAnimationFinish={handleChestOpen}
              />
              {phase === 'chest' && (
                <View style={st.chestBadge}>
                  <Text style={st.chestBadgeText}>Trésor déterré !</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Boutons */}
          {(phase === 'found' || phase === 'digging' || phase === 'chest' || phase === 'opening') && (
            <Animated.View style={[st.bottomZone, {
              opacity: btnOpacity,
              transform: [{ scale: btnScale }, { translateY: btnY }],
            }]}>
              {(phase === 'found' || phase === 'digging') && (
                <TouchableOpacity
                  style={[st.mainBtn, isDigging && st.mainBtnDim]}
                  onPress={handleDig}
                  disabled={isDigging}
                  activeOpacity={0.82}
                >
                  <Ionicons name="hammer-outline" size={22} color={Colors.black} />
                  <Text style={st.mainBtnText}>
                    {isDigging ? 'Creusage...' : 'Creuser'}
                  </Text>
                </TouchableOpacity>
              )}

              {(phase === 'chest' || phase === 'opening') && (
                <TouchableOpacity
                  style={[st.mainBtn, isOpening && st.mainBtnDim]}
                  onPress={handleOpen}
                  disabled={isOpening}
                  activeOpacity={0.82}
                >
                  <Ionicons name="lock-open-outline" size={22} color={Colors.black} />
                  <Text style={st.mainBtnText}>
                    {isOpening ? 'Ouverture...' : 'Ouvrir'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </SafeAreaView>
      </Animated.View>

      {/* Confettis */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: confettiOpacity }]}
        pointerEvents="none"
      >
        <LottieView
          source={require('@/assets/animations/confetti.json')}
          autoPlay loop style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Parchemin */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject, st.scrollOverlay,
          {
            opacity: scrollOpacity,
            transform: [{ translateY: scrollTranslate }, { scale: scrollScale }],
          },
        ]}
        pointerEvents={phase === 'scroll' ? 'auto' : 'none'}
      >
        <View style={st.scrollBackdrop} />

        <View style={st.parchment}>
          {/* Rouleau haut */}
          <View style={st.roll}>
            <View style={st.rollCap} />
            <View style={st.rollBar} />
            <View style={st.rollCap} />
          </View>

          {/* Corps */}
          <View style={st.parchBody}>
            <Text style={st.parchDeco}>✦   ✦   ✦</Text>
            <Text style={st.parchTitle}>INDICE</Text>
            <View style={st.parchLine} />
            <Text style={st.parchText}>{hintText}</Text>
            <View style={st.parchLine} />
            <Text style={st.parchDeco}>✦   ✦   ✦</Text>
          </View>

          {/* Rouleau bas */}
          <View style={st.roll}>
            <View style={st.rollCap} />
            <View style={st.rollBar} />
            <View style={st.rollCap} />
          </View>

          <TouchableOpacity style={st.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.black} />
            <Text style={st.continueBtnText}>Valider et continuer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PARCH_BG     = '#F0D99A';
const PARCH_ROLL   = '#9A6B1A';
const PARCH_BORDER = '#7A500E';
const PARCH_INK    = '#2E1A05';
const PARCH_LINE   = '#9A6B1A99';

const st = StyleSheet.create({
  fill:    { flex: 1 },
  overlay: { flex: 1 },

  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 50,
    borderColor: 'rgba(0,0,0,0.32)',
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Sp.lg, paddingTop: Sp.md,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: R.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontSize: 10, fontWeight: '800', color: '#fff',
    letterSpacing: 2.5, opacity: 0.9,
  },
  headerSub: { fontSize: 13, color: Colors.gold, fontWeight: '700', marginTop: 2 },

  // Pelle
  shovelWrap: {
    position: 'absolute',
    top: SCREEN_H * 0.08,
    left: 0, right: 0,
    alignItems: 'center', gap: 10,
  },
  shovelHint: {
    fontSize: 16, fontWeight: '800', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    letterSpacing: 0.3,
  },

  // Coffre
  chestWrap: {
    position: 'absolute',
    top: SCREEN_H * 0.10,
    left: 0, right: 0,
    alignItems: 'center', gap: 8,
  },
  glow: {
    position: 'absolute',
    width: 290, height: 290, borderRadius: 145,
    backgroundColor: Colors.gold + '18',
    shadowColor: Colors.gold,
    shadowOpacity: 1, shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  chestBadge: {
    backgroundColor: 'rgba(10,6,0,0.72)',
    borderRadius: R.full, borderWidth: 1, borderColor: Colors.gold + '55',
    paddingHorizontal: Sp.lg, paddingVertical: Sp.sm, marginTop: 4,
  },
  chestBadgeText: {
    fontSize: 15, fontWeight: '800', color: Colors.gold, letterSpacing: 0.5,
  },

  // Boutons
  bottomZone: {
    position: 'absolute', bottom: 40, left: Sp.xl, right: Sp.xl,
  },
  mainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: Colors.gold, borderRadius: R.full,
    paddingVertical: 18, paddingHorizontal: 40,
    shadowColor: Colors.gold, shadowOpacity: 0.55,
    shadowRadius: 30, shadowOffset: { width: 0, height: 6 },
    elevation: 18,
  },
  mainBtnDim: { backgroundColor: Colors.gold + '70', shadowOpacity: 0 },
  mainBtnText: { fontSize: 19, fontWeight: '900', color: Colors.black, letterSpacing: 0.4 },

  // Parchemin overlay
  scrollOverlay: {
    alignItems: 'center', justifyContent: 'center',
    padding: Sp.lg,
  },
  scrollBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,2,0,0.78)',
  },
  parchment: {
    width: '100%',
    borderRadius: R.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.8, shadowRadius: 40,
    shadowOffset: { width: 0, height: 14 },
    elevation: 30,
  },

  // Rouleau
  roll: {
    height: 26, flexDirection: 'row', alignItems: 'center',
    backgroundColor: PARCH_ROLL,
  },
  rollCap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: PARCH_BORDER,
  },
  rollBar: {
    flex: 1, height: 10,
    backgroundColor: PARCH_BORDER + 'AA',
    marginHorizontal: -4,
  },

  // Corps parchemin
  parchBody: {
    backgroundColor: PARCH_BG,
    borderLeftWidth: 5, borderRightWidth: 5, borderColor: PARCH_ROLL,
    paddingHorizontal: Sp.xl, paddingVertical: Sp.xl,
    alignItems: 'center', gap: Sp.md,
  },
  parchDeco:  { fontSize: 13, color: PARCH_ROLL, letterSpacing: 5 },
  parchTitle: {
    fontSize: 24, fontWeight: '900', color: PARCH_BORDER,
    letterSpacing: 11,
  },
  parchLine: {
    width: '82%', height: 1.5,
    backgroundColor: PARCH_LINE,
  },
  parchText: {
    fontSize: 15, color: PARCH_INK,
    lineHeight: 25, textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: Sp.sm,
  },

  // Bouton valider
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.gold,
    paddingVertical: 16, paddingHorizontal: 32,
    shadowColor: Colors.gold, shadowOpacity: 0.45,
    shadowRadius: 14, shadowOffset: { width: 0, height: 3 },
    elevation: 10,
  },
  continueBtnText: { fontSize: 15, fontWeight: '900', color: Colors.black },

  // Permission
  permScreen: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: Sp.lg, padding: Sp.xl },
  permTitle:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  permSub:     { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  permBtn:     { backgroundColor: Colors.gold, paddingHorizontal: 32, paddingVertical: 14, borderRadius: R.full },
  permBtnText: { fontSize: 15, fontWeight: '800', color: Colors.black },
});
