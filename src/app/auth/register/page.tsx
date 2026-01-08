"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  CheckCheckIcon,
} from "lucide-react";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "JOUEUR",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("")

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

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
    const value = e.target.value;
    setForm({ ...form, password: value });
    checkPasswordStrength(value);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          username: form.username.toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });

      if (res.ok) {
        setMessage("Inscription réussie, vous allez être redirigé vers la page de connexion");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.message || "Erreur lors de l'inscription");
      }

    } catch {
      setError("Impossible de se connecter au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-3 py-20">
      <div className="w-full max-w-sm relative">
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />

        <form
          onSubmit={handleRegister}
          className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Rejoins Lootopia 🚀
            </h1>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top">
              <CheckCheckIcon className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pseudo"
                required
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                required
                value={form.password}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <p className="text-[11px] font-semibold text-gray-700">
                  Force du mot de passe
                </p>
                <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                  {Object.entries({
                    "8 caractères": passwordStrength.length,
                    Majuscule: passwordStrength.uppercase,
                    Minuscule: passwordStrength.lowercase,
                    Chiffre: passwordStrength.number,
                    "Caractère spécial": passwordStrength.special,
                  }).map(([label, valid]) => (
                    <div
                      key={label}
                      className={`flex items-center gap-1.5 ${valid ? "text-green-600" : "text-gray-400"
                        }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role */}
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="JOUEUR">🎮 Joueur</option>
              <option value="PARTENAIRE">🤝 Partenaire</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 text-sm rounded-xl font-bold disabled:opacity-50 transition"
          >
            {isLoading ? (
              "Création en cours..."
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-600">
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
