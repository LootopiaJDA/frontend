import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Sp, R } from '../../constants/theme';

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
    return (
        <View style={[styles.iconWrap, focused && styles.active]}>
            <Ionicons name={name} size={22} color={focused ? Colors.gold : Colors.textMuted} />
        </View>
    );
}

export default function PartnerLayout() {
    const { user, loading } = useAuth();

    if (loading) return (
        <View style={styles.loadingBg}>
            <ActivityIndicator color={Colors.gold} size="large" />
        </View>
    );

    if (!user) return <Redirect href="/(auth)/login" />;
    if (user.role === 'JOUEUR') return <Redirect href="/(app)/chasses" />;

    if (user.partenaire?.statut === 'VERIFICATION') {
        return (
            <View style={styles.pendingBg}>
                <View style={styles.pendingCard}>
                    <Text style={styles.pendingEmoji}>⏳</Text>
                    <Text style={styles.pendingTitle}>Compte en vérification</Text>
                    <Text style={styles.pendingText}>
                        Votre compte partenaire est en cours d'examen par notre équipe.{'\n'}
                        Vous recevrez un email d'activation sous 24-48h ouvrées.
                    </Text>
                    <View style={styles.pendingMeta}>
                        <Ionicons name="business-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.pendingMetaText}>{user.partenaire?.company_name}</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'grid' : 'grid-outline'} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
                }}
            />

            {/* Écrans cachés de la tab bar */}
            <Tabs.Screen name="add-etape" options={{ href: null }} />
            <Tabs.Screen name="chasse-detail" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    loadingBg: {
        flex: 1, backgroundColor: Colors.bg,
        alignItems: 'center', justifyContent: 'center',
    },
    pendingBg: {
        flex: 1, backgroundColor: Colors.bg,
        alignItems: 'center', justifyContent: 'center', padding: Sp.xl,
    },
    pendingCard: {
        backgroundColor: Colors.bgCard, borderRadius: R.xl,
        borderWidth: 1, borderColor: Colors.border,
        padding: Sp.xl, alignItems: 'center', gap: Sp.md, maxWidth: 340,
    },
    pendingEmoji: { fontSize: 52 },
    pendingTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
    pendingText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
    pendingMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Sp.xs },
    pendingMetaText: { color: Colors.textMuted, fontSize: 13 },
    tabBar: {
        backgroundColor: Colors.bgCard,
        borderTopWidth: 1, borderTopColor: Colors.border,
        height: 72, paddingBottom: 10, paddingTop: 6,
    },
    iconWrap: {
        width: 44, height: 44,
        alignItems: 'center', justifyContent: 'center', borderRadius: R.md,
    },
    active: { backgroundColor: Colors.goldGlow },
});