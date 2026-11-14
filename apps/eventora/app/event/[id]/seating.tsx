import { Button, Card, Chip, EmptyState, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { ChoiceChips, Stepper, TextField } from '@/components/forms';
import { confirmDelete, limitAlert, Notice, ScreenTitle } from '@/components/ui';
import { canAddTable, canUseTableShape } from '@/config/limits';
import { fullName, partySize } from '@/domain/guests';
import { autoPlace, canSeat, seatingSummary, seatPositions, tableUsage, unassignedGuests, type TableUsage } from '@/domain/seating';
import { TABLE_SHAPES, type Guest, type SeatingTable, type TableShape } from '@/domain/types';
import { exportReport } from '@/features/exporter';
import { mutate, useSnapshot } from '@/hooks/useData';
import { useIsPremium } from '@/store/session';

function TableDrawing({ usage, size, highlight }: { usage: TableUsage; size: number; highlight: boolean }) {
  const theme = useTheme();
  const { table, used, overloaded } = usage;
  const seats = seatPositions(table.shape, table.seats);
  const dot = Math.max(8, Math.min(14, size / 9));
  const rectH = table.shape === 'round' || table.shape === 'custom' ? size * 0.56 : size * 0.34;
  const rectW = table.shape === 'round' || table.shape === 'custom' ? size * 0.56 : size * 0.8;
  return (
    <View style={{ width: size, height: table.shape === 'round' || table.shape === 'custom' ? size : size * 0.6, alignSelf: 'center' }}>
      <View
        style={{
          position: 'absolute',
          left: (size - rectW) / 2,
          top: ((table.shape === 'round' || table.shape === 'custom' ? size : size * 0.6) - rectH) / 2,
          width: rectW,
          height: rectH,
          borderRadius: table.shape === 'round' ? rectW / 2 : table.shape === 'custom' ? 18 : 8,
          backgroundColor: highlight ? theme.colors.primarySoft : theme.colors.surfaceAlt,
          borderWidth: 2,
          borderColor: overloaded ? theme.colors.danger : highlight ? theme.colors.primary : theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="caption" style={{ fontWeight: '700' }} numberOfLines={1}>
          {table.name}
        </Text>
        <Text variant="caption" tone={overloaded ? 'danger' : 'muted'}>{`${used}/${table.seats}`}</Text>
      </View>
      {seats.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: p.x * size - dot / 2,
            top: p.y * (table.shape === 'round' || table.shape === 'custom' ? size : size * 0.6) - dot / 2,
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: i < used ? (overloaded ? theme.colors.danger : theme.colors.primary) : theme.colors.border,
          }}
        />
      ))}
    </View>
  );
}

/** Seating plan: pick a guest, then tap a table. Families (groups) can be placed together. */
export default function Seating() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [shape, setShape] = useState<TableShape>('round');
  const [seats, setSeats] = useState(8);
  const [editing, setEditing] = useState<SeatingTable | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>('all');

  if (!snap) return null;
  const usage = tableUsage(snap.tables, snap.assignments, snap.guests);
  const summary = seatingSummary(snap.tables, snap.assignments, snap.guests);
  const unseated = unassignedGuests(snap.guests, snap.assignments).filter((g) => groupFilter === 'all' || g.groupId === groupFilter);
  const groups = new Map(snap.groups.map((g) => [g.id, g.name]));
  const selectedGuest = snap.guests.find((g) => g.id === selected) ?? null;

  const place = (table: SeatingTable) => {
    if (!selectedGuest) return;
    const check = canSeat(selectedGuest, table, usage);
    const doIt = () => {
      void mutate((r) => r.seating.assign(selectedGuest.id, table.id));
      setSelected(null);
    };
    if (!check.ok) {
      Alert.alert(t('seating.fullTitle'), t('seating.fullBody', { free: check.free, needed: check.needed }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('seating.placeAnyway'), style: 'destructive', onPress: doIt },
      ]);
    } else doIt();
  };

  const placeGroup = (groupId: string, table: SeatingTable) => {
    const members = unassignedGuests(snap.guests, snap.assignments).filter((g) => g.groupId === groupId);
    void mutate((r) => r.seating.assignMany(members.map((g) => ({ guestId: g.id, tableId: table.id }))));
  };

  const saveTable = async () => {
    if (!name.trim()) return;
    if (!canUseTableShape(isPremium, shape)) return limitAlert(t, 'advancedSeating', 0, 'table_shape');
    if (editing) await mutate((r) => r.seating.updateTable(editing.id, { name: name.trim(), shape, seats }));
    else {
      const check = canAddTable(isPremium, snap.tables.length);
      if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'seating_tables');
      await mutate((r) => r.seating.addTable({ eventId: id, name: name.trim(), shape, seats, notes: '' }));
    }
    setAdding(false);
    setEditing(null);
    setName('');
  };

  const runAuto = () => {
    const pairs = autoPlace(snap.tables, snap.assignments, snap.guests);
    if (!pairs.length) return Alert.alert(t('seating.autoNone'));
    Alert.alert(t('seating.autoTitle'), t('seating.autoBody', { count: pairs.length }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => void mutate((r) => r.seating.assignMany(pairs)) },
    ]);
  };

  const guestChip = (g: Guest) => (
    <Chip key={g.id} label={`${fullName(g)}${partySize(g) > 1 ? ` +${partySize(g) - 1}` : ''}`} selected={selected === g.id} onPress={() => setSelected(selected === g.id ? null : g.id)} icon={g.isChild ? 'happy-outline' : undefined} />
  );

  return (
    <Screen edges={[]}>
      <ScreenTitle
        title={t('modules.seating')}
        right={
          <IconButton
            icon="share-outline"
            label={t('reports.export')}
            onPress={() =>
              Alert.alert(t('reports.export'), undefined, [
                { text: 'PDF', onPress: () => void exportReport({ t, snap, kind: 'seating', format: 'pdf', isPremium }) },
                { text: 'CSV', onPress: () => void exportReport({ t, snap, kind: 'seating', format: 'csv', isPremium }) },
                { text: t('common.cancel'), style: 'cancel' },
              ])
            }
          />
        }
      />
      <Card tone="alt">
        <Row style={{ justifyContent: 'space-around' }}>
          {[
            [summary.tables, t('seating.tables')],
            [`${summary.seated}/${summary.capacity}`, t('seating.seated')],
            [summary.unseated, t('seating.unseated')],
          ].map(([v, l]) => (
            <View key={String(l)} style={{ alignItems: 'center' }} accessible accessibilityLabel={`${l}: ${v}`}>
              <Text variant="heading">{String(v)}</Text>
              <Text variant="caption" tone="muted">
                {l}
              </Text>
            </View>
          ))}
        </Row>
      </Card>
      {summary.overloadedTables ? <Notice tone="danger" icon="warning">{t('seating.overloadedNote', { count: summary.overloadedTables })}</Notice> : null}
      {summary.capacity < summary.seated + summary.unseated ? <Notice tone="warning">{t('seating.notEnoughSeats', { missing: summary.seated + summary.unseated - summary.capacity })}</Notice> : null}

      <Row gap={2} wrap>
        <Button size="md" icon="add" label={t('seating.addTable')} onPress={() => { setAdding(true); setEditing(null); setName(t('seating.defaultName', { n: snap.tables.length + 1 })); }} />
        {snap.tables.length && unseated.length ? <Button size="md" variant="secondary" icon="color-wand-outline" label={t('seating.auto')} onPress={runAuto} /> : null}
        {snap.assignments.length ? <Button size="md" variant="ghost" label={t('seating.clear')} onPress={() => confirmDelete(t, t('seating.allSeats'), () => void mutate((r) => r.seating.clear(id)))} /> : null}
      </Row>

      {adding || editing ? (
        <Card>
          <TextField label={t('seating.tableName')} value={name} onChangeText={setName} />
          <ChoiceChips<TableShape>
            label={t('seating.shape')}
            value={shape}
            onChange={setShape}
            options={TABLE_SHAPES.map((s) => ({ value: s, label: `${t(`tableShape.${s}`)}${canUseTableShape(isPremium, s) ? '' : ' ◆'}` }))}
          />
          <Stepper label={t('seating.seats')} value={seats} onChange={setSeats} min={1} max={60} />
          <Row gap={2}>
            <Stack style={{ flex: 1 }}>
              <Button size="md" label={t('common.save')} onPress={() => void saveTable()} />
            </Stack>
            <Button size="md" variant="ghost" label={t('common.cancel')} onPress={() => { setAdding(false); setEditing(null); }} />
          </Row>
        </Card>
      ) : null}

      <SectionHeader title={t('seating.unseatedList')} />
      {snap.groups.length ? (
        <ChoiceChips value={groupFilter} onChange={setGroupFilter} options={[{ value: 'all', label: t('common.all') }, ...snap.groups.map((g) => ({ value: g.id, label: g.name }))]} />
      ) : null}
      {unseated.length === 0 ? (
        <Text tone="muted">{t('seating.everyoneSeated')}</Text>
      ) : (
        <Row gap={2} wrap>
          {unseated.slice(0, 80).map(guestChip)}
        </Row>
      )}
      {selectedGuest ? (
        <Notice icon="hand-left-outline" title={t('seating.tapTable', { name: fullName(selectedGuest) })}>
          {selectedGuest.groupId ? t('seating.groupHint', { group: groups.get(selectedGuest.groupId) ?? '' }) : undefined}
        </Notice>
      ) : null}

      <SectionHeader title={t('seating.plan')} />
      {snap.tables.length === 0 ? (
        <EmptyState icon="grid-outline" title={t('seating.emptyTitle')} message={t('seating.emptyBody')} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {usage.map((u) => (
            <View key={u.table.id} style={{ flexBasis: u.table.shape === 'head' ? '100%' : '47%', flexGrow: 1 }}>
              <Card style={{ borderColor: u.overloaded ? theme.colors.danger : theme.colors.border }}>
                <Pressable onPress={() => (selectedGuest ? place(u.table) : undefined)} accessibilityRole="button" accessibilityLabel={`${u.table.name}, ${u.used}/${u.table.seats}`}>
                  <TableDrawing usage={u} size={u.table.shape === 'head' ? 260 : 140} highlight={!!selectedGuest} />
                </Pressable>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="caption" tone={u.free ? 'success' : u.overloaded ? 'danger' : 'muted'}>
                    {u.overloaded ? t('seating.over', { count: u.used - u.table.seats }) : t('seating.free', { count: u.free })}
                  </Text>
                  <Row gap={0}>
                    {selectedGuest?.groupId ? <IconButton icon="people" size={18} label={t('seating.placeGroup')} onPress={() => placeGroup(selectedGuest.groupId!, u.table)} /> : null}
                    <IconButton icon="create-outline" size={18} label={t('common.edit')} onPress={() => { setEditing(u.table); setAdding(false); setName(u.table.name); setShape(u.table.shape); setSeats(u.table.seats); }} />
                    <IconButton icon="trash-outline" size={18} tone="danger" label={t('common.delete')} onPress={() => confirmDelete(t, u.table.name, () => void mutate((r) => r.seating.removeTable(u.table.id)), t('seating.deleteTableBody'))} />
                  </Row>
                </Row>
                {u.guests.map((g) => (
                  <Pressable
                    key={g.id}
                    onPress={() =>
                      Alert.alert(fullName(g), undefined, [
                        { text: t('seating.move'), onPress: () => setSelected(g.id) },
                        { text: t('seating.unseat'), onPress: () => void mutate((r) => r.seating.unassign(g.id)) },
                        { text: t('common.cancel'), style: 'cancel' },
                      ])
                    }
                    accessibilityRole="button"
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}
                  >
                    <Icon name={g.isChild ? 'happy-outline' : 'person-outline'} size={14} color={theme.colors.textMuted} />
                    <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1, fontWeight: selected === g.id ? '700' : '400' }}>
                      {`${fullName(g)}${partySize(g) > 1 ? ` +${partySize(g) - 1}` : ''}`}
                    </Text>
                  </Pressable>
                ))}
              </Card>
            </View>
          ))}
        </View>
      )}
      {!isPremium ? (
        <Text variant="caption" tone="subtle" center>
          {t('seating.freeLimit', { limit: 6 })}
        </Text>
      ) : null}
    </Screen>
  );
}
