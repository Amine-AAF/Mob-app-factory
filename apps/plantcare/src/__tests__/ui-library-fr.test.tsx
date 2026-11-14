import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import Library from '../../app/(tabs)/library';
import { setupUi, slow } from '@/test-utils/ui';

jest.setTimeout(120_000);

it('library in French finds a plant by its synonym and keeps the scientific name', async () => {
  const { layout } = await setupUi('fr');
  await renderRouter({ _layout: layout, index: Library }, { initialUrl: '/' });
  expect(await screen.findByText('Bibliothèque botanique', undefined, slow)).toBeTruthy();
  fireEvent.changeText(screen.getByTestId('library-search'), 'sansevieria');
  expect(await screen.findByText('Langue de belle-mère', undefined, slow)).toBeTruthy();
  expect(screen.getByText('Dracaena trifasciata')).toBeTruthy();
});
