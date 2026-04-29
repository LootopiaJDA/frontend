import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme';

const MAP_BG  = require('../assets/images/parchemin-tresor.png');
const TEXTURE = require('../assets/images/parchemin.png');

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenBackground({ children, style }: Props) {
  return (
    <View style={[st.root, style]}>
      <Image source={MAP_BG}  style={st.mapBg}  resizeMode="cover" />
      <View style={st.mapOverlay} />
      <Image source={TEXTURE} style={st.texture} resizeMode="cover" />
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.bg },
  mapBg:      { position: 'absolute', width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(10,7,0,0.70)' },
  texture:    { position: 'absolute', width: '100%', height: '100%', opacity: 0.032 },
});
