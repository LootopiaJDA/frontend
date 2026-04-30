import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Design, Fonts, Sp, R } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import ScreenBackground from '../../components/ScreenBackground';

export default function PartnerProfil() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  if (!user) return null;
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={st.headerBg}>
          <View style={st.headerGlow} />
          <View style={st.avatar}>
            <Text style={st.avatarText}>{initials}</Text>
          </View>
          <Text style={st.username}>{user.username}</Text>
          <Text style={st.email}>{user.email}</Text>
          <View style={st.badgeRow}>
            <StatusBadge status={user.role} />
            {user.partener && <StatusBadge status={user.partener.statut} />}
          </View>
        </View>

        {user.partener && (
          <View style={st.partnerCard}>
            <View style={st.partnerCardHeader}>
              <Ionicons name="business-outline" size={18} color={Design.text.accent} />
              <Text style={st.partnerCardTitle}>Informations entreprise</Text>
            </View>
            {[
              { label: 'Société', value: user.partener.company_name },
              { label: 'SIRET',   value: user.partener.siret },
              { label: 'Statut',  value: user.partener.statut === 'ACTIVE' ? 'Actif' : 'En vérification' },
            ].map(row => (
              <View key={row.label} style={st.infoRow}>
                <Text style={st.infoLabel}>{row.label}</Text>
                <Text style={st.infoVal}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu */}
        <View style={st.menuCard}>
          {[
            { icon: 'map-outline',                  label: 'Voir les chasses publiques', onPress: () => router.push('/(app)/chasses') },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[st.menuItem, i < arr.length - 1 && st.menuBorder]}
              onPress={item.onPress}
            >
              <View style={st.menuIcon}>
                <Ionicons name={item.icon as any} size={18} color={Design.text.label} />
              </View>
              <Text style={st.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={15} color={Design.text.meta} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={st.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={st.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  scroll: { flexGrow: 1 },

  headerBg: {
    backgroundColor: Design.bg.card, borderBottomWidth: 1, borderBottomColor: Design.border.warm,
    paddingTop: 60, paddingBottom: Sp.xl,
    alignItems: 'center', gap: Sp.sm,
    overflow: 'hidden', position: 'relative',
  },
  headerGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.gold, opacity: 0.05, top: -60,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Design.bg.gold,
    borderWidth: 2, borderColor: Colors.gold + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:  { fontFamily: Fonts.display, color: Design.text.accent, fontSize: 26 },
  username:    { fontFamily: Fonts.display, color: Design.text.heading, fontSize: 20, letterSpacing: 1 },
  email:       { fontFamily: Fonts.title,   color: Design.text.meta, fontSize: 12 },
  badgeRow:    { flexDirection: 'row', gap: Sp.sm, marginTop: Sp.xs },

  partnerCard: {
    margin: Sp.lg, backgroundColor: Design.bg.card,
    borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm, overflow: 'hidden',
  },
  partnerCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
    padding: Sp.md, borderBottomWidth: 1, borderBottomColor: Design.border.warm,
    backgroundColor: Design.bg.elevated,
  },
  partnerCardTitle: { fontFamily: Fonts.title, color: Design.text.heading, fontSize: 13, letterSpacing: 0.5 },
  infoRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.md, borderBottomWidth: 1, borderBottomColor: Design.border.warm },
  infoLabel:{ fontFamily: Fonts.title, color: Design.text.meta, fontSize: 11, letterSpacing: 0.5 },
  infoVal:  { fontFamily: Fonts.title, color: Design.text.heading, fontSize: 12 },

  menuCard: {
    marginHorizontal: Sp.lg, marginBottom: Sp.lg,
    backgroundColor: Design.bg.card,
    borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm, overflow: 'hidden',
  },
  menuItem:   { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Design.border.warm },
  menuIcon:   { width: 34, height: 34, borderRadius: R.sm, backgroundColor: Design.bg.elevated, alignItems: 'center', justifyContent: 'center' },
  menuLabel:  { flex: 1, fontFamily: Fonts.title, color: Design.text.heading, fontSize: 13 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Sp.sm, marginHorizontal: Sp.lg,
    backgroundColor: Design.bg.danger,
    borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44',
    padding: Sp.md,
  },
  logoutText: { fontFamily: Fonts.title, color: Colors.error, fontSize: 14 },
  version:    { fontFamily: Fonts.title, color: Design.text.meta, fontSize: 11, textAlign: 'center', marginTop: Sp.lg, paddingBottom: Sp.xl },
});
