"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, ArrowRight } from "lucide-react";
import { User as UserType } from "@/type";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    userType: "player",
  });

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserType = {
      ...form,
      id: `user_${Date.now()}`,
      userType: form.userType as "player" | "partner",
    };

    const res = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (res.ok) router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-3xl" />

        <form
          onSubmit={handleRegister}
          className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-gray-900">
              Rejoins Lootopia 🚀
            </h1>
            <p className="text-gray-600">
              Crée ton compte et commence la chasse
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Prénom"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nom"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <select
              value={form.userType}
              onChange={(e) =>
                setForm({ ...form, userType: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="player">Joueur</option>
              <option value="partner">Partenaire</option>
            </select>
          </div>

          <button className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition">
            Créer mon compte
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

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
