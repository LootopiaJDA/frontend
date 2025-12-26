"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { User } from "@/type";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/users");
      const users: User[] = await res.json();
      const user = users.find((u) => u.email === email);
      if (!user) return setError("Utilisateur non trouvé");
      localStorage.setItem("user", JSON.stringify(user));
      router.push(
        user.userType === "player"
          ? "/dashboard/player"
          : "/dashboard/partner"
      );
    } catch (err) {
      setError("Erreur de connexion");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />

        <form
          onSubmit={handleLogin}
          className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-gray-900">
              Bon retour 👋
            </h1>
            <p className="text-gray-600">
              Connecte-toi pour continuer l’aventure
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition">
            Se connecter
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <a
              href="/auth/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              S’inscrire
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
