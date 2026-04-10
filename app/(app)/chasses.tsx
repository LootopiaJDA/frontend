import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService } from '@/services/api';
import { Chasse } from '@/constants/types';
import { Colors, Sp } from '@/constants/theme';
import ChasseCard from '@/components/ChasseCard';
import PageHeader from '@/components/PageHeader';

export default function ChassesScreen() {
    const router = useRouter();
    const [chasses, setChasses] = useState<Chasse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await chasseService.getAll();
            setChasses(data.allChasse ?? []);
        } catch (err) {
            console.log('Erreur chargement chasses:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (loading) {
        return (
            <View style={st.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        );
    }

    return (
        <SafeAreaView style={st.safe}>
            {/* PageHeader réutilisé ✅ */}
            <PageHeader
                title="Chasses"
                subtitle="Explorer"
            />

            <FlatList
                data={chasses}
                keyExtractor={item => `chasse-${item.id_chasse}`}
                contentContainerStyle={st.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); load(); }}
                        tintColor={Colors.gold}
                    />
                }
                // ChasseCard réutilisé ✅
                renderItem={({ item }) => (
                    <ChasseCard
                        chasse={item}
                        onPress={() =>
                            router.push({
                                pathname: '/(app)/chasse/[id]',
                                params: { id: item.id_chasse },
                            })
                        }
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: Sp.md }} />}
                ListEmptyComponent={
                    <View style={st.empty}>
                        <Ionicons name="map-outline" size={52} color={Colors.textMuted} />
                        <Text style={st.emptyTitle}>Aucune chasse disponible</Text>
                        <Text style={st.emptySub}>Revenez bientôt pour de nouvelles aventures</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:       { flex: 1, backgroundColor: Colors.bg },
    center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
    list:       { paddingHorizontal: Sp.lg, paddingBottom: 100 },
    empty:      { alignItems: 'center', gap: 10, paddingTop: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
    emptySub:   { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});