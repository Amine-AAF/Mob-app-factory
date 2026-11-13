import { Chip, Row, Stack, Text } from '@factory/design-system';

/** Single-choice chip group with a label (trip type, currency, theme…). */
export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  labelOf,
  testID,
}: {
  label?: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  labelOf: (value: T) => string;
  testID?: string;
}) {
  return (
    <Stack gap={2} testID={testID}>
      {label ? <Text variant="label">{label}</Text> : null}
      <Row gap={2} wrap>
        {options.map((o) => (
          <Chip key={o} label={labelOf(o)} selected={value === o} onPress={() => onChange(o)} testID={testID ? `${testID}-${o}` : undefined} />
        ))}
      </Row>
    </Stack>
  );
}
