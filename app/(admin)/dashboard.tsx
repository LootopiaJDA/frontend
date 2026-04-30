import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userService, chasseService, partenaireService } from '../../services/api';
import { Colors, Design, Fonts, Sp, R } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import ScreenBackground from '../../components/ScreenBackground';

type Stats = {
    totalUsers: number;
    totalChasses: number;
    partenairesEnAttente: number;
    partenairesActifs: number;
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0, totalChasses: 0,
        partenairesEnAttente: 0, partenairesActifs: 0,
    });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const [users, chasses, partenaires] = await Promise.all([
                userService.getAll(),
                chasseService.getAll(),
                partenaireService.getAll(),
            ]);
            setStats({
                totalUsers:           users.filter((u: any) => u.role !== 'ADMIN').length,
                totalChasses:         chasses.allChasse?.length ?? 0,
                partenairesEnAttente: partenaires.filter((p: any) => p.statut === 'VERIFICATION').length,
                partenairesActifs:    partenaires.filter((p: any) => p.statut === 'ACTIVE').length,
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
            <ScreenBackground style={st.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground style={st.safe}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

                {/* Header */}
                <View style={st.header}>
                    <View style={st.headerLeft}>
                        <View style={st.adminAvatar}>
                            <Ionicons name="shield" size={22} color={Colors.error} />
                        </View>
                        <View>
                            <Text style={st.headerTitle}>Administration</Text>
                            <Text style={st.headerSub}>Connecté : {user?.username}</Text>
                        </View>
                    </View>
                </View>

                {/* Grille stats */}
                <View style={st.grid}>
                    <TouchableOpacity
                        style={[st.statCard, { borderTopColor: Colors.gold }]}
                        onPress={() => router.navigate('/(admin)/users')}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="people" size={24} color={Colors.gold} />
                        <Text style={st.statVal}>{stats.totalUsers}</Text>
                        <Text style={st.statLabel}>Utilisateurs</Text>
                        <Text style={st.statHint}>Voir →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[st.statCard, { borderTopColor: '#4FC3F7' }]}
                        onPress={() => router.navigate('/(admin)/chasses')}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="map" size={24} color="#4FC3F7" />
                        <Text style={[st.statVal, { color: '#4FC3F7' }]}>{stats.totalChasses}</Text>
                        <Text style={st.statLabel}>Chasses actives</Text>
                        <Text style={[st.statHint, { color: '#4FC3F7' }]}>Voir →</Text>
                    </TouchableOpacity>
                </View>

                <View style={st.grid}>
                    <View style={[st.statCard, { borderTopColor: Colors.error }]}>
                        <Ionicons name="hourglass" size={24} color={Colors.error} />
                        <Text style={[st.statVal, { color: Colors.error }]}>{stats.partenairesEnAttente}</Text>
                        <Text style={st.statLabel}>En attente</Text>
                        <Text style={[st.statHint, { color: Colors.error, opacity: stats.partenairesEnAttente > 0 ? 1 : 0 }]}>
                            ● Action requise
                        </Text>
                    </View>

                    <View style={[st.statCard, { borderTopColor: Colors.success }]}>
                        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                        <Text style={[st.statVal, { color: Colors.success }]}>{stats.partenairesActifs}</Text>
                        <Text style={st.statLabel}>Partenaires actifs</Text>
                        <Text style={st.statHint}> </Text>
                    </View>
                </View>

                {/* Actions */}
                <Text style={st.sectionTitle}>Gestion</Text>

                <View style={st.actionsCard}>
                    <TouchableOpacity
                        style={st.actionRow}
                        onPress={() => router.navigate('/(admin)/users')}
                        activeOpacity={0.7}
                    >
                        <View style={[st.actionIcon, { backgroundColor: Design.bg.warning }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.warning} />
                        </View>
                        <View style={st.actionBody}>
                            <Text style={st.actionLabel}>Valider les partenaires</Text>
                            <Text style={st.actionSub}>
                                {stats.partenairesEnAttente > 0
                                    ? `${stats.partenairesEnAttente} en attente de vérification`
                                    : 'Aucune demande en attente'}
                            </Text>
                        </View>
                        {stats.partenairesEnAttente > 0 && (
                            <View style={st.badge}>
                                <Text style={st.badgeText}>{stats.partenairesEnAttente}</Text>
                            </View>
                        )}
                        <Ionicons name="chevron-forward" size={16} color={Design.text.meta} />
                    </TouchableOpacity>

                    <View style={st.separator} />

                    <TouchableOpacity
                        style={st.actionRow}
                        onPress={() => router.navigate('/(admin)/users')}
                        activeOpacity={0.7}
                    >
                        <View style={[st.actionIcon, { backgroundColor: Design.bg.gold }]}>
                            <Ionicons name="people-outline" size={20} color={Colors.gold} />
                        </View>
                        <View style={st.actionBody}>
                            <Text style={st.actionLabel}>Gérer les utilisateurs</Text>
                            <Text style={st.actionSub}>{stats.totalUsers} comptes enregistrés</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Design.text.meta} />
                    </TouchableOpacity>

                    <View style={st.separator} />

                    <TouchableOpacity
                        style={st.actionRow}
                        onPress={() => router.navigate('/(admin)/chasses')}
                        activeOpacity={0.7}
                    >
                        <View style={[st.actionIcon, { backgroundColor: 'rgba(79,195,247,0.1)' }]}>
                            <Ionicons name="map-outline" size={20} color="#4FC3F7" />
                        </View>
                        <View style={st.actionBody}>
                            <Text style={st.actionLabel}>Voir les chasses</Text>
                            <Text style={st.actionSub}>{stats.totalChasses} chasses actives</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Design.text.meta} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </ScreenBackground>
    );
}

const st = StyleSheet.create({
    safe:   { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: Sp.lg, paddingBottom: 100, gap: Sp.md },

    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: Sp.sm,
    },
    headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: Sp.md },
    adminAvatar: {
        width: 46, height: 46, borderRadius: R.md,
        backgroundColor: Design.bg.danger,
        borderWidth: 1, borderColor: Colors.error + '44',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontFamily: Fonts.display, fontSize: 18, color: Design.text.heading, letterSpacing: 1 },
    headerSub:   { fontFamily: Fonts.title,   fontSize: 11, color: Design.text.meta, marginTop: 2 },

    grid: { flexDirection: 'row', gap: Sp.md },

    statCard: {
        flex: 1, backgroundColor: Design.bg.card,
        borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm,
        borderTopWidth: 2, padding: Sp.md,
        alignItems: 'center', gap: 4,
    },
    statVal:   { fontFamily: Fonts.display, fontSize: 26, color: Design.text.heading, marginTop: 4 },
    statLabel: { fontFamily: Fonts.title,   fontSize: 10, color: Design.text.meta, textAlign: 'center' },
    statHint:  { fontFamily: Fonts.title,   fontSize: 9,  color: Design.text.accent, marginTop: 2, letterSpacing: 0.5 },

    sectionTitle: {
        fontFamily: Fonts.title, fontSize: 9, fontWeight: '700', color: Design.text.danger,
        letterSpacing: 2, textTransform: 'uppercase', marginTop: Sp.sm,
    },

    actionsCard: {
        backgroundColor: Design.bg.card,
        borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm,
        overflow: 'hidden',
    },
    actionRow:   { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
    actionIcon:  { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
    actionBody:  { flex: 1 },
    actionLabel: { fontFamily: Fonts.title, fontSize: 13, color: Design.text.heading },
    actionSub:   { fontFamily: Fonts.title, fontSize: 11, color: Design.text.meta, marginTop: 2 },
    separator:   { height: 1, backgroundColor: Design.border.warm, marginLeft: Sp.md + 44 + Sp.md },

    badge:     { backgroundColor: Colors.error, borderRadius: R.full, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
    badgeText: { fontFamily: Fonts.title, color: '#fff', fontSize: 11 },
});
