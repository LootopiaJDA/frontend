import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Modal,
    ActivityIndicator, TouchableOpacity,
    SafeAreaView, ScrollView, Image,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService } from '../../services/api';
import { Chasse, ChasseDetail } from '../../constants/types';
import { Colors, Fonts, Sp, R } from '../../constants/theme';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ScreenBackground from '../../components/ScreenBackground';

export default function AdminChassesScreen() {
    const [chasses, setChasses]         = useState<Chasse[]>([]);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [selected, setSelected]       = useState<Chasse | null>(null);
    const [detail, setDetail]           = useState<ChasseDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await chasseService.getAll();
            setChasses(data.allChasse ?? []);
        } catch (err) {
            console.log('Erreur chargement chasses admin:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const openDetail = async (chasse: Chasse) => {
        setSelected(chasse);
        setDetail(null);
        setLoadingDetail(true);
        try {
            const d = await chasseService.getById(chasse.id_chasse);
            setDetail(d);
        } catch {
            // Affiche quand même le modal avec les infos de base
        } finally {
            setLoadingDetail(false);
        }
    };


    const statusColor = (etat: string) => {
        if (etat === 'ACTIVE')    return '#4ecb8a';
        if (etat === 'PENDING')   return Colors.warning;
        if (etat === 'COMPLETED') return Colors.textMuted;
        return Colors.textMuted;
    };

    if (loading) {
        return (
            <ScreenBackground style={st.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground style={st.safe}>
            <PageHeader title="Chasses" subtitle={`${chasses.length} au total`} />

            <FlatList
                data={chasses}
                keyExtractor={c => `chasse-${c.id_chasse}`}
                contentContainerStyle={st.list}
                showsVerticalScrollIndicator={false}
                onRefresh={() => { setRefreshing(true); load(); }}
                refreshing={refreshing}
                renderItem={({ item: c }) => (
                    <TouchableOpacity
                        style={st.card}
                        onPress={() => openDetail(c)}
                        activeOpacity={0.75}
                    >
                        {/* Image ou placeholder */}
                        {c.image ? (
                            <Image source={{ uri: c.image }} style={st.cardImage} />
                        ) : (
                            <View style={[st.cardImage, st.cardImagePlaceholder]}>
                                <Ionicons name="map-outline" size={24} color={Colors.textMuted} />
                            </View>
                        )}

                        <View style={st.cardBody}>
                            <View style={st.cardTop}>
                                <Text style={st.cardName} numberOfLines={1}>{c.name}</Text>
                                <View style={[st.statusDot, { backgroundColor: statusColor(c.etat) }]} />
                            </View>
                            {c.localisation && (
                                <View style={st.cardMeta}>
                                    <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                                    <Text style={st.cardMetaText} numberOfLines={1}>{c.localisation}</Text>
                                </View>
                            )}
                            <View style={st.cardFooter}>
                                <StatusBadge status={c.etat as any} />
                                <Text style={st.cardId}>#{c.id_chasse}</Text>
                            </View>
                        </View>

                        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: Sp.sm }} />}
                ListEmptyComponent={
                    <View style={st.empty}>
                        <Ionicons name="map-outline" size={48} color={Colors.textMuted} />
                        <Text style={st.emptyText}>Aucune chasse active</Text>
                    </View>
                }
            />

            {/* Modal détail chasse */}
            <Modal
                visible={!!selected}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelected(null)}
            >
                {selected && (
                    <SafeAreaView style={st.modalSafe}>
                        {/* Header */}
                        <View style={st.modalHeader}>
                            <TouchableOpacity onPress={() => setSelected(null)} style={st.modalClose}>
                                <Ionicons name="close" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={st.modalTitle}>Détail chasse</Text>
                            <View style={{ width: 36 }} />
                        </View>

                        <ScrollView contentContainerStyle={st.modalScroll}>
                            {/* Image couverture */}
                            {selected.image ? (
                                <Image source={{ uri: selected.image }} style={st.modalCover} />
                            ) : (
                                <View style={[st.modalCover, st.modalCoverEmpty]}>
                                    <Ionicons name="map-outline" size={48} color={Colors.textMuted} />
                                </View>
                            )}

                            {/* Titre + statut */}
                            <View style={st.modalHero}>
                                <Text style={st.modalName}>{selected.name}</Text>
                                <StatusBadge status={selected.etat as any} />
                            </View>

                            {/* Infos générales */}
                            <Text style={st.modalSection}>Informations</Text>
                            <View style={st.infoCard}>
                                <InfoRow icon="bookmark-outline"  label="Nom"         value={selected.name} />
                                <InfoRow icon="location-outline"  label="Lieu"        value={selected.localisation ?? '—'} />
                                <InfoRow icon="flag-outline"      label="Statut"      value={selected.etat} />
                                <InfoRow icon="key-outline"       label="ID"          value={`#${selected.id_chasse}`} last />
                            </View>

                            {/* Occurrence */}
                            {selected.occurence?.[0] && (
                                <>
                                    <Text style={st.modalSection}>Période</Text>
                                    <View style={st.infoCard}>
                                        <InfoRow
                                            icon="calendar-outline"
                                            label="Début"
                                            value={new Date(selected.occurence[0].date_start).toLocaleDateString('fr-FR')}
                                        />
                                        <InfoRow
                                            icon="calendar-outline"
                                            label="Fin"
                                            value={new Date(selected.occurence[0].date_end).toLocaleDateString('fr-FR')}
                                        />
                                        <InfoRow
                                            icon="people-outline"
                                            label="Limite"
                                            value={`${selected.occurence[0].limit_user} joueurs`}
                                            last
                                        />
                                    </View>
                                </>
                            )}

                            {/* Étapes */}
                            <Text style={st.modalSection}>
                                Étapes{detail ? ` (${detail.etape?.length ?? 0})` : ''}
                            </Text>

                            {loadingDetail ? (
                                <View style={st.detailLoading}>
                                    <ActivityIndicator size="small" color={Colors.gold} />
                                    <Text style={st.detailLoadingText}>Chargement des étapes...</Text>
                                </View>
                            ) : detail?.etape?.length ? (
                                <View style={st.etapesCard}>
                                    {detail.etape.map((e, i) => (
                                        <View key={e.id} style={[st.etapeRow, i < detail.etape.length - 1 && st.etapeBorder]}>
                                            <View style={st.etapeNum}>
                                                <Text style={st.etapeNumText}>{e.rank ?? i + 1}</Text>
                                            </View>
                                            <View style={st.etapeInfo}>
                                                <Text style={st.etapeName}>{e.name}</Text>
                                                {e.address && (
                                                    <Text style={st.etapeAddr} numberOfLines={1}>{e.address}</Text>
                                                )}
                                                {e.description && (
                                                    <Text style={st.etapeDesc} numberOfLines={2}>{e.description}</Text>
                                                )}
                                                {e.rayon && (
                                                    <Text style={st.etapeRayon}>Rayon : {e.rayon}m</Text>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={st.noEtapes}>
                                    <Text style={st.noEtapesText}>Aucune étape configurée</Text>
                                </View>
                            )}

                            {/* Info suppression */}
                            <View style={st.infoBox}>
                                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                                <Text style={st.infoBoxText}>
                                    La suppression d'une chasse est réservée au partenaire propriétaire.
                                </Text>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                )}
            </Modal>
        </ScreenBackground>
    );
}

function InfoRow({ icon, label, value, last = false }: {
    icon: string; label: string; value: string; last?: boolean;
}) {
    return (
        <View style={[ir.row, !last && ir.border]}>
            <Ionicons name={icon as any} size={15} color={Colors.textMuted} />
            <Text style={ir.label}>{label}</Text>
            <Text style={ir.value} numberOfLines={1}>{value}</Text>
        </View>
    );
}

const ir = StyleSheet.create({
    row:   { flexDirection: 'row', alignItems: 'center', gap: Sp.md, paddingVertical: 11 },
    border:{ borderBottomWidth: 1, borderBottomColor: Colors.borderWarm },
    label: { fontFamily: Fonts.title, fontSize: 11, color: Colors.textMuted, width: 70, letterSpacing: 0.5 },
    value: { fontFamily: Fonts.title, flex: 1, fontSize: 12, color: Colors.textPrimary, textAlign: 'right' },
});

const st = StyleSheet.create({
    safe:   { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list:   { paddingHorizontal: Sp.lg, paddingBottom: 100 },

    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: R.lg, borderWidth: 1, borderColor: Colors.borderWarm,
        overflow: 'hidden', gap: Sp.md, paddingRight: Sp.md,
    },
    cardImage: { width: 80, height: 80 },
    cardImagePlaceholder: {
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
    },
    cardBody:     { flex: 1, paddingVertical: Sp.sm, gap: 4 },
    cardTop:      { flexDirection: 'row', alignItems: 'center', gap: Sp.sm },
    cardName:     { fontFamily: Fonts.title, flex: 1, fontSize: 13, color: Colors.textPrimary },
    statusDot:    { width: 8, height: 8, borderRadius: 4 },
    cardMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardMetaText: { fontFamily: Fonts.title, fontSize: 10, color: Colors.textMuted, flex: 1 },
    cardFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
    cardId:       { fontFamily: Fonts.title, fontSize: 9, color: Colors.textMuted },

    empty:     { alignItems: 'center', gap: Sp.md, paddingTop: 80 },
    emptyText: { fontFamily: Fonts.title, fontSize: 14, color: Colors.textMuted },

    // Modal
    modalSafe:   { flex: 1, backgroundColor: Colors.bg },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Sp.lg, paddingVertical: Sp.md,
        borderBottomWidth: 1, borderBottomColor: Colors.borderWarm,
    },
    modalClose:  { padding: 4 },
    modalTitle:  { fontFamily: Fonts.title, fontSize: 15, color: Colors.textPrimary, letterSpacing: 0.5 },
    modalScroll: { paddingBottom: 60 },

    modalCover:      { width: '100%', height: 200 },
    modalCoverEmpty: { backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },

    modalHero:    { padding: Sp.lg, gap: Sp.sm },
    modalName:    { fontFamily: Fonts.display, fontSize: 20, color: Colors.textPrimary, letterSpacing: 1 },

    modalSection: {
        fontFamily: Fonts.title, fontSize: 9, color: Colors.gold,
        letterSpacing: 2, textTransform: 'uppercase',
        marginHorizontal: Sp.lg, marginTop: Sp.md, marginBottom: Sp.sm,
    },
    infoCard: {
        backgroundColor: Colors.bgCard, borderRadius: R.lg,
        borderWidth: 1, borderColor: Colors.borderWarm,
        paddingHorizontal: Sp.md, marginHorizontal: Sp.lg,
    },

    detailLoading:     { flexDirection: 'row', alignItems: 'center', gap: Sp.md, marginHorizontal: Sp.lg, padding: Sp.md },
    detailLoadingText: { fontFamily: Fonts.title, color: Colors.textMuted, fontSize: 12 },

    etapesCard: {
        backgroundColor: Colors.bgCard, borderRadius: R.lg,
        borderWidth: 1, borderColor: Colors.borderWarm,
        marginHorizontal: Sp.lg, overflow: 'hidden',
    },
    etapeRow:    { flexDirection: 'row', gap: Sp.md, padding: Sp.md },
    etapeBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderWarm },
    etapeNum:    {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.goldGlow, borderWidth: 1, borderColor: Colors.gold + '55',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    etapeNumText: { fontFamily: Fonts.display, fontSize: 12, color: Colors.gold },
    etapeInfo:    { flex: 1, gap: 2 },
    etapeName:    { fontFamily: Fonts.title, fontSize: 12, color: Colors.textPrimary },
    etapeAddr:    { fontFamily: Fonts.title, fontSize: 10, color: Colors.textMuted },
    etapeDesc:    { fontFamily: Fonts.title, fontSize: 10, color: Colors.textSecondary, lineHeight: 16 },
    etapeRayon:   { fontFamily: Fonts.title, fontSize: 9, color: Colors.gold },

    noEtapes:     { backgroundColor: Colors.bgCard, borderRadius: R.md, padding: Sp.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderWarm, marginHorizontal: Sp.lg },
    noEtapesText: { fontFamily: Fonts.title, color: Colors.textMuted, fontSize: 12 },

    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Sp.sm,
        backgroundColor: Colors.bgElevated, borderRadius: R.md, padding: Sp.md,
        borderWidth: 1, borderColor: Colors.borderWarm,
        margin: Sp.lg,
    },
    infoBoxText: { fontFamily: Fonts.title, flex: 1, color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
});
