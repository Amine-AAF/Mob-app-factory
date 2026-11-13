import { Icon, PressableScale, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { View, type ViewStyle } from 'react-native';

import { describeBits, describeGlyph, type Bits, type Glyph, type PatternBoard, type Translate } from '@/engine';
import { BOARD_SURFACE, GLYPH_COLORS, SHAPE_ICONS } from '@/theme/game';

/* ------------------------------------------------------------------ glyphs */

const SIZE = { s: 0.5, m: 0.7, l: 0.92 } as const;

/** Draws a glyph (1–4 copies) with native vector icons; rotation via transform. */
export function GlyphView({ glyph, box = 64 }: { glyph: Glyph; box?: number }) {
  const theme = useTheme();
  const color = GLYPH_COLORS[theme.scheme][glyph.color];
  const icon = SHAPE_ICONS[glyph.shape][glyph.fill];
  const per = glyph.count === 1 ? 1 : 2;
  const size = Math.round(((box - 8) / per) * SIZE[glyph.size]);
  return (
    <View style={{ width: box, height: box, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', alignContent: 'center' }}>
      {Array.from({ length: glyph.count }, (_, i) => (
        <View key={i} style={{ width: (box - 8) / per, height: (box - 8) / per, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={size} color={color} style={{ transform: [{ rotate: `${glyph.rotation}deg` }] }} />
        </View>
      ))}
    </View>
  );
}

export function Tile({ children, state = 'idle', box, label, style }: { children?: React.ReactNode; state?: 'idle' | 'missing' | 'selected' | 'correct' | 'wrong'; box: number; label?: string; style?: ViewStyle }) {
  const theme = useTheme();
  const border = { idle: theme.colors.border, missing: theme.colors.accent, selected: theme.colors.primary, correct: theme.colors.success, wrong: theme.colors.danger }[state];
  return (
    <View
      accessible={!!label}
      accessibilityLabel={label}
      style={[
        {
          width: box,
          height: box,
          borderRadius: 14,
          borderWidth: state === 'idle' ? 1 : 2,
          borderStyle: state === 'missing' ? 'dashed' : 'solid',
          borderColor: border,
          backgroundColor: BOARD_SURFACE[theme.scheme],
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {state === 'missing' && !children ? (
        <Text variant="title" tone="accent">
          ?
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

/* ------------------------------------------------------------- bit grids */

export function BitGrid({ bits, cell, color, ghost }: { bits: Bits; cell: number; color: string; ghost?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 2 }}>
      {bits.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 2 }}>
          {row.map((v, c) => (
            <View key={c} style={{ width: cell, height: cell, borderRadius: 3, backgroundColor: v ? color : ghost ? 'transparent' : theme.colors.surfaceAlt, borderWidth: ghost ? 1 : 0, borderColor: theme.colors.border, borderStyle: 'dashed' }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/* --------------------------------------------------------- pattern board */

export function PatternBoardView({ board, ct }: { board: PatternBoard; ct: Translate }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const label = (g: Glyph | null) => (g ? describeGlyph(g, ct) : t('game.missingTile'));

  if (board.type === 'symmetry') {
    const color = GLYPH_COLORS[theme.scheme][board.color];
    const cell = board.rows > 4 ? 18 : 26;
    const ghost = board.given.map((r) => r.map(() => 0));
    const axisStyle: ViewStyle = board.axis === 'horizontal' ? { height: 2, alignSelf: 'stretch' } : { width: 2, alignSelf: 'stretch' };
    const parts = [<BitGrid key="g" bits={board.given} cell={cell} color={color} />, <View key="a" style={[axisStyle, { backgroundColor: theme.colors.accent }]} />, <BitGrid key="m" bits={ghost} cell={cell} color={color} ghost />];
    return (
      <View accessible accessibilityLabel={`${ct(`pat.instructions.symmetry_${board.axis}`)} ${describeBits(board.given, ct)}`} style={{ alignSelf: 'center', flexDirection: board.axis === 'horizontal' ? 'column' : 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: 16, backgroundColor: BOARD_SURFACE[theme.scheme], borderWidth: 1, borderColor: theme.colors.border }}>
        {parts}
      </View>
    );
  }

  if (board.type === 'matrix') {
    const box = 76;
    return (
      <View style={{ alignSelf: 'center', gap: 8 }}>
        {[0, 1, 2].map((r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 1, 2].map((c) => {
              const g = board.cells[r * 3 + c] ?? null;
              return (
                <Tile key={c} box={box} state={g ? 'idle' : 'missing'} label={label(g)}>
                  {g ? <GlyphView glyph={g} box={box - 10} /> : null}
                </Tile>
              );
            })}
          </View>
        ))}
      </View>
    );
  }

  if (board.type === 'analogy') {
    const box = 70;
    const [a, b, c] = board.cells as Glyph[];
    const arrow = <Icon name="arrow-forward" size={20} color={theme.colors.textMuted} />;
    return (
      <View style={{ alignSelf: 'center', gap: 10, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessible accessibilityLabel={`${label(a!)} → ${label(b!)}`}>
          <Tile box={box}>{a ? <GlyphView glyph={a} box={box - 10} /> : null}</Tile>
          {arrow}
          <Tile box={box}>{b ? <GlyphView glyph={b} box={box - 10} /> : null}</Tile>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessible accessibilityLabel={`${label(c!)} → ${t('game.missingTile')}`}>
          <Tile box={box}>{c ? <GlyphView glyph={c} box={box - 10} /> : null}</Tile>
          {arrow}
          <Tile box={box} state="missing" />
        </View>
      </View>
    );
  }

  // Row: wraps on narrow screens.
  const box = board.cells.length > 6 ? 54 : 60;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
      {board.cells.map((g, i) => (
        <Tile key={i} box={box} state={g ? 'idle' : 'missing'} label={`${i + 1}: ${label(g)}`}>
          {g ? <GlyphView glyph={g} box={box - 8} /> : null}
        </Tile>
      ))}
    </View>
  );
}

/** Answer options of a pattern board, as a 2×2 grid of large tiles. */
export function PatternOptions({
  board,
  ct,
  selected,
  correctIndex,
  wrongIndex,
  onSelect,
}: {
  board: PatternBoard;
  ct: Translate;
  selected: number | null;
  correctIndex?: number;
  wrongIndex?: number | null;
  onSelect?: (i: number) => void;
}) {
  const theme = useTheme();
  const box = 82;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }} accessibilityRole="radiogroup">
      {board.options.map((opt, i) => {
        const state = i === correctIndex ? 'correct' : i === wrongIndex ? 'wrong' : i === selected ? 'selected' : 'idle';
        const desc = board.type === 'symmetry' ? describeBits(opt as Bits, ct) : describeGlyph(opt as Glyph, ct);
        return (
          <PressableScale
            key={i}
            disabled={!onSelect}
            onPress={() => onSelect?.(i)}
            accessibilityRole="radio"
            accessibilityState={{ selected: i === selected, checked: i === selected }}
            accessibilityLabel={`${ct('pat.optionLabel', { n: i + 1 })}: ${desc}`}
            testID={`option-${i}`}
          >
            <Tile box={box} state={state}>
              {board.type === 'symmetry' ? (
                <BitGrid bits={opt as Bits} cell={board.rows > 4 ? 9 : 13} color={GLYPH_COLORS[theme.scheme][board.color]} />
              ) : (
                <GlyphView glyph={opt as Glyph} box={box - 12} />
              )}
            </Tile>
          </PressableScale>
        );
      })}
    </View>
  );
}

/* --------------------------------------------------------- sequences */

export function SequenceStrip({ terms, revealed }: { terms: (number | null)[]; revealed?: number }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityLabel={terms.map((v) => (v === null ? (revealed !== undefined ? String(revealed) : t('game.missingNumber')) : String(v))).join(', ')}
      style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}
    >
      {terms.map((v, i) => (
        <View
          key={i}
          style={{
            minWidth: 56,
            height: 56,
            paddingHorizontal: 10,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: v === null ? (revealed !== undefined ? theme.colors.successSoft : theme.colors.accentSoft) : BOARD_SURFACE[theme.scheme],
            borderWidth: v === null ? 2 : 1,
            borderStyle: v === null && revealed === undefined ? 'dashed' : 'solid',
            borderColor: v === null ? (revealed !== undefined ? theme.colors.success : theme.colors.accent) : theme.colors.border,
          }}
        >
          <Text variant="heading" tone={v === null ? (revealed !== undefined ? 'success' : 'accent') : 'default'}>
            {v === null ? (revealed !== undefined ? String(revealed) : '?') : String(v)}
          </Text>
        </View>
      ))}
    </View>
  );
}
