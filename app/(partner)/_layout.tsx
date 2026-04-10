import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';
import { useRoleGuard } from '../../hooks/useRoleGuard';

export default function PartnerLayout() {
    const { status, user } = useRoleGuard();

    if (status === 'loading') return <LoadingScreen />;
    if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
    if (user!.role !== 'PARTENAIRE') return <Redirect href="/(app)/chasses" />;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.gold,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Colors.bgCard,
                    borderTopColor: Colors.border,
                    height: 90,
                },
            }}
        >
            {/* ── 2 onglets visibles ── */}
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="(components)/add-etape"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="(components)/chasse-detail"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="(components)/create-chasse"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="(components)/edit-etape"
                options={{ href: null }}
            />
        </Tabs>
    );
}