import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Chasse } from "../constants/types";
import { Colors, Fonts, Sp, R } from "../constants/theme";

const CROIX   = require("../assets/images/croix.png");
const COFFRE  = require("../assets/images/coffre.png");

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

        {/* ── FOOTER sur le parchemin ── */}
        <View style={s.footer}>
          <View style={s.footerTint} />

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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },

  photoWrap: { height: 180, backgroundColor: Colors.bgElevated },
  noImg: { alignItems: "center", justifyContent: "center", backgroundColor: "#0D0905" },
  coffreImg: { width: 90, height: 90 },

  photoShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,2,0,0.45)",
  },

  badge: {
    position: "absolute", top: Sp.sm, right: Sp.sm,
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  badgeOn:  { backgroundColor: "rgba(4,2,0,0.82)", borderColor: Colors.success + "55" },
  badgeOff: { backgroundColor: "rgba(4,2,0,0.82)", borderColor: Colors.warning + "55" },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "700", color: Colors.textPrimary },

  userBadge: {
    position: "absolute", top: Sp.sm, left: Sp.sm,
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, backgroundColor: "rgba(4,2,0,0.82)",
  },
  userBadgeProgress: { borderColor: Colors.success + "66" },
  userBadgeDone:     { borderColor: Colors.gold + "66" },

  titleBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: Sp.md, paddingBottom: Sp.md, paddingTop: Sp.xl,
    backgroundColor: "rgba(4,2,0,0.72)",
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: 17, color: "#EDEAF3",
    letterSpacing: 0.8, lineHeight: 24,
  },

  // Footer
  footer: { position: "relative" },
  footerTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,6,2,0.55)",
  },
  footerContent: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Sp.md, paddingVertical: 12, gap: Sp.sm,
  },

  metaCol: { flex: 1, gap: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: "#C4A46B", flex: 1 },

  joinBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1, borderColor: Colors.gold + "66",
    borderRadius: R.md,
    paddingHorizontal: Sp.md, paddingVertical: 8,
  },
  croixIcon: { width: 14, height: 14, opacity: 0.85 },
  joinText: { fontFamily: Fonts.title, color: Colors.gold, fontSize: 12, letterSpacing: 0.5 },
});
