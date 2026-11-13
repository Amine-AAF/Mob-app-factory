import { Button, Chip, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { currentLanguage } from '@/i18n';
import { addDays, daysInMonth, fromDayKey, monthOf, parseMonth, addMonths, toDayKey, type DayKey } from '@/utils/dates';
import { CURRENCIES } from '@/utils/money';

/* ------------------------------------------------------------------ Field */

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="caption" tone="muted" style={{ marginBottom: 4 }}>
      {children}
    </Text>
  );
}

export function FormField({ label, error, style, ...rest }: TextInputProps & { label: string; error?: string | null }) {
  const t = useTheme();
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.colors.textSubtle}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        style={[
          {
            minHeight: 48,
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor: error ? t.colors.danger : t.colors.border,
            backgroundColor: t.colors.surface,
            color: t.colors.text,
            paddingHorizontal: t.spacing(3),
            fontSize: 16,
          },
          rest.multiline && { minHeight: 80, paddingTop: t.spacing(3), textAlignVertical: 'top' },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: 4 }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** Big amount entry: decimal keypad, currency shown, parsing done by the caller (string -> minor). */
export function AmountInput({ value, onChange, currency, label, error, testID, autoFocus }: { value: string; onChange: (v: string) => void; currency: string; label: string; error?: string | null; testID?: string; autoFocus?: boolean }) {
  const t = useTheme();
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Row gap={2} style={{ borderRadius: t.radius.lg, borderWidth: 1, borderColor: error ? t.colors.danger : t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: t.spacing(4) }}>
        <Text variant="heading" tone="muted">
          {currency}
        </Text>
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onChangeText={(v) => onChange(v.replace(/[^0-9.,\-\s]/g, ''))}
          keyboardType="decimal-pad"
          inputMode="decimal"
          autoFocus={autoFocus}
          placeholder="0"
          placeholderTextColor={t.colors.textSubtle}
          maxFontSizeMultiplier={1.3}
          style={{ flex: 1, fontSize: 30, fontWeight: '700', color: t.colors.text, paddingVertical: t.spacing(3) }}
        />
      </Row>
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: 4 }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ Choice */

export function ChoiceChips<T extends string>({ options, value, onChange, label }: { options: readonly { value: T; label: string; icon?: IconName }[]; value: T | null; onChange: (v: T) => void; label?: string }) {
  return (
    <View>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <Row gap={2} wrap>
        {options.map((o) => (
          <Chip key={o.value} label={o.label} icon={o.icon} selected={o.value === value} onPress={() => onChange(o.value)} testID={`chip-${o.value}`} />
        ))}
      </Row>
    </View>
  );
}

/** Segmented control (e.g. Expense / Income / Transfer). */
export function Segmented<T extends string>({ options, value, onChange }: { options: readonly { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            testID={`seg-${o.value}`}
            style={{ flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.sm, backgroundColor: selected ? t.colors.surface : 'transparent' }}
          >
            <Text variant="bodySmall" style={{ fontWeight: selected ? '700' : '500' }} tone={selected ? 'default' : 'muted'} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SwitchRow({ label, description, value, onChange, testID }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} testID={testID} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 }}>
      <View style={{ flex: 1 }}>
        <Text>{label}</Text>
        {description ? (
          <Text variant="caption" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 46, height: 28, borderRadius: 14, padding: 3, backgroundColor: value ? t.colors.primary : t.colors.border, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: value ? t.colors.onPrimary : t.colors.surface }} />
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Bottom sheet picker */

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: t.colors.overlay }} onPress={onClose} accessibilityLabel={tr('common.close')} />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: t.colors.background, borderTopLeftRadius: t.radius.xl, borderTopRightRadius: t.radius.xl, maxHeight: '80%', paddingTop: t.spacing(4) }}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: t.spacing(5), marginBottom: t.spacing(2) }}>
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tr('common.close')} hitSlop={10}>
            <Icon name="close" size={24} color={t.colors.textMuted} />
          </Pressable>
        </Row>
        {children}
      </SafeAreaView>
    </Modal>
  );
}

export interface PickerOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: IconName;
  color?: string;
}

/** A field that opens a searchable list in a bottom sheet. */
export function SelectField({ label, value, options, onChange, placeholder, searchable, testID }: { label: string; value: string | null; options: readonly PickerOption[]; onChange: (v: string) => void; placeholder?: string; searchable?: boolean; testID?: string }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) : options;
  }, [options, query]);
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder ?? ''}`}
        testID={testID}
        style={{ minHeight: 48, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: t.spacing(3), flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        {selected?.icon ? <Icon name={selected.icon} size={20} color={selected.color ?? t.colors.textMuted} /> : null}
        <Text style={{ flex: 1 }} tone={selected ? 'default' : 'subtle'} numberOfLines={1}>
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Icon name="chevron-down" size={18} color={t.colors.textSubtle} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        {searchable ? (
          <View style={{ paddingHorizontal: t.spacing(5), marginBottom: t.spacing(2) }}>
            <FormField label="" value={query} onChangeText={setQuery} placeholder="…" autoCorrect={false} />
          </View>
        ) : null}
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.value}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: t.spacing(5), paddingBottom: t.spacing(6) }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item.value);
                setOpen(false);
                setQuery('');
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: item.value === value }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 }}
            >
              {item.icon ? (
                <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: (item.color ?? t.colors.primary) + '22' }}>
                  <Icon name={item.icon} size={18} color={item.color ?? t.colors.primary} />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text>{item.label}</Text>
                {item.subtitle ? (
                  <Text variant="caption" tone="muted">
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
              {item.value === value ? <Icon name="checkmark" size={20} color={t.colors.primary} /> : null}
            </Pressable>
          )}
        />
      </Sheet>
    </View>
  );
}

/** ISO 4217 currency picker. */
export function CurrencySelector({ value, onChange, label, testID }: { value: string; onChange: (c: string) => void; label: string; testID?: string }) {
  const lng = currentLanguage();
  const options = useMemo(() => {
    let names: { of(code: string): string | undefined } | null = null;
    try {
      names = new Intl.DisplayNames([lng], { type: 'currency' });
    } catch {
      names = null;
    }
    return CURRENCIES.map((c) => ({ value: c.code, label: c.code, subtitle: names?.of(c.code) ?? undefined }));
  }, [lng]);
  return <SelectField label={label} value={value} options={options} onChange={onChange} searchable testID={testID} />;
}

/* ------------------------------------------------------------------ Date */

function CalendarMonth({ value, onSelect }: { value: DayKey; onSelect: (d: DayKey) => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const [month, setMonth] = useState(monthOf(value));
  const { year, month: m } = parseMonth(month);
  const first = fromDayKey(`${month}-01`).getDay(); // 0 Sunday
  const offset = (first + 6) % 7; // Monday first
  const count = daysInMonth(year, m);
  const cells: (DayKey | null)[] = [...Array.from({ length: offset }, () => null), ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
  const lng = currentLanguage();
  const title = new Intl.DateTimeFormat(lng, { month: 'long', year: 'numeric' }).format(fromDayKey(`${month}-01`));
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(lng, { weekday: 'narrow' }).format(fromDayKey(addDays('2026-11-09', i))));
  return (
    <View style={{ paddingHorizontal: t.spacing(5), paddingBottom: t.spacing(5) }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <Pressable onPress={() => setMonth(addMonths(month, -1))} accessibilityRole="button" accessibilityLabel={tr('common.previous')} hitSlop={10}>
          <Icon name="chevron-back" size={22} color={t.colors.text} />
        </Pressable>
        <Text variant="subheading">{title}</Text>
        <Pressable onPress={() => setMonth(addMonths(month, 1))} accessibilityRole="button" accessibilityLabel={tr('common.next')} hitSlop={10}>
          <Icon name="chevron-forward" size={22} color={t.colors.text} />
        </Pressable>
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {weekdays.map((w, i) => (
          <View key={`w${i}`} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 }}>
            <Text variant="caption" tone="subtle">
              {w}
            </Text>
          </View>
        ))}
        {cells.map((d, i) => (
          <View key={d ?? `e${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
            {d ? (
              <Pressable
                onPress={() => onSelect(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: d === value }}
                accessibilityLabel={d}
                style={{ flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: d === value ? t.colors.primary : 'transparent' }}
              >
                <Text tone={d === value ? 'onPrimary' : 'default'}>{Number(d.slice(8))}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export function DateField({ label, value, onChange, today, allowClear, testID }: { label: string; value: DayKey | null; onChange: (d: DayKey | null) => void; today: DayKey; allowClear?: boolean; testID?: string }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const [open, setOpen] = useState(false);
  const lng = currentLanguage();
  const text = value ? new Intl.DateTimeFormat(lng, { dateStyle: 'medium' }).format(fromDayKey(value)) : tr('common.none');
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${text}`}
        testID={testID}
        style={{ minHeight: 48, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: t.spacing(3), flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <Icon name="calendar-outline" size={20} color={t.colors.textMuted} />
        <Text style={{ flex: 1 }} tone={value ? 'default' : 'subtle'}>
          {text}
        </Text>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <Row gap={2} style={{ paddingHorizontal: t.spacing(5), marginBottom: t.spacing(2) }} wrap>
          <Chip label={tr('common.today')} selected={value === today} onPress={() => (onChange(today), setOpen(false))} />
          <Chip label={tr('common.yesterday')} selected={value === addDays(today, -1)} onPress={() => (onChange(addDays(today, -1)), setOpen(false))} />
          {allowClear ? <Chip label={tr('common.none')} selected={value === null} onPress={() => (onChange(null), setOpen(false))} /> : null}
        </Row>
        <CalendarMonth value={value ?? today} onSelect={(d) => (onChange(d), setOpen(false))} />
      </Sheet>
    </View>
  );
}

/* ------------------------------------------------------------------ Color & icon */

export function ColorPicker({ colors, value, onChange, label }: { colors: readonly string[]; value: string; onChange: (c: string) => void; label: string }) {
  const t = useTheme();
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Row gap={2} wrap>
        {colors.map((c) => (
          <Pressable key={c} onPress={() => onChange(c)} accessibilityRole="radio" accessibilityState={{ checked: c === value }} accessibilityLabel={c} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c, borderWidth: 3, borderColor: c === value ? t.colors.text : 'transparent' }} />
        ))}
      </Row>
    </View>
  );
}

export function IconPicker({ icons, value, onChange, color, label }: { icons: readonly string[]; value: string; onChange: (i: string) => void; color: string; label: string }) {
  const t = useTheme();
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Row gap={2} wrap>
        {icons.map((i) => (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            accessibilityRole="radio"
            accessibilityState={{ checked: i === value }}
            accessibilityLabel={i}
            style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: i === value ? color + '33' : t.colors.surface, borderWidth: 1, borderColor: i === value ? color : t.colors.border }}
          >
            <Icon name={i as IconName} size={20} color={i === value ? color : t.colors.textMuted} />
          </Pressable>
        ))}
      </Row>
    </View>
  );
}

/** Sticky footer with a primary action (used by every form). */
export function FormFooter({ label, onPress, loading, disabled, testID }: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean; testID?: string }) {
  return (
    <Stack gap={2}>
      <Button label={label} onPress={onPress} loading={loading} disabled={disabled} testID={testID} />
    </Stack>
  );
}

export { toDayKey };
