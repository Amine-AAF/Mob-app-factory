import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import EditPlant from '../../app/plant/edit';
import { setupUi, slow } from '@/test-utils/ui';

jest.setTimeout(120_000);

it('the plant form requires a name and saves nothing without it', async () => {
  const { repos, layout } = await setupUi();
  await renderRouter({ _layout: layout, 'plant/edit': EditPlant }, { initialUrl: '/plant/edit' });
  fireEvent.press(await screen.findByTestId('save-plant', undefined, slow));
  expect(await screen.findByText('This field is required.', undefined, slow)).toBeTruthy();
  expect(await repos.plants.count()).toBe(0);
});
