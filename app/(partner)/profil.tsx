import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Sp, R } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';

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
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBg}>
          <View style={styles.headerGlow} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={user.role} />
            {user.partenaire && <StatusBadge status={user.partenaire.statut} />}
          </View>
        </View>

        {/* Partner details */}
        {user.partenaire && (
          <View style={styles.partnerCard}>
            <View style={styles.partnerCardHeader}>
              <Ionicons name="business-outline" size={18} color={Colors.gold} />
              <Text style={styles.partnerCardTitle}>Informations entreprise</Text>
            </View>
            {[
              { label: 'Société', value: user.partenaire.company_name },
              { label: 'SIRET', value: user.partenaire.siret },
              { label: 'Statut', value: user.partenaire.statut === 'ACTIVE' ? 'Actif' : 'En vérification' },
            ].map(row => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoVal}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuCard}>
          {[
            { icon: 'map-outline', label: 'Voir les chasses publiques', onPress: () => router.push('/(app)/chasses') },
            { icon: 'analytics-outline', label: 'Statistiques', onPress: () => {} },
            { icon: 'settings-outline', label: 'Paramètres', onPress: () => {} },
            { icon: 'help-circle-outline', label: 'Aide & Support', onPress: () => {} },
            { icon: 'information-circle-outline', label: 'À propos de Lootopia', onPress: () => {} },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < arr.length - 1 && styles.menuBorder]}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Lootopia Partenaire v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1 },
  headerBg: { backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingTop: 60, paddingBottom: Sp.xl, alignItems: 'center', gap: Sp.sm, overflow: 'hidden', position: 'relative' },
  headerGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.gold, opacity: 0.05, top: -60 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.goldGlow, borderWidth: 2, borderColor: Colors.gold + '44', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.gold, fontSize: 28, fontWeight: '900' },
  username: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  email: { color: Colors.textSecondary, fontSize: 13 },
  badgeRow: { flexDirection: 'row', gap: Sp.sm, marginTop: Sp.xs },
  partnerCard: { margin: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  partnerCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, padding: Sp.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bgElevated },
  partnerCardTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoVal: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  menuCard: { marginHorizontal: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Sp.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: R.sm, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, backgroundColor: Colors.errorBg, borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44', padding: Sp.md },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
  version: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: Sp.lg, paddingBottom: Sp.xl },
});
