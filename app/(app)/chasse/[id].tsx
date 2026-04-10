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
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image de couverture */}
        {chasse.image ? (
          <Image source={{ uri: chasse.image }} style={st.cover} resizeMode="cover" />
        ) : (
          <View style={[st.cover, st.coverEmpty]}>
            <Ionicons name="map-outline" size={52} color={Colors.textMuted} />
          </View>
        )}

        <View style={st.body}>
          {/* Badge état */}
          <View style={st.badgeRow}>
            <View style={[st.badge, { borderColor: isActive ? '#4caf50' : Colors.gold }]}>
              <Text style={[st.badgeText, { color: isActive ? '#4caf50' : Colors.gold }]}>
                {chasse.etat}
              </Text>
            </View>
            {joined && (
              <View style={[st.badge, { borderColor: '#4ecb8a' }]}>
                <Ionicons name="checkmark-circle-outline" size={11} color="#4ecb8a" />
                <Text style={[st.badgeText, { color: '#4ecb8a' }]}>Inscrit</Text>
              </View>
            )}
          </View>

          <Text style={st.title}>{chasse.name}</Text>

          {chasse.localisation ? (
            <View style={st.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={st.meta}>{chasse.localisation}</Text>
            </View>
          ) : null}

          {chasse.occurence?.[0] && (
            <View style={st.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
              <Text style={st.meta}>
                {new Date(chasse.occurence[0].date_start).toLocaleDateString('fr-FR')}
                {' → '}
                {new Date(chasse.occurence[0].date_end).toLocaleDateString('fr-FR')}
                {'  ·  '}
                {chasse.occurence[0].limit_user} places
              </Text>
            </View>
          )}

          {/* Étapes */}
          <Text style={st.sectionTitle}>
            Parcours — {etapes.length} étape{etapes.length !== 1 ? 's' : ''}
          </Text>

          {etapes.length === 0 ? (
            <View style={st.noEtapes}>
              <Text style={st.noEtapesText}>Aucune étape configurée</Text>
            </View>
          ) : (
            etapes.map((etape, i) => (
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
            ))
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
                  <Btn label="Rejoindre" onPress={handleJoin} loading={joining} />
                </View>
                <TouchableOpacity style={st.playBtn} onPress={handlePlay} activeOpacity={0.85}>
                  <Ionicons name="play" size={18} color={Colors.black} />
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

  cover: { width: '100%', height: 240 },
  coverEmpty: { backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },

  body: { padding: Sp.lg, gap: Sp.md, paddingBottom: 60 },

  badgeRow: { flexDirection: 'row', gap: Sp.sm, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, lineHeight: 32 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta:    { fontSize: 13, color: Colors.textMuted, flex: 1 },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: Sp.sm },

  noEtapes:     { backgroundColor: Colors.bgCard, borderRadius: R.md, padding: Sp.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  noEtapesText: { color: Colors.textMuted, fontSize: 13 },

  etapeRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Sp.md,
    backgroundColor: Colors.bgCard, borderRadius: R.md,
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

  cta: { marginTop: Sp.md },

  ctaRow: { flexDirection: 'row', gap: Sp.sm, alignItems: 'stretch' },
  playBtn: {
    width: 50, backgroundColor: Colors.bgCard, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.gold + '55',
    alignItems: 'center', justifyContent: 'center',
  },

  inactiveBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.bgCard, borderRadius: R.md, padding: Sp.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  inactiveText: { fontSize: 13, color: Colors.textMuted },
});
