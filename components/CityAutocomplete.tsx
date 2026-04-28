import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, R, Sp } from '../constants/theme';

interface CityResult {
  label: string;
  context: string;
  lat: string;
  lng: string;
}

interface Props {
  value: string;
  onSelect: (city: string, lat: string, lng: string) => void;
  error?: string;
}

export default function CityAutocomplete({ value, onSelect, error }: Props) {
  const [query, setQuery]       = useState(value);
  const [results, setResults]   = useState<CityResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(false);
  const [confirmed, setConfirmed] = useState(!!value);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync quand la valeur parent change (mode edit)
  useEffect(() => {
    setQuery(value);
    setConfirmed(!!value);
  }, [value]);

  const search = async (text: string) => {
    if (text.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(text)}&type=municipality&limit=6`;
      const res  = await fetch(url);
      const json = await res.json();
      setResults(
        (json.features ?? []).map((f: any) => ({
          label:   f.properties.label,
          context: f.properties.context,
          lat:     String(f.geometry.coordinates[1]),
          lng:     String(f.geometry.coordinates[0]),
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text: string) => {
    setQuery(text);
    setConfirmed(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  };

  const handleSelect = (item: CityResult) => {
    if (blurRef.current) clearTimeout(blurRef.current);
    setQuery(item.label);
    setResults([]);
    setConfirmed(true);
    setFocused(false);
    onSelect(item.label, item.lat, item.lng);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setConfirmed(false);
    onSelect('', '', '');
  };

  const handleFocus = () => {
    if (blurRef.current) clearTimeout(blurRef.current);
    setFocused(true);
  };

  // Délai pour laisser le onPress du dropdown se déclencher avant
  const handleBlur = () => {
    blurRef.current = setTimeout(() => setFocused(false), 150);
  };

  const showDropdown = focused && results.length > 0 && !confirmed;

  return (
    <View style={s.wrap}>
      <Text style={s.label}>LOCALISATION *</Text>

      <View style={[s.row, focused && s.focused, !!error && s.errBorder]}>
        <Ionicons
          name={confirmed ? 'location' : 'location-outline'}
          size={17}
          color={confirmed ? Colors.gold : focused ? Colors.gold : Colors.textMuted}
          style={s.iconLeft}
        />
        <TextInput
          style={s.input}
          placeholder="Paris, Lyon, Bordeaux..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color={Colors.gold} style={s.iconRight} />
        )}
        {confirmed && !loading && (
          <Ionicons name="checkmark-circle" size={18} color={Colors.success ?? '#4ecb8a'} style={s.iconRight} />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={s.errText}>{error}</Text> : null}

      {showDropdown && (
        <View style={s.dropdown}>
          {results.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[s.option, i < results.length - 1 && s.optionBorder]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} style={{ marginTop: 1 }} />
              <View style={s.optionTexts}>
                <Text style={s.optionName}>{item.label}</Text>
                <Text style={s.optionCtx} numberOfLines={1}>{item.context}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: Sp.md },

  label: {
    color: Colors.textSecondary,
    fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 7,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: R.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Sp.md,
  },
  focused:   { borderColor: Colors.gold },
  errBorder: { borderColor: Colors.error },

  iconLeft:  { marginRight: 10 },
  iconRight: { marginRight: 4 },

  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, paddingVertical: Sp.md },
  errText: { color: Colors.error, fontSize: 12, marginTop: 5 },

  dropdown: {
    backgroundColor: Colors.bgCard,
    borderRadius: R.md, borderWidth: 1, borderColor: Colors.border,
    marginTop: 4, overflow: 'hidden',
  },
  option: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Sp.sm, paddingHorizontal: Sp.md, paddingVertical: 10,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  optionTexts:  { flex: 1 },
  optionName:   { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  optionCtx:    { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
});
