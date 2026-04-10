import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
      <ActivityIndicator size="large" color={Colors.gold} />
    </View>
  );
}
