import { Tabs, Redirect } from 'expo-router';
import { Image, Animated } from 'react-native';
import { useRef } from 'react';

import { Colors } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';
import { useRoleGuard } from '../../hooks/useRoleGuard';

// ── ICONS ADMIN ──
const DASHBOARD_ICON = require('../../assets/images/dashboard.png');
const USERS_ICON = require('../../assets/images/plus.png');
const CHASSES_ICON = require('../../assets/images/chasse.png');
const PROFIL_ICON = require('../../assets/images/profil.png');

function TabIcon({ source, focused }: { source: any; focused: boolean }) {
    const scale = useRef(new Animated.Value(1)).current;

    Animated.timing(scale, {
        toValue: focused ? 1.2 : 1,
        duration: 180,
        useNativeDriver: true,
    }).start();

    return (
        <Animated.View
            style={{
                transform: [{ scale }],
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: Colors.error,
                shadowOpacity: focused ? 0.6 : 0,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
            }}
        >
            <Image
                source={source}
                style={{
                    width: 36,
                    height: 36,
                }}
                resizeMode="contain"
            />
        </Animated.View>
    );
}

export default function AdminLayout() {
    const { status, user } = useRoleGuard();

    if (status === 'loading') return <LoadingScreen />;
    if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
    if (user!.role !== 'ADMIN') return <Redirect href="/(app)/chasses" />;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: Colors.error,
                tabBarInactiveTintColor: Colors.textMuted,

                tabBarStyle: {
                    backgroundColor: '#0B0907',
                    borderTopColor: '#2A2118',
                    height: 95,
                    paddingTop: 10,
                    paddingBottom: 10,
                },

                tabBarItemStyle: {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                },

                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
            }}
        >

            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={DASHBOARD_ICON} focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="users"
                options={{
                    title: 'Utilisateurs',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={USERS_ICON} focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="chasses"
                options={{
                    title: 'Chasses',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={CHASSES_ICON} focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profil"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={PROFIL_ICON} focused={focused} />
                    ),
                }}
            />

        </Tabs>
    );
}