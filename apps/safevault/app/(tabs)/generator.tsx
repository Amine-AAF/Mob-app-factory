import { Button, Card, Chip, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Stepper, Toggle } from '@/components/inputs';
import { StrengthMeter, useSecureCopy } from '@/components/vault';
import { clampOptions, generate, generatorEntropyBits, LENGTH_RANGE, SEPARATORS, WORDS_RANGE, type GeneratorOptions } from '@/features/generator/generator';
import { offerGeneratedPassword } from '@/features/generator/handoff';
import { scoreFromEntropy } from '@/features/generator/strength';
import { updateSettings } from '@/services/context';
import { useApp } from '@/store/app';

export default function Generator() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const copy = useSecureCopy();
  const saved = useApp((s) => s.settings.generator);
  const [opts, setOpts] = useState<GeneratorOptions>(saved);
  const [value, setValue] = useState(() => generate(saved));

  const regenerate = useCallback((o: GeneratorOptions) => setValue(generate(o)), []);
  const update = (patch: Partial<GeneratorOptions>) => {
    const next = clampOptions({ ...opts, ...patch });
    setOpts(next);
    regenerate(next);
    void updateSettings({ generator: next });
  };
  // Generated values are not kept when leaving the tab.
  useEffect(() => () => setValue(''), []);

  const bits = useMemo(() => Math.round(generatorEntropyBits(opts)), [opts]);
  const score = scoreFromEntropy(bits);

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('generator.title')}
      </Text>
      <Row gap={2}>
        <Chip label={t('generator.password')} selected={opts.mode === 'password'} onPress={() => update({ mode: 'password' })} />
        <Chip label={t('generator.passphrase')} selected={opts.mode === 'passphrase'} onPress={() => update({ mode: 'passphrase' })} />
      </Row>
      <Card>
        <View style={{ minHeight: 72, justifyContent: 'center' }}>
          <Text variant="mono" selectable={false} style={{ fontSize: 20, lineHeight: 28, color: theme.colors.text }} accessibilityLabel={t('generator.generatedA11y')} testID="generated-value">
            {value}
          </Text>
        </View>
        <StrengthMeter score={score} label={t(`strength.score.${score}`)} detail={t('strength.bits', { bits })} />
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Button label={t('generator.copy')} icon="copy-outline" onPress={() => void copy(value, t('fields.password'))} size="md" />
          </View>
          <View style={{ flex: 1 }}>
            <Button label={t('generator.regenerate')} icon="refresh" variant="secondary" onPress={() => regenerate(opts)} size="md" testID="regenerate" />
          </View>
        </Row>
        <Button
          label={t('generator.useInLogin')}
          icon="key"
          variant="ghost"
          size="md"
          onPress={() => {
            offerGeneratedPassword(value);
            router.push({ pathname: '/edit', params: { type: 'login' } });
          }}
        />
      </Card>

      <Card>
        {opts.mode === 'password' ? (
          <Stack gap={0}>
            <Stepper label={t('generator.length')} value={opts.length} min={LENGTH_RANGE.min} max={LENGTH_RANGE.max} onChange={(length) => update({ length })} />
            <Toggle label={t('generator.lowercase')} value={opts.lowercase} onChange={(lowercase) => update({ lowercase })} />
            <Toggle label={t('generator.uppercase')} value={opts.uppercase} onChange={(uppercase) => update({ uppercase })} />
            <Toggle label={t('generator.digits')} value={opts.digits} onChange={(digits) => update({ digits })} />
            <Toggle label={t('generator.symbols')} value={opts.symbols} onChange={(symbols) => update({ symbols })} />
            <Toggle label={t('generator.excludeAmbiguous')} description={t('generator.excludeAmbiguousHint')} value={opts.excludeAmbiguous} onChange={(excludeAmbiguous) => update({ excludeAmbiguous })} />
          </Stack>
        ) : (
          <Stack gap={0}>
            <Stepper label={t('generator.words')} value={opts.words} min={WORDS_RANGE.min} max={WORDS_RANGE.max} onChange={(words) => update({ words })} />
            <Toggle label={t('generator.capitalize')} value={opts.capitalize} onChange={(capitalize) => update({ capitalize })} />
            <Toggle label={t('generator.includeNumber')} value={opts.includeNumber} onChange={(includeNumber) => update({ includeNumber })} />
            <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
              {t('generator.separator')}
            </Text>
            <Row gap={2} wrap style={{ marginTop: 6 }}>
              {SEPARATORS.map((sep) => (
                <Chip key={sep} label={sep === ' ' ? t('generator.space') : sep} selected={opts.separator === sep} onPress={() => update({ separator: sep })} />
              ))}
            </Row>
          </Stack>
        )}
      </Card>
      <Text variant="caption" tone="subtle">
        {t('generator.disclaimer')}
      </Text>
    </Screen>
  );
}
