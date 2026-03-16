import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, R, Sp } from '../constants/theme';
import { StatutChasse } from '../constants/types';

const CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:       { label: 'Active',      color: Colors.success, bg: Colors.successBg },
  PENDING:      { label: 'En attente',  color: Colors.warning, bg: Colors.warningBg },
  COMPLETED:    { label: 'Terminée',    color: Colors.textSecondary, bg: Colors.border },
  VERIFICATION: { label: 'Vérification',color: Colors.warning, bg: Colors.warningBg },
  INACTIVE:     { label: 'Inactif',     color: Colors.error,   bg: Colors.errorBg },
  JOUEUR:       { label: 'Joueur',      color: Colors.accentLight, bg: '#5B4BDB22' },
  PARTENAIRE:   { label: 'Partenaire',  color: Colors.gold,    bg: Colors.goldGlow },
  ADMIN:        { label: 'Admin',       color: Colors.error,   bg: Colors.errorBg },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status] ?? { label: status, color: Colors.textSecondary, bg: Colors.border };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.full,
    alignSelf: 'flex-start',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
