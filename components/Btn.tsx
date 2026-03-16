import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, R, Sp } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export default function Btn({ label, onPress, variant = 'primary', loading, disabled, style, small }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[styles.base, styles[variant], small && styles.small, isDisabled && styles.disabled, style]}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? Colors.black : Colors.gold} />
        : <Text style={[styles.label, styles[`${variant}Text` as keyof typeof styles] as any, small && styles.labelSmall]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: R.md,
    paddingVertical: Sp.md,
    paddingHorizontal: Sp.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: { paddingVertical: Sp.sm, paddingHorizontal: Sp.md },
  disabled: { opacity: 0.45 },

  primary: { backgroundColor: Colors.gold },
  secondary: { backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.borderLight },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.gold },
  danger: { backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.borderLight },

  label: { fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
  labelSmall: { fontSize: 13 },
  primaryText: { color: Colors.black },
  secondaryText: { color: Colors.textPrimary },
  ghostText: { color: Colors.gold },
  dangerText: { color: Colors.error },
  outlineText: { color: Colors.textSecondary },
});
