import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
    TextInput, SafeAreaView, RefreshControl, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/api';
import { User } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';

const ROLE_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    JOUEUR:     { label: 'Joueur',     color: '#6366F1', bg: '#6366F118', icon: 'game-controller-outline' },
    PARTENAIRE: { label: 'Partenaire', color: Colors.gold, bg: Colors.goldGlow, icon: 'business-outline' },
    ADMIN:      { label: 'Admin',      color: Colors.error, bg: Colors.errorBg, icon: 'shield-checkmark-outline' },
};

type RoleFilter = 'Tous' | 'JOUEUR' | 'PARTENAIRE' | 'ADMIN';

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('Tous');

    // Detail modal
    const [detailModal, setDetailModal] = useState(false);
    const [selected, setSelected] = useState<User | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(Array.isArray(data) ? data : []);
        } catch { /* silencieux */ }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useFocusEffect(useCallback(() => { load(true); }, [load]));

    const confirmDelete = (u: User) => {
        Alert.alert('Supprimer l\'utilisateur', `Supprimer le compte de "${u.username}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive',
                onPress: async () => {
                    try {
                        await userService.delete(u.id_user);
                        setUsers(prev => prev.filter(x => x.id_user !== u.id_user));
                        setDetailModal(false);
                    } catch (e: any) { Alert.alert('Erreur', e.message); }
                },
            },
        ]);
    };

    const filtered = users.filter(u => {
        const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'Tous' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const counts = {
        JOUEUR: users.filter(u => u.role === 'JOUEUR').length,
        PARTENAIRE: users.filter(u => u.role === 'PARTENAIRE').length,
        ADMIN: users.filter(u => u.role === 'ADMIN').length,
    };

    return (
        <View style={styles.bg}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Utilisateurs</Text>
                    <View style={styles.totalBadge}>
                        <Text style={styles.totalText}>{users.length}</Text>
                    </View>
                </View>

                {/* Stats rapides */}
                <View style={styles.miniStats}>
                    {(['JOUEUR', 'PARTENAIRE', 'ADMIN'] as const).map(role => {
                        const cfg = ROLE_CFG[role];
                        return (
                            <TouchableOpacity
                                key={role}
                                style={[styles.miniStat, roleFilter === role && { borderColor: cfg.color }]}
                                onPress={() => setRoleFilter(roleFilter === role ? 'Tous' : role)}
                            >
                                <Text style={[styles.miniStatValue, { color: cfg.color }]}>{counts[role]}</Text>
                                <Text style={styles.miniStatLabel}>{cfg.label}s</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Recherche */}
                <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Nom, email..."
                        placeholderTextColor={Colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={Colors.textMuted} /></TouchableOpacity> : null}
                </View>

                {loading ? (
                    <View style={styles.center}><ActivityIndicator color={Colors.gold} size="large" /></View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={u => String(u.id_user)}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.gold} />}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="person-outline" size={40} color={Colors.textMuted} />
                                <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
                            </View>
                        }
                        renderItem={({ item: u }) => {
                            const cfg = ROLE_CFG[u.role] ?? ROLE_CFG.JOUEUR;
                            const initials = u.username.slice(0, 2).toUpperCase();
                            return (
                                <TouchableOpacity
                                    style={styles.userRow}
                                    onPress={() => { setSelected(u); setDetailModal(true); }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.avatar, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                        <Text style={[styles.avatarText, { color: cfg.color }]}>{initials}</Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{u.username}</Text>
                                        <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                                    </View>
                                    <View style={[styles.roleBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                        <Text style={[styles.roleText, { color: cfg.color }]}>{cfg.label}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                                </TouchableOpacity>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </SafeAreaView>

            {/* Modal détail utilisateur */}
            <Modal visible={detailModal} animationType="slide" transparent onRequestClose={() => setDetailModal(false)}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        {selected && (() => {
                            const cfg = ROLE_CFG[selected.role] ?? ROLE_CFG.JOUEUR;
                            const initials = selected.username.slice(0, 2).toUpperCase();
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Avatar */}
                                    <View style={styles.sheetHero}>
                                        <View style={[styles.sheetAvatar, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                            <Text style={[styles.sheetAvatarText, { color: cfg.color }]}>{initials}</Text>
                                        </View>
                                        <Text style={styles.sheetName}>{selected.username}</Text>
                                        <View style={[styles.sheetRoleBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                            <Ionicons name={cfg.icon as any} size={13} color={cfg.color} />
                                            <Text style={[styles.sheetRoleText, { color: cfg.color }]}>{cfg.label}</Text>
                                        </View>
                                    </View>

                                    {/* Infos */}
                                    <View style={styles.infoTable}>
                                        {[
                                            { label: 'ID', value: `#${selected.id_user}` },
                                            { label: 'Email', value: selected.email },
                                            { label: 'Rôle', value: selected.role },
                                        ].map(row => (
                                            <View key={row.label} style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>{row.label}</Text>
                                                <Text style={styles.infoValue}>{row.value}</Text>
                                            </View>
                                        ))}
                                        {selected.partenaire && ([
                                            { label: 'Société', value: selected.partenaire.company_name },
                                            { label: 'SIRET', value: selected.partenaire.siret },
                                            { label: 'Statut partenaire', value: selected.partenaire.statut },
                                        ].map(row => (
                                            <View key={row.label} style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>{row.label}</Text>
                                                <Text style={styles.infoValue}>{row.value}</Text>
                                            </View>
                                        )))}
                                    </View>

                                    {/* Actions */}
                                    <View style={styles.sheetActions}>
                                        <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setDetailModal(false)}>
                                            <Text style={styles.sheetCloseBtnText}>Fermer</Text>
                                        </TouchableOpacity>
                                        {selected.role !== 'ADMIN' && (
                                            <TouchableOpacity style={styles.sheetDeleteBtn} onPress={() => confirmDelete(selected)}>
                                                <Ionicons name="trash-outline" size={16} color={Colors.error} />
                                                <Text style={styles.sheetDeleteBtnText}>Supprimer</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </ScrollView>
                            );
                        })()}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: Colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, paddingHorizontal: Sp.lg, paddingTop: Sp.md, paddingBottom: Sp.sm },
    title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '900', flex: 1 },
    totalBadge: { backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 4 },
    totalText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
    miniStats: { flexDirection: 'row', gap: Sp.sm, paddingHorizontal: Sp.lg, marginBottom: Sp.sm },
    miniStat: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, padding: Sp.sm, alignItems: 'center', gap: 2 },
    miniStatValue: { fontSize: 20, fontWeight: '800' },
    miniStatLabel: { color: Colors.textMuted, fontSize: 10 },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, backgroundColor: Colors.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Sp.md, paddingVertical: Sp.sm, marginBottom: Sp.sm },
    searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { paddingHorizontal: Sp.lg, paddingBottom: 100 },
    empty: { alignItems: 'center', gap: Sp.sm, paddingTop: 60 },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingVertical: Sp.sm },
    avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 15, fontWeight: '800' },
    userInfo: { flex: 1 },
    userName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
    userEmail: { color: Colors.textMuted, fontSize: 12 },
    roleBadge: { borderWidth: 1, borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3 },
    roleText: { fontSize: 10, fontWeight: '700' },
    separator: { height: 1, backgroundColor: Colors.border, marginLeft: 58 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, borderTopWidth: 1, borderColor: Colors.border, padding: Sp.lg, maxHeight: '80%' },
    handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Sp.lg },
    sheetHero: { alignItems: 'center', gap: Sp.sm, marginBottom: Sp.lg },
    sheetAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    sheetAvatarText: { fontSize: 26, fontWeight: '900' },
    sheetName: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
    sheetRoleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: R.full, paddingHorizontal: Sp.md, paddingVertical: 4 },
    sheetRoleText: { fontSize: 12, fontWeight: '700' },
    infoTable: { backgroundColor: Colors.bgElevated, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Sp.lg },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
    infoLabel: { color: Colors.textMuted, fontSize: 13 },
    infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
    sheetActions: { flexDirection: 'row', gap: Sp.md, marginBottom: Sp.xl },
    sheetCloseBtn: { flex: 1, backgroundColor: Colors.bgElevated, borderRadius: R.md, borderWidth: 1, borderColor: Colors.border, paddingVertical: 13, alignItems: 'center' },
    sheetCloseBtnText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
    sheetDeleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.errorBg, borderRadius: R.md, borderWidth: 1, borderColor: Colors.error + '44', paddingVertical: 13 },
    sheetDeleteBtnText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});