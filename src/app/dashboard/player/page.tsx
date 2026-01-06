"use client";

export default function Register() {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-8">
            <div className="w-full max-w-md relative">       {/* Effet de fond flou */}
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Dashboard Joueur 🚀
                    </h1>
                </div>
            </div>
        </div>
    );
}