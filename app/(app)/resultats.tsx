import React, { useMemo, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors, Sp, R } from '@/constants/theme';
import { Etape, UserChasse, ScoreBoard } from '@/constants/types';
import { chasseService, scoreService } from '@/services/api';

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface CompletedHunt {
  id_userchasse: number;
  id_chasse: number;
  chasseName: string;
  score: number;
  durationMs: number | null;
  completed_at: string | null;
  etapeCount: number;
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

  const [history, setHistory] = useState<CompletedHunt[]>([]);
  const [loading, setLoading] = useState(true);

  const etapes: Etape[] = useMemo(() => {
    try { return JSON.parse(etapesJson ?? '[]'); }
    catch { return []; }
  }, [etapesJson]);

  const scoreNum = Number(score ?? 0);
  const elapsed  = startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
  const timeStr  = formatDuration(elapsed);
  const hasCurrentResult = !!chasseId;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [{ chasses }, scores] = await Promise.all([
        chasseService.getMe(),
        scoreService.getAll().catch(() => [] as ScoreBoard[]),
      ]);

      const completed: CompletedHunt[] = (chasses as UserChasse[])
        .filter(uc => uc.statut === 'COMPLETED')
        .map(uc => {
          const huntScore = (scores as ScoreBoard[]).find(s => s.id_chasse === uc.id_chasse)?.score ?? 0;
          const durationMs = uc.completed_at && uc.started_at
            ? new Date(uc.completed_at).getTime() - new Date(uc.started_at).getTime()
            : null;
          return {
            id_userchasse: uc.id_userchasse,
            id_chasse: uc.id_chasse,
            chasseName: uc.chasse?.name ?? `Chasse #${uc.id_chasse}`,
            score: huntScore,
            durationMs,
            completed_at: uc.completed_at ?? null,
            etapeCount: uc.UserChasseEtape?.length ?? 0,
          };
        })
        .sort((a, b) => {
          const da = a.completed_at ? new Date(a.completed_at).getTime() : 0;
          const db = b.completed_at ? new Date(b.completed_at).getTime() : 0;
          return db - da;
        });

      setHistory(completed);
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  };

  return (
    <View style={st.fill}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {hasCurrentResult ? (
          /* ── Victory header ── */
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
        ) : (
          /* ── History header (accessed from profile menu) ── */
          <SafeAreaView edges={['top']}>
            <View style={st.navBar}>
              <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={st.navTitle}>Scores & Résultats</Text>
              <View style={{ width: 36 }} />
            </View>
          </SafeAreaView>
        )}

        {/* ── Stats for current hunt ── */}
        {hasCurrentResult && (
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
        )}

        {/* ── Parcours for current hunt ── */}
        {hasCurrentResult && etapes.length > 0 && (
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
        )}

        {/* ── Actions for current hunt ── */}
        {hasCurrentResult && (
          <View style={st.actions}>
            <TouchableOpacity
              style={st.btnPrimary}
              onPress={() => router.push({ pathname: '/(app)/chasse/[id]', params: { id: chasseId } })}
              activeOpacity={0.85}
            >
              <Ionicons name="trophy-outline" size={18} color={Colors.black} />
              <Text style={st.btnPrimaryText}>Voir le classement</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── History ── */}
        <View style={st.section}>
          <View style={st.sectionHead}>
            <View style={st.sectionLine} />
            <Text style={st.sectionTitle}>HISTORIQUE</Text>
            <View style={st.sectionLine} />
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginVertical: Sp.lg }} />
          ) : history.length === 0 ? (
            <View style={st.emptyBox}>
              <Ionicons name="trophy-outline" size={32} color={Colors.textMuted} />
              <Text style={st.emptyText}>Aucune chasse terminée pour l'instant</Text>
            </View>
          ) : (
            history.map(hunt => (
              <TouchableOpacity
                key={hunt.id_userchasse}
                style={st.historyCard}
                onPress={() => router.push({ pathname: '/(app)/chasse/[id]', params: { id: String(hunt.id_chasse) } })}
                activeOpacity={0.8}
              >
                <View style={st.historyIcon}>
                  <Ionicons name="trophy" size={16} color={Colors.gold} />
                </View>
                <View style={st.historyInfo}>
                  <Text style={st.historyName} numberOfLines={1}>{hunt.chasseName}</Text>
                  <View style={st.historyMeta}>
                    <Text style={st.historyScore}>{hunt.score} pts</Text>
                    {hunt.durationMs != null && (
                      <Text style={st.historyTime}>⏱ {formatDuration(hunt.durationMs)}</Text>
                    )}
                    {hunt.etapeCount > 0 && (
                      <Text style={st.historySteps}>{hunt.etapeCount} étapes</Text>
                    )}
                  </View>
                  {hunt.completed_at && (
                    <Text style={st.historyDate}>
                      {new Date(hunt.completed_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Bottom action ── */}
        <View style={st.actions}>
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

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Sp.lg, paddingVertical: Sp.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  header:   { alignItems: 'center', paddingHorizontal: Sp.lg, paddingTop: Sp.md, gap: Sp.xs },
  trophy:   { width: 150, height: 150 },
  title:    { fontSize: 28, fontWeight: '900', color: Colors.gold, textAlign: 'center' },
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

  section:     { padding: Sp.lg, gap: Sp.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Sp.md },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.borderWarm },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: Colors.gold, letterSpacing: 2 },

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

  historyCard: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.md,
    backgroundColor: Colors.bgCard,
    borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
    padding: Sp.md, marginBottom: Sp.sm,
  },
  historyIcon: {
    width: 36, height: 36, borderRadius: R.sm,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1, borderColor: Colors.gold + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  historyInfo:  { flex: 1 },
  historyName:  { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  historyMeta:  { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, marginTop: 2 },
  historyScore: { fontSize: 11, fontWeight: '800', color: Colors.gold },
  historyTime:  { fontSize: 10, color: Colors.textMuted },
  historySteps: { fontSize: 10, color: Colors.textMuted },
  historyDate:  { fontSize: 10, color: Colors.textMuted, marginTop: 1 },

  emptyBox: {
    alignItems: 'center', justifyContent: 'center',
    gap: Sp.sm, paddingVertical: Sp.xl,
  },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

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
  btnPrimaryText:  { fontSize: 15, fontWeight: '800', color: Colors.black },
  btnSecondary: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgCard, borderRadius: R.full,
    borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 14,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
