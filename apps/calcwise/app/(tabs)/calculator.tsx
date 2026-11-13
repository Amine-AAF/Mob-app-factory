import { Icon, IconButton, Row, Text, useTheme } from '@factory/design-system';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CopyButton, Segmented } from '@/components/fields';
import { Keypad, type PadAction } from '@/components/Keypad';
import { canonical, equals, INITIAL_STATE, loadValue, press, previewValue, type CalcState } from '@/features/calculator/input';
import { scientificRows, standardRows } from '@/features/calculator/layouts';
import { useFormat } from '@/hooks/useFormat';
import { saveToHistory } from '@/hooks/useToolSession';
import { track } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';
import { Dec } from '@/utils/decimal';
import { displayExpression } from '@/utils/numberFormat';

/**
 * Standard & Scientific calculator. No ad is ever shown on this screen.
 * The expression is evaluated by the safe MathematicalEngine (no eval).
 */
export default function CalculatorScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const f = useFormat();
  const mode = usePreferences((s) => s.calculatorMode);
  const angle = usePreferences((s) => s.angleMode);
  const setPref = usePreferences((s) => s.set);
  const [state, setState] = useState<CalcState>(INITIAL_STATE);
  const [lastExpression, setLastExpression] = useState<string | null>(null);
  const [second, setSecond] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ load?: string; mode?: string }>();

  useFocusEffect(
    useCallback(() => {
      track('calculator_opened', { mode });
    }, [mode]),
  );

  // Values sent from History ("Use in calculator") or the Home shortcuts.
  useEffect(() => {
    if (params.mode === 'standard' || params.mode === 'scientific') setPref({ calculatorMode: params.mode });
    if (params.load && /^-?\d+(\.\d+)?(E[+-]?\d+)?$/.test(params.load)) {
      const value = params.load;
      setState((s) => loadValue(s, value));
      setLastExpression(null);
    }
    if (params.load || params.mode) router.setParams({ load: undefined, mode: undefined });
  }, [params.load, params.mode, setPref]);

  const onKey = (action: PadAction) => {
    if (action.type === 'second') return setSecond((v) => !v);
    if (action.type === 'angle') return setPref({ angleMode: angle === 'deg' ? 'rad' : 'deg' });
    if (action.type === 'equals') {
      const out = equals(state, angle);
      setState(out.state);
      if (out.record) {
        setLastExpression(out.record.expression);
        saveToHistory({ tool: mode, expression: out.record.expression, result: out.record.result });
        track('calculation_completed', { tool: mode });
      }
      return;
    }
    if (state.justEvaluated && action.type !== 'clear') setLastExpression(null);
    if (action.type === 'clear') setLastExpression(null);
    setState((s) => press(s, action));
  };

  const shownExpression = useMemo(() => {
    const withAns = state.ans ? state.expr.replace(/ans/g, canonical(new Dec(state.ans))) : state.expr;
    return displayExpression(withAns, f.locale);
  }, [state.expr, state.ans, f.locale]);

  const preview = previewValue(state, angle);
  const resultText = state.justEvaluated && state.ans ? f.number(new Dec(state.ans)) : preview ? f.number(preview) : null;
  const errorText = state.error ? t(`calc.errors.${state.error}`) : null;

  const rows = useMemo(() => standardRows(f.separators.decimal), [f.separators.decimal]);
  const sciRows = useMemo(() => scientificRows(second, angle), [second, angle]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="calculator-screen">
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, maxWidth: 280 }}>
            <Segmented
              testID="calc-mode"
              value={mode}
              onChange={(m) => setPref({ calculatorMode: m })}
              options={[
                { value: 'standard', label: t('tools.standard.short') },
                { value: 'scientific', label: t('tools.scientific.short') },
              ]}
            />
          </View>
          <IconButton icon="time-outline" label={t('tabs.history')} onPress={() => router.push('/(tabs)/history')} />
        </Row>

        {/* Display */}
        <View style={{ flex: 1, justifyContent: 'flex-end', gap: 6, paddingHorizontal: 4 }} accessibilityLiveRegion="polite">
          {lastExpression ? (
            <Text tone="subtle" style={{ textAlign: 'right' }} numberOfLines={1} testID="calc-last-expression">
              {`${displayExpression(lastExpression, f.locale)} =`}
            </Text>
          ) : null}
          <ScrollView horizontal ref={scroller} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} showsHorizontalScrollIndicator={false}>
            <Text
              testID="calc-expression"
              accessibilityLabel={t('calc.expressionLabel', { expression: shownExpression || '0' })}
              style={{ fontSize: state.justEvaluated ? 22 : shownExpression.length > 14 ? 30 : 40, fontWeight: state.justEvaluated ? '500' : '300', color: state.justEvaluated ? theme.colors.textMuted : theme.colors.text, fontVariant: ['tabular-nums'] }}
            >
              {state.justEvaluated ? (lastExpression ? '' : shownExpression) : shownExpression || '0'}
            </Text>
          </ScrollView>
          <Row style={{ justifyContent: 'space-between', minHeight: 48 }}>
            {resultText && state.justEvaluated ? <CopyButton text={resultText} /> : <View />}
            {errorText ? (
              <Text tone="danger" variant="subheading" testID="calc-error" style={{ textAlign: 'right', flex: 1 }}>
                {errorText}
              </Text>
            ) : resultText ? (
              <Text
                testID="calc-result"
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{ flex: 1, textAlign: 'right', fontSize: state.justEvaluated ? 44 : 24, fontWeight: state.justEvaluated ? '700' : '500', color: state.justEvaluated ? theme.colors.text : theme.colors.textMuted, fontVariant: ['tabular-nums'] }}
              >
                {state.justEvaluated ? resultText : `= ${resultText}`}
              </Text>
            ) : null}
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="caption" tone="subtle">
              {mode === 'scientific' ? (angle === 'deg' ? t('calc.degrees') : t('calc.radians')) : ' '}
            </Text>
            <Pressable
              testID="key-backspace"
              onPress={() => onKey({ type: 'backspace' })}
              onLongPress={() => onKey({ type: 'clear' })}
              accessibilityRole="button"
              accessibilityLabel={t('keys.backspace')}
              accessibilityHint={t('keys.backspaceHint')}
              hitSlop={12}
              style={{ padding: 8 }}
            >
              <Icon name="backspace-outline" size={26} color={theme.colors.textMuted} />
            </Pressable>
          </Row>
        </View>

        {mode === 'scientific' ? <Keypad rows={sciRows} onPress={onKey} compact testID="keypad-scientific" /> : null}
        <Keypad rows={rows} onPress={onKey} dense={mode === 'scientific'} testID="keypad-standard" />
      </View>
    </SafeAreaView>
  );
}
