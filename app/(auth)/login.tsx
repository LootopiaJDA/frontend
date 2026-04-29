import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import ScreenBackground from '../../components/ScreenBackground';
import { Colors, Fonts, Sp, R } from '../../constants/theme';

const BOUSSOLE = require('../../assets/images/boussole.png');

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
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
    setApiError('');
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      router.replace('/');
    } catch (err: any) {
      setApiError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      {/* Halos */}
      <View style={s.glowTop} />
      <View style={s.glowBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView>

            <TouchableOpacity style={s.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={s.header}>
              {/* Boussole circulaire */}
              <View style={s.compassWrap}>
                <Image source={BOUSSOLE} style={s.compassImg} resizeMode="cover" />
              </View>
              <Text style={s.title}>Connexion</Text>
              <Text style={s.sub}>Bienvenue de retour, explorateur</Text>
            </View>

            {/* Erreur API */}
            {!!apiError && (
              <View style={s.errorBanner}>
                <Ionicons name="warning-outline" size={16} color={Colors.error} />
                <Text style={s.errorBannerText}>{apiError}</Text>
              </View>
            )}

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
              <Btn label="Se connecter" onPress={handleLogin} loading={loading} style={{ marginTop: Sp.md }} />
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
    </ScreenBackground>
  );
}

const COMPASS_SIZE = 70;

const s = StyleSheet.create({
  glowTop:    { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: Colors.amber, opacity: 0.06, top: -100, right: -60 },
  glowBottom: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.gold,  opacity: 0.04, bottom: 0, left: -60 },

  scroll: { flexGrow: 1, padding: Sp.lg, paddingTop: Sp.xl },

  back: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.borderWarm,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Sp.xl,
  },

  header: { marginBottom: Sp.xl, gap: Sp.sm },

  compassWrap: {
    width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.gold + '55',
    marginBottom: Sp.sm,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 10,
    elevation: 6,
  },
  compassImg: { width: '100%', height: '100%' },

  title: { fontFamily: Fonts.display, fontSize: 28, color: Colors.textPrimary, letterSpacing: 3 },
  sub:   { fontFamily: Fonts.title, fontSize: 13, color: Colors.textSecondary, letterSpacing: 0.5 },

  form: { gap: Sp.xs },

  sep:     { flexDirection: 'row', alignItems: 'center', gap: Sp.md, marginVertical: Sp.lg },
  sepLine: { flex: 1, height: 1, backgroundColor: Colors.borderWarm },
  sepText: { fontFamily: Fonts.title, color: Colors.textMuted, fontSize: 11, letterSpacing: 1 },

  links:      { flexDirection: 'row', justifyContent: 'center', marginBottom: Sp.md },
  linkText:   { fontFamily: Fonts.title, color: Colors.textSecondary, fontSize: 13 },
  linkAccent: { fontFamily: Fonts.title, color: Colors.gold, fontSize: 13 },

  partnerLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Sp.xs, paddingVertical: Sp.sm,
  },
  partnerLinkText: { fontFamily: Fonts.title, color: Colors.textMuted, fontSize: 12 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.xs,
    backgroundColor: Colors.error + '18',
    borderWidth: 1, borderColor: Colors.error + '55',
    borderRadius: R.md, padding: Sp.md, marginBottom: Sp.md,
  },
  errorBannerText: { flex: 1, color: Colors.error, fontSize: 13, fontFamily: Fonts.title },
});
