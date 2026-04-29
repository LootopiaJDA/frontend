import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts, Sp, R } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import ScreenBackground from '../../components/ScreenBackground';

export default function AdminProfilScreen() {
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

    return (
        <ScreenBackground style={st.safe}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageHeader title="Mon profil" subtitle="Admin" />

                {/* Hero */}
                <View style={st.hero}>
                    <View style={st.avatar}>
                        <Text style={st.avatarText}>{initials}</Text>
                    </View>
                    <Text style={st.username}>{user.username}</Text>
                    <Text style={st.email}>{user.email}</Text>
                    <StatusBadge status="ADMIN" />
                </View>

                {/* Infos */}
                <View style={st.card}>
                    {[
                        { icon: 'person-outline',  label: 'Identifiant', value: user.username },
                        { icon: 'mail-outline',    label: 'Email',       value: user.email },
                        { icon: 'shield-outline',  label: 'Rôle',        value: 'Administrateur' },
                    ].map((row, i, arr) => (
                        <View key={row.label} style={[st.row, i < arr.length - 1 && st.rowBorder]}>
                            <View style={st.rowIcon}>
                                <Ionicons name={row.icon as any} size={16} color={Colors.textSecondary} />
                            </View>
                            <View style={st.rowBody}>
                                <Text style={st.rowLabel}>{row.label}</Text>
                                <Text style={st.rowValue}>{row.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={st.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={st.version}>Lootopia Admin v1.0.0</Text>
            </ScrollView>
        </ScreenBackground>
    );
}

const st = StyleSheet.create({
    safe:       { flex: 1 },

    hero:       { alignItems: 'center', paddingVertical: Sp.xl, gap: Sp.sm },
    avatar:     {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: Colors.errorBg,
        borderWidth: 2, borderColor: Colors.error + '55',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Sp.xs,
    },
    avatarText: { fontFamily: Fonts.display, fontSize: 26, color: Colors.error },
    username:   { fontFamily: Fonts.display, fontSize: 20, color: Colors.textPrimary, letterSpacing: 1 },
    email:      { fontFamily: Fonts.title,   fontSize: 12, color: Colors.textMuted },

    card:       {
        marginHorizontal: Sp.lg, marginBottom: Sp.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
        overflow: 'hidden',
    },
    row:        { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
    rowBorder:  { borderBottomWidth: 1, borderBottomColor: Colors.borderWarm },
    rowIcon:    {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
    },
    rowBody:    { flex: 1 },
    rowLabel:   { fontFamily: Fonts.title, fontSize: 10, color: Colors.textMuted, marginBottom: 2, letterSpacing: 0.5 },
    rowValue:   { fontFamily: Fonts.title, fontSize: 13, color: Colors.textPrimary },

    logoutBtn:  {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Sp.sm, marginHorizontal: Sp.lg,
        backgroundColor: Colors.errorBg,
        borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44',
        padding: Sp.md,
    },
    logoutText: { fontFamily: Fonts.title, color: Colors.error, fontSize: 14 },
    version:    { fontFamily: Fonts.title, color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: Sp.lg, paddingBottom: Sp.xl },
});