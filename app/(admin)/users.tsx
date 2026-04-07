import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userService, partenaireService } from '../../services/api';
import { User } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';
// ← composants partagés réutilisés
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

export default function UsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            console.log('Erreur chargement users:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    // Valider / rejeter un partenaire en attente
    const handleValidatePartner = (user: User) => {
        if (!user.partener) return;
        Alert.alert(
            'Valider le partenaire',
            `Activer le compte de "${user.partener.company_name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Activer',
                    onPress: async () => {
                        try {
                            await partenaireService.updateStatut(user.partener!.id_partenaire, 'ACTIVE');
                            await load();
                        } catch (e: any) {
                            Alert.alert('Erreur', e.message);
                        }
                    },
                },
                {
                    text: 'Rejeter',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await partenaireService.updateStatut(user.partener!.id_partenaire, 'INACTIVE');
                            await load();
                        } catch (e: any) {
                            Alert.alert('Erreur', e.message);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteUser = (user: User) => {
        Alert.alert(
            'Supprimer l\'utilisateur',
            `Supprimer "${user.username}" ? Cette action est irréversible.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.delete(user.id_user);
                            await load();
                        } catch (e: any) {
                            Alert.alert('Erreur', e.message);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={st.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        );
    }

    return (
        <SafeAreaView style={st.safe}>
            {/* PageHeader ✅ */}
            <PageHeader title="Utilisateurs" subtitle={`${users.length} comptes`} />

            <FlatList
                data={users}
                keyExtractor={u => `user-${u.id_user}`}
                contentContainerStyle={st.list}
                showsVerticalScrollIndicator={false}
                onRefresh={() => { setRefreshing(true); load(); }}
                refreshing={refreshing}
                renderItem={({ item: u }) => {
                    const isPendingPartner = u.partener?.statut === 'VERIFICATION';
                    return (
                        <View style={[st.card, isPendingPartner && st.cardHighlight]}>
                            {/* Avatar initiales */}
                            <View style={st.avatar}>
                                <Text style={st.avatarText}>{u.username.slice(0, 2).toUpperCase()}</Text>
                            </View>

                            <View style={st.body}>
                                <Text style={st.username}>{u.username}</Text>
                                <Text style={st.email}>{u.email}</Text>

                                {/* StatusBadge ✅ réutilisé pour le rôle */}
                                <View style={st.badgeRow}>
                                    <StatusBadge status={u.role} />
                                    {/* StatusBadge ✅ réutilisé pour le statut partenaire */}
                                    {u.partener && <StatusBadge status={u.partener.statut} />}
                                </View>

                                {u.partener && (
                                    <Text style={st.company}>{u.partener.company_name}</Text>
                                )}
                            </View>

                            {/* Actions */}
                            <View style={st.actions}>
                                {isPendingPartner && (
                                    <TouchableOpacity
                                        style={st.btnValidate}
                                        onPress={() => handleValidatePartner(u)}
                                    >
                                        <Ionicons name="checkmark-circle-outline" size={18} color={Colors.green ?? '#4ecb8a'} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={st.btnDelete}
                                    onPress={() => handleDeleteUser(u)}
                                >
                                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                ItemSeparatorComponent={() => <View style={{ height: Sp.sm }} />}
                ListEmptyComponent={
                    <View style={st.empty}>
                        <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
                        <Text style={st.emptyText}>Aucun utilisateur</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:          { flex: 1, backgroundColor: Colors.bg },
    center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
    list:          { paddingHorizontal: Sp.lg, paddingBottom: 100 },

    card:          {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
        padding: Sp.md, gap: Sp.md,
    },
    cardHighlight: { borderColor: Colors.warning, backgroundColor: Colors.warningBg },

    avatar:        {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    avatarText:    { fontSize: 15, fontWeight: '800', color: Colors.gold },

    body:          { flex: 1, gap: 3 },
    username:      { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    email:         { fontSize: 12, color: Colors.textMuted },
    badgeRow:      { flexDirection: 'row', gap: Sp.xs, flexWrap: 'wrap', marginTop: 2 },
    company:       { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

    actions:       { gap: Sp.sm },
    btnValidate:   {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: 'rgba(78,203,138,0.12)',
        borderWidth: 1, borderColor: 'rgba(78,203,138,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    btnDelete:     {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: Colors.errorBg,
        borderWidth: 1, borderColor: Colors.error + '44',
        alignItems: 'center', justifyContent: 'center',
    },

    empty:         { alignItems: 'center', gap: Sp.md, paddingTop: 80 },
    emptyText:     { fontSize: 16, color: Colors.textMuted },
});