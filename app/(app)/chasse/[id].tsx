import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { chasseService, scoreService } from '../../../services/api';
import { ChasseDetail, ScoreBoard } from '../../../constants/types';
import { Colors, Sp, R } from '../../../constants/theme';
import Btn from '../../../components/Btn';
import { useAuth } from '../../../context/AuthContext';

const MAP_BG = require('../../../assets/images/parchemin-tresor.png');

// ─── Podium ───────────────────────────────────────────────────────────────────
interface PodiumProps {
  scores: ScoreBoard[];
  currentUserId?: number;
}

function PodiumSection({ scores, currentUserId }: PodiumProps) {
  const MEDALS = [
    { color: '#FFD700', bg: '#FFD70022', rank: '1er' },
    { color: '#C0C0C0', bg: '#C0C0C022', rank: '2ème' },
    { color: '#CD7F32', bg: '#CD7F3222', rank: '3ème' },
  ];

  // Entrées avec score > 0 pour le top 3
  const ranked   = scores.filter(s => s.score > 0).slice(0, 3);
  // Entrée du joueur courant (même si score=0)
  const myEntry  = currentUserId ? scores.find(s => s.id_user === currentUserId) : null;
  const myInTop3 = ranked.some(s => s.id_user === currentUserId);

  return (
    <View style={pd.wrap}>
      {/* Animation podium */}
      <View style={pd.lottiWrap} pointerEvents="none">
        <LottieView
          source={require('../../../assets/animations/PrizePodium.json')}
          autoPlay
          loop
          style={pd.lottie}
        />
      </View>

      <View style={pd.header}>
        <View style={pd.sectionLine} />
        <Text style={pd.sectionTitle}>CLASSEMENT</Text>
        <View style={pd.sectionLine} />
      </View>

      {/* Points à gagner */}
      <View style={pd.pointsCard}>
        <Ionicons name="trophy-outline" size={16} color={Colors.gold} />
        <Text style={pd.pointsText}>
          Récompense : <Text style={pd.pointsBold}>100 pts</Text> par chasse complétée
        </Text>
      </View>

      {/* Top 3 */}
      {ranked.length === 0 ? (
        <View style={pd.empty}>
          <Ionicons name="people-outline" size={28} color={Colors.textMuted} />
          <Text style={pd.emptyText}>Aucun joueur classé pour l'instant</Text>
          <Text style={pd.emptySubText}>Soyez le premier à terminer cette chasse !</Text>
        </View>
      ) : (
        <View style={pd.rows}>
          {ranked.map((s, i) => {
            const medal = MEDALS[i];
            const isMe  = s.id_user === currentUserId;
            return (
              <View key={s.id_score} style={[pd.row, { borderColor: isMe ? Colors.gold + '88' : medal.color + '44' }]}>
                <View style={[pd.medal, { backgroundColor: medal.bg, borderColor: medal.color + '66' }]}>
                  <Text style={[pd.medalText, { color: medal.color }]}>{medal.rank}</Text>
                </View>
                <View style={pd.playerInfo}>
                  <Text style={pd.playerName}>
                    {isMe ? 'Vous' : `Joueur #${s.id_user}`}
                  </Text>
                  {isMe && <Text style={pd.playerYouTag}>· votre score</Text>}
                </View>
                <View style={pd.scoreWrap}>
                  <Text style={[pd.scoreVal, { color: isMe ? Colors.gold : medal.color }]}>{s.score * 100}</Text>
                  <Text style={pd.scorePts}>pts</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Entrée du joueur courant hors top 3 */}
      {myEntry && !myInTop3 && (
        <View style={pd.myScoreRow}>
          <Ionicons name="person-circle-outline" size={16} color={Colors.gold} />
          <Text style={pd.myScoreLabel}>Votre score</Text>
          <Text style={pd.myScoreVal}>{myEntry.score * 100} pts</Text>
          {myEntry.score === 0 && (
            <Text style={pd.myScoreHint}>· terminez la chasse pour marquer !</Text>
          )}
        </View>
      )}
    </View>
  );
}

const pd = StyleSheet.create({
  wrap:        { gap: Sp.sm },
  lottiWrap:   { alignItems: 'center', height: 140, marginBottom: -Sp.md },
  lottie:      { width: 200, height: 200 },
  header:      { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingTop: 50 },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.borderWarm },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: Colors.gold, letterSpacing: 2, textAlign: 'center' },
  pointsCard:  {
    flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
    backgroundColor: Colors.bgCard, borderRadius: R.lg,
    borderWidth: 1, borderColor: Colors.borderWarm,
    padding: Sp.md, flexWrap: 'wrap',
  },
  pointsText:  { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  pointsBold:  { color: Colors.gold, fontWeight: '800' },
  myScoreRow:  {
    flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
    backgroundColor: Colors.goldGlow, borderRadius: R.lg,
    borderWidth: 1, borderColor: Colors.gold + '44',
    padding: Sp.md,
  },
  myScoreLabel: { fontSize: 13, color: Colors.gold, fontWeight: '700' },
  myScoreVal:   { fontSize: 14, color: Colors.gold, fontWeight: '900' },
  myScoreHint:  { fontSize: 11, color: Colors.textMuted, flex: 1 },
  playerYouTag: { fontSize: 10, color: Colors.gold, fontWeight: '700' },
  empty:       {
    backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: Sp.lg,
    alignItems: 'center', gap: Sp.sm, borderWidth: 1, borderColor: Colors.borderWarm,
  },
  emptyText:    { fontSize: 14, color: Colors.textMuted, fontWeight: '700' },
  emptySubText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  rows:        { gap: Sp.sm },
  row:         {
    flexDirection: 'row', alignItems: 'center', gap: Sp.md,
    backgroundColor: Colors.bgCard, borderRadius: R.lg,
    borderWidth: 1, padding: Sp.md,
  },
  medal:       {
    width: 44, height: 44, borderRadius: R.sm,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  medalText:   { fontSize: 12, fontWeight: '900' },
  playerInfo:  { flex: 1 },
  playerName:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  scoreWrap:   { alignItems: 'flex-end' },
  scoreVal:    { fontSize: 20, fontWeight: '900' },
  scorePts:    { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
});

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ChasseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const chasseId = Number(id);
  const { user } = useAuth();

  const [chasse, setChasse]                 = useState<ChasseDetail | null>(null);
  const [scores, setScores]                 = useState<ScoreBoard[]>([]);
  const [loading, setLoading]               = useState(true);
  const [joining, setJoining]               = useState(false);
  const [alreadyJoined, setAlreadyJoined]   = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [hasOtherActive, setHasOtherActive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, meData, allScores] = await Promise.all([
        chasseService.getById(chasseId),
        chasseService.getMe().catch(() => ({ chasses: [] })),
        scoreService.getAll().catch(() => [] as ScoreBoard[]),
      ]);
      setChasse(detail);
      const uc = meData.chasses ?? [];
      setAlreadyCompleted(uc.some(u => u.id_chasse === chasseId && u.statut === 'COMPLETED'));
      setAlreadyJoined(uc.some(u => u.id_chasse === chasseId && u.statut === 'IN_PROGRESS'));
      setHasOtherActive(uc.some(u => u.id_chasse !== chasseId && u.statut === 'IN_PROGRESS'));
      const chasseScores = (allScores as ScoreBoard[])
        .filter(s => s.id_chasse === chasseId)
        .sort((a, b) => b.score - a.score);
      setScores(chasseScores);
    } catch {
      /* silencieux */
    } finally {
      setLoading(false);
    }
  }, [chasseId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleJoin = async () => {
    setJoining(true);
    try {
      await chasseService.join(chasseId);
      await scoreService.create(chasseId);
      setAlreadyJoined(true);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('already') || err.message?.toLowerCase().includes('inscription')) {
        await scoreService.create(chasseId);
        setAlreadyJoined(true);
      } else {
        Alert.alert('Erreur', err.message ?? 'Impossible de rejoindre la chasse');
      }
    } finally {
      setJoining(false);
    }
  };

  const handlePlay = () => router.push({ pathname: '/(app)/map', params: { chasseId } });

  if (loading) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  if (!chasse) {
    return (
      <View style={st.center}>
        <Ionicons name="alert-circle-outline" size={44} color={Colors.textMuted} />
        <Text style={st.errorText}>Chasse introuvable</Text>
      </View>
    );
  }

  const etapes   = chasse.etape ?? [];
  const isActive = chasse.etat === 'ACTIVE';

  return (
    <ImageBackground source={MAP_BG} style={st.root} imageStyle={{ opacity: 0.22 }} resizeMode="cover">
      <View style={st.overlay} />

      {/* Bouton retour absolu */}
      <SafeAreaView style={st.backWrap} edges={['top']}>
        <TouchableOpacity style={st.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

        {/* ── Photo de couverture ── */}
        <View style={st.coverWrap}>
          {chasse.image ? (
            <Image source={{ uri: chasse.image }} style={st.cover} resizeMode="cover" />
          ) : (
            <View style={[st.cover, st.coverEmpty]}>
              <Ionicons name="map-outline" size={56} color={Colors.textMuted} />
            </View>
          )}
          <View style={st.coverGradient} />
          <View style={st.coverContent}>
            <View style={st.badgeRow}>
              <View style={[st.badge, { borderColor: isActive ? Colors.success : Colors.gold }]}>
                <View style={[st.badgeDot, { backgroundColor: isActive ? Colors.success : Colors.gold }]} />
                <Text style={[st.badgeText, { color: isActive ? Colors.success : Colors.gold }]}>
                  {isActive ? 'Active' : chasse.etat}
                </Text>
              </View>
              {alreadyCompleted ? (
                <View style={[st.badge, { borderColor: Colors.gold }]}>
                  <Ionicons name="trophy" size={12} color={Colors.gold} />
                  <Text style={[st.badgeText, { color: Colors.gold }]}>Terminée</Text>
                </View>
              ) : alreadyJoined ? (
                <View style={[st.badge, { borderColor: Colors.success }]}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                  <Text style={[st.badgeText, { color: Colors.success }]}>Inscrit</Text>
                </View>
              ) : null}
            </View>
            <Text style={st.coverTitle}>{chasse.name}</Text>
          </View>
        </View>

        <View style={st.body}>

          {/* ── Infos meta ── */}
          {(chasse.localisation || chasse.occurence?.[0]) && (
            <View style={st.metaCard}>
              {chasse.localisation ? (
                <View style={st.metaRow}>
                  <View style={st.metaIcon}>
                    <Ionicons name="location" size={15} color={Colors.gold} />
                  </View>
                  <Text style={st.metaText}>{chasse.localisation}</Text>
                </View>
              ) : null}
              {chasse.occurence?.[0] && (
                <View style={[st.metaRow, chasse.localisation ? st.metaRowBorder : undefined]}>
                  <View style={st.metaIcon}>
                    <Ionicons name="calendar" size={15} color={Colors.gold} />
                  </View>
                  <Text style={st.metaText}>
                    {new Date(chasse.occurence[0].date_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    {' → '}
                    {new Date(chasse.occurence[0].date_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    {'  '}
                    <Text style={st.metaAccent}>· {chasse.occurence[0].limit_user} places</Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Podium & Points ── */}
          <PodiumSection scores={scores} currentUserId={user?.id_user} />

          {/* ── Étapes ── */}
          <View style={st.sectionHeader}>
            <View style={st.sectionLine} />
            <Text style={st.sectionTitle}>
              PARCOURS · {etapes.length} ÉTAPE{etapes.length !== 1 ? 'S' : ''}
            </Text>
            <View style={st.sectionLine} />
          </View>

          {etapes.length === 0 ? (
            <View style={st.noEtapes}>
              <Ionicons name="map-outline" size={32} color={Colors.textMuted} />
              <Text style={st.noEtapesText}>Aucune étape configurée</Text>
            </View>
          ) : (
            <View style={st.etapesList}>
              {etapes.map((etape, i) => (
                <View key={etape.id} style={st.etapeRow}>
                  {i < etapes.length - 1 && <View style={st.etapeLine} />}
                  <View style={st.etapeNum}>
                    <Text style={st.etapeNumText}>{i + 1}</Text>
                  </View>
                  <View style={st.etapeInfo}>
                    <View style={st.etapeTopRow}>
                      <Text style={st.etapeName}>{etape.name}</Text>
                      <View style={st.etapePtsBadge}>
                        <Text style={st.etapePtsText}>+100 pts</Text>
                      </View>
                    </View>
                    {etape.address ? (
                      <View style={st.etapeAddrRow}>
                        <Ionicons name="location-outline" size={12} color={Colors.gold} />
                        <Text style={st.etapeAddr}>{etape.address}</Text>
                      </View>
                    ) : null}
                    {etape.description ? (
                      <Text style={st.etapeDesc} numberOfLines={3}>{etape.description}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── CTA ── */}
          <View style={st.cta}>
            {alreadyCompleted ? (
              <View style={st.completedBanner}>
                <Ionicons name="trophy" size={20} color={Colors.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={st.completedTitle}>Chasse terminée !</Text>
                  <Text style={st.completedSub}>Vous avez déjà complété cette chasse et remporté vos points.</Text>
                </View>
              </View>
            ) : !isActive ? (
              <View style={st.infoBanner}>
                <Ionicons name="time-outline" size={18} color={Colors.parchment} />
                <Text style={st.infoBannerText}>{"Cette chasse n'est pas encore active"}</Text>
              </View>
            ) : alreadyJoined ? (
              <Btn label="Jouer sur la carte" onPress={handlePlay} />
            ) : hasOtherActive ? (
              <View style={st.warningBanner}>
                <Ionicons name="warning-outline" size={18} color={Colors.warning} />
                <Text style={st.warningText}>
                  {"Vous avez déjà une chasse en cours. Terminez-la avant d'en rejoindre une autre."}
                </Text>
              </View>
            ) : (
              <View style={st.ctaRow}>
                <View style={{ flex: 1 }}>
                  <Btn label="Rejoindre la chasse" onPress={handleJoin} loading={joining} />
                </View>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,7,0,0.68)' },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg, gap: 12 },
  errorText: { fontSize: 16, color: Colors.textSecondary },

  backWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  back: {
    margin: Sp.md,
    width: 40, height: 40,
    backgroundColor: 'rgba(10,7,0,0.65)',
    borderRadius: R.full,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingBottom: 100 },

  // Cover
  coverWrap:     { position: 'relative' },
  cover:         { width: '100%', height: 300 },
  coverEmpty:    { backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  coverContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Sp.lg, paddingBottom: Sp.lg, paddingTop: 80,
    gap: Sp.sm,
    backgroundColor: 'rgba(8,5,0,0.80)',
  },
  coverTitle: {
    fontSize: 28, fontWeight: '900', color: Colors.textPrimary,
    lineHeight: 34, letterSpacing: 0.3,
  },
  badgeRow: { flexDirection: 'row', gap: Sp.sm, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: R.full,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(10,7,0,0.70)',
  },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  body: { padding: Sp.lg, gap: Sp.lg },

  // Meta card
  metaCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
    overflow: 'hidden',
  },
  metaRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: Sp.md, padding: Sp.md },
  metaRowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderWarm },
  metaIcon:      { width: 24, alignItems: 'center', paddingTop: 1 },
  metaText:      { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  metaAccent:    { color: Colors.gold, fontWeight: '700' },

  // Section titre
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Sp.md },
  sectionLine:   { flex: 1, height: 1, backgroundColor: Colors.borderWarm },
  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: Colors.gold,
    letterSpacing: 2, textAlign: 'center',
  },

  noEtapes: {
    backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: Sp.xl,
    alignItems: 'center', gap: Sp.sm, borderWidth: 1, borderColor: Colors.border,
  },
  noEtapesText: { color: Colors.textMuted, fontSize: 14 },

  etapesList: { gap: Sp.sm },
  etapeRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Sp.md,
    backgroundColor: Colors.bgCard, borderRadius: R.lg,
    padding: Sp.md, borderWidth: 1, borderColor: Colors.borderWarm,
    position: 'relative',
  },
  etapeLine: {
    position: 'absolute', left: Sp.md + 15, top: Sp.md + 30,
    width: 2, height: Sp.md + 6, backgroundColor: Colors.gold + '33',
  },
  etapeNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '66',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  etapeNumText:  { fontSize: 13, fontWeight: '900', color: Colors.gold },
  etapeInfo:     { flex: 1, gap: 4 },
  etapeTopRow:   { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, flexWrap: 'wrap' },
  etapeName:     { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22, flex: 1 },
  etapePtsBadge: {
    backgroundColor: Colors.goldGlow, borderRadius: R.full,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.gold + '44',
  },
  etapePtsText: { fontSize: 10, color: Colors.gold, fontWeight: '800' },
  etapeAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  etapeAddr:    { fontSize: 12, color: Colors.parchment, flex: 1 },
  etapeDesc:    { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  cta: {},

  ctaRow: { flexDirection: 'row', gap: Sp.sm, alignItems: 'stretch' },

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm,
    backgroundColor: Colors.bgCard, borderRadius: R.md, padding: Sp.lg,
    borderWidth: 1, borderColor: Colors.borderWarm,
  },
  infoBannerText: { fontSize: 14, color: Colors.parchment },

  warningBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Sp.sm,
    backgroundColor: Colors.warning + '15', borderRadius: R.md, padding: Sp.md,
    borderWidth: 1, borderColor: Colors.warning + '55',
  },
  warningText: { flex: 1, fontSize: 14, color: Colors.warning, lineHeight: 20 },

  completedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.md,
    backgroundColor: Colors.gold + '18', borderRadius: R.lg, padding: Sp.lg,
    borderWidth: 1, borderColor: Colors.gold + '55',
  },
  completedTitle: { fontSize: 15, fontWeight: '800', color: Colors.gold },
  completedSub:   { fontSize: 13, color: Colors.parchment, lineHeight: 18, marginTop: 2 },
});
