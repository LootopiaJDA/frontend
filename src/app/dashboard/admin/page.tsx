"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
    Users,
    MapPin,
    Trophy,
    Building2,
    TrendingUp,
    Activity,
    AlertCircle,
    CheckCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    Plus,
    Search,
    Filter,
} from "lucide-react";

export default function AdminDashboard() {
    const { user, token, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "hunts" | "partners">("overview");
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalHunts: 0,
        totalPartners: 0,
        activeHunts: 0,
    });

    useEffect(() => {
        if (!loading && (!user || user.role !== "ADMIN")) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Bienvenue, {user.username}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Administrateur
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
                    <div className="flex gap-1">
                        <TabButton
                            active={activeTab === "overview"}
                            onClick={() => setActiveTab("overview")}
                            icon={<Activity className="w-4 h-4" />}
                        >
                            Vue d'ensemble
                        </TabButton>
                        <TabButton
                            active={activeTab === "users"}
                            onClick={() => setActiveTab("users")}
                            icon={<Users className="w-4 h-4" />}
                        >
                            Utilisateurs
                        </TabButton>
                        <TabButton
                            active={activeTab === "hunts"}
                            onClick={() => setActiveTab("hunts")}
                            icon={<MapPin className="w-4 h-4" />}
                        >
                            Chasses
                        </TabButton>
                        <TabButton
                            active={activeTab === "partners"}
                            onClick={() => setActiveTab("partners")}
                            icon={<Building2 className="w-4 h-4" />}
                        >
                            Partenaires
                        </TabButton>
                    </div>
                </div>

                {/* Content */}
                {activeTab === "overview" && <OverviewTab stats={stats} />}
                {activeTab === "users" && <UsersTab token={token} />}
                {activeTab === "hunts" && <HuntsTab token={token} />}
                {activeTab === "partners" && <PartnersTab token={token} />}
            </div>
        </div>
    );
}

/* =========================
   TAB BUTTON
========================= */
function TabButton({
    active,
    onClick,
    icon,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${active
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
        >
            {icon}
            {children}
        </button>
    );
}

/* =========================
   OVERVIEW TAB
========================= */
function OverviewTab({ stats }: { stats: any }) {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Utilisateurs"
                    value="1,247"
                    change="+12%"
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard
                    title="Chasses actives"
                    value="23"
                    change="+5"
                    icon={<MapPin className="w-6 h-6" />}
                    color="green"
                />
                <StatCard
                    title="Partenaires"
                    value="87"
                    change="+8"
                    icon={<Building2 className="w-6 h-6" />}
                    color="purple"
                />
                <StatCard
                    title="Récompenses"
                    value="342"
                    change="+23%"
                    icon={<Trophy className="w-6 h-6" />}
                    color="orange"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Activité récente</h2>
                <div className="space-y-4">
                    <ActivityItem
                        type="success"
                        message="Nouvelle chasse créée par Partner Café"
                        time="Il y a 5 minutes"
                    />
                    <ActivityItem
                        type="info"
                        message="15 nouveaux utilisateurs inscrits"
                        time="Il y a 2 heures"
                    />
                    <ActivityItem
                        type="warning"
                        message="Chasse 'Paris Explorer' expire demain"
                        time="Il y a 4 heures"
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    change,
    icon,
    color,
}: {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    color: string;
}) {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    }[color];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {change}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses}`}>{icon}</div>
            </div>
        </div>
    );
}

function ActivityItem({
    type,
    message,
    time,
}: {
    type: "success" | "info" | "warning";
    message: string;
    time: string;
}) {
    const icon = {
        success: <CheckCircle className="w-5 h-5 text-green-600" />,
        info: <AlertCircle className="w-5 h-5 text-blue-600" />,
        warning: <AlertCircle className="w-5 h-5 text-orange-600" />,
    }[type];

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            {icon}
            <div className="flex-1">
                <p className="text-sm text-gray-900">{message}</p>
                <p className="text-xs text-gray-500 mt-1">{time}</p>
            </div>
        </div>
    );
}

/* =========================
   USERS TAB
========================= */
function UsersTab({ token }: { token: string | null }) {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                    <Filter className="w-4 h-4" />
                    Filtres
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Utilisateur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Inscription
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <UserRow
                            name="Alice Martin"
                            email="alice@example.com"
                            role="JOUEUR"
                            status="active"
                            date="15 Jan 2025"
                        />
                        <UserRow
                            name="Bob Dupont"
                            email="bob@partner.com"
                            role="PARTENAIRE"
                            status="active"
                            date="12 Jan 2025"
                        />
                        <UserRow
                            name="Claire Bernard"
                            email="claire@example.com"
                            role="JOUEUR"
                            status="inactive"
                            date="10 Jan 2025"
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UserRow({
    name,
    email,
    role,
    status,
    date,
}: {
    name: string;
    email: string;
    role: string;
    status: string;
    date: string;
}) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
                <div>
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {role}
                </span>
            </td>
            <td className="px-6 py-4">
                <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {status === "active" ? "Actif" : "Inactif"}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{date}</td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* =========================
   HUNTS TAB
========================= */
function HuntsTab({ token }: { token: string | null }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Gestion des chasses</h2>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    Nouvelle chasse
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HuntCard
                    title="Paris Explorer"
                    partner="Café de Paris"
                    status="active"
                    participants={142}
                    endDate="20 Jan 2025"
                />
                <HuntCard
                    title="Lyon Discovery"
                    partner="Restaurant Le Gourmet"
                    status="active"
                    participants={89}
                    endDate="25 Jan 2025"
                />
                <HuntCard
                    title="Marseille Adventure"
                    partner="Bar Le Port"
                    status="pending"
                    participants={0}
                    endDate="30 Jan 2025"
                />
            </div>
        </div>
    );
}

function HuntCard({
    title,
    partner,
    status,
    participants,
    endDate,
}: {
    title: string;
    partner: string;
    status: string;
    participants: number;
    endDate: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{partner}</p>
                </div>
                <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                >
                    {status === "active" ? "Active" : "En attente"}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Participants</span>
                    <span className="font-medium text-gray-900">{participants}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date de fin</span>
                    <span className="font-medium text-gray-900">{endDate}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                    Modifier
                </button>
                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">
                    Supprimer
                </button>
            </div>
        </div>
    );
}

/* =========================
   PARTNERS TAB
========================= */
function PartnersTab({ token }: { token: string | null }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Gestion des partenaires</h2>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    Nouveau partenaire
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PartnerCard
                    name="Café de Paris"
                    type="Restaurant"
                    hunts={3}
                    status="verified"
                />
                <PartnerCard
                    name="Restaurant Le Gourmet"
                    type="Restaurant"
                    hunts={2}
                    status="verified"
                />
                <PartnerCard name="Bar Le Port" type="Bar" hunts={1} status="pending" />
            </div>
        </div>
    );
}

function PartnerCard({
    name,
    type,
    hunts,
    status,
}: {
    name: string;
    type: string;
    hunts: number;
    status: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${status === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                >
                    {status === "verified" ? "Vérifié" : "En attente"}
                </span>
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-600 mb-4">{type}</p>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{hunts} chasse(s) créée(s)</span>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                    Voir détails
                </button>
            </div>
        </div>
    );
}