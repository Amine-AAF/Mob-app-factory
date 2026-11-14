import { ThemeProvider, Text } from '@factory/design-system';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { DocumentsGate } from '@/components/DocumentsGate';
import { PlaceCard } from '@/components/PlaceCard';
import { TravelDocumentCard } from '@/components/TravelDocumentCard';
import { brand } from '@/config/brand';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import type { Place, TravelDocument } from '@/types/models';

let i18n: I18n;
async function wrap(node: ReactNode, scheme: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider brand={brand} preference={scheme}>
      <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
    </ThemeProvider>,
  );
}

const doc: TravelDocument = {
  id: 'd1',
  tripId: 't1',
  title: 'Rail pass',
  type: 'train_ticket',
  fileUri: 'file:///x.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 2_400_000,
  expiresOn: '2026-06-10',
  notes: '',
  createdAt: '2026-06-01T10:00:00.000Z',
};

const place: Place = {
  id: 'p1',
  tripId: null,
  dayId: null,
  name: 'Ramen bar',
  address: '2-1 Street',
  city: 'Tokyo',
  countryCode: 'JP',
  category: 'restaurant',
  notes: '',
  url: null,
  latitude: null,
  longitude: null,
  photoUri: null,
  isFavorite: false,
  createdAt: '',
};

beforeAll(async () => {
  i18n = await initI18n('en', []);
  (await wrap(<TravelDocumentCard doc={doc} today="2026-06-01" onPress={() => undefined} />)).unmount();
}, 180_000);

describe('TravelDocumentCard', () => {
  it.each(['light', 'dark'] as const)('shows type, size, offline badge and expiry warning (%s)', async (scheme) => {
    await wrap(<TravelDocumentCard doc={doc} today="2026-06-01" tripName="Japan" onPress={() => undefined} />, scheme);
    expect(screen.getByText('Rail pass')).toBeTruthy();
    expect(screen.getByText(/Train ticket · PDF · 2\.3 MB · Japan/)).toBeTruthy();
    expect(screen.getByText('Expires Jun 10, 2026')).toBeTruthy();
    expect(screen.getByText('Offline')).toBeTruthy();
  });

  it('marks expired documents', async () => {
    await wrap(<TravelDocumentCard doc={doc} today="2026-07-01" onPress={() => undefined} />);
    expect(screen.getByText('Expired Jun 10, 2026')).toBeTruthy();
  });
});

describe('PlaceCard', () => {
  it('shows the place and toggles favourite', async () => {
    const onFav = jest.fn();
    const onMap = jest.fn();
    await wrap(<PlaceCard place={place} onPress={() => undefined} onToggleFavorite={onFav} onOpenMap={onMap} />);
    expect(screen.getByText('2-1 Street, Tokyo, JP')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Favourite'));
    expect(onFav).toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Open in maps'));
    expect(onMap).toHaveBeenCalled();
  });
});

describe('DocumentsGate', () => {
  const auth = jest.requireMock('expo-local-authentication') as { authenticateAsync: jest.Mock };
  afterEach(() => {
    usePreferences.setState({ documentsLock: false });
    useSession.setState({ documentsUnlockedAt: null });
  });

  it('shows documents directly when the lock is off', async () => {
    await wrap(
      <DocumentsGate>
        <Text>secret list</Text>
      </DocumentsGate>,
    );
    expect(screen.getByText('secret list')).toBeTruthy();
    expect(auth.authenticateAsync).not.toHaveBeenCalled();
  });

  it('hides documents until the phone confirms the owner', async () => {
    usePreferences.setState({ documentsLock: true });
    auth.authenticateAsync.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true });
    await wrap(
      <DocumentsGate>
        <Text>secret list</Text>
      </DocumentsGate>,
    );
    expect(await screen.findByText('Not unlocked. Try again.')).toBeTruthy();
    expect(screen.queryByText('secret list')).toBeNull();
    await fireEvent.press(screen.getByTestId('documents-unlock'));
    await waitFor(() => expect(screen.getByText('secret list')).toBeTruthy());
    expect(useSession.getState().documentsUnlockedAt).not.toBeNull();
  });
});
