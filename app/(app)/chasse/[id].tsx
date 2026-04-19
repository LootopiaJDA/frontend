import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService } from '../../../services/api';
import { ChasseDetail } from '../../../constants/types';
import { Colors, Sp, R } from '../../../constants/theme';
import Btn from '../../../components/Btn';

export default function ChasseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const chasseId = Number(id);

  const [chasse, setChasse] = useState<ChasseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await chasseService.getById(chasseId);
      setChasse(detail);
    } catch (err) {
      console.log('Erreur chargement chasse:', err);
    } finally {
      setLoading(false);
    }
  }, [chasseId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleJoin = async () => {
    setJoining(true);
    try {
      await chasseService.join(chasseId);
      setJoined(true);
    } catch (err: any) {
      // Si déjà inscrit, on considère ça comme un succès
      if (err.message?.toLowerCase().includes('already') || err.message?.toLowerCase().includes('inscription')) {
        setJoined(true);
      } else {
        Alert.alert('Erreur', err.message ?? 'Impossible de rejoindre la chasse');
      }
    } finally {
      setJoining(false);
    }
  };

  const handlePlay = () => {
    router.push({ pathname: '/(app)/map', params: { chasseId } });
  };

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
        <Ionicons name="alert-circle-outline" size={40} color={Colors.textMuted} />
        <Text style={st.errorText}>Chasse introuvable</Text>
      </View>
    );
  }

  const etapes = chasse.etape ?? [];
  const isActive = chasse.etat === 'ACTIVE';

  return (
    <SafeAreaView style={st.safe}>
      <TouchableOpacity style={st.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image de couverture */}
        <View style={st.coverWrap}>
          {chasse.image ? (
            <Image source={{ uri: chasse.image }} style={st.cover} resizeMode="cover" />
          ) : (
            <View style={[st.cover, st.coverEmpty]}>
              <Ionicons name="map-outline" size={52} color={Colors.textMuted} />
            </View>
          )}
          {/* Overlay gradient bas */}
          <View style={st.coverOverlay} />
          {/* Titre sur l'image */}
          <View style={st.coverContent}>
            <View style={st.badgeRow}>
              <View style={[st.badge, { borderColor: isActive ? '#4ecb8a' : Colors.gold }]}>
                <View style={[st.badgeDot, { backgroundColor: isActive ? '#4ecb8a' : Colors.gold }]} />
                <Text style={[st.badgeText, { color: isActive ? '#4ecb8a' : Colors.gold }]}>
                  {isActive ? 'Active' : chasse.etat}
                </Text>
              </View>
              {joined && (
                <View style={[st.badge, { borderColor: '#4ecb8a' }]}>
                  <Ionicons name="checkmark-circle" size={11} color="#4ecb8a" />
                  <Text style={[st.badgeText, { color: '#4ecb8a' }]}>Inscrit</Text>
                </View>
              )}
            </View>
            <Text style={st.coverTitle}>{chasse.name}</Text>
          </View>
        </View>

        <View style={st.body}>
          {/* Meta infos */}
          <View style={st.metaCard}>
            {chasse.localisation ? (
              <View style={st.metaRow}>
                <Ionicons name="location-outline" size={15} color={Colors.gold} />
                <Text style={st.meta}>{chasse.localisation}</Text>
              </View>
            ) : null}
            {chasse.occurence?.[0] && (
              <View style={[st.metaRow, chasse.localisation ? st.metaRowBorder : undefined]}>
                <Ionicons name="calendar-outline" size={15} color={Colors.gold} />
                <Text style={st.meta}>
                  {new Date(chasse.occurence[0].date_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  {' → '}
                  {new Date(chasse.occurence[0].date_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  {'  ·  '}
                  <Text style={st.metaAccent}>{chasse.occurence[0].limit_user} places</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Étapes */}
          <Text style={st.sectionTitle}>
            Parcours · {etapes.length} étape{etapes.length !== 1 ? 's' : ''}
          </Text>

          {etapes.length === 0 ? (
            <View style={st.noEtapes}>
              <Ionicons name="map-outline" size={28} color={Colors.textMuted} />
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
                        <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                        <Text style={st.etapeAddr}>{etape.address}</Text>
                      </View>
                    ) : null}
                    {etape.description ? (
                      <Text style={st.etapeDesc} numberOfLines={2}>{etape.description}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <View style={st.cta}>
            {!isActive ? (
              <View style={st.inactiveBanner}>
                <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                <Text style={st.inactiveText}>Cette chasse n'est pas encore active</Text>
              </View>
            ) : joined ? (
              <Btn label="Jouer sur la carte" onPress={handlePlay} />
            ) : (
              <View style={st.ctaRow}>
                <View style={{ flex: 1 }}>
                  <Btn label="Rejoindre la chasse" onPress={handleJoin} loading={joining} />
                </View>
                <TouchableOpacity style={st.playBtn} onPress={handlePlay} activeOpacity={0.85}>
                  <Ionicons name="navigate-outline" size={20} color={Colors.gold} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg, gap: 12 },
  errorText: { fontSize: 15, color: Colors.textMuted },

  back: {
    position: 'absolute', top: 16, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: R.full, padding: 10,
  },

  // Cover with overlay
  coverWrap:    { position: 'relative' },
  cover:        { width: '100%', height: 280 },
  coverEmpty:   { backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Bottom gradient simulation
  },
  coverContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Sp.lg, paddingTop: Sp.xxl,
    backgroundColor: 'rgba(8,8,16,0.72)',
    gap: Sp.sm,
  },
  coverTitle: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 32 },

  badgeRow: { flexDirection: 'row', gap: Sp.sm, flexWrap: 'wrap' },
  badge:    {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: R.full,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(8,8,16,0.6)',
  },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  body: { padding: Sp.lg, gap: Sp.md, paddingBottom: 80 },

  // Meta card
  metaCard: {
    backgroundColor: Colors.bgCard, borderRadius: R.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, padding: Sp.md },
  metaRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  meta:          { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  metaAccent:    { color: Colors.gold, fontWeight: '600' },

  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.gold,
    textTransform: 'uppercase', letterSpacing: 1.4,
  },

  noEtapes: {
    backgroundColor: Colors.bgCard, borderRadius: R.lg, padding: Sp.xl,
    alignItems: 'center', gap: Sp.sm, borderWidth: 1, borderColor: Colors.border,
  },
  noEtapesText: { color: Colors.textMuted, fontSize: 13 },

  etapesList: { gap: Sp.sm },
  etapeRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Sp.md,
    backgroundColor: Colors.bgCard, borderRadius: R.lg,
    padding: Sp.md, borderWidth: 1, borderColor: Colors.border,
    position: 'relative',
  },
  etapeLine: {
    position: 'absolute', left: Sp.md + 14, top: Sp.md + 28,
    width: 2, height: Sp.md + 4, backgroundColor: Colors.border,
  },
  etapeNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '55',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  etapeNumText: { fontSize: 12, fontWeight: '800', color: Colors.gold },
  etapeInfo:    { flex: 1, gap: 2 },
  etapeName:    { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  etapeAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  etapeAddr:    { fontSize: 11, color: Colors.textMuted, flex: 1 },
  etapeDesc:    { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginTop: 2 },

  cta: { marginTop: Sp.sm },

  ctaRow: { flexDirection: 'row', gap: Sp.sm, alignItems: 'stretch' },
  playBtn: {
    width: 52, backgroundColor: Colors.bgCard, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.gold + '55',
    alignItems: 'center', justifyContent: 'center',
  },

  inactiveBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm,
    backgroundColor: Colors.bgCard, borderRadius: R.md, padding: Sp.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  inactiveText: { fontSize: 13, color: Colors.textMuted },
});
