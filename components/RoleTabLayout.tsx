// components/RoleTabLayout.tsx
import { Tabs, Redirect } from 'expo-router';
import { Image, Animated } from 'react-native';
import {useEffect, useRef} from 'react';
import { Colors } from '../constants/theme';
import LoadingScreen from './LoadingScreen';
import { useRoleGuard } from '../hooks/useRoleGuard';

export type TabConfig = {
    name: string;
    title: string;
    icon: any;
    href?: null;
};

type RoleTabLayoutProps = {
    allowedRole: 'JOUEUR' | 'ADMIN' | 'PARTENAIRE';
    redirectTo: string;
    accentColor: string;
    tabBarHeight?: number;
    tabs: TabConfig[];
    hiddenScreens?: string[];
};

function TabIcon({
                     source,
                     focused,
                     accentColor,
                 }: {
    source: any;
    focused: boolean;
    accentColor: string;
}) {
    const scale = useRef(new Animated.Value(focused ? 1.15 : 1)).current;

    useEffect(() => {
        Animated.timing(scale, {
            toValue: focused ? 1.15 : 1,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [focused]);

    return (
        <Animated.View
            style={{
                transform: [{ scale }],
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: accentColor,
                shadowOpacity: focused ? 0.6 : 0,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
            }}
        >
            <Image source={source} style={{ width: 36, height: 36 }} resizeMode="contain" />
        </Animated.View>
    );
}

export default function RoleTabLayout({
                                          allowedRole,
                                          redirectTo,
                                          accentColor,
                                          tabBarHeight = 95,
                                          tabs,
                                          hiddenScreens = [],
                                      }: RoleTabLayoutProps) {
    const { status, user } = useRoleGuard();

    if (status === 'loading') return <LoadingScreen />;
    if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
    if (user!.role !== allowedRole) return <Redirect href={redirectTo as any} />;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: accentColor,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: '#0B0907',
                    borderTopColor: '#2A2118',
                    height: tabBarHeight,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarItemStyle: {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    marginTop: 2,
                    fontWeight: '600',
                },
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon source={tab.icon} focused={focused} accentColor={accentColor} />
                        ),
                    }}
                />
            ))}

            {hiddenScreens.map((screen) => (
                <Tabs.Screen key={screen} name={screen} options={{ href: null }} />
            ))}
        </Tabs>
    );
}