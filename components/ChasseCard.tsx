import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Chasse } from "../constants/types";
import { Colors, Sp, R } from "../constants/theme";

type Props = {
  chasse: Chasse;
  onPress?: () => void;
};

export default function ChasseCard({ chasse, onPress }: Props) {
  const occ = chasse.occurence?.[0];
  const dateStr = occ
    ? new Date(occ.date_start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) +
      " → " +
      new Date(occ.date_end).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    : null;

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.88} onPress={onPress}>
      {/* Image avec overlay titre */}
      <View style={s.imageWrap}>
        {chasse.image ? (
          <Image source={{ uri: chasse.image }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={[s.image, s.imageFallback]}>
            <Ionicons name="map-outline" size={40} color={Colors.textMuted} />
          </View>
        )}
        {/* Overlay sombre en bas de l'image */}
        <View style={s.overlay} />
        {/* Titre sur l'image */}
        <View style={s.overlayContent}>
          <Text style={s.overlayTitle} numberOfLines={2}>{chasse.name}</Text>
        </View>
        {/* Badge statut en haut à droite */}
        <View style={s.statusBadge}>
          <View style={[s.statusDot, { backgroundColor: chasse.etat === "ACTIVE" ? "#4ecb8a" : Colors.warning }]} />
          <Text style={s.statusText}>{chasse.etat === "ACTIVE" ? "Active" : chasse.etat}</Text>
        </View>
      </View>

      {/* Infos en bas */}
      <View style={s.footer}>
        <View style={s.footerLeft}>
          {chasse.localisation ? (
            <View style={s.metaRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={s.metaText} numberOfLines={1}>{chasse.localisation}</Text>
            </View>
          ) : null}
          {dateStr ? (
            <View style={s.metaRow}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
              <Text style={s.metaText}>{dateStr}</Text>
            </View>
          ) : null}
        </View>
        <View style={s.playBtn}>
          <Ionicons name="arrow-forward" size={16} color={Colors.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: R.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  imageWrap: { position: "relative" },
  image:     { width: "100%", height: 175 },
  imageFallback: {
    backgroundColor: Colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  // Gradient simulé
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    // Dégradé du bas vers le haut
    backgroundImage: undefined,
    // Simulation via deux couches
  },
  overlayContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Sp.md,
    paddingTop: Sp.xl,
    backgroundColor: "rgba(8,8,16,0.65)",
  },
  overlayTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },

  statusBadge: {
    position: "absolute",
    top: Sp.sm,
    right: Sp.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(8,8,16,0.75)",
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot:  { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "700", color: Colors.textPrimary },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Sp.md,
    paddingVertical: 12,
    gap: Sp.sm,
  },
  footerLeft: { flex: 1, gap: 4 },
  metaRow:    { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText:   { fontSize: 12, color: Colors.textMuted, flex: 1 },

  playBtn: {
    width: 34,
    height: 34,
    borderRadius: R.full,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.gold + "44",
    alignItems: "center",
    justifyContent: "center",
  },
});
