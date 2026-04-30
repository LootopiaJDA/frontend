import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService } from '../../../services/api';
import { ChasseDetail } from '../../../constants/types';
import { Colors, Sp, R } from '../../../constants/theme';
import Btn from '../../../components/Btn';

const MAP_BG = require('../../../assets/images/parchemin-tresor.png');

export default function ChasseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const chasseId = Number(id);

  const [chasse, setChasse]             = useState<ChasseDetail | null>(null);
  const [loading, setLoading]           = useState(true);
  const [joining, setJoining]           = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [hasOtherActive, setHasOtherActive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, meData] = await Promise.all([
        chasseService.getById(chasseId),
        chasseService.getMe().catch(() => ({ chasses: [] })),
      ]);
      setChasse(detail);
      const uc = meData.chasses ?? [];
      setAlreadyJoined(uc.some(u => u.id_chasse === chasseId && u.statut === 'IN_PROGRESS'));
      setHasOtherActive(uc.some(u => u.id_chasse !== chasseId && u.statut === 'IN_PROGRESS'));
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
      setAlreadyJoined(true);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('already') || err.message?.toLowerCase().includes('inscription')) {
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
              {alreadyJoined && (
                <View style={[st.badge, { borderColor: Colors.success }]}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                  <Text style={[st.badgeText, { color: Colors.success }]}>Inscrit</Text>
                </View>
              )}
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
                    <Text style={st.etapeName}>{etape.name}</Text>
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
            {!isActive ? (
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
    // Gradient simulé : transparent en haut, sombre en bas
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
  etapeNumText: { fontSize: 13, fontWeight: '900', color: Colors.gold },
  etapeInfo:    { flex: 1, gap: 4 },
  etapeName:    { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
  etapeAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  etapeAddr:    { fontSize: 12, color: Colors.parchment, flex: 1 },
  etapeDesc:    { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  cta: {},

  ctaRow: { flexDirection: 'row', gap: Sp.sm, alignItems: 'stretch' },
  playBtn: {
    width: 56, backgroundColor: Colors.bgCard, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.gold + '66',
    alignItems: 'center', justifyContent: 'center',
  },

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
});
