import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Modal,
    ActivityIndicator, TouchableOpacity, Alert,
    SafeAreaView, ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userService, partenaireService } from '../../services/api';
import { Partenaire } from '../../constants/types';
import { User } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

export default function UsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selected, setSelected] = useState<User | null>(null);

    const load = useCallback(async () => {
        try {
            const [data, partenaires] = await Promise.all([
                userService.getAll(),
                partenaireService.getAll(),
            ]);

            // Le backend ne retourne pas la relation partener dans getAll()
            // On la rattache manuellement via user.partenerId
            const merged: User[] = data.map((u: User) => {
                if (u.role === 'PARTENAIRE' && u.partenerId) {
                    const partener = partenaires.find((p: any) => p.id_partenaire === u.partenerId);
                    return { ...u, partener: partener ?? null };
                }
                return u;
            });

            setUsers(merged.filter((u: User) => u.role !== 'ADMIN'));
        } catch (err) {
            console.log('Erreur chargement users:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const handleValidatePartner = (user: User) => {
        if (!user.partener) return;
        Alert.alert(
            'Valider le partenaire',
            `Que faire du compte "${user.partener.company_name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Activer',
                    onPress: async () => {
                        try {
                            await partenaireService.updateStatut(user.partener!.id_partenaire, 'ACTIVE');
                            setSelected(null);
                            await load();
                        } catch (e: any) { Alert.alert('Erreur', e.message); }
                    },
                },
                {
                    text: 'Rejeter', style: 'destructive',
                    onPress: async () => {
                        try {
                            await partenaireService.updateStatut(user.partener!.id_partenaire, 'INACTIVE');
                            setSelected(null);
                            await load();
                        } catch (e: any) { Alert.alert('Erreur', e.message); }
                    },
                },
            ]
        );
    };

    const handleDeleteUser = (user: User) => {
        Alert.alert(
            'Supprimer l\'utilisateur',
            `Supprimer "${user.username}" ? Action irréversible.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.delete(user.id_user);
                            setSelected(null);
                            await load();
                        } catch (e: any) { Alert.alert('Erreur', e.message); }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={st.center}>
                <ActivityIndicator size="large" color={Colors.error} />
            </View>
        );
    }

    const joueurs     = users.filter(u => u.role === 'JOUEUR');
    const partenaires = users.filter(u => u.role === 'PARTENAIRE');
    const enAttente   = partenaires.filter(u => u.partener?.statut === 'VERIFICATION');

    return (
        <SafeAreaView style={st.safe}>
            <PageHeader title="Utilisateurs" subtitle={`${users.length} comptes`} />

            {enAttente.length > 0 && (
                <View style={st.alertBanner}>
                    <Ionicons name="hourglass-outline" size={16} color={Colors.warning} />
                    <Text style={st.alertText}>
                        {enAttente.length} partenaire{enAttente.length > 1 ? 's' : ''} en attente de validation
                    </Text>
                </View>
            )}

            <FlatList
                data={users}
                keyExtractor={u => `user-${u.id_user}`}
                contentContainerStyle={st.list}
                showsVerticalScrollIndicator={false}
                onRefresh={() => { setRefreshing(true); load(); }}
                refreshing={refreshing}
                renderItem={({ item: u }) => {
                    const isPending = u.partener?.statut === 'VERIFICATION';
                    return (
                        <TouchableOpacity
                            style={[st.card, isPending && st.cardPending]}
                            onPress={() => setSelected(u)}
                            activeOpacity={0.75}
                        >
                            <View style={[st.avatar, isPending && st.avatarPending]}>
                                <Text style={st.avatarText}>{u.username.slice(0, 2).toUpperCase()}</Text>
                            </View>

                            <View style={st.cardBody}>
                                <View style={st.cardTop}>
                                    <Text style={st.username}>{u.username}</Text>
                                    {isPending && (
                                        <View style={st.pendingDot} />
                                    )}
                                </View>
                                <Text style={st.email}>{u.email}</Text>
                                <View style={st.badgeRow}>
                                    <StatusBadge status={u.role} />
                                    {u.partener && <StatusBadge status={u.partener.statut} />}
                                </View>
                                {u.partener && (
                                    <Text style={st.company}>{u.partener.company_name}</Text>
                                )}
                            </View>

                            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                        </TouchableOpacity>
                    );
                }}
                ItemSeparatorComponent={() => <View style={{ height: Sp.sm }} />}
                ListHeaderComponent={
                    <View style={st.summary}>
                        <View style={st.summaryItem}>
                            <Text style={st.summaryVal}>{joueurs.length}</Text>
                            <Text style={st.summaryLabel}>Joueurs</Text>
                        </View>
                        <View style={st.summaryDivider} />
                        <View style={st.summaryItem}>
                            <Text style={st.summaryVal}>{partenaires.length}</Text>
                            <Text style={st.summaryLabel}>Partenaires</Text>
                        </View>
                        <View style={st.summaryDivider} />
                        <View style={st.summaryItem}>
                            <Text style={[st.summaryVal, enAttente.length > 0 && { color: Colors.warning }]}>
                                {enAttente.length}
                            </Text>
                            <Text style={st.summaryLabel}>En attente</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={st.empty}>
                        <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
                        <Text style={st.emptyText}>Aucun utilisateur</Text>
                    </View>
                }
            />

            {/* Modal détail utilisateur */}
            <Modal
                visible={!!selected}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelected(null)}
            >
                {selected && (
                    <SafeAreaView style={st.modalSafe}>
                        {/* Header modal */}
                        <View style={st.modalHeader}>
                            <TouchableOpacity onPress={() => setSelected(null)} style={st.modalClose}>
                                <Ionicons name="close" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={st.modalTitle}>Détail utilisateur</Text>
                            <View style={{ width: 36 }} />
                        </View>

                        <ScrollView contentContainerStyle={st.modalScroll}>
                            {/* Avatar */}
                            <View style={st.modalHero}>
                                <View style={[st.modalAvatar, selected.partener?.statut === 'VERIFICATION' && st.modalAvatarPending]}>
                                    <Text style={st.modalAvatarText}>
                                        {selected.username.slice(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={st.modalUsername}>{selected.username}</Text>
                                <Text style={st.modalEmail}>{selected.email}</Text>
                                <View style={st.modalBadgeRow}>
                                    <StatusBadge status={selected.role} />
                                    {selected.partener && <StatusBadge status={selected.partener.statut} />}
                                </View>
                            </View>

                            {/* Infos compte */}
                            <Text style={st.modalSection}>Informations du compte</Text>
                            <View style={st.infoCard}>
                                <InfoRow icon="person-outline"    label="Identifiant"   value={`#${selected.id_user}`} />
                                <InfoRow icon="mail-outline"      label="Email"         value={selected.email} />
                                <InfoRow icon="shield-outline"    label="Rôle"          value={selected.role} />
                                <InfoRow icon="calendar-outline"  label="Inscrit le"    value={new Date(selected.created_at).toLocaleDateString('fr-FR')} last />
                            </View>

                            {/* Infos partenaire */}
                            {selected.partener && (
                                <>
                                    <Text style={st.modalSection}>Informations partenaire</Text>
                                    <View style={st.infoCard}>
                                        <InfoRow icon="key-outline"               label="ID"        value={`#${selected.partener.id_partenaire}`} />
                                        <InfoRow icon="business-outline"          label="Société"   value={selected.partener.company_name} />
                                        <InfoRow icon="card-outline"              label="SIRET"     value={selected.partener.siret} />
                                        <InfoRow icon="location-outline"          label="Adresse"   value={selected.partener.adresse ?? '—'} />
                                        <InfoRow icon="checkmark-circle-outline"  label="Statut"    value={selected.partener.statut} />
                                        <InfoRow icon="calendar-outline"          label="Créé le"   value={new Date(selected.partener.created_at).toLocaleDateString('fr-FR')} />
                                        <InfoRow icon="refresh-outline"           label="Mis à jour" value={new Date(selected.partener.updated_at).toLocaleDateString('fr-FR')} last />
                                    </View>
                                </>
                            )}

                            {/* Actions */}
                            <Text style={st.modalSection}>Actions</Text>
                            <View style={st.actionsCol}>
                                {selected.partener?.statut === 'VERIFICATION' && (
                                    <TouchableOpacity
                                        style={st.btnValidate}
                                        onPress={() => handleValidatePartner(selected)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                                        <Text style={st.btnValidateText}>Valider / Rejeter le partenaire</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={st.btnDelete}
                                    onPress={() => handleDeleteUser(selected)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                    <Text style={st.btnDeleteText}>Supprimer le compte</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                )}
            </Modal>
        </SafeAreaView>
    );
}

function InfoRow({ icon, label, value, last = false }: {
    icon: string; label: string; value: string; last?: boolean;
}) {
    return (
        <View style={[ir.row, !last && ir.border]}>
            <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
            <Text style={ir.label}>{label}</Text>
            <Text style={ir.value} numberOfLines={1}>{value}</Text>
        </View>
    );
}

const ir = StyleSheet.create({
    row:   { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingVertical: 12 },
    border:{ borderBottomWidth: 1, borderBottomColor: Colors.border },
    label: { fontSize: 13, color: Colors.textMuted, width: 80 },
    value: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'right' },
});

const st = StyleSheet.create({
    safe:   { flex: 1, backgroundColor: Colors.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
    list:   { paddingHorizontal: Sp.lg, paddingBottom: 100 },

    alertBanner: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.sm,
        backgroundColor: Colors.warningBg, borderBottomWidth: 1, borderBottomColor: Colors.warning + '44',
        paddingHorizontal: Sp.lg, paddingVertical: Sp.sm,
    },
    alertText: { fontSize: 13, color: Colors.warning, fontWeight: '600' },

    summary: {
        flexDirection: 'row', backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
        marginBottom: Sp.md, overflow: 'hidden',
    },
    summaryItem:    { flex: 1, alignItems: 'center', paddingVertical: Sp.md, gap: 4 },
    summaryDivider: { width: 1, backgroundColor: Colors.border },
    summaryVal:     { fontSize: 20, fontWeight: '800', color: Colors.gold },
    summaryLabel:   { fontSize: 11, color: Colors.textMuted },

    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border,
        padding: Sp.md, gap: Sp.md,
    },
    cardPending: { borderColor: Colors.warning, backgroundColor: Colors.warningBg },
    cardTop:  { flexDirection: 'row', alignItems: 'center', gap: Sp.sm },
    cardBody: { flex: 1, gap: 3 },
    pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning },

    avatar: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    avatarPending: { backgroundColor: Colors.warningBg, borderWidth: 1, borderColor: Colors.warning },
    avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gold },

    username:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    email:     { fontSize: 12, color: Colors.textMuted },
    badgeRow:  { flexDirection: 'row', gap: Sp.xs, flexWrap: 'wrap', marginTop: 2 },
    company:   { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

    empty:     { alignItems: 'center', gap: Sp.md, paddingTop: 80 },
    emptyText: { fontSize: 16, color: Colors.textMuted },

    // Modal
    modalSafe:       { flex: 1, backgroundColor: Colors.bg },
    modalHeader:     {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Sp.lg, paddingVertical: Sp.md,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    modalClose:      { padding: 4 },
    modalTitle:      { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
    modalScroll:     { padding: Sp.lg, paddingBottom: 60, gap: Sp.md },

    modalHero:       { alignItems: 'center', paddingVertical: Sp.lg, gap: Sp.sm },
    modalAvatar:     {
        width: 72, height: 72, borderRadius: 22,
        backgroundColor: Colors.bgElevated,
        borderWidth: 2, borderColor: Colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    modalAvatarPending: { borderColor: Colors.warning, backgroundColor: Colors.warningBg },
    modalAvatarText: { fontSize: 26, fontWeight: '800', color: Colors.gold },
    modalUsername:   { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
    modalEmail:      { fontSize: 13, color: Colors.textMuted },
    modalBadgeRow:   { flexDirection: 'row', gap: Sp.sm, marginTop: Sp.xs },

    modalSection: {
        fontSize: 10, fontWeight: '700', color: Colors.error,
        letterSpacing: 1.5, textTransform: 'uppercase', marginTop: Sp.sm,
    },
    infoCard: {
        backgroundColor: Colors.bgCard, borderRadius: R.lg,
        borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Sp.md,
    },

    actionsCol: { gap: Sp.sm },
    btnValidate: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm,
        backgroundColor: Colors.success, borderRadius: R.md, padding: Sp.md,
    },
    btnValidateText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    btnDelete: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sp.sm,
        backgroundColor: Colors.errorBg, borderRadius: R.md, padding: Sp.md,
        borderWidth: 1, borderColor: Colors.error + '44',
    },
    btnDeleteText: { color: Colors.error, fontWeight: '700', fontSize: 14 },
});
