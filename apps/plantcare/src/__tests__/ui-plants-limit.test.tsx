import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import Plants from '../../app/(tabs)/plants';
import { FREE_PLANT_LIMIT } from '@/domain/limits';
import { basePlant, setupUi, slow } from '@/test-utils/ui';

jest.setTimeout(120_000);

it('My Plants shows the free counter and sends to the paywall beyond the free limit', async () => {
  const { repos, layout } = await setupUi();
  for (let i = 0; i < FREE_PLANT_LIMIT; i++) await repos.plants.create({ ...basePlant, nickname: `Plant ${i}` });
  await renderRouter({ _layout: layout, index: Plants, paywall: () => <Text>PAYWALL</Text>, 'plant/edit': () => <Text>EDIT</Text> }, { initialUrl: '/' });
  expect(await screen.findByText(`${FREE_PLANT_LIMIT} of ${FREE_PLANT_LIMIT} plants in the free version`, undefined, slow)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Add a plant'));
  expect(await screen.findByText('PAYWALL', undefined, slow)).toBeTruthy();
});
