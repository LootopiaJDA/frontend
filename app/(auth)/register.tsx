import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import ScreenBackground from '../../components/ScreenBackground';
import { Colors, Design, Fonts, Sp, R } from '../../constants/theme';
import { userService } from '../../services/api';

const BOUSSOLE = require('../../assets/images/boussole.png');

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const s = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = 'Pseudo requis';
    else if (form.username.length < 3) e.username = 'Minimum 3 caractères';
    if (!form.email.trim()) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.password) e.password = 'Mot de passe requis';
    else if (form.password.length < 8) e.password = 'Minimum 8 caractères';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await userService.register({ username: form.username, email: form.email.toLowerCase().trim(), password: form.password, role: 'JOUEUR' });
      Alert.alert('Compte créé !', 'Vous pouvez maintenant vous connecter.', [
        { text: 'Se connecter', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={s_.glowTop} />
      <View style={s_.glowBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s_.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView>
            <TouchableOpacity style={s_.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Design.text.heading} />
            </TouchableOpacity>

            <View style={s_.header}>
              <View style={s_.compassWrap}>
                <Image source={BOUSSOLE} style={s_.compassImg} resizeMode="cover" />
              </View>
              <Text style={s_.title}>Créer un compte</Text>
              <Text style={s_.sub}>Rejoignez l'aventure Lootopia</Text>
            </View>

            <View style={s_.roleBadge}>
              <Ionicons name="game-controller-outline" size={14} color={Design.text.warm} />
              <Text style={s_.roleText}>Compte Joueur</Text>
            </View>

            <View style={s_.form}>
              <Input label="Pseudo" placeholder="explorateur_42" value={form.username} onChangeText={s('username')} error={errors.username} icon="at-outline" autoCapitalize="none" />
              <Input label="Email" placeholder="vous@example.com" value={form.email} onChangeText={s('email')} error={errors.email} keyboard="email-address" icon="mail-outline" autoCapitalize="none" />
              <Input label="Mot de passe" placeholder="••••••••" value={form.password} onChangeText={s('password')} error={errors.password} secure icon="lock-closed-outline" />
              <Input label="Confirmer le mot de passe" placeholder="••••••••" value={form.confirm} onChangeText={s('confirm')} error={errors.confirm} secure icon="lock-closed-outline" />
              <Btn label="Créer mon compte" onPress={handleRegister} loading={loading} style={{ marginTop: Sp.sm }} />
            </View>

            <View style={s_.sep}>
              <View style={s_.sepLine} />
              <Text style={s_.sepText}>ou</Text>
              <View style={s_.sepLine} />
            </View>

            <View style={s_.links}>
              <Text style={s_.linkText}>Déjà un compte ?</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={s_.linkAccent}> Se connecter</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const COMPASS_SIZE = 70;

const s_ = StyleSheet.create({
  glowTop:    { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: Colors.amber, opacity: 0.05, top: -80, right: -60 },
  glowBottom: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.gold,  opacity: 0.04, bottom: 0, left: -60 },

  scroll: { flexGrow: 1, padding: Sp.lg, paddingTop: Sp.xl },

  back: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Design.bg.elevated,
    borderWidth: 1, borderColor: Design.border.warm,
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

  title: { fontFamily: Fonts.display, fontSize: 26, color: Design.text.heading, letterSpacing: 3 },
  sub:   { fontFamily: Fonts.title,   fontSize: 13, color: Design.text.label, letterSpacing: 0.5 },

  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.xs,
    backgroundColor: Design.bg.gold, borderWidth: 1, borderColor: Colors.gold + '33',
    borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 6,
    alignSelf: 'flex-start', marginBottom: Sp.lg,
  },
  roleText: { fontFamily: Fonts.title, color: Design.text.warm, fontSize: 11, letterSpacing: 0.5 },

  form: { gap: Sp.xs },

  sep:     { flexDirection: 'row', alignItems: 'center', gap: Sp.md, marginVertical: Sp.lg },
  sepLine: { flex: 1, height: 1, backgroundColor: Design.border.warm },
  sepText: { fontFamily: Fonts.title, color: Design.text.accent, fontSize: 11, letterSpacing: 1 },

  links:      { flexDirection: 'row', justifyContent: 'center', marginBottom: Sp.xl },
  linkText:   { fontFamily: Fonts.title, color: Design.text.label, fontSize: 13 },
  linkAccent: { fontFamily: Fonts.title, color: Design.text.accent, fontSize: 13 },
});
