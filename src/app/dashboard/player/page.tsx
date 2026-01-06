"use client";

import { Trophy, MapPin, Star } from "lucide-react";

export default function PlayerDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 pt-20">
            <h1 className="text-2xl font-black mb-6">🎮 Dashboard Joueur</h1>

            <div className="grid gap-4">
                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-indigo-600" />
                    <div>
                        <p className="font-bold">1 250 pts</p>
                        <p className="text-xs text-gray-500">Points gagnés</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    <div>
                        <p className="font-bold">6 chasses</p>
                        <p className="text-xs text-gray-500">Terminées</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <div>
                        <p className="font-bold">4.8 / 5</p>
                        <p className="text-xs text-gray-500">Note moyenne</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
