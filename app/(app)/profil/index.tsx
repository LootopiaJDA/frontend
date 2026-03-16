import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { chasseService } from '../../../services/api';
import { Colors, Sp, R } from '../../../constants/theme';

type StatutUserChasse = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

interface UserChasse {
  id_userchasse: number;
  id_chasse: number;
  statut: StatutUserChasse;
  started_at: string;
  completed_at?: string;
  chasse?: { name: string; localisation: string; image?: string };
}

const STATUT_CFG: Record<StatutUserChasse, { label: string; color: string; bg: string; icon: string }> = {
  IN_PROGRESS: { label: 'En cours',   color: Colors.gold,     bg: Colors.goldGlow,     icon: 'hourglass-outline' },
  COMPLETED:   { label: 'Terminée',   color: '#22C55E',        bg: '#22C55E18',         icon: 'trophy' },
  ABANDONED:   { label: 'Abandonnée', color: Colors.textMuted, bg: Colors.bgElevated,   icon: 'close-circle-outline' },
};

function StatBox({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
      <View style={[sbS.box, { borderColor: color + '30' }]}>
        <View style={[sbS.icon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={sbS.val}>{value}</Text>
        <Text style={sbS.label}>{label}</Text>
      </View>
  );
}
const sbS = StyleSheet.create({
  box: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, padding: Sp.sm, alignItems: 'center', gap: 4 },
  icon: { width: 36, height: 36, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  val: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  label: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },
});

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [myChasses, setMyChasses] = useState<UserChasse[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const data = await chasseService.myChasses();
        setMyChasses(Array.isArray(data) ? data : []);
      } catch { /* silencieux, endpoint peut ne pas exister encore */ }
      finally { setLoading(false); }
    })();
  }, []));

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/welcome'); },
      },
    ]);
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??';
  const stats = {
    total: myChasses.length,
    completed: myChasses.filter(c => c.statut === 'COMPLETED').length,
    inProgress: myChasses.filter(c => c.statut === 'IN_PROGRESS').length,
  };

  return (
      <View style={styles.bg}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Hero profil */}
            <View style={styles.hero}>
              <View style={styles.heroGlow} />
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.username}>{user?.username}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="game-controller-outline" size={13} color={Colors.accentLight} />
                <Text style={styles.roleText}>Joueur Lootopia</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatBox icon="map" value={stats.total} label="Chasses" color={Colors.gold} />
              <StatBox icon="trophy" value={stats.completed} label="Terminées" color="#22C55E" />
              <StatBox icon="hourglass-outline" value={stats.inProgress} label="En cours" color={Colors.warning} />
            </View>

            {/* Score fictif gamification */}
            <View style={styles.xpCard}>
              <View style={styles.xpLeft}>
                <Ionicons name="star" size={20} color={Colors.gold} />
                <View>
                  <Text style={styles.xpLabel}>Points d'expérience</Text>
                  <Text style={styles.xpValue}>{stats.completed * 250 + stats.inProgress * 50} XP</Text>
                </View>
              </View>
              <View style={styles.xpRank}>
                <Text style={styles.xpRankText}>
                  {stats.completed >= 10 ? '🏆 Explorateur' : stats.completed >= 5 ? '⭐ Aventurier' : '🌱 Débutant'}
                </Text>
              </View>
            </View>

            {/* Mes chasses */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mes aventures</Text>
              {loading ? (
                  <ActivityIndicator color={Colors.gold} style={{ marginTop: Sp.lg }} />
              ) : myChasses.length === 0 ? (
                  <View style={styles.empty}>
                    <Ionicons name="compass-outline" size={40} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>Aucune chasse rejointe</Text>
                    <Text style={styles.emptyText}>Explorez les chasses disponibles et lancez-vous !</Text>
                    <TouchableOpacity
                        style={styles.exploreCta}
                        onPress={() => router.push('/(app)/chasses')}
                    >
                      <Ionicons name="map-outline" size={15} color={Colors.gold} />
                      <Text style={styles.exploreCtaText}>Voir les chasses</Text>
                    </TouchableOpacity>
                  </View>
              ) : (
                  myChasses.map(uc => {
                    const cfg = STATUT_CFG[uc.statut];
                    return (
                        <View key={uc.id_userchasse} style={styles.chasseRow}>
                          <View style={[styles.chasseRowIcon, { backgroundColor: cfg.bg }]}>
                            <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                          </View>
                          <View style={styles.chasseRowInfo}>
                            <Text style={styles.chasseRowName} numberOfLines={1}>
                              {uc.chasse?.name ?? `Chasse #${uc.id_chasse}`}
                            </Text>
                            <Text style={styles.chasseRowDate}>
                              Démarrée le {new Date(uc.started_at).toLocaleDateString('fr-FR')}
                              {uc.completed_at ? ` · Terminée le ${new Date(uc.completed_at).toLocaleDateString('fr-FR')}` : ''}
                            </Text>
                          </View>
                          <View style={[styles.statutBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                            <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
                          </View>
                        </View>
                    );
                  })
              )}
            </View>

            {/* Menu */}
            <View style={styles.menuCard}>
              {[
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
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  </TouchableOpacity>
              ))}
            </View>

            {/* Déco */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={Colors.error} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Lootopia v1.0.0</Text>
          </ScrollView>
        </SafeAreaView>
      </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 100 },
  hero: { backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingTop: Sp.xl, paddingBottom: Sp.xl, alignItems: 'center', gap: Sp.sm, overflow: 'hidden', position: 'relative' },
  heroGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.gold, opacity: 0.05, top: -60 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.goldGlow, borderWidth: 2, borderColor: Colors.gold + '55', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.gold, fontSize: 30, fontWeight: '900' },
  username: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  email: { color: Colors.textSecondary, fontSize: 13 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#5B4BDB18', borderWidth: 1, borderColor: '#5B4BDB44', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 4 },
  roleText: { color: Colors.accentLight, fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: Sp.sm, padding: Sp.lg, paddingBottom: 0 },
  xpCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.gold + '30', padding: Sp.md, marginBottom: 0 },
  xpLeft: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm },
  xpLabel: { color: Colors.textMuted, fontSize: 11 },
  xpValue: { color: Colors.gold, fontSize: 18, fontWeight: '800' },
  xpRank: { backgroundColor: Colors.goldGlow, borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 4 },
  xpRankText: { color: Colors.gold, fontSize: 12, fontWeight: '700' },
  section: { padding: Sp.lg, gap: Sp.sm },
  sectionTitle: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  empty: { alignItems: 'center', gap: Sp.sm, paddingVertical: Sp.xl },
  emptyTitle: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  exploreCta: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '44', borderRadius: R.full, paddingHorizontal: Sp.lg, paddingVertical: Sp.sm, marginTop: Sp.xs },
  exploreCtaText: { color: Colors.gold, fontSize: 14, fontWeight: '700' },
  chasseRow: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, backgroundColor: Colors.bgCard, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, padding: Sp.md },
  chasseRowIcon: { width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  chasseRowInfo: { flex: 1 },
  chasseRowName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  chasseRowDate: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statutBadge: { borderWidth: 1, borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3 },
  statutText: { fontSize: 10, fontWeight: '700' },
  menuCard: { marginHorizontal: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Sp.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Sp.md, gap: Sp.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: R.sm, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, backgroundColor: Colors.errorBg, borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44', padding: Sp.md, marginBottom: Sp.md },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
  version: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', paddingBottom: Sp.xl },
});