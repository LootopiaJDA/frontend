import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

export function useImagePicker() {
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
      const a = res.assets[0];
      setImage({
        uri: a.uri,
        name: a.fileName || `chasse_${Date.now()}.jpg`,
        type: a.mimeType || 'image/jpeg',
      });
    }
  };

  const reset = () => setImage(null);

  return { image, setImage, pick, reset };
}
