import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, R, Sp } from '../constants/theme';
import { Chasse } from '../constants/types';
import StatusBadge from './StatusBadge';

const { width } = Dimensions.get('window');

interface Props {
  chasse: Chasse;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function ChasseCard({ chasse, onPress, onEdit, onDelete, showActions }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Image de fond */}
      <Image
        source={{ uri: chasse.image }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {/* Gradient overlay */}
      <View style={styles.overlay} />

      {/* Contenu */}
      <View style={styles.content}>
        <View style={styles.top}>
          <StatusBadge status={chasse.etat} />
          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                  <Ionicons name="create-outline" size={16} color={Colors.gold} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottom}>
          <Text style={styles.name} numberOfLines={2}>{chasse.name}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={13} color={Colors.gold} />
            <Text style={styles.locText} numberOfLines={1}>{chasse.localisation}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 200,
    borderRadius: R.lg,
    overflow: 'hidden',
    marginBottom: Sp.md,
    backgroundColor: Colors.bgCard,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,16,0)',
  },
  content: {
    flex: 1,
    padding: Sp.md,
    justifyContent: 'space-between',
    // Simulated gradient via two overlapping views
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actions: { flexDirection: 'row', gap: Sp.sm },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: R.sm,
    backgroundColor: 'rgba(8,8,16,0.7)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    backgroundColor: 'rgba(8,8,16,0.75)',
    borderRadius: R.sm,
    padding: Sp.sm,
    gap: 4,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { color: Colors.textSecondary, fontSize: 12, flex: 1 },
});
