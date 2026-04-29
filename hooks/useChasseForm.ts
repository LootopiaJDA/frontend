import { useState } from 'react';
import { Chasse, StatutChasse } from '../constants/types';
import { PickedImage } from './useImagePicker';

export type ChasseEtat = 'PENDING' | 'ACTIVE';

export interface ChasseForm {
  name: string;
  localisation: string;
  latitude: string;
  longitude: string;
  etat: ChasseEtat;
  date_start: string;
  date_end: string;
  limit_user: string;
}

const EMPTY_FORM: ChasseForm = {
  name: '', localisation: '', latitude: '', longitude: '', etat: 'PENDING',
  date_start: '', date_end: '', limit_user: '',
};

function fromChasse(chasse: Chasse): ChasseForm {
  const occ = chasse.occurence?.[0];
  return {
    name: chasse.name ?? '',
    localisation: chasse.localisation ?? '',
    latitude: chasse.latitude != null ? String(chasse.latitude) : '',
    longitude: chasse.longitude != null ? String(chasse.longitude) : '',
    etat: (chasse.etat === 'ACTIVE' ? 'ACTIVE' : 'PENDING') as ChasseEtat,
    date_start: occ?.date_start ? occ.date_start.slice(0, 10) : '',
    date_end: occ?.date_end ? occ.date_end.slice(0, 10) : '',
    limit_user: occ?.limit_user ? String(occ.limit_user) : '30',
  };
}

export function useChasseForm() {
  const [form, setForm] = useState<ChasseForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: keyof ChasseForm) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const resetForCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const resetForEdit = (chasse: Chasse) => {
    setForm(fromChasse(chasse));
    setErrors({});
  };

  const setLocation = (city: string, lat: string, lng: string) =>
    setForm(f => ({ ...f, localisation: city, latitude: lat, longitude: lng }));

  const validate = (options: { requireImage: boolean; image: PickedImage | null }) => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.localisation.trim()) e.localisation = 'Localisation requise';
    if (options.requireImage && !options.image) e.image = 'Image de couverture requise';
    setErrors(e);
    return Object.values(e).every(v => !v);
  };

  const buildCreateFormData = (image: PickedImage): FormData => {
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('localisation', form.localisation.trim());
    if (form.latitude) fd.append('latitude', form.latitude);
    if (form.longitude) fd.append('longitude', form.longitude);
    fd.append('etat', form.etat);
    fd.append('occurrence', JSON.stringify({
      date_start: form.date_start,
      date_end: form.date_end,
      limit_user: Number(form.limit_user) || 30,
    }));
    fd.append('image', { uri: image.uri, name: image.name, type: image.type } as any);
    return fd;
  };

  const buildUpdatePayload = () => ({
    name: form.name.trim(),
    localisation: form.localisation.trim(),
    etat: form.etat as StatutChasse,
    ...(form.latitude ? { latitude: parseFloat(form.latitude) } : {}),
    ...(form.longitude ? { longitude: parseFloat(form.longitude) } : {}),
  });

  return {
    form, setForm, setField, setLocation,
    errors, setErrors,
    resetForCreate, resetForEdit,
    validate, buildCreateFormData, buildUpdatePayload,
  };
}
