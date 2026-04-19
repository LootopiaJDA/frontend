import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { Colors, Sp, R } from '../../constants/theme';
import { userService } from '../../services/api';

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
      Alert.alert('Compte créé ! 🎉', 'Vous pouvez maintenant vous connecter.', [
        { text: 'Se connecter', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Ionicons name="person-add-outline" size={28} color={Colors.gold} />
              </View>
              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.sub}>Rejoignez l'aventure Lootopia</Text>
            </View>

            {/* Role badge */}
            <View style={styles.roleBadge}>
              <Ionicons name="game-controller-outline" size={15} color={Colors.accentLight} />
              <Text style={styles.roleText}>Compte Joueur</Text>
            </View>

            <View style={styles.form}>
              <Input label="Pseudo" placeholder="explorateur_42" value={form.username} onChangeText={s('username')} error={errors.username} icon="at-outline" autoCapitalize="none" />
              <Input label="Email" placeholder="vous@example.com" value={form.email} onChangeText={s('email')} error={errors.email} keyboard="email-address" icon="mail-outline" autoCapitalize="none" />
              <Input label="Mot de passe" placeholder="••••••••" value={form.password} onChangeText={s('password')} error={errors.password} secure icon="lock-closed-outline" />
              <Input label="Confirmer le mot de passe" placeholder="••••••••" value={form.confirm} onChangeText={s('confirm')} error={errors.confirm} secure icon="lock-closed-outline" />
              <Btn label="Créer mon compte" onPress={handleRegister} loading={loading} style={{ marginTop: Sp.sm }} />
            </View>

            <View style={styles.sep}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>ou</Text>
              <View style={styles.sepLine} />
            </View>

            <View style={styles.links}>
              <Text style={styles.linkText}>Déjà un compte ?</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.linkAccent}> Se connecter</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg:         { flex: 1, backgroundColor: Colors.bg },
  glowTop:    { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: Colors.accent, opacity: 0.04, top: -60, right: -60 },
  glowBottom: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.gold, opacity: 0.04, bottom: 0, left: -60 },

  scroll: { flexGrow: 1, padding: Sp.lg, paddingTop: Sp.xl },

  back: {
    width: 40, height: 40, borderRadius: R.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Sp.xl,
  },

  header:  { marginBottom: Sp.lg, gap: Sp.sm },
  iconWrap: {
    width: 60, height: 60, borderRadius: R.xl,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.gold + '33',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Sp.sm,
  },
  title: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  sub:   { fontSize: 15, color: Colors.textSecondary },

  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.xs,
    backgroundColor: '#5B4BDB18', borderWidth: 1, borderColor: '#5B4BDB44',
    borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 6,
    alignSelf: 'flex-start', marginBottom: Sp.lg,
  },
  roleText: { color: Colors.accentLight, fontSize: 12, fontWeight: '700' },

  form: { gap: Sp.xs },

  sep:     { flexDirection: 'row', alignItems: 'center', gap: Sp.md, marginVertical: Sp.lg },
  sepLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  sepText: { color: Colors.textMuted, fontSize: 12 },

  links:      { flexDirection: 'row', justifyContent: 'center', marginBottom: Sp.xl },
  linkText:   { color: Colors.textSecondary, fontSize: 14 },
  linkAccent: { color: Colors.gold, fontSize: 14, fontWeight: '700' },
});
