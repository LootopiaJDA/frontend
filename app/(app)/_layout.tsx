import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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

export default function AppLayout() {
    const { user, loading } = useAuth();

    if (loading) return (
        <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.gold} size="large" />
        </View>
    );

    if (!user) return <Redirect href="/(auth)/login" />;
    if (user.role === 'ADMIN') return <Redirect href="/(admin)/dashboard" />;
    if (user.role === 'PARTENAIRE') return <Redirect href="/(partner)/dashboard" />;

    return (
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}>
            <Tabs.Screen
                name="chasses"
                options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'map' : 'map-outline'} focused={focused} /> }}
            />
            <Tabs.Screen
                name="map"
                options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'navigate' : 'navigate-outline'} focused={focused} /> }}
            />
            <Tabs.Screen
                name="profil"
                options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} /> }}
            />
            {/* Écrans cachés */}
            <Tabs.Screen name="chasse-detail" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: { backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border, height: 72, paddingBottom: 10, paddingTop: 6 },
    iconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: R.md },
    active: { backgroundColor: Colors.goldGlow },
});