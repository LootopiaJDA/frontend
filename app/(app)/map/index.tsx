import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  SafeAreaView, Dimensions, ScrollView, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { chasseService, etapeService } from '../../../services/api';
import { Chasse, Etape } from '../../../constants/types';
import { Colors, Sp, R } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');
const BOTTOM_HEIGHT = 220;

// Structure : chasse + sa première étape pour coordonnées
type ChassePin = Chasse & { lat?: number; lng?: number };

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [chasses, setChasses] = useState<ChassePin[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<ChassePin | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 46.8, longitude: 2.3, latitudeDelta: 8, longitudeDelta: 8,
  });

  const load = useCallback(async () => {
    try {
      const data = await chasseService.getAll();
      const all = data.allChasse ?? [];

      // Pour chaque chasse active, récupère la 1ère étape pour avoir les coords
      const withCoords = await Promise.allSettled(
          all.filter(c => c.etat === 'ACTIVE').map(async (c) => {
            try {
              const etapes: Etape[] = await etapeService.getAll(c.id_chasse);
              const sorted = etapes.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
              const first = sorted.find(e => !isNaN(parseFloat(e.lat)));
              return {
                ...c,
                lat: first ? parseFloat(first.lat) : undefined,
                lng: first ? parseFloat(first.long) : undefined,
              } as ChassePin;
            } catch {
              return { ...c } as ChassePin;
            }
          })
      );

      const pins = withCoords
          .filter((r): r is PromiseFulfilledResult<ChassePin> => r.status === 'fulfilled')
          .map(r => r.value)
          .filter(c => c.lat !== undefined && c.lng !== undefined);

      setChasses(pins);

      // Centrer la map sur le barycentre des chasses
      if (pins.length > 0) {
        const lats = pins.map(c => c.lat!);
        const lngs = pins.map(c => c.lng!);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const deltaLat = Math.max(Math.max(...lats) - Math.min(...lats), 1) * 1.5;
        const deltaLng = Math.max(Math.max(...lngs) - Math.min(...lngs), 1) * 1.5;
        const newRegion = { latitude: centerLat, longitude: centerLng, latitudeDelta: deltaLat, longitudeDelta: deltaLng };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 800);
      }
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    })();
  }, []);

  const flyTo = (c: ChassePin) => {
    setSelected(c);
    if (c.lat && c.lng) {
      mapRef.current?.animateToRegion({
        latitude: c.lat - 0.02,
        longitude: c.lng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }, 600);
    }
  };

  const flyToUser = () => {
    if (userLoc) {
      mapRef.current?.animateToRegion({
        latitude: userLoc.lat, longitude: userLoc.lng,
        latitudeDelta: 0.05, longitudeDelta: 0.05,
      }, 600);
    }
  };

  return (
      <View style={styles.bg}>
        {/* MAP plein écran */}
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_DEFAULT}
            initialRegion={region}
            userInterfaceStyle="dark"
            showsUserLocation
            showsCompass={false}
            onPress={() => setSelected(null)}
        >
          {chasses.map(c => (
              <Marker
                  key={c.id_chasse}
                  coordinate={{ latitude: c.lat!, longitude: c.lng! }}
                  onPress={() => flyTo(c)}
              >
                <View style={[styles.pin, selected?.id_chasse === c.id_chasse && styles.pinSelected]}>
                  <Ionicons name="compass" size={selected?.id_chasse === c.id_chasse ? 18 : 14} color={Colors.black} />
                </View>
              </Marker>
          ))}
        </MapView>

        {/* Header overlay */}
        <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
          <View style={styles.topBar}>
            <View style={styles.titlePill}>
              <Ionicons name="map" size={14} color={Colors.gold} />
              <Text style={styles.titleText}>
                {loading ? 'Chargement...' : `${chasses.length} chasse${chasses.length !== 1 ? 's' : ''} disponible${chasses.length !== 1 ? 's' : ''}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.locBtn} onPress={flyToUser} disabled={!userLoc}>
              <Ionicons name="locate" size={18} color={userLoc ? Colors.gold : Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={Colors.gold} size="large" />
              <Text style={styles.loadingText}>Chargement des chasses...</Text>
            </View>
        )}

        {/* Bottom sheet : chasse sélectionnée */}
        {selected ? (
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetContent}>
                {selected.image ? (
                    <Image source={{ uri: selected.image }} style={styles.sheetImg} />
                ) : (
                    <View style={[styles.sheetImg, styles.sheetImgPlaceholder]}>
                      <Ionicons name="map" size={28} color={Colors.textMuted} />
                    </View>
                )}
                <View style={styles.sheetInfo}>
                  <Text style={styles.sheetName} numberOfLines={1}>{selected.name}</Text>
                  <View style={styles.sheetLoc}>
                    <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                    <Text style={styles.sheetLocText} numberOfLines={1}>{selected.localisation}</Text>
                  </View>
                  {selected.occurence?.[0]?.limit_user ? (
                      <Text style={styles.sheetMeta}>Max {selected.occurence[0].limit_user} joueurs</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                    style={styles.sheetBtn}
                    onPress={() => router.push({ pathname: '/(app)/chasse-detail', params: { id: selected.id_chasse } })}
                >
                  <Ionicons name="arrow-forward" size={18} color={Colors.black} />
                </TouchableOpacity>
              </View>
            </View>
        ) : chasses.length > 0 ? (
            /* Liste mini horizontale quand rien de sélectionné */
            <View style={styles.miniList}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniListScroll}>
                {chasses.map(c => (
                    <TouchableOpacity key={c.id_chasse} style={styles.miniCard} onPress={() => flyTo(c)}>
                      <Text style={styles.miniCardName} numberOfLines={1}>{c.name}</Text>
                      <Text style={styles.miniCardLoc} numberOfLines={1}>{c.localisation}</Text>
                    </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
        ) : null}
      </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: Sp.md, gap: Sp.sm },
  titlePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgCard + 'EE', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  titleText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  locBtn: { width: 42, height: 42, borderRadius: R.full, backgroundColor: Colors.bgCard + 'EE', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  pin: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  pinSelected: { width: 48, height: 48, borderRadius: 24, borderColor: Colors.gold, backgroundColor: Colors.black, borderWidth: 3 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.bg + 'CC', alignItems: 'center', justifyContent: 'center', gap: Sp.md },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, borderTopWidth: 1, borderColor: Colors.border, paddingBottom: 34 },
  sheetHandle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginTop: Sp.sm, marginBottom: Sp.md },
  sheetContent: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingHorizontal: Sp.lg, paddingBottom: Sp.md },
  sheetImg: { width: 72, height: 72, borderRadius: R.lg },
  sheetImgPlaceholder: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  sheetInfo: { flex: 1, gap: 4 },
  sheetName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  sheetLoc: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetLocText: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  sheetMeta: { color: Colors.gold, fontSize: 11, fontWeight: '600' },
  sheetBtn: { width: 44, height: 44, borderRadius: R.full, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  miniList: { position: 'absolute', bottom: 20, left: 0, right: 0 },
  miniListScroll: { paddingHorizontal: Sp.lg, gap: Sp.sm },
  miniCard: { backgroundColor: Colors.bgCard + 'EE', borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, padding: Sp.md, minWidth: 140 },
  miniCardName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  miniCardLoc: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
});