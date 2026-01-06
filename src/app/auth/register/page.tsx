"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "JOUEUR",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const router = useRouter();

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setForm({ ...form, password: newPassword });
    checkPasswordStrength(newPassword);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = {
      email: form.email,
      username: form.username.toLowerCase(),
      password: form.password,
      role: form.role,
    };

    try {
      const res = await fetch("http://localhost:3000/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/auth/login");
      } else {
        const data = await res.json();
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Impossible de se connecter au serveur");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-8">
      <div className="w-full max-w-md relative">
        {/* Effet de fond flou */}
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />

        <form
          onSubmit={handleRegister}
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6"
        >
          {/* En-tête */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Rejoins Lootopia 🚀
            </h1>
            <p className="text-gray-600">Crée ton compte et commence l'aventure</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Champ Pseudo */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pseudo"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
              />
            </div>

            {/* Champ Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={form.password}
                onChange={handlePasswordChange}
                required
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {form.password && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700">Force du mot de passe :</p>
                <div className="flex gap-3">
                  <div className="space-y-1.5 text-xs">
                    <div className={`flex items-center gap-2 ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Au moins 8 caractères</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Une majuscule</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Une minuscule</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className={`flex items-center gap-2 ${passwordStrength.number ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Un chiffre</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.special ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Un caractère spécial (!@#$...)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sélection du rôle */}
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition bg-white"
            >
              <option value="JOUEUR">🎮 Joueur</option>
              <option value="PARTENAIRE">🤝 Partenaire</option>
            </select>
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span>Création en cours...</span>
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Lien vers la connexion */}
          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <a
              href="/auth/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}