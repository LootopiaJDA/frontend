import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { Colors, Sp, R } from '../../constants/theme';
import { userService } from '../../services/api';

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
        'Demande envoyée ✅',
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
    <View style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Ionicons name="business-outline" size={26} color={Colors.gold} />
              </View>
              <Text style={styles.title}>Compte Partenaire</Text>
              <Text style={styles.sub}>Créez et gérez vos chasses au trésor</Text>
            </View>

            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark-outline" size={15} color={Colors.warning} />
              <Text style={styles.roleText}>Partenaire · Vérification requise</Text>
            </View>

            {/* Section compte */}
            <Text style={styles.section}>Informations de compte</Text>
            <Input label="Nom / Prénom" placeholder="Jean Dupont" value={form.username} onChangeText={s('username')} error={errors.username} icon="person-outline" autoCapitalize="words" />
            <Input label="Email professionnel" placeholder="contact@societe.fr" value={form.email} onChangeText={s('email')} error={errors.email} keyboard="email-address" icon="mail-outline" />
            <Input label="Mot de passe" placeholder="••••••••" value={form.password} onChangeText={s('password')} error={errors.password} secure icon="lock-closed-outline" />
            <Input label="Confirmer le mot de passe" placeholder="••••••••" value={form.confirm} onChangeText={s('confirm')} error={errors.confirm} secure icon="lock-closed-outline" />

            {/* Section entreprise */}
            <Text style={styles.section}>Informations entreprise</Text>
            <Input label="Nom de la société" placeholder="Musée National, Mairie de..." value={form.company_name} onChangeText={s('company_name')} error={errors.company_name} icon="briefcase-outline" autoCapitalize="words" />
            <Input label="Numéro SIRET" placeholder="123 456 789 01234" value={form.siret} onChangeText={s('siret')} error={errors.siret} keyboard="numeric" icon="card-outline" />
            <Input label="Adresse (optionnel)" placeholder="1 rue de la Paix, 75001 Paris" value={form.adresse} onChangeText={s('adresse')} icon="location-outline" autoCapitalize="sentences" />

            {/* Info box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                Votre compte sera examiné par notre équipe avant activation. Ce processus prend généralement 24 à 48h ouvrées.
              </Text>
            </View>

            <Btn label="Envoyer la demande" onPress={handleRegister} loading={loading} style={{ marginTop: Sp.sm }} />

            <View style={styles.links}>
              <Text style={styles.linkText}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.linkAccent}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: Sp.lg, paddingTop: Sp.xl },
  back: { width: 38, height: 38, borderRadius: R.sm, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Sp.xl },
  header: { marginBottom: Sp.lg },
  iconWrap: { width: 56, height: 56, borderRadius: R.lg, backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '30', alignItems: 'center', justifyContent: 'center', marginBottom: Sp.md },
  title: { color: Colors.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  sub: { color: Colors.textSecondary, fontSize: 15 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: Sp.xs, backgroundColor: Colors.warningBg, borderWidth: 1, borderColor: Colors.warning + '44', borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: Sp.lg },
  roleText: { color: Colors.warning, fontSize: 12, fontWeight: '700' },
  section: { color: Colors.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.md, marginTop: Sp.lg },
  infoBox: { flexDirection: 'row', gap: Sp.sm, backgroundColor: Colors.bgElevated, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, padding: Sp.md, marginVertical: Sp.md, alignItems: 'flex-start' },
  infoText: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 20 },
  links: { flexDirection: 'row', justifyContent: 'center', marginTop: Sp.lg, paddingBottom: Sp.xxl },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  linkAccent: { color: Colors.gold, fontSize: 14, fontWeight: '600' },
});
