import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { chasseService } from "../../services/api";
import { Chasse } from "../../constants/types";
import { Colors, Sp, R } from "../../constants/theme";

import ChasseCard from "../../components/ChasseCard";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [chasses, setChasses] = useState<Chasse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChasses = useCallback(async () => {
    try {
      if (!user?.partenerId) return;

      const data = await chasseService.getByPartenaire(user.partenerId);

      setChasses(data.chasseByPart ?? []);
    } catch (err) {
      console.log("Erreur chargement chasses :", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
      useCallback(() => {
        loadChasses();
      }, [loadChasses])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadChasses();
  };

  return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.company}>
                {user?.partenaire?.company_name}
              </Text>

              <Text style={styles.title}>Mes chasses</Text>
            </View>

            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push("/(partner)/create-chasse")}
            >
              <Ionicons name="add" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
              </View>
          ) : (
              <FlatList
                  data={chasses}
                  keyExtractor={(item) => String(item.id_chasse)}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.gold}
                    />
                  }
                  renderItem={({ item }) => (
                      <ChasseCard
                          chasse={item}
                          onPress={() =>
                              router.push({
                                pathname: "/(partner)/chasse-detail",
                                params: { id: item.id_chasse },
                              })
                          }
                      />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: Sp.sm }} />}
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Ionicons
                          name="map-outline"
                          size={60}
                          color={Colors.textMuted}
                      />

                      <Text style={styles.emptyTitle}>
                        Aucune chasse créée
                      </Text>

                      <Text style={styles.emptySub}>
                        Commencez votre première aventure
                      </Text>

                      <TouchableOpacity
                          style={styles.createBtn}
                          onPress={() => router.push("/(partner)/create-chasse")}
                      >
                        <Text style={styles.createText}>
                          Créer une chasse
                        </Text>
                      </TouchableOpacity>
                    </View>
                  }
              />
          )}
        </SafeAreaView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sp.lg,
    paddingVertical: Sp.md,
  },

  company: {
    fontSize: 11,
    color: Colors.gold,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  addBtn: {
    width: 44,
    height: 44,
    borderRadius: R.full,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal: Sp.lg,
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    marginTop: 80,
    alignItems: "center",
    gap: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  emptySub: {
    fontSize: 14,
    color: Colors.textMuted,
  },

  createBtn: {
    marginTop: 15,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: R.md,
  },

  createText: {
    fontWeight: "700",
    color: Colors.black,
  },
});