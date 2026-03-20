import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    ActivityIndicator, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService, etapeService } from '../../../services/api';
import { Chasse, Etape } from '../../../constants/types';
import { Colors, Sp, R } from '../../../constants/theme';
import Btn from '../../../components/Btn';
import ChasseMapView from '../../../components/ChasseMapView';

const ETAT_COLOR: Record<string, string> = {
    PENDING: Colors.gold,
    ACTIVE: '#4caf50',
    COMPLETED: Colors.textMuted,
};

// ─── Sous-composant étape — clé portée par le parent ─────────────────────────
// (on ne retourne PAS de fragment ni de tableau ici, juste un View)
interface EtapeRowProps {
    etape: Etape;
    onEdit: () => void;
    onDelete: () => void;
}

function EtapeRow({ etape, onEdit, onDelete }: EtapeRowProps) {
    return (
        <View style={s.etapeCard}>
            {/* Badge rang — toujours rendu, pas conditionnel au niveau liste */}
            <View style={s.rankBadge}>
                <Text style={s.rankTxt}>{etape.rank ?? '?'}</Text>
            </View>

            {/* Image — rendu conditionnel à l'intérieur du View, pas en enfant direct du ScrollView */}
            {etape.image ? (
                <Image source={{ uri: etape.image }} style={s.etapeImg} resizeMode="cover" />
            ) : (
                <View style={s.etapeImgPlaceholder}>
                    <Ionicons name="image-outline" size={28} color={Colors.textMuted} />
                </View>
            )}

            <View style={s.etapeBody}>
                <Text style={s.etapeName}>{etape.name}</Text>

                {!!etape.address && (
                    <View style={s.inlineRow}>
                        <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                        <Text style={s.etapeAddr}>{etape.address}</Text>
                    </View>
                )}

                {!!etape.description && (
                    <Text style={s.etapeDesc} numberOfLines={2}>{etape.description}</Text>
                )}

                <View style={s.inlineRow}>
                    <Ionicons name="navigate-outline" size={12} color={Colors.textMuted} />
                    <Text style={s.etapeMeta}>
                        {parseFloat(etape.lat).toFixed(5)}, {parseFloat(etape.long).toFixed(5)}
                        {etape.rayon ? `  ·  r=${etape.rayon}m` : ''}
                    </Text>
                </View>

                <View style={s.actionsRow}>
                    <TouchableOpacity style={s.btnEdit} onPress={onEdit}>
                        <Ionicons name="pencil-outline" size={13} color={Colors.gold} />
                        <Text style={s.btnEditTxt}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.btnDel} onPress={onDelete}>
                        <Ionicons name="trash-outline" size={13} color={Colors.error} />
                        <Text style={s.btnDelTxt}>Supprimer</Text>
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

    const load = useCallback(async () => {
        try {
            const raw = await chasseService.getById(chasseId);
            setChasse(raw as unknown as Chasse);
            const e = await etapeService.getAll(chasseId);
            setEtapes([...e].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)));
        } catch (err) {
            console.log('Erreur chargement chasse:', err);
        } finally {
            setLoading(false);
        }
    }, [chasseId]);

    useEffect(() => { load(); }, [load]);

    const handleDeleteEtape = (etape: Etape) => {
        Alert.alert(
            'Supprimer l\'étape',
            `Voulez-vous supprimer "${etape.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive',
                    onPress: async () => {
                        try {
                            await etapeService.delete(chasseId, etape.id_etape);
                            setEtapes(prev => prev.filter(e => e.id_etape !== etape.id_etape));
                        } catch (err: any) {
                            Alert.alert('Erreur', err.message ?? 'Suppression échouée');
                        }
                    },
                },
            ]
        );
    };

    // ── États de chargement ────────────────────────────────────────────────────
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
                <Ionicons name="alert-circle-outline" size={40} color={Colors.textMuted} />
                <Text style={s.notFound}>Chasse introuvable</Text>
            </View>
        );
    }

    const occ = chasse.occurence?.[0];
    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const etatColor = ETAT_COLOR[chasse.etat] ?? Colors.textMuted;

    // ── Render ─────────────────────────────────────────────────────────────────
    // IMPORTANT : ScrollView n'a qu'un seul enfant direct (le <View> wrapper).
    // Tous les éléments conditionnels sont à l'intérieur de ce View.
    return (
        <SafeAreaView style={s.container}>
            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Unique enfant direct du ScrollView ── */}
                <View style={s.inner}>

                    {/* Back */}
                    <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Hero image */}
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
                                <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                                <Text style={s.meta}>{chasse.localisation}</Text>
                            </View>
                        ) : null}

                        {occ ? (
                            <View style={s.inlineRow}>
                                <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                                <Text style={s.meta}>{fmt(occ.date_start)} → {fmt(occ.date_end)}</Text>
                                <Ionicons name="people-outline" size={14} color={Colors.textMuted} style={{ marginLeft: 8 }} />
                                <Text style={s.meta}>{occ.limit_user} places</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Carte du parcours */}
                    <Text style={s.sectionLabel}>Carte du parcours</Text>
                    <ChasseMapView etapes={etapes} height={280} />

                    {/* CTA ajout étape */}
                    <Btn
                        label="+ Ajouter une étape"
                        onPress={() => router.push({
                            pathname: '/(partner)/(components)/add-etape',
                            params: { chasseId },
                        })}
                        style={{ marginTop: Sp.lg }}
                    />

                    {/* Section étapes */}
                    <Text style={[s.sectionLabel, { marginTop: Sp.xl }]}>
                        {`Étapes (${etapes.length})`}
                    </Text>

                    {etapes.length === 0 ? (
                        <View style={s.emptyEtapes}>
                            <Ionicons name="flag-outline" size={36} color={Colors.textMuted} />
                            <Text style={s.emptyTxt}>Aucune étape pour l'instant</Text>
                        </View>
                    ) : (
                        // Le key est sur EtapeRow directement — pas sur un fragment
                        etapes.map((etape) => (
                            <EtapeRow
                                key={String(etape.id_etape)}
                                etape={etape}
                                onEdit={() => router.push({
                                    pathname: '/(partner)/(components)/edit-etape',
                                    params: { chasseId, etapeId: etape.id_etape },
                                })}
                                onDelete={() => handleDeleteEtape(etape)}
                            />
                        ))
                    )}

                </View>
                {/* ── Fin unique enfant ── */}
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    // contentContainerStyle — pas de flex:1 ici pour que le scroll fonctionne
    scroll: { paddingBottom: 60 },
    // Le vrai wrapper avec le padding
    inner: { padding: Sp.lg },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    notFound: { color: Colors.textSecondary, fontSize: 15 },

    backBtn: {
        width: 38, height: 38, borderRadius: R.sm,
        backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
        alignItems: 'center', justifyContent: 'center', marginBottom: Sp.md,
    },

    heroWrap: { borderRadius: R.lg, overflow: 'hidden', marginBottom: Sp.md },
    hero: { width: '100%', height: 220 },

    infoBlock: { gap: 8, marginBottom: Sp.lg },
    inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
    meta: { fontSize: 13, color: Colors.textMuted },
    badge: { borderWidth: 1, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 3 },
    badgeTxt: { fontSize: 11, fontWeight: '700' },

    sectionLabel: {
        fontSize: 10, fontWeight: '700', color: Colors.gold,
        letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Sp.md,
    },

    emptyEtapes: { alignItems: 'center', gap: 8, paddingVertical: Sp.xl },
    emptyTxt: { fontSize: 14, color: Colors.textMuted },

    // Étape card
    etapeCard: {
        backgroundColor: Colors.bgCard, borderRadius: R.lg,
        overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
        marginBottom: Sp.md,
    },
    rankBadge: {
        position: 'absolute', top: Sp.sm, left: Sp.sm, zIndex: 10,
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.gold,
        alignItems: 'center', justifyContent: 'center',
    },
    rankTxt: { fontSize: 12, fontWeight: '800', color: Colors.black },
    etapeImg: { width: '100%', height: 150 },
    etapeImgPlaceholder: {
        width: '100%', height: 80,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
    },
    etapeBody: { padding: Sp.md, gap: 5 },
    etapeName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    etapeAddr: { fontSize: 12, color: Colors.textMuted, flex: 1 },
    etapeDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
    etapeMeta: { fontSize: 11, color: Colors.textMuted, flex: 1 },

    actionsRow: { flexDirection: 'row', gap: Sp.sm, marginTop: Sp.sm },
    btnEdit: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, borderRadius: R.md, borderWidth: 1,
        borderColor: Colors.gold + '55', backgroundColor: Colors.goldGlow, paddingVertical: 8,
    },
    btnEditTxt: { color: Colors.gold, fontSize: 12, fontWeight: '700' },
    btnDel: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, borderRadius: R.md, borderWidth: 1,
        borderColor: Colors.error + '55', backgroundColor: Colors.errorBg, paddingVertical: 8,
    },
    btnDelTxt: { color: Colors.error, fontSize: 12, fontWeight: '700' },
});