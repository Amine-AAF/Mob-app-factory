import { Card, Icon, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { track } from '@/services/analytics';

const ENTRIES: { key: 'merge' | 'split' | 'extract' | 'imageToPdf' | 'pdfToImages'; icon: IconName; href: Href }[] = [
  { key: 'merge', icon: 'git-merge-outline', href: '/tools/pdf-merge' },
  { key: 'split', icon: 'cut-outline', href: { pathname: '/tools/pdf-split', params: { mode: 'ranges' } } },
  { key: 'extract', icon: 'copy-outline', href: { pathname: '/tools/pdf-split', params: { mode: 'extract' } } },
  { key: 'imageToPdf', icon: 'images-outline', href: '/tools/image-to-pdf' },
  { key: 'pdfToImages', icon: 'image-outline', href: '/tools/pdf-to-images' },
];

export default function PdfToolsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Screen edges={[]} testID="pdf-tools">
      <Text tone="muted">{t('pdf.hubIntro')}</Text>
      <Stack gap={3}>
        {ENTRIES.map((e) => (
          <Card
            key={e.key}
            onPress={() => {
              track('tool_opened', { tool: `pdf_${e.key}` });
              router.push(e.href);
            }}
            accessibilityLabel={`${t(`pdf.hub.${e.key}.title`)}. ${t(`pdf.hub.${e.key}.subtitle`)}`}
            testID={`pdf-${e.key}`}
          >
            <Row gap={3}>
              <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.accentSoft }}>
                <Icon name={e.icon} size={22} color={theme.colors.accent} />
              </View>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text variant="subheading">{t(`pdf.hub.${e.key}.title`)}</Text>
                <Text variant="caption" tone="muted">
                  {t(`pdf.hub.${e.key}.subtitle`)}
                </Text>
              </Stack>
              <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
            </Row>
          </Card>
        ))}
      </Stack>
      <Card tone="alt" testID="pdf-compression-unavailable">
        <Row gap={2}>
          <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
          <Text variant="subheading">{t('pdf.compressionTitle')}</Text>
        </Row>
        <Text variant="bodySmall" tone="muted">
          {t('pdf.compressionBody')}
        </Text>
      </Card>
    </Screen>
  );
}
