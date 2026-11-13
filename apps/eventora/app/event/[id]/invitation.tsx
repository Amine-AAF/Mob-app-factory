import { Badge, Button, Card, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { ChoiceChips, TextField, ToggleRow } from '@/components/forms';
import { InvitationCard } from '@/components/InvitationCard';
import { limitAlert, Notice, ScreenTitle } from '@/components/ui';
import { INVITATION_PALETTE, INVITATION_TEMPLATES, findInvitationTemplate } from '@/content/invitationTemplates';
import type { EventSnapshot } from '@/database';
import type { EventRecord, Invitation, InvitationDesign, InvitationFont, InvitationLayout } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { invitationHtml, invitationText, type InvitationView } from '@/reports/html';
import { track } from '@/services/analytics';
import { deleteOwnedFile, imageDataUri } from '@/services/files';
import { copyText, pickImage, sharePdf, shareText } from '@/services/sharing';
import { useIsPremium } from '@/store/session';

type Draft = Omit<Invitation, 'id' | 'eventId' | 'createdAt' | 'updatedAt'> & { id?: string };

function designFrom(templateId: string): InvitationDesign {
  const tpl = findInvitationTemplate(templateId);
  return { templateId: tpl.id, background: tpl.background, foreground: tpl.foreground, accent: tpl.accent, font: tpl.font, layout: tpl.layout, backgroundUri: null };
}

export function buildView(e: EventRecord, d: Pick<Draft, 'title' | 'hosts' | 'message' | 'showDate' | 'showTime' | 'showVenue' | 'rsvpLine'>): InvitationView {
  return {
    title: d.title || e.name,
    hosts: d.hosts,
    message: d.message,
    dateLine: d.showDate ? fmt.day(e.startDate, 'full') : '',
    timeLine: d.showTime && e.startTime ? fmt.time(e.startTime) : '',
    venueLine: d.showVenue ? [e.venue, e.address].filter(Boolean).join('\n') : '',
    rsvpLine: d.rsvpLine,
  };
}

/**
 * Invitation editor. Sharing always goes through the Android share sheet:
 * the user chooses WhatsApp, e-mail… and sends it themself. Eventora does not
 * send invitations or collect replies automatically.
 */
export default function InvitationEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  // The editor mounts once the event is loaded, so its draft is initialised from the saved invitation.
  return snap ? <Editor snap={snap} /> : null;
}

function Editor({ snap }: { snap: EventSnapshot }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { width } = useWindowDimensions();
  const [busy, setBusy] = useState(false);

  const themeTemplates = useMemo(
    () => [...INVITATION_TEMPLATES].sort((a, b) => Number(b.themes.includes(snap.event.theme)) - Number(a.themes.includes(snap.event.theme))),
    [snap.event.theme],
  );

  const [draft, setDraft] = useState<Draft>(() => {
    const existing = snap.invitations[0];
    if (existing) {
      const { eventId: _e, createdAt: _c, updatedAt: _u, ...rest } = existing;
      return rest;
    }
    const first = themeTemplates.find((x) => !x.premium) ?? themeTemplates[0]!;
    return { design: designFrom(first.id), title: snap.event.name, hosts: '', message: t('invitation.defaultMessage'), showDate: true, showTime: true, showVenue: true, rsvpLine: t('invitation.defaultRsvp') };
  });

  const e = snap.event;
  const view = buildView(e, draft);
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const patchDesign = (p: Partial<InvitationDesign>) => setDraft((d) => ({ ...d, design: { ...d.design, ...p } }));
  const tpl = findInvitationTemplate(draft.design.templateId);
  const locked = tpl.premium && !isPremium;

  const save = async () => {
    const savedId = await mutate((r) => r.invitations.save({ ...draft, eventId: e.id }));
    patch({ id: savedId });
    return savedId;
  };

  const guardPremium = () => {
    if (locked) {
      limitAlert(t, 'premiumInvitations', 0, 'invitation_template');
      return false;
    }
    return true;
  };

  const sharePdfCard = async () => {
    if (!guardPremium()) return;
    setBusy(true);
    try {
      await save();
      const bg = await imageDataUri(draft.design.backgroundUri);
      const outcome = await sharePdf(invitationHtml(draft, view, bg), `invitation-${e.name}`, t('invitation.shareTitle'), { width: 420, height: 595 });
      if (outcome === 'shared') track('invitation_shared', { template: tpl.id, format: 'pdf' });
      else Alert.alert(t('share.failed'));
    } finally {
      setBusy(false);
    }
  };

  const shareAsText = async () => {
    await save();
    const outcome = await shareText(invitationText(view), view.title);
    if (outcome === 'shared') track('invitation_shared', { template: tpl.id, format: 'text' });
  };

  const chooseBackground = async () => {
    const uri = await pickImage('invitations', [5, 7]);
    if (uri) {
      deleteOwnedFile(draft.design.backgroundUri);
      patchDesign({ backgroundUri: uri });
    }
  };

  const swatches = (label: string, key: 'background' | 'foreground' | 'accent') => (
    <Stack gap={1}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Row gap={2}>
          {INVITATION_PALETTE.map((c) => (
            <Pressable
              key={c}
              onPress={() => patchDesign({ [key]: c })}
              accessibilityRole="radio"
              accessibilityLabel={`${label} ${c}`}
              accessibilityState={{ selected: draft.design[key] === c }}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c, borderWidth: draft.design[key] === c ? 3 : 1, borderColor: draft.design[key] === c ? theme.colors.primary : theme.colors.border }}
            />
          ))}
        </Row>
      </ScrollView>
    </Stack>
  );

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          <Stack style={{ flex: 1 }}>
            <Button variant="secondary" icon="chatbubble-ellipses-outline" label={t('invitation.shareText')} onPress={() => void shareAsText()} />
          </Stack>
          <Stack style={{ flex: 1 }}>
            <Button icon="share-social-outline" label={t('invitation.sharePdf')} onPress={() => void sharePdfCard()} loading={busy} testID="invitation-share" />
          </Stack>
        </Row>
      }
    >
      <ScreenTitle title={t('modules.invitations')} />
      <View style={{ alignItems: 'center' }}>
        <InvitationCard design={draft.design} view={view} width={Math.min(width - 40, 380)} />
      </View>
      {locked ? (
        <Notice icon="diamond" tone="warning" title={t('invitation.premiumTemplate')}>
          {t('invitation.premiumTemplateBody')}
        </Notice>
      ) : null}

      <SectionHeader title={t('invitation.templates', { count: INVITATION_TEMPLATES.length })} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Row gap={2}>
          {themeTemplates.map((x) => (
            <Pressable
              key={x.id}
              onPress={() => patchDesign({ ...designFrom(x.id), backgroundUri: draft.design.backgroundUri })}
              accessibilityRole="radio"
              accessibilityState={{ selected: x.id === draft.design.templateId }}
              accessibilityLabel={t(`invitationTemplates.${x.id}`)}
              style={{ width: 92, gap: 4 }}
            >
              <View style={{ height: 120, borderRadius: 10, backgroundColor: x.background, borderWidth: x.id === draft.design.templateId ? 3 : 1, borderColor: x.id === draft.design.templateId ? theme.colors.primary : theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: x.accent, fontSize: 22 }}>{x.ornament}</Text>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: x.foreground, marginTop: 6, opacity: 0.7 }} />
                {x.premium ? (
                  <View style={{ position: 'absolute', top: 6, right: 6 }}>
                    <Icon name="diamond" size={14} color={theme.colors.accent} />
                  </View>
                ) : null}
              </View>
              <Text variant="caption" numberOfLines={1}>
                {t(`invitationTemplates.${x.id}`)}
              </Text>
            </Pressable>
          ))}
        </Row>
      </ScrollView>

      <SectionHeader title={t('invitation.text')} />
      <TextField label={t('invitation.title')} value={draft.title} onChangeText={(title) => patch({ title })} maxLength={80} />
      <TextField label={t('invitation.hosts')} value={draft.hosts} onChangeText={(hosts) => patch({ hosts })} placeholder={t('invitation.hostsPlaceholder')} maxLength={80} />
      <TextField label={t('invitation.message')} value={draft.message} onChangeText={(message) => patch({ message })} multiline maxLength={400} />
      <TextField label={t('invitation.rsvpLine')} value={draft.rsvpLine} onChangeText={(rsvpLine) => patch({ rsvpLine })} maxLength={120} />
      <Card>
        <ToggleRow label={t('invitation.showDate')} value={draft.showDate} onChange={(showDate) => patch({ showDate })} />
        <ToggleRow label={t('invitation.showTime')} value={draft.showTime} onChange={(showTime) => patch({ showTime })} />
        <ToggleRow label={t('invitation.showVenue')} value={draft.showVenue} onChange={(showVenue) => patch({ showVenue })} />
      </Card>

      <SectionHeader title={t('invitation.style')} />
      <ChoiceChips<InvitationFont> label={t('invitation.font')} value={draft.design.font} onChange={(font) => patchDesign({ font })} options={(['serif', 'sans', 'script', 'condensed', 'mono'] as const).map((f) => ({ value: f, label: t(`invitation.fonts.${f}`) }))} />
      <ChoiceChips<InvitationLayout> label={t('invitation.layout')} value={draft.design.layout} onChange={(layout) => patchDesign({ layout })} options={(['centered', 'framed', 'banner', 'minimal', 'split'] as const).map((l) => ({ value: l, label: t(`invitation.layouts.${l}`) }))} />
      {swatches(t('invitation.background'), 'background')}
      {swatches(t('invitation.foreground'), 'foreground')}
      {swatches(t('invitation.accent'), 'accent')}
      <Row gap={2} wrap>
        <Button size="md" variant="secondary" icon="image-outline" label={draft.design.backgroundUri ? t('invitation.changeImage') : t('invitation.addImage')} onPress={() => void chooseBackground()} />
        {draft.design.backgroundUri ? <Button size="md" variant="ghost" label={t('invitation.removeImage')} onPress={() => patchDesign({ backgroundUri: null })} /> : null}
      </Row>

      <Row gap={2} wrap>
        <Button size="md" variant="secondary" icon="save-outline" label={t('common.save')} onPress={() => void save().then(() => Alert.alert(t('common.saved')))} />
        <Button size="md" variant="ghost" icon="copy-outline" label={t('invitation.copyText')} onPress={() => void copyText(invitationText(view)).then(() => Alert.alert(t('invitation.copied')))} />
      </Row>
      <Badge label={t('invitation.imageExportNote')} tone="neutral" icon="information-circle" />
      <Notice icon="hand-left-outline">{t('invitation.manualSendNote')}</Notice>
    </Screen>
  );
}
