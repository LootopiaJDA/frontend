"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      if (!data.access_token) {
        setError("Erreur de connexion : token manquant");
        setIsLoading(false);
        return;
      }

      // Utilisation de la fonction login du provider
      login(data.access_token);
      // La redirection est gérée automatiquement par le provider

    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError("Impossible de se connecter au serveur");
      setIsLoading(false);
    }
  };

  // Afficher rien pendant le chargement initial
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-20">
      <div className="w-full max-w-md relative">
        {/* Effet de glow */}
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />

        <form
          onSubmit={handleLogin}
          className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6"
        >
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bon retour ! 👋
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Connecte-toi pour continuer l'aventure
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Mail className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="ton.email@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-gray-300
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <Lock className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-3 text-sm rounded-xl border border-gray-300
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-[42px] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={!email || !password || isLoading}
            className="w-full flex items-center justify-center gap-2
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white py-3.5 text-sm rounded-xl font-bold
            hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Register Link */}
          <Link
            href="/auth/register"
            className="block w-full text-center py-3.5 text-sm rounded-xl font-bold
            border-2 border-indigo-600 text-indigo-600
            hover:bg-indigo-50 transition-all duration-200"
          >
            Créer un compte gratuitement
          </Link>
        </form>
      </div>
    </div>
  );
}