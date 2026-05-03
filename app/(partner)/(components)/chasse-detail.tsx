import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService, etapeService } from '../../../services/api';
import { Chasse, Etape } from '../../../constants/types';
import { Colors, Design, Sp, R } from '../../../constants/theme';
import Btn from '../../../components/Btn';
import ChasseMapView from '../../../components/ChasseMapView';
import EtapeFormModal from '../../../components/EtapeFormModal';

const ETAT_COLOR: Record<string, string> = {
    PENDING: Colors.gold,
    ACTIVE: Design.status.ACTIVE.color,
    COMPLETED: Design.text.meta,
};

/**
 * L'API GET /etape?idChasse=X peut retourner "id" ou "id_etape" selon l'endpoint.
 * On normalise ici pour être sûr d'avoir toujours id_etape.
 */
function normalizeEtape(raw: any): Etape {
    return {
        ...raw,
        id_etape: raw.id_etape ?? raw.id ?? Math.random(), // fallback random évite les clés undefined
    };
}

// ─── Sous-composant ligne étape ───────────────────────────────────────────────
interface EtapeRowProps {
    etape: Etape;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

function EtapeRow({ etape, onEdit, onDelete, isDeleting }: EtapeRowProps) {
    return (
        <View style={s.etapeCard}>
            <View style={s.rankBadge}>
                <Text style={s.rankTxt}>{etape.rank ?? '?'}</Text>
            </View>

            {etape.image ? (
                <Image source={{ uri: etape.image }} style={s.etapeImg} resizeMode="cover" />
            ) : (
                <View style={s.etapeImgPlaceholder}>
                    <Ionicons name="image-outline" size={28} color={Design.text.meta} />
                </View>
            )}

            <View style={s.etapeBody}>
                <Text style={s.etapeName}>{etape.name}</Text>

                {!!etape.address && (
                    <View style={s.inlineRow}>
                        <Ionicons name="location-outline" size={12} color={Design.text.meta} />
                        <Text style={s.etapeAddr}>{etape.address}</Text>
                    </View>
                )}

                {!!etape.description && (
                    <Text style={s.etapeDesc} numberOfLines={2}>{etape.description}</Text>
                )}

                <View style={s.inlineRow}>
                    <Ionicons name="navigate-outline" size={12} color={Design.text.meta} />
                    <Text style={s.etapeMeta}>
                        {parseFloat(etape.lat).toFixed(5)}, {parseFloat(etape.long).toFixed(5)}
                        {etape.rayon ? `  ·  r=${etape.rayon}m` : ''}
                    </Text>
                </View>

                <View style={s.actionsRow}>
                    <TouchableOpacity style={s.btnEdit} onPress={onEdit}>
                        <Ionicons name="pencil-outline" size={13} color={Design.text.accent} />
                        <Text style={s.btnEditTxt}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.btnDel, isDeleting && { opacity: 0.6 }]} onPress={onDelete} disabled={isDeleting}>
                        {isDeleting
                            ? <ActivityIndicator size="small" color={Colors.error} />
                            : <Ionicons name="trash-outline" size={13} color={Colors.error} />
                        }
                        <Text style={s.btnDelTxt}>{isDeleting ? 'Suppression...' : 'Supprimer'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ChasseDetail() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const chasseId = Number(id);
    const router = useRouter();

    const [chasse, setChasse] = useState<Chasse | null>(null);
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [etapeModal, setEtapeModal] = useState<{
        visible: boolean;
        mode: 'create' | 'edit';
        etape: Etape | null;
    }>({ visible: false, mode: 'create', etape: null });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            // getById retourne ChasseDetail — on le cast en Chasse
            const raw = await chasseService.getById(chasseId);
            setChasse(raw as unknown as Chasse);

            // Charger les étapes séparément et normaliser les ids
            const rawEtapes = await etapeService.getAll(chasseId);
            const normalized = rawEtapes
                .map(normalizeEtape)
                .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
            setEtapes(normalized);
        } catch (err) {
            console.log('Erreur chargement chasse:', err);
        } finally {
            setLoading(false);
        }
    }, [chasseId]);

    // useFocusEffect → reload quand on revient de add-etape ou edit-etape
    useFocusEffect(useCallback(() => {
        load();
    }, [load]));

    const handleDeleteEtape = (etape: Etape) => {
        Alert.alert(
            '🗑 Supprimer l\'étape',
            `Voulez-vous vraiment supprimer "${etape.name}" ?\nCette action est irréversible.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(etape.id_etape);
                        try {
                            await etapeService.delete(chasseId, etape.id_etape);
                            setEtapes(prev => prev.filter(e => e.id_etape !== etape.id_etape));
                        } catch (err: any) {
                            Alert.alert('Erreur', err.message ?? 'Suppression échouée');
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        );
    }

    if (!chasse) {
        return (
            <View style={s.center}>
                <Ionicons name="alert-circle-outline" size={40} color={Design.text.meta} />
                <Text style={s.notFound}>Chasse introuvable</Text>
            </View>
        );
    }

    const occ = chasse.occurence?.[0];
    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const etatColor = ETAT_COLOR[chasse.etat] ?? Design.text.meta;

    return (
        <SafeAreaView style={s.container}>
            {/*
        ScrollView avec UN SEUL enfant direct (<View style={s.inner}>).
        Tous les éléments conditionnels sont DANS ce View.
        C'est la seule façon d'éviter l'erreur "key prop" sur les enfants du ScrollView.
      */}
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <View style={s.inner}>

                    {/* Back */}
                    <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={20} color={Design.text.heading} />
                    </TouchableOpacity>

                    {/* Hero */}
                    {chasse.image ? (
                        <View style={s.heroWrap}>
                            <Image source={{ uri: chasse.image }} style={s.hero} resizeMode="cover" />
                        </View>
                    ) : null}

                    {/* Infos */}
                    <View style={s.infoBlock}>
                        <View style={s.inlineRow}>
                            <Text style={s.title}>{chasse.name}</Text>
                            <View style={[s.badge, { borderColor: etatColor }]}>
                                <Text style={[s.badgeTxt, { color: etatColor }]}>{chasse.etat}</Text>
                            </View>
                        </View>

                        {chasse.localisation ? (
                            <View style={s.inlineRow}>
                                <Ionicons name="location-outline" size={14} color={Design.text.meta} />
                                <Text style={s.meta}>{chasse.localisation}</Text>
                            </View>
                        ) : null}

                        {occ ? (
                            <View style={s.inlineRow}>
                                <Ionicons name="calendar-outline" size={14} color={Design.text.meta} />
                                <Text style={s.meta}>{fmt(occ.date_start)} → {fmt(occ.date_end)}</Text>
                                <Ionicons name="people-outline" size={14} color={Design.text.meta} style={{ marginLeft: 8 }} />
                                <Text style={s.meta}>{occ.limit_user} places</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Carte */}
                    <Text style={s.sectionLabel}>Carte du parcours</Text>
                    <ChasseMapView etapes={etapes} height={280} />

                    {/* Actions chasse */}
                    <View style={s.actionsBlock}>
                        <Btn
                            label="+ Ajouter une étape"
                            onPress={() => setEtapeModal({ visible: true, mode: 'create', etape: null })}
                        />
                    </View>

                    {/* Liste étapes */}
                    <Text style={[s.sectionLabel, { marginTop: Sp.xl }]}>
                        {`Étapes (${etapes.length})`}
                    </Text>

                    {etapes.length === 0 ? (
                        <View style={s.emptyEtapes}>
                            <Ionicons name="flag-outline" size={36} color={Design.text.meta} />
                            <Text style={s.emptyTxt}>{"Aucune étape pour l'instant"}</Text>
                        </View>
                    ) : (
                        etapes.map((etape, index) => (
                            // On utilise index en fallback si id_etape est encore undefined
                            <EtapeRow
                                key={`etape-${etape.id_etape ?? index}`}
                                etape={etape}
                                onEdit={() => setEtapeModal({ visible: true, mode: 'edit', etape })}
                                onDelete={() => handleDeleteEtape(etape)}
                                isDeleting={deletingId === etape.id_etape}
                            />
                        ))
                    )
                    }
                </View>
            </ScrollView>

            <EtapeFormModal
                visible={etapeModal.visible}
                mode={etapeModal.mode}
                chasseId={chasseId}
                etape={etapeModal.etape}
                nextRank={etapes.length + 1}
                onClose={() => setEtapeModal(m => ({ ...m, visible: false }))}
                onSaved={load}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Design.bg.screen },
    scroll: { paddingBottom: 60 },
    inner: { padding: Sp.lg },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    notFound: { color: Design.text.label, fontSize: 15 },

    backBtn: {
        width: 38, height: 38, borderRadius: R.sm,
        backgroundColor: Design.bg.elevated, borderWidth: 1, borderColor: Design.border.default,
        alignItems: 'center', justifyContent: 'center', marginBottom: Sp.md,
    },

    heroWrap: { borderRadius: R.lg, overflow: 'hidden', marginBottom: Sp.md },
    hero: { width: '100%', height: 220 },

    infoBlock: { gap: 8, marginBottom: Sp.lg },
    inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    title: { flex: 1, fontSize: 22, fontWeight: '800', color: Design.text.heading },
    meta: { fontSize: 13, color: Design.text.meta },
    badge: { borderWidth: 1, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 3 },
    badgeTxt: { fontSize: 11, fontWeight: '700' },

    sectionLabel: {
        fontSize: 10, fontWeight: '700', color: Design.text.accent,
        letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.md,
    },

    emptyEtapes: { alignItems: 'center', gap: 8, paddingVertical: Sp.xl },
    emptyTxt: { fontSize: 14, color: Design.text.meta },

    etapeCard: {
        backgroundColor: Design.bg.card, borderRadius: R.lg,
        overflow: 'hidden', borderWidth: 1, borderColor: Design.border.default, marginBottom: Sp.md,
    },
    rankBadge: {
        position: 'absolute', top: Sp.sm, left: Sp.sm, zIndex: 10,
        width: 28, height: 28, borderRadius: 14, backgroundColor: Design.button.primary.bg,
        alignItems: 'center', justifyContent: 'center',
    },
    rankTxt: { fontSize: 12, fontWeight: '800', color: Design.text.onSolid },
    etapeImg: { width: '100%', height: 150 },
    etapeImgPlaceholder: {
        width: '100%', height: 80, backgroundColor: Design.bg.elevated,
        alignItems: 'center', justifyContent: 'center',
    },
    etapeBody: { padding: Sp.md, gap: 5 },
    etapeName: { fontSize: 15, fontWeight: '700', color: Design.text.heading },
    etapeAddr: { fontSize: 12, color: Design.text.meta, flex: 1 },
    etapeDesc: { fontSize: 13, color: Design.text.label, lineHeight: 18 },
    etapeMeta: { fontSize: 11, color: Design.text.meta, flex: 1 },

    actionsBlock: { gap: Sp.md, marginTop: Sp.lg },
    testBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderWidth: 1, borderColor: Colors.gold + '55',
        backgroundColor: Design.bg.gold, borderRadius: R.md, paddingVertical: 14,
    },
    testBtnText: { fontSize: 14, fontWeight: '700', color: Design.text.accent },
    actionsRow: { flexDirection: 'row', gap: Sp.sm, marginTop: Sp.sm },
    btnEdit: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, borderRadius: R.md, borderWidth: 1,
        borderColor: Colors.gold + '55', backgroundColor: Design.bg.gold, paddingVertical: 8,
    },
    btnEditTxt: { color: Design.text.accent, fontSize: 12, fontWeight: '700' },
    btnDel: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, borderRadius: R.md, borderWidth: 1,
        borderColor: Colors.error + '55', backgroundColor: Design.bg.danger, paddingVertical: 8,
    },
    btnDelTxt: { color: Colors.error, fontSize: 12, fontWeight: '700' },
});
