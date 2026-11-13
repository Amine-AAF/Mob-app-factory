import { Button, PressableScale, Stack, Text, useTheme } from '@factory/design-system';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { buildMemoryRound, describeGlyph, memoryDisplayMs, memoryFrameAt, type MemoryChallenge, type PlayerAnswer, type Translate } from '@/engine';
import { useNow } from '@/hooks';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { BOARD_SURFACE } from '@/theme/game';

import { GlyphView, PatternOptions, Tile } from './board';
import { NumberKeypad } from './inputs';

type Phase = 'ready' | 'show' | 'recall';

/**
 * Memory challenge: ready → memorize (timeline from `memoryFrameAt`) → recall.
 * A replay hint remounts the view with `autoStart` (see app/game.tsx).
 */
export function MemoryPlay({ challenge, ct, relaxed, autoStart, review, onSubmit }: { challenge: MemoryChallenge; ct: Translate; relaxed: boolean; autoStart: boolean; review?: { correct: boolean } | null; onSubmit: (a: PlayerAnswer) => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const spec = challenge.spec;
  const round = useMemo(() => buildMemoryRound(spec), [spec]);
  // A replay (hint) remounts this component with autoStart, skipping the "ready" step.
  const [startedAt, setStartedAt] = useState<number | null>(() => (autoStart ? clock.now().getTime() : null));
  const [taps, setTaps] = useState<number[]>([]);
  const [digits, setDigits] = useState('');
  const [choice, setChoice] = useState<number | null>(null);
  const duration = memoryDisplayMs(spec, relaxed);
  const [ticking, setTicking] = useState(autoStart);
  const now = useNow(80, ticking);

  const start = () => {
    setStartedAt(clock.now().getTime());
    setTicking(true);
  };

  // The show → recall transition is derived from the engine's timeline, never stored.
  const frame = startedAt === null ? null : memoryFrameAt(spec, round, Math.max(0, now - startedAt), relaxed);
  const phase: Phase = startedAt === null ? 'ready' : frame?.phase === 'show' ? 'show' : 'recall';
  const showing = phase === 'show';
  if (ticking && startedAt !== null && now - startedAt > duration + 200) setTicking(false); // stop the clock once recall begins

  if (review) {
    return (
      <Stack gap={3}>
        <MemoryBoard challenge={challenge} round={round} highlight={challenge.answer} ct={ct} />
      </Stack>
    );
  }

  if (phase === 'ready') {
    return (
      <Stack gap={4} style={{ alignItems: 'center', paddingVertical: 16 }}>
        <Text tone="muted" center>
          {t('game.memoryReady')}
        </Text>
        <Button label={t('game.memoryStart')} icon="eye-outline" onPress={start} testID="memory-start" />
      </Stack>
    );
  }

  const tileCount = spec.kind === 'sequence' ? spec.tiles : spec.kind === 'pattern' ? spec.rows * spec.cols : 0;
  const cols = spec.kind === 'sequence' ? (spec.tiles === 4 ? 2 : 3) : spec.kind === 'pattern' ? spec.cols : 0;

  if (spec.kind === 'sequence' || spec.kind === 'pattern') {
    const lit = showing ? (spec.kind === 'sequence' ? (frame?.phase === 'show' && frame.activeTile != null ? [frame.activeTile] : []) : round.items) : [];
    const toggle = (i: number) => {
      feedback.tap();
      if (spec.kind === 'sequence') {
        const next = [...taps, i];
        setTaps(next);
        if (next.length === spec.length) onSubmit({ kind: 'taps', values: next });
      } else {
        setTaps((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
      }
    };
    const box = cols >= 5 ? 52 : cols === 4 ? 62 : 78;
    return (
      <Stack gap={4} style={{ alignItems: 'center' }}>
        <Text variant="bodySmall" tone="muted" accessibilityLiveRegion="polite">
          {showing ? t('game.memorize') : spec.kind === 'sequence' ? t('game.tapInOrder', { done: taps.length, total: spec.length }) : t('game.tapCells', { done: taps.length, total: spec.lit })}
        </Text>
        <View style={{ width: cols * (box + 8), flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {Array.from({ length: tileCount }, (_, i) => {
            const on = lit.includes(i) || (!showing && spec.kind === 'pattern' && taps.includes(i));
            return (
              <PressableScale key={i} disabled={showing} onPress={() => toggle(i)} accessibilityRole="button" accessibilityLabel={t('game.tile', { n: i + 1 })} accessibilityState={{ selected: on }} testID={`tile-${i}`}>
                <View style={{ width: box, height: box, borderRadius: 14, backgroundColor: on ? theme.colors.accent : BOARD_SURFACE[theme.scheme], borderWidth: 1, borderColor: on ? theme.colors.accent : theme.colors.border }} />
              </PressableScale>
            );
          })}
        </View>
        {!showing && spec.kind === 'pattern' ? (
          <Button label={t('game.submit')} onPress={() => onSubmit({ kind: 'taps', values: taps })} disabled={taps.length !== spec.lit} testID="submit" />
        ) : null}
        {!showing && spec.kind === 'sequence' && taps.length > 0 ? <Button label={t('game.clear')} variant="ghost" size="md" onPress={() => setTaps([])} /> : null}
      </Stack>
    );
  }

  if (spec.kind === 'number') {
    return (
      <Stack gap={4}>
        {showing ? (
          <View accessible accessibilityLabel={round.items.join(' ')} style={{ alignItems: 'center', paddingVertical: 24, borderRadius: 16, backgroundColor: BOARD_SURFACE[theme.scheme], borderWidth: 1, borderColor: theme.colors.border }}>
            <Text variant="display" style={{ letterSpacing: 6, fontVariant: ['tabular-nums'] }}>
              {round.items.join('')}
            </Text>
          </View>
        ) : (
          <>
            <NumberKeypad value={digits} onChange={setDigits} maxLength={spec.digits} />
            <Button label={t('game.submit')} onPress={() => onSubmit({ kind: 'taps', values: [...digits].map(Number) })} disabled={digits.length !== spec.digits} testID="submit" />
          </>
        )}
      </Stack>
    );
  }

  // Visual memory
  return (
    <Stack gap={4}>
      {showing ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {round.shownGlyphs.map((g, i) => (
            <Tile key={i} box={64} label={describeGlyph(g, ct)}>
              <GlyphView glyph={g} box={56} />
            </Tile>
          ))}
        </View>
      ) : (
        <>
          <PatternOptions board={{ type: 'row', cells: [], options: round.options }} ct={ct} selected={choice} onSelect={setChoice} />
          <Button label={t('game.submit')} onPress={() => choice !== null && onSubmit({ kind: 'option', index: choice })} disabled={choice === null} testID="submit" />
        </>
      )}
    </Stack>
  );
}

/** Post-answer view of a memory round with the expected answer highlighted. */
function MemoryBoard({ challenge, round, highlight, ct }: { challenge: MemoryChallenge; round: ReturnType<typeof buildMemoryRound>; highlight: number[]; ct: Translate }) {
  const theme = useTheme();
  const spec = challenge.spec;
  if (spec.kind === 'number') return null;
  if (spec.kind === 'visual') return <PatternOptions board={{ type: 'row', cells: [], options: round.options }} ct={ct} selected={null} correctIndex={highlight[0]} />;
  const count = spec.kind === 'sequence' ? spec.tiles : spec.rows * spec.cols;
  const cols = spec.kind === 'sequence' ? (spec.tiles === 4 ? 2 : 3) : spec.cols;
  const box = cols >= 5 ? 44 : cols === 4 ? 52 : 62;
  return (
    <View style={{ alignSelf: 'center', width: cols * (box + 6), flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: count }, (_, i) => {
        const order = spec.kind === 'sequence' ? highlight.map((v, k) => (v === i ? k + 1 : null)).filter(Boolean) : [];
        const on = highlight.includes(i);
        return (
          <View key={i} style={{ width: box, height: box, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? theme.colors.successSoft : BOARD_SURFACE[theme.scheme], borderWidth: on ? 2 : 1, borderColor: on ? theme.colors.success : theme.colors.border }}>
            {order.length ? (
              <Text variant="caption" tone="success">
                {order.join(',')}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
