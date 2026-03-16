import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, R, Sp } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  secure?: boolean;
  keyboard?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  multiline?: boolean;
  lines?: number;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Input({
  label, placeholder, value, onChangeText, error, secure,
  keyboard, autoCapitalize = 'none', multiline, lines, style, icon,
}: Props) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.row,
        focused && styles.focused,
        error && styles.errBorder,
        multiline && { height: 24 * (lines || 4), alignItems: 'flex-start', paddingTop: Sp.md },
      ]}>
        {icon && (
          <Ionicons name={icon} size={17} color={focused ? Colors.gold : Colors.textMuted} style={styles.iconLeft} />
        )}
        <TextInput
          style={[styles.input, multiline && { textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !show}
          keyboardType={keyboard}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={lines}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.eyeBtn}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Sp.md },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Sp.md,
  },
  focused: { borderColor: Colors.gold },
  errBorder: { borderColor: Colors.error },
  iconLeft: { marginRight: 10 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, paddingVertical: Sp.md },
  eyeBtn: { padding: 4 },
  errText: { color: Colors.error, fontSize: 12, marginTop: 5 },
});
