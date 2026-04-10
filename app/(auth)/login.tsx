import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { Colors, Sp, R } from '../../constants/theme';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide';
    if (!password) e.password = 'Mot de passe requis';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Connexion échouée', err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.glow} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView>
            {/* Back */}
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Ionicons name="key-outline" size={26} color={Colors.gold} />
              </View>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.sub}>Bienvenue de retour, explorateur</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Adresse email"
                placeholder="vous@example.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboard="email-address"
                icon="mail-outline"
              />
              <Input
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secure
                icon="lock-closed-outline"
              />

              <Btn
                label="Se connecter"
                onPress={handleLogin}
                loading={loading}
                style={{ marginTop: Sp.sm }}
              />
            </View>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>ou</Text>
              <View style={styles.sepLine} />
            </View>

            {/* Links */}
            <View style={styles.links}>
              <Text style={styles.linkText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.linkAccent}>S'inscrire</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.partnerLink} onPress={() => router.push('/(auth)/register-partner')}>
              <Ionicons name="business-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.partnerLinkText}>Rejoindre en tant que partenaire</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.gold,
    opacity: 0.04,
    top: -100,
    right: -80,
  },
  scroll: { flexGrow: 1, padding: Sp.lg, paddingTop: Sp.xl },
  back: {
    width: 38,
    height: 38,
    borderRadius: R.sm,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sp.xl,
  },
  header: { marginBottom: Sp.xl },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: R.lg,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sp.md,
  },
  title: { color: Colors.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  sub: { color: Colors.textSecondary, fontSize: 15 },
  form: {},
  separator: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, marginVertical: Sp.lg },
  sepLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  sepText: { color: Colors.textMuted, fontSize: 12 },
  links: { flexDirection: 'row', justifyContent: 'center', marginBottom: Sp.md },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  linkAccent: { color: Colors.gold, fontSize: 14, fontWeight: '600' },
  partnerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Sp.xs,
    paddingVertical: Sp.sm,
  },
  partnerLinkText: { color: Colors.textMuted, fontSize: 13 },
});
