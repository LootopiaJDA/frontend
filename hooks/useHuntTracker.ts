import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Etape } from '../constants/types';
import { etapeService } from '../services/api';

// ─── Haversine ────────────────────────────────────────────────────────────────
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // rayon Terre en mètres
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
}

export interface HuntTrackerState {
  etapes: Etape[];
  currentEtape: Etape | null;
  currentIndex: number;
  position: GeoPosition | null;
  distance: number | null; // mètres, arrondi
  isInRadius: boolean;
  loading: boolean;
  completed: boolean;
  reachCurrentEtape: () => Promise<void>;
  /** Avance à l'étape suivante sans appeler l'API (utilisé après validation AR) */
  advanceOnly: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useHuntTracker(chasseId: number): HuntTrackerState {
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
        if (!cancelled) setEtapes(sorted);
      } catch (err) {
        console.log('Erreur chargement étapes:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }

      // GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 3 },
        (loc) => {
          if (!cancelled) {
            setPosition({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }
        }
      );
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
    const rounded = Math.round(dist);
    setDistance(rounded);
    setIsInRadius(rounded <= (etape.rayon ?? 30));
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
