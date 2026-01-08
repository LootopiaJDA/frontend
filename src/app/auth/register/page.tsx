"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle,
  User,
  Building2,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

type UserType = "JOUEUR" | "PARTENAIRE";

export default function Register() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // États communs
  const [userType, setUserType] = useState<UserType>("JOUEUR");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États spécifiques PARTENAIRE
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");

  // États UI
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirection si déjà authentifié
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation du mot de passe
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {
      let url = "http://localhost:3000/user";
      let body: any = { username, email, password };

      // Si c'est un partenaire, changer l'URL et ajouter les données
      if (userType === "PARTENAIRE") {
        url = "http://localhost:3000/user/partenaire";
        body = {
          username,
          email,
          password,
          partenaire: {
            adresse,
            telephone,
            siret,
            company_name: companyName,
            statut: "VERIFICATION",
          },
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de l'inscription");
        setIsLoading(false);
        return;
      }

      // Inscription réussie
      setMessage(
        userType === "PARTENAIRE"
          ? "Inscription réussie ! Votre compte est en cours de vérification. Redirection..."
          : "Inscription réussie ! Redirection..."
      );

      // Attendre 2 secondes
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirection vers login
      router.push("/auth/login");
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError("Impossible de se connecter au serveur");
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <div className="text-white text-lg font-medium">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-12">
      <div className="w-full max-w-2xl relative">
        {/* Effet de glow */}
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />

        <form
          onSubmit={handleRegister}
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
              Rejoins l'aventure ! 🚀
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Crée ton compte et commence à jouer
            </p>
          </div>

          {/* Sélection du type d'utilisateur */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUserType("JOUEUR")}
              disabled={isLoading}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${userType === "JOUEUR"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:cursor-not-allowed`}
            >
              <User className="w-5 h-5 mx-auto mb-1" />
              Joueur
            </button>
            <button
              type="button"
              onClick={() => setUserType("PARTENAIRE")}
              disabled={isLoading}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${userType === "PARTENAIRE"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:cursor-not-allowed`}
            >
              <Building2 className="w-5 h-5 mx-auto mb-1" />
              Partenaire
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Champs communs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <User className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="john_doe"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-gray-300
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
            </div>

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
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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
                className="absolute right-4 top-[42px] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <Lock className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-3 text-sm rounded-xl border border-gray-300
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-4 top-[42px] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Champs spécifiques PARTENAIRE */}
          {userType === "PARTENAIRE" && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Informations de l'entreprise
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <Building2 className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Doe Enterprises"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-gray-300
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                    disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIRET
                  </label>
                  <FileText className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="12345678901234"
                    required
                    maxLength={14}
                    value={siret}
                    onChange={(e) => setSiret(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-gray-300
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                    disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <MapPin className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="123 Main St, Cityville"
                  required
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-gray-300
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <Phone className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-gray-300
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  ℹ️ Votre compte sera en cours de vérification. Vous recevrez un email
                  une fois validé.
                </p>
              </div>
            </>
          )}

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={isLoading}
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
                Inscription en cours...
              </>
            ) : (
              <>
                S'inscrire
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Lien vers login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}