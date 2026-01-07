'use client';

import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Target, Compass, TrendingDown, Award, Crosshair } from 'lucide-react';

export default function TreasureHuntTracker() {
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [bearing, setBearing] = useState<number>(0);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const [heading, setHeading] = useState<number | null>(null);
    const [speed, setSpeed] = useState<number | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const accuracyCircleRef = useRef<any>(null);
    const treasureMarkerRef = useRef<any>(null);
    const targetCircleRef = useRef<any>(null);
    const pathLineRef = useRef<any>(null);

    // Configuration du trésor
    const targetCoords = { lat: 44.8549962, lng: -0.5683491 };
    const activationRadius = 50; // 50 mètres pour activer le trésor

    // Chargement de Leaflet
    useEffect(() => {
        if (!document.querySelector('#leaflet-css')) {
            const css = document.createElement('link');
            css.id = 'leaflet-css';
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);
        }

        if (!(window as any).L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => setLeafletLoaded(true);
            document.head.appendChild(script);
        } else {
            setLeafletLoaded(true);
        }
    }, []);

    // Géolocalisation continue
    useEffect(() => {
        let watchId: number;

        const success = (pos: GeolocationPosition) => {
            const current = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };

            setUserPosition(current);
            setAccuracy(pos.coords.accuracy);
            setHeading(pos.coords.heading);
            setSpeed(pos.coords.speed);

            // Calcul de la distance
            const dist = getDistance(
                current.lat,
                current.lng,
                targetCoords.lat,
                targetCoords.lng
            );
            setDistance(dist);
            setIsWithinRadius(dist <= activationRadius);


            const bear = getBearing(
                current.lat,
                current.lng,
                targetCoords.lat,
                targetCoords.lng
            );
            setBearing(bear);
        };

        const error = (err: GeolocationPositionError) => {
            console.error('Erreur de géolocalisation:', err.message);
        };

        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 10000,
        });

        watchId = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 10000
        });

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    // Initialisation de la carte
    useEffect(() => {
        if (!leafletLoaded || !userPosition || leafletMapRef.current) return;

        const L = (window as any).L;

        // Création de la carte
        const map = L.map(mapRef.current!, {
            center: [userPosition.lat, userPosition.lng],
            zoom: 17,
            zoomControl: true,
            attributionControl: false,
        });

        // Ajout des tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
        }).addTo(map);

        leafletMapRef.current = map;

        // Icône personnalisée pour l'utilisateur
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div style="
        width: 20px; 
        height: 20px; 
        background: #3b82f6; 
        border: 3px solid white; 
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
        z-index: 1000;
      "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        // Marqueur utilisateur
        userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
            icon: userIcon,
        }).addTo(map);

        // Cercle de précision
        accuracyCircleRef.current = L.circle([userPosition.lat, userPosition.lng], {
            radius: accuracy || 50,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1,
        }).addTo(map);

        // Icône du trésor
        const treasureIcon = L.divIcon({
            className: 'custom-treasure-marker',
            html: `<div style="
        font-size: 32px;
        text-align: center;
        animation: bounce 2s infinite;
      ">🏆</div>
      <style>
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      </style>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        // Marqueur du trésor
        treasureMarkerRef.current = L.marker([targetCoords.lat, targetCoords.lng], {
            icon: treasureIcon,
        }).addTo(map);

        // Cercle d'activation autour du trésor
        targetCircleRef.current = L.circle([targetCoords.lat, targetCoords.lng], {
            radius: activationRadius,
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '5, 5',
        }).addTo(map);

        // Ligne entre l'utilisateur et le trésor
        pathLineRef.current = L.polyline(
            [
                [userPosition.lat, userPosition.lng],
                [targetCoords.lat, targetCoords.lng],
            ],
            {
                color: '#f59e0b',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10',
            }
        ).addTo(map);
    }, [leafletLoaded, userPosition]);

    // Mise à jour continue de la position
    useEffect(() => {
        if (!userPosition || !leafletMapRef.current) return;

        const L = (window as any).L;

        // Mise à jour du marqueur utilisateur
        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
        }

        // Mise à jour du cercle de précision
        if (accuracyCircleRef.current) {
            accuracyCircleRef.current.setLatLng([userPosition.lat, userPosition.lng]);
            accuracyCircleRef.current.setRadius(accuracy || 50);
        }

        // Mise à jour de la ligne de trajet
        if (pathLineRef.current) {
            pathLineRef.current.setLatLngs([
                [userPosition.lat, userPosition.lng],
                [targetCoords.lat, targetCoords.lng],
            ]);
        }

        // Changement de couleur du cercle cible selon la distance
        if (targetCircleRef.current && distance !== null) {
            const color = distance <= activationRadius ? '#10b981' :
                distance <= activationRadius * 2 ? '#f59e0b' : '#ef4444';
            targetCircleRef.current.setStyle({ color, fillColor: color });
        }
    }, [userPosition, accuracy, distance]);

    // Calcul de distance (Haversine)
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000; // Rayon de la Terre en mètres
        const toRad = (x: number) => (x * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Calcul du cap (bearing)
    const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (x: number) => (x * Math.PI) / 180;
        const toDeg = (x: number) => (x * 180) / Math.PI;
        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x =
            Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
        return (toDeg(Math.atan2(y, x)) + 360) % 360;
    };

    // Formatage distance
    const formatDistance = (d: number) =>
        d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(2)} km`;

    // Direction cardinale
    const getCardinalDirection = (deg: number) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
        return directions[Math.round(deg / 45) % 8];
    };

    // Centrer la carte sur l'utilisateur
    const handleCenterMap = () => {
        if (userPosition && leafletMapRef.current) {
            leafletMapRef.current.setView([userPosition.lat, userPosition.lng], 17, {
                animate: true,
            });
        }
    };

    // Voir le trésor et l'utilisateur
    const handleViewAll = () => {
        if (userPosition && leafletMapRef.current) {
            const L = (window as any).L;
            const bounds = L.latLngBounds([
                [userPosition.lat, userPosition.lng],
                [targetCoords.lat, targetCoords.lng],
            ]);
            leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="w-7 h-7" />
                    Chasse au Trésor
                </h1>
                <p className="text-blue-100 text-sm mt-1">Suivez votre position en temps réel</p>
            </div>

            <div className="p-4 space-y-4 pb-6">
                {/* Carte */}
                <div className="relative h-[45vh] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white">
                    <div ref={mapRef} className="absolute inset-0" />

                    {/* Boutons de contrôle */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
                        <button
                            onClick={handleCenterMap}
                            className="bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                            title="Me centrer"
                        >
                            <Crosshair className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                            onClick={handleViewAll}
                            className="bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                            title="Tout voir"
                        >
                            <Target className="w-5 h-5 text-indigo-600" />
                        </button>
                    </div>

                    {/* Statut précision */}
                    {accuracy !== null && (
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium shadow-lg z-[1000]">
                            <span className={accuracy < 20 ? 'text-green-600' : accuracy < 50 ? 'text-orange-600' : 'text-red-600'}>
                                ±{Math.round(accuracy)}m
                            </span>
                        </div>
                    )}
                </div>

                {/* Alerte de proximité */}
                {isWithinRadius && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-xl animate-pulse">
                        <div className="flex items-center gap-3">
                            <Award className="w-10 h-10" />
                            <div>
                                <p className="text-xl font-bold">Trésor trouvé ! 🎉</p>
                                <p className="text-green-100 text-sm">Vous êtes arrivé à destination</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicateur de direction principal */}
                {distance !== null && userPosition && !isWithinRadius && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Compass className="w-16 h-16 text-blue-600" />
                                    <Navigation
                                        className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                        style={{
                                            transform: `translate(-50%, -50%) rotate(${bearing}deg)`,
                                            transition: 'transform 0.3s ease-out',
                                        }}
                                    />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">{formatDistance(distance)}</p>
                                    <p className="text-sm text-gray-500">Direction: {getCardinalDirection(bearing)} ({Math.round(bearing)}°)</p>
                                </div>
                            </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Progression</span>
                                <span>{Math.max(0, Math.round((1 - distance / 500) * 100))}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                                    style={{
                                        width: `${Math.max(0, Math.min(100, (1 - distance / 500) * 100))}%`,
                                    }}
                                />
                            </div>
                            {distance > activationRadius && (
                                <p className="text-sm text-gray-600 text-center">
                                    Encore <strong className="text-blue-600">{Math.round(distance - activationRadius)}m</strong> avant le trésor
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Informations détaillées */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Vitesse */}
                    {speed !== null && speed > 0 && (
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingDown className="w-4 h-4 text-purple-600" />
                                <p className="text-xs text-gray-500">Vitesse</p>
                            </div>
                            <p className="text-lg font-bold text-purple-600">
                                {(speed * 3.6).toFixed(1)} km/h
                            </p>
                        </div>
                    )}

                    {/* Distance restante */}
                    {distance !== null && (
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-red-600" />
                                <p className="text-xs text-gray-500">Reste</p>
                            </div>
                            <p className="text-lg font-bold text-red-600">
                                {distance > activationRadius ? Math.round(distance - activationRadius) : 0}m
                            </p>
                        </div>
                    )}
                </div>

                {/* Coordonnées (débug) */}
                {userPosition && (
                    <details className="bg-white rounded-xl shadow-md p-4">
                        <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                            Coordonnées GPS
                        </summary>
                        <div className="mt-3 space-y-2 text-xs text-gray-600 font-mono">
                            <div className="flex justify-between">
                                <span>📍 Ma position:</span>
                                <span className="font-bold">{userPosition.lat.toFixed(6)}, {userPosition.lng.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🏆 Trésor:</span>
                                <span className="font-bold">{targetCoords.lat.toFixed(6)}, {targetCoords.lng.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🎯 Précision:</span>
                                <span className="font-bold">±{accuracy ? Math.round(accuracy) : '?'}m</span>
                            </div>
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
}