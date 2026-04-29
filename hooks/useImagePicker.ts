import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

function applyAsset(a: ImagePicker.ImagePickerAsset, prefix: string): PickedImage {
  return {
    uri: a.uri,
    name: a.fileName || `${prefix}_${Date.now()}.jpg`,
    type: a.mimeType || 'image/jpeg',
  };
}

export function useImagePicker(prefix = 'image') {
  const [image, setImage] = useState<PickedImage | null>(null);

  const pick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à la galerie nécessaire');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setImage(applyAsset(res.assets[0], prefix));
    }
  };

  const shoot = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à la caméra nécessaire');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setImage(applyAsset(res.assets[0], prefix));
    }
  };

  const pickOrShoot = () => {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez une source',
      [
        { text: 'Prendre une photo', onPress: shoot },
        { text: 'Choisir dans la galerie', onPress: pick },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const reset = () => setImage(null);

  return { image, setImage, pick, shoot, pickOrShoot, reset };
}
