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
  return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>

        {chasse.image && (
            <Image
                source={{ uri: chasse.image }}
                style={styles.image}
                resizeMode="cover"
            />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{chasse.name}</Text>

          {chasse.localisation && (
              <View style={styles.row}>
                <Ionicons name="location-outline" size={15} color={Colors.textMuted} />
                <Text style={styles.text}>{chasse.localisation}</Text>
              </View>
          )}
        </View>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: R.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  image: {
    width: "100%",
    height: 160,
  },

  content: {
    padding: Sp.md,
    gap: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  text: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});