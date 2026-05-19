import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors, Design, Fonts, Sp, R } from '@/constants/theme';
import { chasseService, scoreService } from '@/services/api';
import { UserChasse, ScoreBoard } from '@/constants/types';

interface HuntResult {
    userChasse: UserChasse;
    score: number;      // backend score (1 = 100 pts)
    etapesDone: number;
}

export default function ResultatsScreen() {
    const { user } = useAuth();
    const router   = useRouter();

    const [results, setResults]   = useState<HuntResult[]>([]);
    const [loading, setLoading]   = useState(true);
    const [totalPts, setTotalPts] = useState(0);

    useEffect(() => {
        if (!user) return;
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [{ chasses }, scores] = await Promise.all([
                chasseService.getMe(),
                scoreService.getAll().catch(() => [] as ScoreBoard[]),
            ]);

            const myScores = (scores as ScoreBoard[]).filter(s => s.id_user === user!.id_user);

            const built: HuntResult[] = chasses.map(uc => {
                const sb = myScores.find(s => s.id_chasse === uc.id_chasse);
                return {
                    userChasse: uc,
                    score: sb?.score ?? 0,
                    etapesDone: uc.UserChasseEtape?.length ?? 0,
                };
            }).sort((a, b) => {
                // Completées d'abord, puis par date décroissante
                if (a.userChasse.statut === 'COMPLETED' && b.userChasse.statut !== 'COMPLETED') return -1;
                if (b.userChasse.statut === 'COMPLETED' && a.userChasse.statut !== 'COMPLETED') return 1;
                const da = a.userChasse.completed_at ?? a.userChasse.started_at;
                const db = b.userChasse.completed_at ?? b.userChasse.started_at;
                return new Date(db).getTime() - new Date(da).getTime();
            });

            setResults(built);
            setTotalPts(myScores.reduce((acc, s) => acc + s.score * 100, 0));
        } catch {
            /* silently fail */
        } finally {
            setLoading(false);
        }
    };

    const completed   = results.filter(r => r.userChasse.statut === 'COMPLETED');
    const inProgress  = results.filter(r => r.userChasse.statut === 'IN_PROGRESS');

    if (loading) {
        return (
            <SafeAreaView style={st.safe}>
                <View style={st.center}>
                    <ActivityIndicator size="large" color={Colors.gold} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={st.safe}>
            <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={st.header}>
                    <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={st.headerText}>
                        <Text style={st.title}>Scores & Résultats</Text>
                        <Text style={st.subtitle}>{user?.username}</Text>
                    </View>
                </View>

                {/* Résumé global */}
                <View style={st.summaryCard}>
                    <View style={st.summaryItem}>
                        <Text style={st.summaryVal}>{totalPts}</Text>
                        <Text style={st.summaryLabel}>Points{'\n'}totaux</Text>
                    </View>
                    <View style={[st.summaryItem, st.summaryBorder]}>
                        <Text style={st.summaryVal}>{completed.length}</Text>
                        <Text style={st.summaryLabel}>Chasses{'\n'}terminées</Text>
                    </View>
                    <View style={st.summaryItem}>
                        <Text style={st.summaryVal}>{results.reduce((a, r) => a + r.etapesDone, 0)}</Text>
                        <Text style={st.summaryLabel}>Étapes{'\n'}validées</Text>
                    </View>
                </View>

                {/* Chasses terminées */}
                {completed.length > 0 && (
                    <>
                        <SectionHeader icon="trophy" label={`Terminées (${completed.length})`} color={Colors.gold} />
                        <View style={st.list}>
                            {completed.map(r => (
                                <ResultCard key={r.userChasse.id_userchasse} result={r} />
                            ))}
                        </View>
                    </>
                )}

                {/* Chasses en cours */}
                {inProgress.length > 0 && (
                    <>
                        <SectionHeader icon="walk" label={`En cours (${inProgress.length})`} color={Colors.parchment} />
                        <View style={st.list}>
                            {inProgress.map(r => (
                                <ResultCard key={r.userChasse.id_userchasse} result={r} />
                            ))}
                        </View>
                    </>
                )}

                {results.length === 0 && (
                    <View style={st.empty}>
                        <Ionicons name="map-outline" size={52} color={Colors.textMuted} />
                        <Text style={st.emptyTitle}>Aucune chasse</Text>
                        <Text style={st.emptySub}>Rejoignez une chasse pour voir vos résultats ici.</Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────
function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
    return (
        <View style={sh.row}>
            <View style={[sh.icon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                <Ionicons name={icon as any} size={14} color={color} />
            </View>
            <Text style={[sh.label, { color }]}>{label}</Text>
            <View style={[sh.line, { backgroundColor: color + '33' }]} />
        </View>
    );
}

const sh = StyleSheet.create({
    row:   { flexDirection: 'row', alignItems: 'center', gap: Sp.sm, marginHorizontal: Sp.lg, marginBottom: Sp.sm, marginTop: Sp.md },
    icon:  { width: 24, height: 24, borderRadius: R.xs, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    label: { fontFamily: Fonts.title, fontSize: 11, letterSpacing: 1.5 },
    line:  { flex: 1, height: 1 },
});

function ResultCard({ result }: { result: HuntResult }) {
    const { userChasse, score, etapesDone } = result;
    const isDone = userChasse.statut === 'COMPLETED';
    const pts    = score * 100;

    return (
        <View style={rc.card}>
            {/* Icône statut */}
            <View style={[rc.iconWrap, { backgroundColor: isDone ? Colors.success + '22' : Colors.gold + '22' }]}>
                <Ionicons
                    name={isDone ? 'checkmark-circle' : 'time-outline'}
                    size={22}
                    color={isDone ? Colors.success : Colors.gold}
                />
            </View>

            {/* Infos */}
            <View style={rc.body}>
                <Text style={rc.name} numberOfLines={1}>
                    {userChasse.chasse?.name ?? `Chasse #${userChasse.id_chasse}`}
                </Text>

                <View style={rc.metaRow}>
                    <Ionicons name="flag-outline" size={11} color={Colors.textMuted} />
                    <Text style={rc.meta}>{etapesDone} étape{etapesDone !== 1 ? 's' : ''} validée{etapesDone !== 1 ? 's' : ''}</Text>

                    {userChasse.completed_at && (
                        <>
                            <Text style={rc.dot}>·</Text>
                            <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
                            <Text style={rc.meta}>
                                {new Date(userChasse.completed_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </Text>
                        </>
                    )}
                </View>
            </View>

            {/* Score */}
            <View style={rc.scoreWrap}>
                {isDone ? (
                    <>
                        <Text style={rc.scoreVal}>{pts}</Text>
                        <Text style={rc.scorePts}>pts</Text>
                    </>
                ) : (
                    <Text style={rc.inProgress}>En cours</Text>
                )}
            </View>
        </View>
    );
}

const rc = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.md,
        backgroundColor: Design.bg.card, borderRadius: R.lg,
        borderWidth: 1, borderColor: Design.border.warm,
        padding: Sp.md,
    },
    iconWrap:   { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
    body:       { flex: 1, gap: 4 },
    name:       { fontFamily: Fonts.title, fontSize: 13, color: Design.text.heading },
    metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
    meta:       { fontFamily: Fonts.title, fontSize: 10, color: Design.text.meta },
    dot:        { color: Design.text.meta, fontSize: 10 },
    scoreWrap:  { alignItems: 'flex-end', minWidth: 52 },
    scoreVal:   { fontFamily: Fonts.display, fontSize: 18, color: Colors.gold },
    scorePts:   { fontFamily: Fonts.title, fontSize: 9, color: Colors.textMuted },
    inProgress: { fontFamily: Fonts.title, fontSize: 10, color: Colors.parchment },
});

const st = StyleSheet.create({
    safe:   { flex: 1, backgroundColor: Design.bg.screen },
    scroll: { paddingBottom: 60 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.md,
        paddingHorizontal: Sp.lg, paddingTop: Sp.md, paddingBottom: Sp.lg,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: R.sm,
        backgroundColor: Design.bg.elevated, borderWidth: 1, borderColor: Design.border.default,
        alignItems: 'center', justifyContent: 'center',
    },
    headerText: { flex: 1 },
    title:      { fontFamily: Fonts.display, fontSize: 18, color: Design.text.heading, letterSpacing: 1 },
    subtitle:   { fontFamily: Fonts.title, fontSize: 11, color: Design.text.accent, letterSpacing: 1 },

    summaryCard: {
        flexDirection: 'row',
        marginHorizontal: Sp.lg, marginBottom: Sp.md,
        backgroundColor: Design.bg.card,
        borderRadius: R.lg, borderWidth: 1, borderColor: Design.border.warm,
        overflow: 'hidden',
    },
    summaryItem:   { flex: 1, alignItems: 'center', padding: Sp.md, gap: 4 },
    summaryBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Design.border.warm },
    summaryVal:    { fontFamily: Fonts.display, fontSize: 22, color: Colors.gold },
    summaryLabel:  { fontFamily: Fonts.title, fontSize: 10, color: Design.text.meta, textAlign: 'center', lineHeight: 16 },

    list:  { paddingHorizontal: Sp.lg, gap: Sp.sm },

    empty:      { alignItems: 'center', gap: Sp.md, paddingTop: 80, paddingHorizontal: Sp.xl },
    emptyTitle: { fontFamily: Fonts.display, fontSize: 18, color: Design.text.heading },
    emptySub:   { fontFamily: Fonts.title, fontSize: 13, color: Design.text.meta, textAlign: 'center', lineHeight: 20 },
});
