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
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

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
    <View style={s.bg}>
      <View style={s.glowTop} />
      <View style={s.glowBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView>

            {/* Bouton retour */}
            <TouchableOpacity style={s.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={s.header}>
              <View style={s.iconWrap}>
                <Ionicons name="compass" size={28} color={Colors.gold} />
              </View>
              <Text style={s.title}>Connexion</Text>
              <Text style={s.sub}>Bienvenue de retour, explorateur</Text>
            </View>

            {/* Formulaire */}
            <View style={s.form}>
              <Input
                label="Adresse email"
                placeholder="vous@example.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboard="email-address"
                icon="mail-outline"
                autoCapitalize="none"
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
                style={{ marginTop: Sp.md }}
              />
            </View>

            {/* Séparateur */}
            <View style={s.sep}>
              <View style={s.sepLine} />
              <Text style={s.sepText}>ou</Text>
              <View style={s.sepLine} />
            </View>

            {/* Liens */}
            <View style={s.links}>
              <Text style={s.linkText}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={s.linkAccent}> S'inscrire</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.partnerLink} onPress={() => router.push('/(auth)/register-partner')}>
              <Ionicons name="business-outline" size={14} color={Colors.textMuted} />
              <Text style={s.partnerLinkText}>Rejoindre en tant que partenaire</Text>
            </TouchableOpacity>

          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  bg:         { flex: 1, backgroundColor: Colors.bg },
  glowTop:    { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: Colors.gold, opacity: 0.04, top: -100, right: -60 },
  glowBottom: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.accent, opacity: 0.04, bottom: 0, left: -60 },

  scroll: { flexGrow: 1, padding: Sp.lg, paddingTop: Sp.xl },

  back: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Sp.xl,
  },

  header: { marginBottom: Sp.xl, gap: Sp.sm },
  iconWrap: {
    width: 60, height: 60, borderRadius: R.xl,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.gold + '33',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Sp.sm,
  },
  title: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  sub:   { fontSize: 15, color: Colors.textSecondary },

  form: { gap: Sp.xs },

  sep:     { flexDirection: 'row', alignItems: 'center', gap: Sp.md, marginVertical: Sp.lg },
  sepLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  sepText: { color: Colors.textMuted, fontSize: 12 },

  links:      { flexDirection: 'row', justifyContent: 'center', marginBottom: Sp.md },
  linkText:   { color: Colors.textSecondary, fontSize: 14 },
  linkAccent: { color: Colors.gold, fontSize: 14, fontWeight: '700' },

  partnerLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Sp.xs, paddingVertical: Sp.sm,
  },
  partnerLinkText: { color: Colors.textMuted, fontSize: 13 },
});
