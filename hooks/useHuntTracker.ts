import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Etape } from '../constants/types';
import { etapeService } from '../services/api';

// ─── Haversine ────────────────────────────────────────────────────────────────
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface HuntTrackerState {
  etapes: Etape[];
  currentEtape: Etape | null;
  currentIndex: number;
  position: GeoPosition | null;
  distance: number | null;
  isInRadius: boolean;
  loading: boolean;
  completed: boolean;
  reachCurrentEtape: () => Promise<void>;
  advanceOnly: () => void;
}

// Rayon de détection par défaut (mètres).
// Les GPS téléphone ont une précision de ~5–15 m — en dessous de 15 m on risque de ne jamais détecter.
const DEFAULT_RADIUS = 15;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useHuntTracker(chasseId: number, completedEtapeIds: number[] = []): HuntTrackerState {
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isInRadius, setIsInRadius] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!chasseId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      // Chargement des étapes
      try {
        const data = await etapeService.getAll(chasseId);
        const sorted = [...data].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
        if (!cancelled) {
          setEtapes(sorted);
          if (completedEtapeIds.length > 0) {
            const firstPending = sorted.findIndex(e => !completedEtapeIds.includes(e.id_etape));
            setCurrentIndex(firstPending === -1 ? sorted.length : firstPending);
          }
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }

      // GPS — demande d'abord la permission, puis active les services de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      // Essaie d'activer les services GPS natifs (Android) — sans bloquer si refusé
      try { await Location.enableNetworkProviderAsync(); } catch {}

      const sub = await Location.watchPositionAsync(
        {
          // High utilise GPS + réseau : plus rapide à acquérir et plus fiable que BestForNavigation
          accuracy: Location.Accuracy.High,
          distanceInterval: 3,   // mise à jour tous les 3 m de déplacement réel
          timeInterval: 2000,    // au plus toutes les 2 s
        },
        (loc) => {
          if (!cancelled) {
            setPosition({
              latitude:  loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy:  loc.coords.accuracy,
            });
          }
        }
      );

      if (cancelled) { sub.remove(); return; }
      watchRef.current = sub;
    };

    init();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [chasseId]);

  // Mise à jour distance/rayon à chaque déplacement ou changement d'étape
  useEffect(() => {
    if (!position || etapes.length === 0 || currentIndex >= etapes.length) return;

    const etape = etapes[currentIndex];
    const dist = haversine(
      position.latitude,
      position.longitude,
      parseFloat(etape.lat),
      parseFloat(etape.long)
    );

    const radius = etape.rayon ?? DEFAULT_RADIUS;

    // Si la précision GPS est mauvaise, élargit légèrement le rayon de détection
    const gpsError = position.accuracy ?? 0;
    const effectiveRadius = Math.max(radius, radius + Math.min(gpsError * 0.5, 10));

    setDistance(Math.round(dist));
    setIsInRadius(dist <= effectiveRadius);
  }, [position, etapes, currentIndex]);

  const advanceOnly = useCallback(() => {
    const next = currentIndex + 1;
    if (next >= etapes.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(next);
      setIsInRadius(false);
      setDistance(null);
    }
  }, [etapes.length, currentIndex]);

  const reachCurrentEtape = useCallback(async () => {
    if (currentIndex >= etapes.length) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= etapes.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(nextIndex);
      setIsInRadius(false);
      setDistance(null);
    }
  }, [etapes, currentIndex]);

  return {
    etapes,
    currentEtape: etapes[currentIndex] ?? null,
    currentIndex,
    position,
    distance,
    isInRadius,
    loading,
    completed,
    reachCurrentEtape,
    advanceOnly,
  };
}
