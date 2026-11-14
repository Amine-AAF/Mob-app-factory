import { Chip, Row } from '@factory/design-system';
import { ScrollView } from 'react-native';

import type { EventRecord } from '@/domain/types';

/** Horizontal chips to pick the event a tab shows (Guests, Tasks). */
export function EventPicker({ events, value, onChange, allLabel }: { events: readonly EventRecord[]; value: string | null; onChange: (id: string | null) => void; allLabel?: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Row gap={2}>
        {allLabel ? <Chip label={allLabel} selected={value === null} onPress={() => onChange(null)} /> : null}
        {events.map((e) => (
          <Chip key={e.id} label={e.name} selected={value === e.id} onPress={() => onChange(e.id)} />
        ))}
      </Row>
    </ScrollView>
  );
}
