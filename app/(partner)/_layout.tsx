import { Tabs, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';

export default function PartnerLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        );
    }

    if (!user) return <Redirect href="/(auth)/login" />;

    if (user.role !== 'PARTENAIRE') {
        return <Redirect href="/(app)/chasses" />;
    }

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