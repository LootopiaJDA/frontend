import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors, Sp, R } from '@/constants/theme';
import { Etape } from '@/constants/types';

function formatElapsed(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function ResultatsScreen() {
  const { chasseId, score, startedAt, chasseName, etapesJson } = useLocalSearchParams<{
    chasseId: string;
    score: string;
    startedAt: string;
    chasseName: string;
    etapesJson: string;
  }>();
  const router = useRouter();

  const etapes: Etape[] = useMemo(() => {
    try { return JSON.parse(etapesJson ?? '[]'); }
    catch { return []; }
  }, [etapesJson]);

  const scoreNum = Number(score ?? 0);
  const elapsed  = startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
  const timeStr  = formatElapsed(elapsed);

  return (
    <View style={st.fill}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── Header trophée ───────────────────────────────────────────────── */}
        <SafeAreaView edges={['top']}>
          <View style={st.header}>
            <LottieView
              source={require('@/assets/animations/Trophy.json')}
              autoPlay loop
              style={st.trophy}
            />
            <Text style={st.title}>Chasse terminée !</Text>
            {chasseName ? <Text style={st.subtitle}>{chasseName}</Text> : null}
          </View>
        </SafeAreaView>

        {/* ─── Stats ────────────────────────────────────────────────────────── */}
        <View style={st.statsRow}>
          <View style={st.statCard}>
            <Ionicons name="time-outline" size={22} color={Colors.gold} />
            <Text style={st.statValue}>{timeStr}</Text>
            <Text style={st.statLabel}>TEMPS</Text>
          </View>
          <View style={st.statCard}>
            <Ionicons name="star" size={22} color={Colors.gold} />
            <Text style={st.statValue}>{scoreNum}</Text>
            <Text style={st.statLabel}>POINTS</Text>
          </View>
          <View style={st.statCard}>
            <Ionicons name="flag" size={22} color={Colors.gold} />
            <Text style={st.statValue}>{etapes.length}</Text>
            <Text style={st.statLabel}>ÉTAPES</Text>
          </View>
        </View>

        {/* ─── Parcours ─────────────────────────────────────────────────────── */}
        <View style={st.section}>
          <View style={st.sectionHead}>
            <View style={st.sectionLine} />
            <Text style={st.sectionTitle}>PARCOURS VALIDÉ</Text>
            <View style={st.sectionLine} />
          </View>

          {etapes.map((etape) => (
            <View key={etape.id_etape} style={st.etapeCard}>
              <View style={st.etapeHeader}>
                <View style={st.etapeBadge}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <Text style={st.etapeName} numberOfLines={2}>{etape.name}</Text>
                <Text style={st.etapePoints}>+100 pts</Text>
              </View>

              {etape.image ? (
                <Image source={{ uri: etape.image }} style={st.etapeImg} resizeMode="cover" />
              ) : null}

              {etape.description ? (
                <View style={st.indiceBox}>
                  <Text style={st.indiceLabel}>INDICE</Text>
                  <Text style={st.indiceText}>{etape.description}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* ─── Actions ──────────────────────────────────────────────────────── */}
        <View style={st.actions}>
          {chasseId ? (
            <TouchableOpacity
              style={st.btnPrimary}
              onPress={() => router.push({ pathname: '/(app)/chasse/[id]', params: { id: chasseId } })}
              activeOpacity={0.85}
            >
              <Ionicons name="trophy-outline" size={18} color={Colors.black} />
              <Text style={st.btnPrimaryText}>Voir le classement</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={st.btnSecondary}
            onPress={() => router.navigate('/(app)/chasses')}
            activeOpacity={0.85}
          >
            <Text style={st.btnSecondaryText}>Retour aux chasses</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  fill:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 60 },

  header: { alignItems: 'center', paddingHorizontal: Sp.lg, paddingTop: Sp.md, gap: Sp.xs },
  trophy: { width: 150, height: 150 },
  title:  { fontSize: 28, fontWeight: '900', color: Colors.gold, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: Sp.sm },

  statsRow: {
    flexDirection: 'row', gap: Sp.sm,
    paddingHorizontal: Sp.lg, paddingTop: Sp.md,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard,
    borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
    padding: Sp.md, alignItems: 'center', gap: Sp.xs,
  },
  statValue: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
  statLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1, fontWeight: '700' },

  section: { padding: Sp.lg, gap: Sp.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Sp.md },
  sectionLine:  { flex: 1, height: 1, backgroundColor: Colors.borderWarm },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: Colors.gold, letterSpacing: 2 },

  etapeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
    overflow: 'hidden', marginBottom: Sp.sm,
  },
  etapeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
    padding: Sp.md,
  },
  etapeBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#4ecb8a',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  etapeName:   { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  etapePoints: { fontSize: 12, fontWeight: '800', color: Colors.gold },
  etapeImg:    { width: '100%', height: 160 },
  indiceBox: {
    backgroundColor: Colors.bgElevated,
    padding: Sp.md, gap: 6,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  indiceLabel: { fontSize: 9, fontWeight: '800', color: Colors.gold, letterSpacing: 1.5 },
  indiceText:  { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },

  actions: {
    paddingHorizontal: Sp.lg,
    paddingBottom: Sp.xl,
    gap: Sp.sm,
  },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm,
    backgroundColor: Colors.gold, borderRadius: R.full,
    paddingVertical: 16,
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '800', color: Colors.black },
  btnSecondary: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgCard, borderRadius: R.full,
    borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 14,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
