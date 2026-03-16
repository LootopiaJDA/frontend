import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Sp, R } from '../../constants/theme';

function TabIcon({ name, focused, badge }: { name: any; focused: boolean; badge?: number }) {
    return (
        <View style={[styles.iconWrap, focused && styles.active]}>
            <Ionicons name={name} size={21} color={focused ? Colors.gold : Colors.textMuted} />
            {badge ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
            ) : null}
        </View>
    );
}

export default function AdminLayout() {
    const { user, loading } = useAuth();

    if (loading) return (
        <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.gold} size="large" />
        </View>
    );

    if (!user) return <Redirect href="/(auth)/login" />;
    if (user.role !== 'ADMIN') return <Redirect href="/(auth)/welcome" />;

    return (
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}>
            <Tabs.Screen
                name="dashboard"
                options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} /> }}
            />
            <Tabs.Screen
                name="users"
                options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} /> }}
            />
            <Tabs.Screen
                name="partenaires"
                options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'business' : 'business-outline'} focused={focused} /> }}
            />
            <Tabs.Screen
                name="chasses"
                options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'map' : 'map-outline'} focused={focused} /> }}
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
    iconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: R.md, position: 'relative' },
    active: { backgroundColor: Colors.goldGlow },
    badge: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});