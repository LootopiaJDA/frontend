import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sp } from '@/constants/theme';
import PageHeader from '@/components/PageHeader';

/**
 * MapScreen — onglet Carte du joueur.
 * Placeholder en attente de l'intégration MapView complète.
 * Remplacer le <View style={st.mapPlaceholder}> par un <MapView>
 * une fois la logique GPS/chasses actives prête.
 */
export default function MapScreen() {
    return (
        <SafeAreaView style={st.safe}>
            <PageHeader title="Carte" subtitle="Ma position" />

            <View style={st.mapPlaceholder}>
                <View style={st.iconWrap}>
                    <Ionicons name="location" size={40} color={Colors.gold} />
                </View>
                <Text style={st.title}>Carte interactive</Text>
                <Text style={st.sub}>
                    Les chasses auxquelles vous participez{'\n'}apparaîtront ici sur la carte.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:           { flex: 1, backgroundColor: Colors.bg },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Sp.md,
        paddingHorizontal: Sp.xl,
    },
    iconWrap: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: Colors.goldGlow,
        borderWidth: 1, borderColor: Colors.gold + '30',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Sp.sm,
    },
    title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
    sub:   { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
});