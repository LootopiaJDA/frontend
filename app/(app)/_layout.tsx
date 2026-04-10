import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';
import { useRoleGuard } from '../../hooks/useRoleGuard';

export default function AppLayout() {
    const { status, user } = useRoleGuard();

    if (status === 'loading') return <LoadingScreen />;
    if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
    if (user!.role === 'PARTENAIRE') return <Redirect href="/(partner)/dashboard" />;
    if (user!.role === 'ADMIN') return <Redirect href="/(admin)/dashboard" />;

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
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chasses"
                options={{
                    title: 'Chasses',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Carte',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="location-outline" size={size} color={color} />
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
            {/* Écrans non visibles dans la tab bar */}
            <Tabs.Screen name="chasse/[id]" options={{ href: null }} />
            <Tabs.Screen name="ar-view"     options={{ href: null }} />
        </Tabs>
    );
}