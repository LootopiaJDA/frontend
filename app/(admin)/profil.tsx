import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Sp, R } from '../../constants/theme';

export default function AdminProfil() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Quitter l\'interface admin ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Déconnexion', style: 'destructive',
                onPress: async () => { await logout(); router.replace('/(auth)/welcome'); },
            },
        ]);
    };

    const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AD';

    return (
        <View style={styles.bg}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <View style={styles.hero}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <Text style={styles.name}>{user?.username}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                        <View style={styles.adminBadge}>
                            <Ionicons name="shield-checkmark" size={14} color={Colors.gold} />
                            <Text style={styles.adminBadgeText}>ADMINISTRATEUR</Text>
                        </View>
                    </View>

                    <View style={styles.menuCard}>
                        {[
                            { icon: 'stats-chart-outline', label: 'Vue d\'ensemble', route: '/(admin)/dashboard' },
                            { icon: 'people-outline', label: 'Gérer les utilisateurs', route: '/(admin)/users' },
                            { icon: 'business-outline', label: 'Gérer les partenaires', route: '/(admin)/partenaires' },
                            { icon: 'map-outline', label: 'Gérer les chasses', route: '/(admin)/chasses' },
                        ].map((item, i, arr) => (
                            <TouchableOpacity
                                key={item.label}
                                style={[styles.menuItem, i < arr.length - 1 && styles.menuBorder]}
                                onPress={() => router.push(item.route as any)}
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name={item.icon as any} size={18} color={Colors.gold} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                        <Text style={styles.logoutText}>Se déconnecter</Text>
                    </TouchableOpacity>

                    <Text style={styles.version}>Lootopia Admin v1.0.0</Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    scroll: { paddingBottom: 100 },
    hero: { backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingTop: Sp.xl, paddingBottom: Sp.xl, alignItems: 'center', gap: Sp.sm },
    avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.goldGlow, borderWidth: 2, borderColor: Colors.gold + '55', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: Colors.gold, fontSize: 30, fontWeight: '900' },
    name: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
    email: { color: Colors.textSecondary, fontSize: 13 },
    adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 5 },
    adminBadgeText: { color: Colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
    menuCard: { margin: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuIcon: { width: 36, height: 36, borderRadius: R.md, backgroundColor: Colors.goldGlow, alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, backgroundColor: Colors.errorBg, borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44', padding: Sp.md, marginBottom: Sp.md },
    logoutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
    version: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', paddingBottom: Sp.xl },
});