import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet,
  ActivityIndicator, ViewStyle, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Design, Fonts, R, Sp } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Btn({
  label, onPress, variant = 'primary',
  loading, disabled, style, small, icon,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.78}
      style={[
        styles.base,
        styles[variant],
        small && styles.small,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Design.button.primary.text : Design.text.accent}
        />
      ) : (
        <View style={styles.inner}>
          {icon && (
            <Ionicons
              name={icon}
              size={small ? 14 : 16}
              color={(styles[`${variant}Text` as keyof typeof styles] as any)?.color ?? Design.text.accent}
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={[
            styles.label,
            styles[`${variant}Text` as keyof typeof styles] as any,
            small && styles.labelSmall,
          ]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: R.full,
    paddingVertical: Sp.md,
    paddingHorizontal: Sp.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  small:     { paddingVertical: Sp.sm, paddingHorizontal: Sp.md },
  disabled:  { opacity: 0.42 },

  primary:   {
    backgroundColor: Design.button.primary.bg,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 12,
    elevation: 7,
  },
  secondary: { backgroundColor: Design.button.secondary.bg, borderWidth: 1, borderColor: Design.button.secondary.border },
  ghost:     { backgroundColor: Design.button.ghost.bg,     borderWidth: 1, borderColor: Design.button.ghost.border },
  danger:    { backgroundColor: Design.button.danger.bg,    borderWidth: 1, borderColor: Design.button.danger.border },
  outline:   { backgroundColor: Design.button.outline.bg,   borderWidth: 1, borderColor: Design.button.outline.border },

  label:         { fontFamily: Fonts.title, fontSize: 14, letterSpacing: 1.5 },
  labelSmall:    { fontSize: 12, letterSpacing: 1 },
  primaryText:   { color: Design.button.primary.text },
  secondaryText: { color: Design.button.secondary.text },
  ghostText:     { color: Design.button.ghost.text },
  dangerText:    { color: Design.button.danger.text },
  outlineText:   { color: Design.button.outline.text },
});
