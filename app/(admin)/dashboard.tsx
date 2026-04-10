import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userService, chasseService } from '../../services/api';
import { Colors, Sp, R } from '../../constants/theme';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

type Stats = {
    totalUsers: number;
    totalChasses: number;
    partenairesEnAttente: number;
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalChasses: 0, partenairesEnAttente: 0 });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const [users, chasses] = await Promise.all([
                userService.getAll(),
                chasseService.getAll(),
            ]);
            setStats({
                totalUsers:           users.length,
                totalChasses:         chasses.allChasse?.length ?? 0,
                partenairesEnAttente: 0,
            });
        } catch (err) {
            console.log('Erreur stats admin:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (loading) {
        return (
            <View style={st.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        );
    }

    const statCards = [
        { label: 'Utilisateurs',          value: stats.totalUsers,           icon: 'people-outline',   color: Colors.gold },
        { label: 'Chasses totales',        value: stats.totalChasses,         icon: 'map-outline',      color: '#4FC3F7' },
        { label: 'Partenaires en attente', value: stats.partenairesEnAttente, icon: 'hourglass-outline',color: Colors.error },
    ];

    return (
        <SafeAreaView style={st.safe}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* PageHeader ✅ */}
                <PageHeader title="Administration" subtitle="Lootopia" />

                {/* Badge admin */}
                <View style={st.adminBadge}>
                    <StatusBadge status="ADMIN" />
                    <Text style={st.adminName}>Connecté : {user?.username}</Text>
                </View>

                {/* Stat cards */}
                <View style={st.statsGrid}>
                    {statCards.map(card => (
                        <View key={card.label} style={[st.statCard, { borderTopColor: card.color }]}>
                            <Ionicons name={card.icon as any} size={22} color={card.color} />
                            <Text style={st.statVal}>{card.value}</Text>
                            <Text style={st.statLabel}>{card.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Section actions rapides */}
                <Text style={st.sectionTitle}>Actions rapides</Text>
                <View style={st.actionsCard}>
                    {[
                        {
                            icon: 'shield-checkmark-outline',
                            label: 'Valider les partenaires',
                            sub: `${stats.partenairesEnAttente} en attente de vérification`,
                            color: Colors.warning,
                            bg: Colors.warningBg,
                        },
                        {
                            icon: 'people-outline',
                            label: 'Gérer les utilisateurs',
                            sub: `${stats.totalUsers} comptes enregistrés`,
                            color: Colors.gold,
                            bg: Colors.goldGlow,
                        },
                        {
                            icon: 'map-outline',
                            label: 'Modérer les chasses',
                            sub: `${stats.totalChasses} chasses créées`,
                            color: '#4FC3F7',
                            bg: 'rgba(79,195,247,0.1)',
                        },
                    ].map((action, i, arr) => (
                        <TouchableOpacity
                            key={action.label}
                            style={[st.actionRow, i < arr.length - 1 && st.actionBorder]}
                            activeOpacity={0.7}
                        >
                            <View style={[st.actionIcon, { backgroundColor: action.bg }]}>
                                <Ionicons name={action.icon as any} size={20} color={action.color} />
                            </View>
                            <View style={st.actionBody}>
                                <Text style={st.actionLabel}>{action.label}</Text>
                                <Text style={st.actionSub}>{action.sub}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:         { flex: 1, backgroundColor: Colors.bg },
    center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },

    adminBadge:   { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingHorizontal: Sp.lg, marginBottom: Sp.lg },
    adminName:    { fontSize: 13, color: Colors.textMuted },

    // Stats
    statsGrid:    { flexDirection: 'row', gap: Sp.md, paddingHorizontal: Sp.lg, marginBottom: Sp.lg },
    statCard:     {
        flex: 1, backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
        borderTopWidth: 2, padding: Sp.md,
        alignItems: 'center', gap: 6,
    },
    statVal:      { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
    statLabel:    { fontSize: 10, color: Colors.textMuted, textAlign: 'center', letterSpacing: 0.3 },

    sectionTitle: {
        fontSize: 10, fontWeight: '700', color: Colors.gold,
        letterSpacing: 1.5, textTransform: 'uppercase',
        marginHorizontal: Sp.lg, marginBottom: Sp.md,
    },

    // Actions
    actionsCard:  {
        marginHorizontal: Sp.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
        overflow: 'hidden',
    },
    actionRow:    { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
    actionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    actionIcon:   { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
    actionBody:   { flex: 1 },
    actionLabel:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    actionSub:    { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});