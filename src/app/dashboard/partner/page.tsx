"use client";

import { Map, Users, PlusCircle } from "lucide-react";

export default function PartnerDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 pt-20">
            <h1 className="text-2xl font-black mb-6">🤝 Dashboard Partenaire</h1>

            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <Map className="w-6 h-6 text-indigo-600" />
                    <div>
                        <p className="font-bold">3 chasses actives</p>
                        <p className="text-xs text-gray-500">Publiées</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                        <p className="font-bold">2 430 joueurs</p>
                        <p className="text-xs text-gray-500">Participants</p>
                    </div>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Créer une chasse
                </button>
            </div>
        </div>
    );
}
