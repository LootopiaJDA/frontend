import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Sp, R } from '../../constants/theme';

import CoffreSvg    from '../../assets/images/coffre.svg';
import BoussoleSvg  from '../../assets/images/boussole.svg';
import ParcheminSvg from '../../assets/images/petit-parchemin.svg';
import PieceSvg     from '../../assets/images/piece.svg';
import CroixSvg     from '../../assets/images/croix.svg';

const { width, height } = Dimensions.get('window');

const MAP_BG = require('../../assets/images/parchemin-tresor.png');

const COFFRE_SIZE  = 150;
const COMPASS_SIZE = 220;
const HERO_H       = 190;
const SCROLL_W     = width * 1.2;
const SCROLL_H     = SCROLL_W * 0.82;

export default function Welcome() {
  const router     = useRouter();
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const floatAnim  = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 38, friction: 9, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 26000, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={st.root}>

      {/* ── Fond carte ── */}
      <Image source={MAP_BG} style={st.mapBg} resizeMode="cover" />
      <View style={st.mapOverlay} />

      {/* ── Halos ── */}
      <View style={[st.glow, { top: -80, left: -60, width: 340, height: 340, borderRadius: 170 }]} />
      <View style={[st.glow, { bottom: 80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: Colors.gold, opacity: 0.07 }]} />

      {/* ── Décorations absolues ── */}
      <View style={[st.deco, { top: height * 0.09, right: Sp.xl,  width: 44, height: 44, opacity: 1.0, transform: [{ rotate: '6deg'   }] }]}>
        <CroixSvg width={44} height={44} />
      </View>
      <View style={[st.deco, { top: height * 0.90, left: Sp.lg,   width: 32, height: 32, opacity: 1.0, transform: [{ rotate: '-12deg' }] }]}>
        <CroixSvg width={32} height={32} />
      </View>
      <View style={[st.deco, { top: height * 0.18, left: Sp.md,   width: 42, height: 42, opacity: 0.75 }]}>
        <PieceSvg width={42} height={42} />
      </View>
      <View style={[st.deco, { top: height * 0.20, right: Sp.sm,  width: 34, height: 34, opacity: 0.70, transform: [{ rotate: '20deg'  }] }]}>
        <PieceSvg width={34} height={34} />
      </View>

      <SafeAreaView style={st.safe}>

        {/* ── Hero : boussole (fond) + coffre flottant ── */}
        <Animated.View style={[st.heroArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Animated.View style={[st.compass, { transform: [{ rotate: spin }] }]}>
            <BoussoleSvg width={COMPASS_SIZE} height={COMPASS_SIZE} />
          </Animated.View>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <CoffreSvg width={COFFRE_SIZE} height={COFFRE_SIZE} />
          </Animated.View>
        </Animated.View>

        {/* ── Parchemin titre ── */}
        <Animated.View style={[st.scrollArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={st.scrollWrap}>
            <View style={StyleSheet.absoluteFill}>
              <ParcheminSvg width={SCROLL_W} height={SCROLL_H} />
            </View>
            <View style={st.scrollContent}>
              <Text style={st.brand} numberOfLines={1} adjustsFontSizeToFit>
                LOOTOPIA
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Boutons ── */}
        <Animated.View style={[st.actions, { opacity: fadeAnim }]}>

          <TouchableOpacity style={st.btnPrimary} onPress={() => router.push('/(auth)/login')} activeOpacity={0.82}>
            <Ionicons name="compass" size={18} color={Colors.black} />
            <Text style={st.btnPrimaryText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.btnSecondary} onPress={() => router.push('/(auth)/register')} activeOpacity={0.82}>
            <Text style={st.btnSecondaryText}>Créer un compte joueur</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.btnLink} onPress={() => router.push('/(auth)/register-partner')} activeOpacity={0.75}>
            <Ionicons name="business-outline" size={14} color={Colors.parchment} />
            <Text style={st.btnLinkText}>
              Partenaire ?{'  '}<Text style={st.btnLinkAccent}>Rejoindre →</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0C0800' },

  mapBg:      { position: 'absolute', width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(10,7,0,0.58)' },

  glow: { position: 'absolute', backgroundColor: Colors.amber, opacity: 0.08 },
  deco: { position: 'absolute' },

  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Sp.md,
    paddingBottom: Platform.OS === 'ios' ? Sp.md : Sp.xl,
  },

  // Hero
  heroArea: {
    height: HERO_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    opacity: 0.30,
  },

  // Parchemin
  scrollArea: { alignItems: 'center' },
  scrollWrap: {
    width: SCROLL_W,
    height: SCROLL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Sp.md,
    paddingVertical: Sp.lg,
    width: SCROLL_W,
  },

  brand: {
    fontFamily: Fonts.display,
    color: '#3D1E04',
    fontSize: 30,
    letterSpacing: 5,
    width: '100%',
    textAlign: 'center',
  },

  divider: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, width: '75%' },
  divLine:  { flex: 1, height: 1, backgroundColor: '#8B5E1A55' },

  tagline: {
    fontFamily: Fonts.title,
    color: '#5C3610',
    fontSize: 8,
    letterSpacing: 2.5,
    textAlign: 'center',
    opacity: 0.85,
  },

  // Boutons
  actions: {
    paddingHorizontal: Sp.lg,
    gap: Sp.sm,
  },

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Sp.sm, backgroundColor: Colors.gold,
    borderRadius: R.md, paddingVertical: 15,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 6,
  },
  btnPrimaryText: { fontFamily: Fonts.title, color: Colors.black, fontSize: 15, letterSpacing: 1 },

  btnSecondary: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: R.md,
    borderWidth: 1, borderColor: 'rgba(201,147,58,0.40)',
    paddingVertical: 14,
  },
  btnSecondaryText: { fontFamily: Fonts.title, color: Colors.textPrimary, fontSize: 14, letterSpacing: 0.5 },

  btnLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Sp.xs, paddingVertical: Sp.sm,
  },
  btnLinkText:   { color: Colors.parchment, fontSize: 13 },
  btnLinkAccent: { fontFamily: Fonts.title, color: Colors.gold, fontSize: 13 },
});
