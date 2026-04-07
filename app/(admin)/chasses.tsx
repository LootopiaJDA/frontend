import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chasseService } from '@/services/api';
import { Chasse } from '@/constants/types';
import { Colors, Sp } from '@/constants/theme';
import PageHeader from '@/components/PageHeader';
import ChasseCard from '@/components/ChasseCard';

export default function AdminChassesScreen() {
    const [chasses, setChasses] = useState<Chasse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await chasseService.getAll();
            setChasses(data.allChasse ?? []);
            console.log(data)
        } catch (err) {
            console.log('Erreur chargement chasses admin:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const handleDelete = (chasse: Chasse) => {
        Alert.alert(
            'Supprimer la chasse',
            `Supprimer "${chasse.name}" ? Action irréversible.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive',
                    onPress: async () => {
                        try {
                            await chasseService.delete(chasse.id_chasse);
                            setChasses(prev => prev.filter(c => c.id_chasse !== chasse.id_chasse));
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
            <PageHeader title="Chasses" subtitle={`${chasses.length} au total`} />

            <FlatList
                data={chasses}
                keyExtractor={c => `admin-chasse-${c.id_chasse}`}
                contentContainerStyle={st.list}
                showsVerticalScrollIndicator={false}
                onRefresh={() => { setRefreshing(true); load(); }}
                refreshing={refreshing}
                // ChasseCard ✅ réutilisé — onPress ouvre une action de suppression
                renderItem={({ item }) => (
                    <ChasseCard
                        chasse={item}
                        onPress={() => handleDelete(item)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: Sp.md }} />}
                ListEmptyComponent={
                    <View style={st.empty}>
                        <Ionicons name="map-outline" size={48} color={Colors.textMuted} />
                        <Text style={st.emptyText}>Aucune chasse</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe:      { flex: 1, backgroundColor: Colors.bg },
    center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
    list:      { paddingHorizontal: Sp.lg, paddingBottom: 100 },
    empty:     { alignItems: 'center', gap: Sp.md, paddingTop: 80 },
    emptyText: { fontSize: 16, color: Colors.textMuted },
});