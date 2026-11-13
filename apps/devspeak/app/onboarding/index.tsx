import { Button, CodeLabel, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SLIDES: { key: string; icon: IconName; code: string }[] = [
  { key: 'slide1', icon: 'code-slash', code: 'standup.say("Yesterday I fixed the login bug.")' },
  { key: 'slide2', icon: 'chatbubbles', code: 'review.explain("This change reduces latency.")' },
  { key: 'slide3', icon: 'cloud-offline', code: 'app.offline = true // no account needed' },
];

export default function Welcome() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const list = useRef<FlatList>(null);
  const last = page === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  const next = () => (last ? router.push('/onboarding/profile') : list.current?.scrollToIndex({ index: page + 1, animated: true }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
        <Row gap={2}>
          <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="mono" style={{ color: '#fff', fontWeight: '800' }}>
              {'</>'}
            </Text>
          </View>
          <Text variant="heading">DevSpeak</Text>
        </Row>
        {!last ? <Button label={t('common.skip')} variant="ghost" size="md" onPress={() => router.push('/onboarding/profile')} /> : null}
      </Row>

      <FlatList
        ref={list}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(s) => s.key}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: 28, justifyContent: 'center', gap: 28 }}>
            <View style={{ alignSelf: 'center', width: 132, height: 132, borderRadius: 40, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={item.icon} size={60} color={theme.colors.primary} />
            </View>
            <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 14, padding: 14 }}>
              <Text variant="mono" tone="accent" numberOfLines={2}>
                {item.code}
              </Text>
            </View>
            <Stack gap={3}>
              <Text variant="display">{t(`onboarding.${item.key}Title`)}</Text>
              <Text tone="muted">{t(`onboarding.${item.key}Body`)}</Text>
            </Stack>
          </View>
        )}
      />

      <Stack gap={5} style={{ padding: 20 }}>
        <Row gap={2} style={{ justifyContent: 'center' }} accessibilityLabel={t('onboarding.stepOf', { current: page + 1, total: SLIDES.length })}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={{ height: 8, width: i === page ? 24 : 8, borderRadius: 4, backgroundColor: i === page ? theme.colors.primary : theme.colors.border }} />
          ))}
        </Row>
        <Button label={last ? t('onboarding.getStarted') : t('common.next')} onPress={next} testID="onboarding-next" />
        <View style={{ alignItems: 'center' }}>
          <CodeLabel tone="subtle">Learn English. Speak Tech. Grow Your Career.</CodeLabel>
        </View>
      </Stack>
    </SafeAreaView>
  );
}
