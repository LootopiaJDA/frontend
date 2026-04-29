import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions, Platform, Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Sp, R } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const MAP_BG   = require('../../assets/images/parchemin-tresor.png');
const PARCHEMIN = require('../../assets/images/parchemin.png');
const BOUSSOLE  = require('../../assets/images/boussole.png');
const PAS_PIED  = require('../../assets/images/pas-pied.png');

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.5 + 0.08,
}));

const EMPREINTES = [
  { x: width * 0.08, y: height * 0.25, r: -15, s: 0.5 },
  { x: width * 0.15, y: height * 0.32, r: 10,  s: 0.45 },
  { x: width * 0.72, y: height * 0.60, r: -8,  s: 0.4 },
  { x: width * 0.80, y: height * 0.67, r: 12,  s: 0.42 },
];

export default function Welcome() {
  const router    = useRouter();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
    ]).start();

    // Boussole tourne très lentement
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 22000, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={st.root}>

      {/* ── Carte au trésor en fond ── */}
      <Image source={MAP_BG} style={st.mapBg} resizeMode="cover" />
      <View style={st.mapOverlay} />

      {/* ── Étoiles ── */}
      {STARS.map(s => (
        <View key={s.id} style={[st.star, { left: s.x, top: s.y, width: s.size, height: s.size, opacity: s.opacity }]} />
      ))}

      {/* ── Empreintes décoratives ── */}
      {EMPREINTES.map((e, i) => (
        <Image
          key={i}
          source={PAS_PIED}
          style={[st.empreinte, { left: e.x, top: e.y, transform: [{ rotate: `${e.r}deg` }, { scale: e.s }], opacity: 0.12 }]}
          resizeMode="contain"
        />
      ))}

      {/* ── Halos ambrés ── */}
      <View style={st.glowCenter} />
      <View style={st.glowBottom} />

      <SafeAreaView style={st.safe}>

        {/* ── HERO ── */}
        <Animated.View style={[st.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Boussole — médaillon circulaire tournant */}
          <Animated.View style={[st.compassWrap, { transform: [{ rotate: spin }] }]}>
            <Image source={BOUSSOLE} style={st.compassImg} resizeMode="cover" />
          </Animated.View>

          {/* Scroll parchemin — titre */}
          <View style={st.scrollWrap}>
            <ImageBackground source={PARCHEMIN} style={st.scrollBg} resizeMode="cover">
              <View style={st.scrollOverlay}>
                <Text style={st.deco}>✦  ◆  ✦</Text>
                <Text style={st.brand}>LOOTOPIA</Text>
                <View style={st.divider}>
                  <View style={st.divLine} />
                  <Ionicons name="diamond" size={8} color={Colors.gold} />
                  <View style={st.divLine} />
                </View>
                <Text style={st.tagline}>Chasses au trésor numériques</Text>
                <Text style={[st.deco, { marginTop: Sp.xs }]}>⚑  &nbsp;  ⚑</Text>
              </View>
            </ImageBackground>
          </View>

        </Animated.View>

        {/* ── BOUTONS ── */}
        <Animated.View style={[st.actions, { opacity: fadeAnim }]}>

          <TouchableOpacity style={st.btnPrimary} onPress={() => router.push('/(auth)/login')} activeOpacity={0.82}>
            <Ionicons name="compass" size={17} color={Colors.black} />
            <Text style={st.btnPrimaryText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.btnSecondary} onPress={() => router.push('/(auth)/register')} activeOpacity={0.82}>
            <Text style={st.btnSecondaryText}>Créer un compte joueur</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.btnLink} onPress={() => router.push('/(auth)/register-partner')} activeOpacity={0.75}>
            <Ionicons name="business-outline" size={13} color={Colors.textMuted} />
            <Text style={st.btnLinkText}>
              Partenaire ?{'  '}<Text style={st.btnLinkAccent}>Rejoindre →</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const COMPASS_SIZE = 110;
const SCROLL_W = width * 0.78;

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  mapBg: { position: 'absolute', width: '100%', height: '100%', opacity: 0.17 },
  mapOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(8,8,16,0.78)' },

  star: { position: 'absolute', borderRadius: 99, backgroundColor: '#EDEAF3' },
  empreinte: { position: 'absolute', width: 80, height: 50 },

  glowCenter: {
    position: 'absolute', width: 420, height: 420, borderRadius: 210,
    backgroundColor: Colors.amber, opacity: 0.05,
    top: height * 0.15, alignSelf: 'center',
  },
  glowBottom: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: Colors.gold, opacity: 0.04,
    bottom: -40, right: -80,
  },

  safe: { flex: 1, justifyContent: 'space-between', paddingBottom: Platform.OS === 'ios' ? 0 : Sp.lg },

  // ── Hero ──
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Sp.lg },

  // Boussole
  compassWrap: {
    width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2, borderColor: Colors.gold + '55',
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16,
    elevation: 10,
  },
  compassImg: { width: '100%', height: '100%' },

  // Scroll
  scrollWrap: {
    width: SCROLL_W,
    borderRadius: R.lg,
    overflow: 'hidden',
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20,
    elevation: 10,
  },
  scrollBg: { width: '100%', backgroundColor: '#1A1205' },
  scrollOverlay: {
    paddingVertical: Sp.xl + Sp.md,
    paddingHorizontal: Sp.xl,
    alignItems: 'center',
    gap: Sp.sm,
    backgroundColor: 'rgba(5,3,1,0.65)',
  },

  deco: { color: Colors.gold, fontSize: 12, letterSpacing: 8, opacity: 0.65 },

  brand: {
    fontFamily: Fonts.display,
    color: Colors.goldLight,
    fontSize: 34,
    letterSpacing: 9,
  },

  divider: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, width: '70%' },
  divLine:  { flex: 1, height: 1, backgroundColor: Colors.gold + '55' },

  tagline: {
    fontFamily: Fonts.title,
    color: Colors.parchment,
    fontSize: 10,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    opacity: 0.8,
  },

  // ── Boutons ──
  actions: { paddingHorizontal: Sp.lg, paddingBottom: Sp.lg, gap: Sp.sm },

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Sp.sm, backgroundColor: Colors.gold, borderRadius: R.md, paddingVertical: 15,
  },
  btnPrimaryText: { fontFamily: Fonts.title, color: Colors.black, fontSize: 15, letterSpacing: 1 },

  btnSecondary: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgElevated, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.borderWarm, paddingVertical: 14,
  },
  btnSecondaryText: { fontFamily: Fonts.title, color: Colors.textPrimary, fontSize: 14, letterSpacing: 0.5 },

  btnLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.xs, paddingVertical: Sp.sm },
  btnLinkText:   { color: Colors.textMuted, fontSize: 12 },
  btnLinkAccent: { fontFamily: Fonts.title, color: Colors.gold, fontSize: 12 },
});
