import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import EditPlant from '../../app/plant/edit';
import { setupUi, slow } from '@/test-utils/ui';

jest.setTimeout(120_000);

it('creates a plant with a watering schedule from a library sheet', async () => {
  const { repos, layout } = await setupUi();
  await renderRouter({ _layout: layout, 'plant/edit': EditPlant, 'plant/[id]/index': () => <Text>DETAIL</Text> }, { initialUrl: '/plant/edit?speciesId=ocimum-basilicum' });
  expect(await screen.findByText('Pre-filled from the library sheet “Basil”. You can change anything.', undefined, slow)).toBeTruthy();
  fireEvent.press(screen.getByTestId('save-plant'));
  expect(await screen.findByText('DETAIL', undefined, slow)).toBeTruthy();
  const [plant] = await repos.plants.list();
  expect(plant).toMatchObject({ nickname: 'Basil', scientificName: 'Ocimum basilicum', category: 'herb', speciesId: 'ocimum-basilicum' });
  // The species' water need only proposes suggestion chips; the interval stays the editable default.
  expect(await repos.tasks.wateringTask(plant!.id)).toMatchObject({ nextDue: '2026-05-10', intervalDays: 7 });
});
