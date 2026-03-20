import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth, AuthProvider } from '../context/AuthContext';
import { Colors, Sp } from "@/constants/theme";

function RootStack() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.splash}>
                <ActivityIndicator size="large" color={Colors.gold} />
                <Text style={styles.splashText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="register-partner" options={{ animation: 'slide_from_right' }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootStack />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bg || '#111',
    },
    splashText: {
        marginTop: 12,
        color: Colors.gold || '#FFD700',
        fontWeight: '600',
        fontSize: 16,
    },
});