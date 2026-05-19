import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Design, Fonts, R, Sp } from '../constants/theme';

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
        ? <ActivityIndicator size="small" color={variant === 'primary' ? Design.button.primary.text : Design.text.accent} />
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
  small:    { paddingVertical: Sp.sm, paddingHorizontal: Sp.md },
  disabled: { opacity: 0.45 },

  primary:  { backgroundColor: Design.button.primary.bg },
  secondary:{ backgroundColor: Design.button.secondary.bg, borderWidth: 1, borderColor: Design.button.secondary.border },
  ghost:    { backgroundColor: Design.button.ghost.bg,     borderWidth: 1, borderColor: Design.button.ghost.border },
  danger:   { backgroundColor: Design.button.danger.bg,   borderWidth: 1, borderColor: Design.button.danger.border },
  outline:  { backgroundColor: Design.button.outline.bg,  borderWidth: 1, borderColor: Design.button.outline.border },

  label:         { fontFamily: Fonts.title, fontSize: 15, letterSpacing: 0.8 },
  labelSmall:    { fontSize: 13 },
  primaryText:   { color: Design.button.primary.text },
  secondaryText: { color: Design.button.secondary.text },
  ghostText:     { color: Design.button.ghost.text },
  dangerText:    { color: Design.button.danger.text },
  outlineText:   { color: Design.button.outline.text },
});
