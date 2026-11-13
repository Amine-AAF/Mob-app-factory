import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LocalTime } from '@/types/models';
import { normalizeTime } from '@/utils/dates';

import { TextField } from './TextField';

/**
 * Wall-clock time input ("HH:mm", local to the destination). Accepts "9", "930", "9:30",
 * "9h30" and normalises on blur. Empty = no fixed time.
 */
export function TimeField({ label, value, onChange, testID }: { label: string; value: LocalTime | null; onChange: (value: LocalTime | null) => void; testID?: string }) {
  const { t } = useTranslation();
  const [text, setText] = useState(value ?? '');
  const [invalid, setInvalid] = useState(false);
  const commit = (raw: string) => {
    if (!raw.trim()) {
      setInvalid(false);
      onChange(null);
      return;
    }
    const normalized = normalizeTime(raw);
    setInvalid(!normalized);
    if (normalized) {
      setText(normalized);
      onChange(normalized);
    }
  };
  return (
    <TextField
      label={label}
      placeholder={t('timeField.placeholder')}
      keyboardType="numbers-and-punctuation"
      maxLength={5}
      value={text}
      onChangeText={(v) => {
        setText(v);
        // Commit as soon as the value is complete so the parent never misses it.
        if (/^\d{1,2}[:h.]\d{2}$/.test(v.trim()) || v.trim() === '') commit(v);
      }}
      onBlur={() => commit(text)}
      error={invalid ? t('timeField.invalid') : null}
      testID={testID}
    />
  );
}
