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
import { Colors, Fonts, Sp, R } from '../../constants/theme';
import { userService } from '../../services/api';

const BOUSSOLE = require('../../assets/images/boussole.png');

export default function RegisterPartner() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '',
    company_name: '', siret: '', adresse: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const s = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = 'Nom requis';
    if (!form.email.trim()) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.password) e.password = 'Mot de passe requis';
    else if (form.password.length < 8) e.password = 'Minimum 8 caractères';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    if (!form.company_name.trim()) e.company_name = 'Nom de société requis';
    if (!form.siret.trim()) e.siret = 'SIRET requis';
    else if (!/^\d{14}$/.test(form.siret.replace(/\s/g, ''))) e.siret = '14 chiffres requis';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await userService.registerPartner({
        username: form.username,
        email: form.email.toLowerCase().trim(),
        password: form.password,
        partenaire: { company_name: form.company_name, siret: form.siret.replace(/\s/g, ''), adresse: form.adresse },
      });
      Alert.alert(
        'Demande envoyée',
        'Votre compte partenaire est en cours de vérification. Vous serez notifié par email sous 24-48h.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
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
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={s_.header}>
              <View style={s_.compassWrap}>
                <Image source={BOUSSOLE} style={s_.compassImg} resizeMode="cover" />
              </View>
              <Text style={s_.title}>Compte Partenaire</Text>
              <Text style={s_.sub}>Créez et gérez vos chasses au trésor</Text>
            </View>

            <View style={s_.roleBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.warning} />
              <Text style={s_.roleText}>Partenaire · Vérification requise</Text>
            </View>

            <Text style={s_.section}>Informations de compte</Text>
            <View style={s_.form}>
              <Input label="Nom / Prénom" placeholder="Jean Dupont" value={form.username} onChangeText={s('username')} error={errors.username} icon="person-outline" autoCapitalize="words" />
              <Input label="Email professionnel" placeholder="contact@societe.fr" value={form.email} onChangeText={s('email')} error={errors.email} keyboard="email-address" icon="mail-outline" autoCapitalize="none" />
              <Input label="Mot de passe" placeholder="••••••••" value={form.password} onChangeText={s('password')} error={errors.password} secure icon="lock-closed-outline" />
              <Input label="Confirmer le mot de passe" placeholder="••••••••" value={form.confirm} onChangeText={s('confirm')} error={errors.confirm} secure icon="lock-closed-outline" />
            </View>

            <Text style={s_.section}>Informations entreprise</Text>
            <View style={s_.form}>
              <Input label="Nom de la société" placeholder="Musée National, Mairie de..." value={form.company_name} onChangeText={s('company_name')} error={errors.company_name} icon="briefcase-outline" autoCapitalize="words" />
              <Input label="Numéro SIRET" placeholder="123 456 789 01234" value={form.siret} onChangeText={s('siret')} error={errors.siret} keyboard="numeric" icon="card-outline" />
              <Input label="Adresse (optionnel)" placeholder="1 rue de la Paix, 75001 Paris" value={form.adresse} onChangeText={s('adresse')} icon="location-outline" autoCapitalize="sentences" />
            </View>

            <View style={s_.infoBox}>
              <Ionicons name="time-outline" size={16} color={Colors.warning} />
              <Text style={s_.infoText}>
                Votre compte sera examiné par notre équipe avant activation. Ce processus prend généralement 24 à 48h ouvrées.
              </Text>
            </View>

            <Btn label="Envoyer la demande" onPress={handleRegister} loading={loading} style={{ marginTop: Sp.sm }} />

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
  glowTop:    { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: Colors.amber, opacity: 0.05, top: -100, right: -60 },
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

  title: { fontFamily: Fonts.display, fontSize: 26, color: Colors.textPrimary, letterSpacing: 3 },
  sub:   { fontFamily: Fonts.title,   fontSize: 13, color: Colors.textSecondary, letterSpacing: 0.5 },

  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Sp.xs,
    backgroundColor: Colors.warningBg, borderWidth: 1, borderColor: Colors.warning + '44',
    borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 6,
    alignSelf: 'flex-start', marginBottom: Sp.lg,
  },
  roleText: { fontFamily: Fonts.title, color: Colors.warning, fontSize: 11, letterSpacing: 0.5 },

  section: {
    fontFamily: Fonts.title, color: Colors.gold, fontSize: 10,
    letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: Sp.md, marginTop: Sp.lg,
  },

  form: { gap: Sp.xs },

  infoBox: {
    flexDirection: 'row', gap: Sp.sm,
    backgroundColor: Colors.warningBg, borderRadius: R.md,
    borderWidth: 1, borderColor: Colors.warning + '33',
    padding: Sp.md, marginVertical: Sp.lg, alignItems: 'flex-start',
  },
  infoText: { fontFamily: Fonts.title, color: Colors.textSecondary, fontSize: 12, flex: 1, lineHeight: 20 },

  sep:     { flexDirection: 'row', alignItems: 'center', gap: Sp.md, marginVertical: Sp.lg },
  sepLine: { flex: 1, height: 1, backgroundColor: Colors.borderWarm },
  sepText: { fontFamily: Fonts.title, color: Colors.textMuted, fontSize: 11, letterSpacing: 1 },

  links:      { flexDirection: 'row', justifyContent: 'center', marginBottom: Sp.xl },
  linkText:   { fontFamily: Fonts.title, color: Colors.textSecondary, fontSize: 13 },
  linkAccent: { fontFamily: Fonts.title, color: Colors.gold, fontSize: 13 },
});
