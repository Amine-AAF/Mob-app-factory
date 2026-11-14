import { Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import { ErrorNotice, ToolTile } from '@/components/common';
import { AdBanner } from '@/components/monetization';
import { TOOLS, type ToolDef } from '@/constants/tools';
import { useOpenTool } from '@/features/navigation';

const GROUPS: ToolDef['group'][] = ['essentials', 'creative', 'productivity'];

/** Every tool, grouped. Advanced options live inside each tool, not here. */
export default function ToolsScreen() {
  const { t } = useTranslation();
  const { open, error } = useOpenTool('tools');
  return (
    <Screen testID="tools-screen">
      <Text variant="title" accessibilityRole="header">
        {t('tabs.tools')}
      </Text>
      {error ? <ErrorNotice code={error} /> : null}
      {GROUPS.map((g) => (
        <Row key={g} gap={3} wrap>
          <SectionHeader title={t(`toolGroups.${g}`)} />
          <Row gap={3} wrap style={{ width: '100%' }}>
            {TOOLS.filter((x) => x.group === g).map((tool) => (
              <ToolTile key={tool.id} icon={tool.icon} title={t(`tools.${tool.id}.title`)} subtitle={t(`tools.${tool.id}.short`)} premium={tool.premium} onPress={() => void open(tool.id)} testID={`tool-${tool.id}`} />
            ))}
          </Row>
        </Row>
      ))}
      <AdBanner />
    </Screen>
  );
}
