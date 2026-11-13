import { Card, Screen, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import { AchievementBadge } from '@/components/ui';
import { repos } from '@/database';
import { ACHIEVEMENTS, achievementProgress } from '@/engine';
import { useAsync } from '@/hooks';
import { clock } from '@/services/clock';

/** Achievements with real progress, computed from the player's history. */
export default function Awards() {
  const { t } = useTranslation();
  const today = clock.today();
  const { data } = useAsync(async () => {
    const r = repos();
    const [stats, unlocked] = await Promise.all([r.progress.stats(today), r.progress.unlockedAchievements()]);
    return { stats, unlocked };
  }, [today]);
  const count = data?.unlocked.size ?? 0;

  return (
    <Screen testID="awards">
      <Text variant="title" accessibilityRole="header">
        {t('awards.title')}
      </Text>
      <Text tone="muted">{t('awards.summary', { count, total: ACHIEVEMENTS.length })}</Text>
      <Card>
        {ACHIEVEMENTS.map((a) => (
          <AchievementBadge key={a.id} id={a.id} unlockedAt={data?.unlocked.get(a.id)} progress={data ? achievementProgress(a, data.stats) : 0} />
        ))}
      </Card>
    </Screen>
  );
}
