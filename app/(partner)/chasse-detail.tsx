import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { chasseService, etapeService } from '../../services/api';
import { Chasse, Etape } from '../../constants/types';
import { Colors, Sp, R } from '../../constants/theme';
import Btn from '../../components/Btn';

export default function ChasseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const chasseId = parseInt(id ?? '0');

    const [chasse, setChasse] = useState<Chasse | null>(null);
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [loading, setLoading] = useState(true);

    const loadChasse = useCallback(async () => {
        try {
            const c = await chasseService.getById(chasseId);
            setChasse(c);
            const e = await etapeService.getAll(chasseId);
            setEtapes([...e].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)));
        } catch (err) {
            console.log('Erreur chargement chasse:', err);
        } finally {
            setLoading(false);
        }
    }, [chasseId]);

    useEffect(() => { loadChasse(); }, [loadChasse]);

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.gold} />
        </View>
    );

    if (!chasse) return (
        <View style={styles.center}>
            <Text style={{ color: Colors.textSecondary }}>Chasse introuvable</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <Text style={styles.title}>{chasse.name}</Text>
                <Btn
                    label="Ajouter une étape"
                    onPress={() => router.push({ pathname: '/(partner)/add-etape', params: { chasseId } })}
                    style={{ marginBottom: Sp.lg }}
                />
                {etapes.map((etape) => (
                    <View key={etape.id} style={styles.etapeCard}>
                        {etape.image && <Image source={{ uri: etape.image }} style={styles.image} />}
                        <View style={styles.etapeInfo}>
                            <Text style={styles.etapeName}>{etape.name}</Text>
                            {etape.address && <Text style={styles.etapeAddr}>{etape.address}</Text>}
                            {etape.description && <Text style={styles.etapeDesc}>{etape.description}</Text>}
                            <Text style={styles.etapeMeta}>Lat: {parseFloat(etape.lat).toFixed(4)}, Lng: {parseFloat(etape.long).toFixed(4)}, r: {etape.rayon}m</Text>
                        </View>
                    </View>
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    scroll: { padding: Sp.lg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: Sp.sm },
    desc: { fontSize: 14, color: Colors.textSecondary, marginBottom: Sp.md },
    etapeCard: { marginBottom: Sp.md, backgroundColor: Colors.bgCard, borderRadius: R.md, overflow: 'hidden' },
    image: { width: '100%', height: 180 },
    etapeInfo: { padding: Sp.md, gap: 4 },
    etapeName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
    etapeAddr: { fontSize: 12, color: Colors.textMuted },
    etapeDesc: { fontSize: 13, color: Colors.textSecondary },
    etapeMeta: { fontSize: 11, color: Colors.textMuted },
});