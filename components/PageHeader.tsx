import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Design, Fonts, Sp, R } from '../constants/theme';

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
      <View style={styles.left}>
        {back && (
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Design.text.heading} />
          </TouchableOpacity>
        )}
        <View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sp.lg,
    paddingTop: 60,
    paddingBottom: Sp.md,
  },
  left:    { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, flex: 1 },
  backBtn: {
    width: 38, height: 38, borderRadius: R.sm,
    backgroundColor: Design.avatar.bg,
    borderWidth: 1, borderColor: Design.border.warm,
    alignItems: 'center', justifyContent: 'center',
  },
  subtitle: {
    fontFamily: Fonts.title,
    color: Design.text.warm,
    fontSize: 15,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: { fontFamily: Fonts.title, color: Design.text.heading, fontSize: 30, letterSpacing: 1 },
});
