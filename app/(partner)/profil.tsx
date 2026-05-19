import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Design, Fonts, Sp, R } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import ScreenBackground from '../../components/ScreenBackground';

export default function PartnerProfil() {
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
        <ScrollView
            contentContainerStyle={st.scroll}
            showsVerticalScrollIndicator={false}
        >

          <PageHeader title="Mon profil" subtitle="Partenaire" />

          {/* HERO */}
          <View style={st.hero}>
            <View style={st.avatar}>
              <Text style={st.avatarText}>{initials}</Text>
            </View>

            <Text style={st.username}>{user.username}</Text>
            <Text style={st.email}>{user.email}</Text>

            <View style={st.badgeRow}>
              <StatusBadge status={user.role} />
              {user.partener && (
                  <StatusBadge status={user.partener.statut} />
              )}
            </View>
          </View>

          {/* INFOS */}
          {user.partener && (
              <View style={st.card}>
                {[
                  { icon: 'business-outline', label: 'Société', value: user.partener.company_name },
                  { icon: 'card-outline', label: 'SIRET', value: user.partener.siret },
                  {
                    icon: 'checkmark-circle-outline',
                    label: 'Statut',
                    value: user.partener.statut === 'ACTIVE' ? 'Actif' : 'En vérification',
                  },
                ].map((row, i, arr) => (
                    <View
                        key={row.label}
                        style={[st.row, i < arr.length - 1 && st.rowBorder]}
                    >
                      <View style={st.rowIcon}>
                        <Ionicons name={row.icon as any} size={16} color={Design.text.label} />
                      </View>

                      <View style={st.rowBody}>
                        <Text style={st.rowLabel}>{row.label}</Text>
                        <Text style={st.rowValue}>{row.value}</Text>
                      </View>
                    </View>
                ))}
              </View>
          )}

          {/* LOGOUT */}
          <TouchableOpacity
              style={st.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={st.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

        </ScrollView>
      </ScreenBackground>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },

  scroll: {
    flexGrow: 1,
    paddingBottom: Sp.xl,
  },

  hero: {
    alignItems: 'center',
    paddingVertical: Sp.xl,
    gap: Sp.sm,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Design.bg.elevated,
    borderWidth: 2,
    borderColor: Colors.gold + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Design.text.accent,
  },

  username: {
    fontFamily: Fonts.display,
    fontSize: 20,
    color: Design.text.heading,
    letterSpacing: 1,
  },

  email: {
    fontFamily: Fonts.title,
    fontSize: 12,
    color: Design.text.meta,
  },

  badgeRow: {
    flexDirection: 'row',
    gap: Sp.sm,
    marginTop: Sp.xs,
  },

  card: {
    marginHorizontal: Sp.lg,
    marginBottom: Sp.lg,
    backgroundColor: Design.bg.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: Design.border.warm,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Sp.md,
    gap: Sp.md,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Design.border.warm,
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: R.sm,
    backgroundColor: Design.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowBody: {
    flex: 1,
  },

  rowLabel: {
    fontFamily: Fonts.title,
    fontSize: 10,
    color: Design.text.meta,
    marginBottom: 2,
    letterSpacing: 0.5,
  },

  rowValue: {
    fontFamily: Fonts.title,
    fontSize: 13,
    color: Design.text.heading,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Sp.sm,
    marginHorizontal: Sp.lg,
    backgroundColor: Design.bg.danger,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.error + '44',
    padding: Sp.md,
  },

  logoutText: {
    fontFamily: Fonts.title,
    color: Colors.error,
    fontSize: 14,
  },
});