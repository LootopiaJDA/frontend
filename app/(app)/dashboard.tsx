import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useAuth } from '@/context/AuthContext';
import { chasseService } from '@/services/api';
import { Chasse } from '@/constants/types';
import { Colors, Design, Fonts, Sp, R } from '@/constants/theme';
import ScreenBackground from '@/components/ScreenBackground';

import BoussoleSvg from '../../assets/images/boussole.svg';

const LOUPE  = require('../../assets/images/loupe.png');
const CARTE  = require('../../assets/images/carte.png');
const COFFRE = require('../../assets/images/coffre.png');

function HuntRow({ chasse, onPress }: { chasse: Chasse; onPress: () => void }) {
    return (
        <TouchableOpacity style={hr.wrap} onPress={onPress} activeOpacity={0.75}>
            {chasse.image ? (
                <Image source={{ uri: chasse.image }} style={hr.thumb} />
            ) : (
                <View style={[hr.thumb, hr.thumbFallback]}>
                    <Image source={COFFRE} style={{ width: 28, height: 28, opacity: 0.6 }} resizeMode="contain" />
                </View>
            )}
            <View style={hr.info}>
                <Text style={hr.name} numberOfLines={1}>{chasse.name}</Text>
                {chasse.localisation
                    ? <Text style={hr.meta} numberOfLines={1}>{chasse.localisation}</Text>
                    : null}
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.gold + '88'} />
        </TouchableOpacity>
    );
}

const hr = StyleSheet.create({
    wrap: {
        backgroundColor: Design.bg.card,
        borderRadius: R.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Design.border.warm,
        overflow: 'hidden',
        gap: Sp.md,
        paddingRight: Sp.md,
    },
    thumb: { width: 60, height: 60 },
    thumbFallback: {
        backgroundColor: '#0D0905',
        alignItems: 'center',
        justifyContent: 'center',
    },
    info:  { flex: 1, paddingVertical: Sp.sm },
    name:  { fontFamily: Fonts.title,   fontSize: 13, color: Design.text.heading, letterSpacing: 0.3 },
    meta:  { fontFamily: Fonts.title,   fontSize: 10, color: Colors.parchment,    marginTop: 3 },
});

export default function DashboardJoueurScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [allChasses, setAllChasses] = useState<Chasse[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await chasseService.getAll();
            setAllChasses(data.allChasse ?? []);
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (!user) return null;

    const initials       = user.username.slice(0, 2).toUpperCase();
    const chassesActives = allChasses.filter(c => c.etat === 'ACTIVE');

    return (
        <ScreenBackground style={st.safe}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={st.scroll}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); load(); }}
                        tintColor={Colors.gold}
                    />
                }
            >
                {/* ── Header ── */}
                <View style={st.header}>
                    <View>
                        <Text style={st.greeting}>BIENVENUE</Text>
                        <Text style={st.name}>{user.username}</Text>
                    </View>
                    <TouchableOpacity
                        style={st.avatar}
                        onPress={() => router.push('/(app)/profil')}
                        activeOpacity={0.8}
                    >
                        <Text style={st.avatarText}>{initials}</Text>
                        <View style={st.avatarDot} />
                    </TouchableOpacity>
                </View>

                {/* ── Hero ── */}
                <View style={st.heroBanner}>
                    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                        <LottieView
                            source={require('../../assets/animations/starburstanimation.json')}
                            autoPlay
                            loop
                            style={{ flex: 1, opacity: 0.12 }}
                        />
                    </View>
                    <View style={st.heroLeft}>
                        <Text style={st.heroTagline}>LA QUÊTE COMMENCE</Text>
                        <Text style={st.heroTitle}>L'aventure{'\n'}vous attend</Text>
                    </View>
                    <BoussoleSvg width={72} height={72} opacity={0.85} />
                </View>

                {/* ── Actions rapides ── */}
                <View style={st.quickRow}>
                    <TouchableOpacity
                        style={[st.quickCard, { borderColor: Colors.gold + '44' }]}
                        onPress={() => router.push('/(app)/chasses')}
                        activeOpacity={0.75}
                    >
                        <Image source={LOUPE} style={st.quickImg} resizeMode="contain" />
                        <Text style={st.quickLabel}>Explorer</Text>
                        <Text style={st.quickSub}>Toutes les chasses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[st.quickCard, { borderColor: Colors.parchment + '33' }]}
                        onPress={() => router.push('/(app)/map')}
                        activeOpacity={0.75}
                    >
                        <Image source={CARTE} style={st.quickImg} resizeMode="contain" />
                        <Text style={st.quickLabel}>Ma Carte</Text>
                        <Text style={st.quickSub}>Chasse en cours</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Liste des chasses ── */}
                {loading ? (
                    <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
                ) : chassesActives.length === 0 ? (
                    <View style={st.empty}>
                        <Image source={COFFRE} style={st.emptyImg} resizeMode="contain" />
                        <Text style={st.emptyTitle}>Aucun trésor en vue</Text>
                        <Text style={st.emptySub}>Les cartes aux trésors arrivent bientôt...</Text>
                    </View>
                ) : (
                    <>
                        <View style={st.sectionHd}>
                            <View style={st.sectionLine} />
                            <Text style={st.sectionTitle}>
                                TRÉSORS · {chassesActives.length}
                            </Text>
                            <View style={st.sectionLine} />
                        </View>
                        <View style={st.moreWrap}>
                            <TouchableOpacity onPress={() => router.push('/(app)/chasses')}>
                                <Text style={st.sectionAction}>Voir tout →</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={st.huntList}>
                            {chassesActives.slice(0, 5).map(c => (
                                <HuntRow
                                    key={`hunt-${c.id_chasse}`}
                                    chasse={c}
                                    onPress={() => router.push({
                                        pathname: '/(app)/chasse/[id]',
                                        params: { id: c.id_chasse },
                                    })}
                                />
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenBackground>
    );
}

const st = StyleSheet.create({
    safe:   { flex: 1 },
    scroll: { paddingBottom: 60 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Sp.lg, paddingTop: Sp.xxl, paddingBottom: Sp.sm,
    },
    greeting: {
        fontFamily: Fonts.title, fontSize: 9, color: Colors.parchment,
        letterSpacing: 3, marginBottom: 2,
    },
    name: { fontFamily: Fonts.display, fontSize: 22, color: Design.text.heading, letterSpacing: 1 },

    avatar: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: Design.bg.elevated,
        borderWidth: 1.5, borderColor: Colors.gold + '44',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontFamily: Fonts.display, fontSize: 14, color: Colors.gold },
    avatarDot:  {
        position: 'absolute', top: -3, right: -3,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: Colors.success, borderWidth: 2, borderColor: '#0A0700',
    },

    heroBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginHorizontal: Sp.lg, marginVertical: Sp.md,
        backgroundColor: Design.bg.card,
        borderRadius: R.xl, borderWidth: 1, borderColor: Colors.gold + '30',
        padding: Sp.lg, overflow: 'hidden',
    },
    heroLeft:    { flex: 1, gap: 6 },
    heroTagline: { fontFamily: Fonts.title, fontSize: 9, color: Colors.parchment, letterSpacing: 3 },
    heroTitle:   { fontFamily: Fonts.display, fontSize: 20, color: Design.text.heading, lineHeight: 26, letterSpacing: 0.5 },

    quickRow: {
        flexDirection: 'row', gap: Sp.md,
        paddingHorizontal: Sp.lg, marginBottom: Sp.lg,
    },
    quickCard: {
        flex: 1, backgroundColor: Design.bg.card,
        borderRadius: R.xl, borderWidth: 1,
        padding: Sp.md, gap: 4, alignItems: 'flex-start',
    },
    quickImg:   { width: 40, height: 40, marginBottom: 4, opacity: 0.9 },
    quickLabel: { fontFamily: Fonts.title,   fontSize: 13, color: Design.text.heading, letterSpacing: 0.3 },
    quickSub:   { fontFamily: Fonts.title,   fontSize: 9,  color: Colors.parchment, letterSpacing: 0.5 },

    sectionHd: {
        flexDirection: 'row', alignItems: 'center', gap: Sp.md,
        paddingHorizontal: Sp.lg, marginBottom: Sp.xs,
    },
    sectionLine:   { flex: 1, height: 1, backgroundColor: Colors.gold + '30' },
    sectionTitle:  { fontFamily: Fonts.title, fontSize: 9, color: Colors.gold, letterSpacing: 2 },
    moreWrap:      { paddingHorizontal: Sp.lg, marginBottom: Sp.sm, alignItems: 'flex-end' },
    sectionAction: { fontFamily: Fonts.title, fontSize: 11, color: Colors.gold },

    huntList: { paddingHorizontal: Sp.lg, gap: Sp.sm },

    empty:      { alignItems: 'center', gap: Sp.md, paddingVertical: Sp.xl, paddingHorizontal: Sp.xl },
    emptyImg:   { width: 90, height: 90, opacity: 0.55, marginBottom: Sp.sm },
    emptyTitle: { fontFamily: Fonts.display, fontSize: 16, color: Design.text.label, letterSpacing: 0.5 },
    emptySub:   { fontFamily: Fonts.title,   fontSize: 11, color: Colors.parchment, textAlign: 'center', lineHeight: 18 },
});
