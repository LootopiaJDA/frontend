import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme';

const TEXTURE = require('../assets/images/parchemin.png');

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenBackground({ children, style }: Props) {
  return (
    <View style={[st.root, style]}>
      <Image source={TEXTURE} style={st.texture} resizeMode="cover" />
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  texture: {
    position: 'absolute',
    width: '100%', height: '100%',
    opacity: 0.038,
  },
});
