import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Chasse } from "../constants/types";
import { Colors, Fonts, Sp, R } from "../constants/theme";

const CROIX    = require("../assets/images/croix.png");
const COFFRE   = require("../assets/images/coffre.png");
const PARCHEMIN = require("../assets/images/parchemin.png");

type UserStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | null;
type Props = { chasse: Chasse; onPress?: () => void; userStatus?: UserStatus };

export default function ChasseCard({ chasse, onPress, userStatus }: Props) {
  const occ = chasse.occurence?.[0];
  const dateStr = occ
    ? new Date(occ.date_start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
      + " – "
      + new Date(occ.date_end).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    : null;

  const isActive = chasse.etat === "ACTIVE";

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>

      {/* ── Photo ── */}
      <View style={s.photoWrap}>
        {chasse.image ? (
          <Image source={{ uri: chasse.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, s.noImg]}>
            <Image source={COFFRE} style={s.coffreImg} resizeMode="contain" />
          </View>
        )}
        <View style={s.photoShadow} />

        {/* Badge statut chasse */}
        <View style={[s.badge, isActive ? s.badgeOn : s.badgeOff]}>
          <View style={[s.dot, { backgroundColor: isActive ? Colors.success : Colors.warning }]} />
          <Text style={s.badgeText}>{isActive ? "Active" : "Bientôt"}</Text>
        </View>

        {/* Badge statut joueur */}
        {userStatus === 'IN_PROGRESS' && (
          <View style={[s.userBadge, s.userBadgeProgress]}>
            <View style={[s.dot, { backgroundColor: Colors.success }]} />
            <Text style={s.badgeText}>En cours</Text>
          </View>
        )}
        {userStatus === 'COMPLETED' && (
          <View style={[s.userBadge, s.userBadgeDone]}>
            <Ionicons name="trophy" size={10} color={Colors.gold} />
            <Text style={[s.badgeText, { color: Colors.gold }]}>Terminé</Text>
          </View>
        )}

        {/* Titre */}
        <View style={s.titleBar}>
          <Text style={s.title} numberOfLines={2}>{chasse.name}</Text>
        </View>
      </View>

      {/* ── Footer parchemin ── */}
      <View style={s.footer}>
        <Image source={PARCHEMIN} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={s.footerOverlay} />
        <View style={s.footerContent}>
          <View style={s.metaCol}>
            {chasse.localisation ? (
              <View style={s.metaRow}>
                <Ionicons name="location-outline" size={12} color={Colors.amber} />
                <Text style={s.metaText} numberOfLines={1}>{chasse.localisation}</Text>
              </View>
            ) : null}
            {dateStr ? (
              <View style={s.metaRow}>
                <Ionicons name="calendar-outline" size={12} color={Colors.amber} />
                <Text style={s.metaText}>{dateStr}</Text>
              </View>
            ) : null}
            {(chasse.etapes?.length ?? 0) > 0 ? (
              <View style={s.metaRow}>
                <Ionicons name="flag-outline" size={12} color={Colors.gold} />
                <Text style={s.metaTextGold}>
                  {chasse.etapes!.length} étape{chasse.etapes!.length > 1 ? 's' : ''}
                  {' · '}{chasse.etapes!.length * 100} pts
                </Text>
              </View>
            ) : null}
          </View>

          <View style={s.joinBtn}>
            <Image source={CROIX} style={s.croixIcon} resizeMode="contain" />
            <Text style={s.joinText}>Explorer</Text>
          </View>
        </View>
      </View>

    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: R.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderWarm,
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 10,
  },

  photoWrap: { height: 190, backgroundColor: '#0D0905' },
  noImg:     { alignItems: "center", justifyContent: "center" },
  coffreImg: { width: 100, height: 100, opacity: 0.7 },

  photoShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,2,0,0.40)",
  },

  badge: {
    position: "absolute", top: Sp.sm, right: Sp.sm,
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  badgeOn:  { backgroundColor: "rgba(4,2,0,0.85)", borderColor: Colors.success + "55" },
  badgeOff: { backgroundColor: "rgba(4,2,0,0.85)", borderColor: Colors.warning + "55" },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  badgeText:{ fontFamily: Fonts.title, fontSize: 10, color: Colors.textPrimary, letterSpacing: 0.5 },

  userBadge: {
    position: "absolute", top: Sp.sm, left: Sp.sm,
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, backgroundColor: "rgba(4,2,0,0.85)",
  },
  userBadgeProgress: { borderColor: Colors.success + "66" },
  userBadgeDone:     { borderColor: Colors.gold + "66" },

  titleBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: Sp.md, paddingBottom: Sp.md, paddingTop: Sp.xl,
    backgroundColor: "rgba(4,2,0,0.80)",
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 16, color: Colors.textPrimary,
    letterSpacing: 0.5, lineHeight: 22,
  },

  footer:        { position: "relative", overflow: "hidden" },
  footerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(6,4,1,0.78)" },
  footerContent: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Sp.md, paddingVertical: 12, gap: Sp.sm,
  },

  metaCol:      { flex: 1, gap: 4 },
  metaRow:      { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText:     { fontFamily: Fonts.title, fontSize: 11, color: Colors.parchment, flex: 1 },
  metaTextGold: { fontFamily: Fonts.title, fontSize: 11, color: Colors.gold, flex: 1 },

  joinBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1, borderColor: Colors.gold + "66",
    borderRadius: R.md,
    paddingHorizontal: Sp.md, paddingVertical: 8,
  },
  croixIcon: { width: 14, height: 14, opacity: 0.90 },
  joinText:  { fontFamily: Fonts.title, color: Colors.gold, fontSize: 11, letterSpacing: 0.8 },
});
