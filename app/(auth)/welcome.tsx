import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sp, R } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const CONSTELLATIONS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height * 0.6,
  size: Math.random() * 2.5 + 0.8,
  opacity: Math.random() * 0.5 + 0.15,
}));

export default function Welcome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 2200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        ])
    ).start();
  }, []);

  return (
      <View style={styles.bg}>
        {/* Étoiles */}
        {CONSTELLATIONS.map(s => (
            <View
                key={s.id}
                style={[styles.star, { left: s.x, top: s.y, width: s.size, height: s.size, opacity: s.opacity }]}
            />
        ))}

        {/* Cercle d'ambiance */}
        <View style={styles.glowCircle} />
        <View style={styles.glowCircle2} />

        {/* Lignes de grille fines */}
        <View style={[styles.gridV, { left: '25%' }]} />
        <View style={[styles.gridV, { left: '50%' }]} />
        <View style={[styles.gridV, { left: '75%' }]} />
        <View style={[styles.gridH, { top: '30%' }]} />
        <View style={[styles.gridH, { top: '60%' }]} />

        <SafeAreaView style={styles.safe}>
          {/* Logo + titre */}
          <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.compassRing, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.compassInner}>
                <Ionicons name="compass" size={52} color={Colors.gold} />
              </View>
            </Animated.View>

            <View style={styles.titleBlock}>
              <Text style={styles.brand}>LOOTOPIA</Text>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Ionicons name="diamond" size={10} color={Colors.gold} />
                <View style={styles.dividerLine} />
              </View>
              <Text style={styles.tagline}>Chasses au trésor numériques</Text>
            </View>

            {/* Features pills */}
            <View style={styles.pills}>
              {[
                { icon: 'location', label: 'Géolocalisation' },
                { icon: 'cube', label: 'Réalité augmentée' },
                { icon: 'trophy', label: 'Classements' },
              ].map(p => (
                  <View key={p.label} style={styles.pill}>
                    <Ionicons name={p.icon as any} size={12} color={Colors.gold} />
                    <Text style={styles.pillText}>{p.label}</Text>
                  </View>
              ))}
            </View>
          </Animated.View>

          {/* Boutons */}
          <Animated.View style={[styles.actions, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.82}
            >
              <Text style={styles.btnPrimaryText}>Se connecter</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.black} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.82}
            >
              <Text style={styles.btnSecondaryText}>Créer un compte joueur</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.btnLink}
                onPress={() => router.push('/(auth)/register-partner')}
                activeOpacity={0.75}
            >
              <Ionicons name="business-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.btnLinkText}>
                Vous êtes un partenaire ?{' '}
                <Text style={styles.btnLinkAccent}>Rejoindre →</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  star: { position: 'absolute', borderRadius: 99, backgroundColor: Colors.textPrimary },
  glowCircle: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: Colors.gold,
    opacity: 0.04,
    top: -80,
    left: width / 2 - 170,
  },
  glowCircle2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.accent,
    opacity: 0.05,
    bottom: 60,
    right: -80,
  },
  gridV: { position: 'absolute', width: 1, top: 0, bottom: 0, backgroundColor: Colors.border, opacity: 0.4 },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.border, opacity: 0.3 },
  safe: { flex: 1, justifyContent: 'space-between', paddingBottom: Platform.OS === 'ios' ? 0 : Sp.lg },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Sp.xl, gap: Sp.xl },
  compassRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.gold + '50',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  compassInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  titleBlock: { alignItems: 'center', gap: Sp.sm },
  brand: {
    color: Colors.textPrimary,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 10,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, width: 160 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  tagline: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  pills: { flexDirection: 'row', gap: Sp.sm, flexWrap: 'wrap', justifyContent: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: R.full,
    paddingHorizontal: Sp.md,
    paddingVertical: 6,
  },
  pillText: { color: Colors.textSecondary, fontSize: 12 },
  actions: { paddingHorizontal: Sp.lg, paddingBottom: Sp.lg, gap: Sp.sm },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Sp.sm,
    backgroundColor: Colors.gold,
    borderRadius: R.md,
    paddingVertical: 16,
  },
  btnPrimaryText: { color: Colors.black, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  btnSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: 15,
  },
  btnSecondaryText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  btnLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Sp.xs,
    paddingVertical: Sp.sm,
  },
  btnLinkText: { color: Colors.textMuted, fontSize: 13 },
  btnLinkAccent: { color: Colors.gold, fontWeight: '600' },
});
