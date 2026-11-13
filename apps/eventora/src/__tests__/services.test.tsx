import { ThemeProvider } from '@factory/design-system';
import { createTestDatabase } from '@factory/testing';
import { render, screen } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { I18nextProvider } from 'react-i18next';

import { InvitationCard } from '@/components/InvitationCard';
import { brand } from '@/config/brand';
import { initDatabase, setRepositories } from '@/database';
import { GuestRow } from '@/features/GuestManager';
import { initI18n } from '@/i18n';
import { resolveAdUnits, shouldShowBanner } from '@factory/monetization';
import { syncNotifications } from '@/services/notifications';
import { usePreferences } from '@/store/preferences';

const scheduled = (Notifications as unknown as { __scheduled: { identifier: string; content: { title: string; body: string } }[] }).__scheduled;

describe('notification service', () => {
  it('schedules planned reminders with generic, translated texts and replaces stale ones', async () => {
    const db = await createTestDatabase();
    const now = new Date();
    const repos = await initDatabase(db, { now: () => now });
    setRepositories(repos);
    const i18n = await initI18n('en', []);
    const future = new Date(now.getTime() + 40 * 86_400_000).toISOString().slice(0, 10);
    const e = await repos.events.create({
      name: 'Secret surprise', typeId: 'birthday', coverUri: null, description: '', startDate: future, startTime: '19:00', endDate: null, endTime: null,
      timezone: 'Europe/Paris', venue: '', address: '', expectedGuests: 10, budgetMinor: 0, currency: 'EUR', notes: '', status: 'planning', theme: 'birthday', templateId: null,
    });
    await repos.guests.add({ eventId: e.id, groupId: null, firstName: 'Zoe', lastName: 'Private', phone: '0600000000', email: '', category: 'friend', plusOnes: 0, children: 0, isChild: false, dietary: 'vegan', notes: '', rsvpStatus: 'invited', rsvpRespondedAt: null, rsvpNote: '' });
    scheduled.push({ identifier: 'eventora-task-stale', content: { title: 'old', body: 'old' } });
    usePreferences.setState({ notificationsEnabled: true, notificationEventNames: false });

    await syncNotifications(repos, i18n.t);

    const ours = scheduled.filter((n) => n.identifier.startsWith('eventora-'));
    expect(ours.map((n) => n.identifier).sort()).toEqual([`eventora-event-${e.id}`, `eventora-rsvp-${e.id}`]);
    const text = JSON.stringify(ours);
    expect(text).not.toMatch(/Secret|Zoe|Private|vegan|0600000000/);
    expect(ours.find((n) => n.identifier.startsWith('eventora-rsvp'))?.content.body).toBe('1 guest is still awaiting an answer.');

    usePreferences.setState({ notificationsEnabled: false });
    await syncNotifications(repos, i18n.t);
    expect(scheduled.filter((n) => n.identifier.startsWith('eventora-'))).toEqual([]);
    db.close();
  });
});

describe('ads policy', () => {
  it('uses Google test units in development and never on premium or before consent', () => {
    expect(resolveAdUnits({ isDev: true }).banner).toMatch(/^ca-app-pub-3940256099942544\//);
    expect(resolveAdUnits({ isDev: false, production: { banner: 'ca-app-pub-3940256099942544/9214589741' } }).banner).toBeNull();
    expect(shouldShowBanner({ isPremium: true, consentObtained: true, sessionCount: 10, graceSessions: 2, screenAllowsAds: true })).toBe(false);
    expect(shouldShowBanner({ isPremium: false, consentObtained: false, sessionCount: 10, graceSessions: 2, screenAllowsAds: true })).toBe(false);
    expect(shouldShowBanner({ isPremium: false, consentObtained: true, sessionCount: 1, graceSessions: 2, screenAllowsAds: true })).toBe(false);
  });
});

describe('UI components', () => {
  it('renders an invitation preview and a guest row', async () => {
    const i18n = await initI18n('en', []);
    await render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider brand={brand} preference="light">
          <InvitationCard
            width={300}
            design={{ templateId: 'ivory_classic', background: '#FFFFFF', foreground: '#000000', accent: '#B8925A', font: 'serif', layout: 'framed', backgroundUri: null }}
            view={{ title: 'Léa & Sam', hosts: 'With joy', message: 'Join us', dateLine: 'Saturday', timeLine: '15:00', venueLine: 'Quinta', rsvpLine: 'Reply' }}
          />
          <GuestRow
            guest={{ id: 'g', eventId: 'e', groupId: null, firstName: 'Ana', lastName: 'Silva', phone: '', email: '', category: 'family', plusOnes: 1, children: 1, isChild: false, dietary: '', notes: '', rsvpStatus: 'confirmed', rsvpRespondedAt: null, rsvpNote: '', createdAt: '', updatedAt: '' }}
            groupName="Silva"
            onPress={() => undefined}
            onStatus={() => undefined}
          />
        </ThemeProvider>
      </I18nextProvider>,
    );
    expect(screen.getByText('Léa & Sam')).toBeTruthy();
    expect(screen.getByText('Ana Silva')).toBeTruthy();
    expect(screen.getByText('Silva · party of 3')).toBeTruthy();
    expect(screen.getByText('Confirmed')).toBeTruthy();
  });
});
