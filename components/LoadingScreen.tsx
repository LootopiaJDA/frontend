import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors, Fonts } from '../constants/theme';

const MAP_BG = require('../assets/images/parchemin-tresor.png');

export default function LoadingScreen() {
  return (
    <View style={st.root}>
      <Image source={MAP_BG} style={st.bg} resizeMode="cover" />
      <View style={st.overlay} />
      <LottieView
        source={require('../assets/animations/ChestOpening.json')}
        autoPlay
        loop
        style={st.lottie}
      />
      <Text style={st.brand}>LOOTOPIA</Text>
      <Text style={st.sub}>Chargement de l'aventure...</Text>
    </View>
  );
}

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 8 },
  bg:      { position: 'absolute', width: '100%', height: '100%' },
  overlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(10,7,0,0.72)' },
  lottie:  { width: 200, height: 200 },
  brand:   { fontFamily: Fonts.display, color: Colors.gold, fontSize: 22, letterSpacing: 7 },
  sub:     { fontFamily: Fonts.title,   color: Colors.parchment, fontSize: 11, letterSpacing: 2, opacity: 0.7 },
});
