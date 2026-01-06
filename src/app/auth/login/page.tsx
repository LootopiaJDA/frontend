"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/connexion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();


        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);


          const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
          localStorage.setItem("user", JSON.stringify({
            id: tokenPayload.sub,
            username: tokenPayload.username,
            role: tokenPayload.role
          }));

          if (tokenPayload.role === "JOUEUR") {
            router.push("/dashboard/player");
          } else if (tokenPayload.role === "PARTENAIRE") {
            router.push("/dashboard/partner");
          } else {
            router.push("/dashboard");
          }
        }
      } else {
        const data = await res.json();
        setError(data.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Impossible de se connecter au serveur");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />

        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bon retour 👋
            </h1>
            <p className="text-gray-600">
              Connecte-toi pour continuer l'aventure
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <a
              href="/auth/forgot-password"
              className="text-sm text-indigo-600 font-semibold hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                Se connecter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <a
              href="/auth/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}