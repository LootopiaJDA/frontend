import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors, Sp, R } from '@/constants/theme';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';

export default function ProfilJoueurScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) return null;

    const initials = user.username.slice(0, 2).toUpperCase();

    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Déconnexion',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/(auth)/welcome');
                },
            },
        ]);
    };

    const menuItems = [
        { icon: 'trophy-outline',         label: 'Mes scores & récompenses', onPress: () => {} },
        { icon: 'map-outline',            label: 'Chasses en cours',         onPress: () => router.push('/(app)/chasses') },
        { icon: 'notifications-outline',  label: 'Notifications',            onPress: () => {} },
        { icon: 'settings-outline',       label: 'Paramètres',               onPress: () => {} },
        { icon: 'help-circle-outline',    label: 'Aide & Support',           onPress: () => {} },
    ];

    return (
        <SafeAreaView style={st.safe}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageHeader title="Mon profil" subtitle="Joueur" />

                {/* Hero avatar */}
                <View style={st.hero}>
                    <View style={st.avatarWrap}>
                        <View style={st.avatar}>
                            <Text style={st.avatarText}>{initials}</Text>
                        </View>
                        {/* Halo décoratif */}
                        <View style={st.avatarRing} />
                    </View>

                    <Text style={st.username}>{user.username}</Text>
                    <Text style={st.email}>{user.email}</Text>

                    {/* StatusBadge réutilisé ✅ */}
                    <View style={st.badgeRow}>
                        <StatusBadge status={user.role} />
                    </View>
                </View>

                {/* Stats rapides */}
                <View style={st.statsRow}>
                    <View style={st.statItem}>
                        <Text style={st.statVal}>0</Text>
                        <Text style={st.statLabel}>Chasses{'\n'}terminées</Text>
                    </View>
                    <View style={[st.statItem, st.statBorder]}>
                        <Text style={st.statVal}>0</Text>
                        <Text style={st.statLabel}>En{'\n'}cours</Text>
                    </View>
                    <View style={st.statItem}>
                        <Text style={st.statVal}>0</Text>
                        <Text style={st.statLabel}>Points{'\n'}gagnés</Text>
                    </View>
                </View>

                {/* Menu */}
                <View style={st.menuCard}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[st.menuItem, i < menuItems.length - 1 && st.menuBorder]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={st.menuIcon}>
                                <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
                            </View>
                            <Text style={st.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={st.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={st.version}>Lootopia v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },

    // Hero
    hero:       { alignItems: 'center', paddingVertical: Sp.xl, gap: Sp.sm },
    avatarWrap: { position: 'relative', marginBottom: Sp.sm },
    avatar:     {
        width: 88, height: 88, borderRadius: 28,
        backgroundColor: Colors.bgElevated,
        borderWidth: 2, borderColor: Colors.gold + '44',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
    },
    avatarRing: {
        position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
        borderRadius: 34, borderWidth: 1, borderColor: Colors.gold + '20',
    },
    avatarText: { fontSize: 30, fontWeight: '800', color: Colors.gold },
    username:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
    email:      { fontSize: 13, color: Colors.textMuted },
    badgeRow:   { flexDirection: 'row', gap: Sp.sm, marginTop: Sp.xs },

    // Stats
    statsRow:   {
        flexDirection: 'row',
        marginHorizontal: Sp.lg, marginBottom: Sp.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
        overflow: 'hidden',
    },
    statItem:   { flex: 1, alignItems: 'center', padding: Sp.md, gap: 4 },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
    statVal:    { fontSize: 22, fontWeight: '800', color: Colors.gold },
    statLabel:  { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },

    // Menu
    menuCard:   {
        marginHorizontal: Sp.lg, marginBottom: Sp.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
        overflow: 'hidden',
    },
    menuItem:   { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuIcon:   {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel:  { flex: 1, fontSize: 15, color: Colors.textPrimary },

    // Logout
    logoutBtn:  {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Sp.sm, marginHorizontal: Sp.lg,
        backgroundColor: Colors.errorBg,
        borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44',
        padding: Sp.md,
    },
    logoutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
    version:    { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: Sp.lg, paddingBottom: Sp.xl },
});