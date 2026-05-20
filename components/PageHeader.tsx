import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Design, Fonts, Sp, R } from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, back, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.left}>
          {back && (
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Design.text.heading} />
            </TouchableOpacity>
          )}
          <View style={styles.textBlock}>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        {right && <View>{right}</View>}
      </View>

      {/* Décoration dorée */}
      <View style={styles.divider}>
        <View style={styles.divLine} />
        <View style={styles.divGem} />
        <View style={styles.divLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Sp.lg,
    paddingTop: 60,
    paddingBottom: Sp.md,
    gap: Sp.sm,
  },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left:      { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, flex: 1 },
  textBlock: { flex: 1 },

  backBtn: {
    width: 38, height: 38, borderRadius: R.sm,
    backgroundColor: Design.avatar.bg,
    borderWidth: 1, borderColor: Design.border.warm,
    alignItems: 'center', justifyContent: 'center',
  },

  subtitle: {
    fontFamily: Fonts.title,
    color: Design.text.warm,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    fontFamily: Fonts.display,
    color: Design.text.heading,
    fontSize: 26,
    letterSpacing: 1,
    lineHeight: 32,
  },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.gold + '30' },
  divGem:  {
    width: 6, height: 6, borderRadius: 1,
    backgroundColor: Colors.gold + '55',
    transform: [{ rotate: '45deg' }],
  },
});
