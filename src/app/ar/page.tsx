'use client';

import { useEffect, useState } from 'react';

export default function ARPage() {
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [isWithinRadius, setIsWithinRadius] = useState(false);

    // Coordonnées de l'objet
    const targetCoords = { lat: 44.8549962, lng: -0.5683491 };
    const activationRadius = 5;

    useEffect(() => {
        // Charger A-Frame et AR.js une seule fois
        const loadScripts = async () => {
            if (!document.querySelector('#aframe')) {
                const aframe = document.createElement('script');
                aframe.id = 'aframe';
                aframe.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
                aframe.async = true;
                document.head.appendChild(aframe);

                aframe.onload = () => {
                    const arjs = document.createElement('script');
                    arjs.src =
                        'https://raw.githack.com/AR-js-org/AR.js/3.4.7/aframe/build/aframe-ar.js';
                    arjs.async = true;
                    document.head.appendChild(arjs);

                    arjs.onload = () => setScriptsLoaded(true);
                };
            } else {
                setScriptsLoaded(true);
            }
        };

        loadScripts();

        // Suivi GPS utilisateur avec mise à jour toutes les 3 secondes
        let watchId: number;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const distance = getDistance(
                        pos.coords.latitude,
                        pos.coords.longitude,
                        targetCoords.lat,
                        targetCoords.lng
                    );
                    setIsWithinRadius(distance <= activationRadius);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
            );
        }

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Calcul distance entre deux points GPS (Haversine)
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000;
        const toRad = (x: number) => (x * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            {scriptsLoaded ? (
                <a-scene
                    embedded
                    vr-mode-ui="enabled: false"
                    arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false"
                    renderer="antialias: true; alpha: true"
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* Caméra GPS */}
                    <a-camera gps-new-camera="gpsMinDistance: 0">
                        {/* Objet 3D activé seulement dans le rayon */}
                        {isWithinRadius && (
                            <a-box
                                position="0 0 -1"        // toujours devant la caméra
                                rotation="0 0 0"
                                color="red"
                                scale="0.5 0.5 0.5"
                                animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"
                            ></a-box>
                        )}
                    </a-camera>
                </a-scene>
            ) : (
                <p>Chargement AR...</p>
            )}
        </div>
    );
}
