import React from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import Btn from "./Btn";
import { Etape } from "../constants/types";
import { Colors, Sp, R } from "../constants/theme";

type Props = {
    etape: Etape;
    onEdit?: (etape: Etape) => void;
    onDelete?: (etape: Etape) => void;
};

/**
 * Tente de parser une coordonnée qui peut être :
 * - Un nombre décimal classique : "39.4656378"
 * - Un format DMS : '41°24\'12.2"N 2°10\'26.5"E'
 * Retourne null si le parsing échoue.
 */
function parseCoord(value: string | null | undefined): number | null {
    if (!value) return null;

    const trimmed = value.trim();

    // Cas simple : nombre décimal
    const decimal = parseFloat(trimmed);
    if (!isNaN(decimal)) return decimal;

    // Cas DMS : on extrait le premier groupe (lat ou lng selon le champ)
    // Format attendu : 41°24'12.2"N ou 41°24'12.2"N 2°10'26.5"E
    const dmsRegex = /(\d+)°(\d+)'([\d.]+)"([NSEW])/;
    const match = trimmed.match(dmsRegex);
    if (match) {
        const degrees = parseFloat(match[1]);
        const minutes = parseFloat(match[2]);
        const seconds = parseFloat(match[3]);
        const direction = match[4];
        let dd = degrees + minutes / 60 + seconds / 3600;
        if (direction === 'S' || direction === 'W') dd = -dd;
        return dd;
    }

    return null;
}

function formatCoord(value: string | null | undefined, label: string): string {
    const parsed = parseCoord(value);
    if (parsed === null) return `${label}: invalide`;
    return `${label}: ${parsed.toFixed(5)}`;
}

export default function EtapeCard({ etape, onEdit, onDelete }: Props) {
    const handleDelete = () => {
        Alert.alert(
            "Supprimer l'étape",
            `Voulez-vous vraiment supprimer "${etape.name}" ?`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Oui",
                    onPress: () => {
                        Alert.alert(
                            "Confirmer suppression",
                            "Cette action est définitive. Confirmer ?",
                            [
                                { text: "Annuler", style: "cancel" },
                                {
                                    text: "Supprimer",
                                    style: "destructive",
                                    onPress: () => onDelete?.(etape),
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const coordText = [
        formatCoord(etape.lat, "Lat"),
        formatCoord(etape.long, "Lng"),
        etape.rayon ? `Rayon: ${etape.rayon}m` : null,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <View style={styles.card}>
            {etape.image && <Image source={{ uri: etape.image }} style={styles.image} />}
            <View style={styles.content}>
                <Text style={styles.title}>{etape.name}</Text>
                {etape.rank != null && (
                    <Text style={styles.rank}>Étape #{etape.rank}</Text>
                )}
                {etape.address && <Text style={styles.address}>{etape.address}</Text>}
                {etape.description && <Text style={styles.desc}>{etape.description}</Text>}
                <Text style={styles.meta}>{coordText}</Text>

                <View style={styles.btnRow}>
                    <Btn label="Modifier" onPress={() => onEdit?.(etape)} variant="secondary" />
                    <Btn label="Supprimer" onPress={handleDelete} variant="danger" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: Sp.md,
        backgroundColor: Colors.bgCard,
        borderRadius: R.md,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    image: {
        width: "100%",
        height: 180,
    },
    content: {
        padding: Sp.md,
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    rank: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.gold,
    },
    address: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    desc: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    meta: {
        fontSize: 11,
        color: Colors.textMuted,
        marginTop: 4,
    },
    btnRow: {
        flexDirection: "row",
        marginTop: Sp.md,
        gap: Sp.sm,
    },
});