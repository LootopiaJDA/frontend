import { useState } from 'react';
import { Chasse, StatutChasse } from '../constants/types';
import { PickedImage } from './useImagePicker';

export type ChasseEtat = 'PENDING' | 'ACTIVE';

export interface ChasseForm {
  name: string;
  localisation: string;
  etat: ChasseEtat;
  date_start: string;
  date_end: string;
  limit_user: string;
}

const EMPTY_FORM: ChasseForm = {
  name: '', localisation: '', etat: 'PENDING',
  date_start: '', date_end: '', limit_user: '30',
};

function fromChasse(chasse: Chasse): ChasseForm {
  const occ = chasse.occurence?.[0];
  return {
    name: chasse.name ?? '',
    localisation: chasse.localisation ?? '',
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
    occurrence: {
      date_start: form.date_start,
      date_end: form.date_end,
      limit_user: Number(form.limit_user) || 30,
    },
  });

  return {
    form, setForm, setField,
    errors, setErrors,
    resetForCreate, resetForEdit,
    validate, buildCreateFormData, buildUpdatePayload,
  };
}
