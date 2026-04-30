import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Design, Fonts, R } from '../constants/theme';

export default function StatusBadge({ status }: { status: string }) {
  const cfg = (Design.status as any)[status] ?? {
    label: status,
    color: Design.text.label,
    bg:    Design.border.default,
  };
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
  dot:  { width: 5, height: 5, borderRadius: 3 },
  text: { fontFamily: Fonts.title, fontSize: 10, letterSpacing: 0.5 },
});
