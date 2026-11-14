import { Text } from '@factory/design-system';
import { Image, View } from 'react-native';

import { FONT_FAMILIES, findInvitationTemplate } from '@/content/invitationTemplates';
import type { InvitationDesign } from '@/domain/types';
import type { InvitationView } from '@/reports/html';

/** Native preview of an invitation; mirrors reports/html.ts `invitationHtml` (used for the PDF). */
export function InvitationCard({ design, view, width }: { design: InvitationDesign; view: InvitationView; width: number }) {
  const tpl = findInvitationTemplate(design.templateId);
  const fontFamily = FONT_FAMILIES[design.font].native;
  const scale = width / 360;
  const align = design.layout === 'split' || design.layout === 'minimal' ? 'left' : 'center';
  const color = design.backgroundUri ? '#FFFFFF' : design.foreground;
  const line = (s: string, size: number, extra: object = {}) =>
    s ? (
      <Text style={[{ fontFamily, fontSize: size * scale, lineHeight: size * scale * 1.35, color, textAlign: align, marginVertical: 3 * scale }, extra]} maxFontSizeMultiplier={1.2}>
        {s}
      </Text>
    ) : null;
  return (
    <View
      accessible
      accessibilityLabel={[view.title, view.dateLine, view.timeLine, view.venueLine].filter(Boolean).join(', ')}
      style={{ width, aspectRatio: 0.707, backgroundColor: design.background, borderRadius: 12, overflow: 'hidden', justifyContent: 'center', padding: 26 * scale }}
    >
      {design.backgroundUri ? (
        <>
          <Image source={{ uri: design.backgroundUri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
        </>
      ) : null}
      {design.layout === 'framed' ? <View style={{ position: 'absolute', top: 14 * scale, left: 14 * scale, right: 14 * scale, bottom: 14 * scale, borderWidth: 2, borderColor: design.accent }} /> : null}
      {design.layout === 'banner' ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44 * scale, backgroundColor: design.accent }} /> : null}
      {design.layout === 'split' ? <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 8 * scale, backgroundColor: design.accent }} /> : null}
      <Text style={{ color: design.accent, fontSize: 22 * scale, textAlign: align, letterSpacing: 6 }}>{tpl.ornament}</Text>
      {line(view.hosts, 12, { letterSpacing: 2, textTransform: 'uppercase', opacity: 0.85 })}
      {line(view.title, 30, { color: design.backgroundUri ? '#FFFFFF' : design.accent, fontWeight: '700', marginVertical: 10 * scale })}
      {line(view.message, 13)}
      <View style={{ height: 1, backgroundColor: design.accent, opacity: 0.6, marginVertical: 12 * scale, marginHorizontal: align === 'center' ? '25%' : 0 }} />
      {line(view.dateLine, 15, { fontWeight: '600' })}
      {line(view.timeLine, 13)}
      {line(view.venueLine, 12)}
      {line(view.rsvpLine, 11, { marginTop: 12 * scale, opacity: 0.85 })}
      <Text style={{ color: design.accent, fontSize: 18 * scale, textAlign: align, letterSpacing: 6, marginTop: 6 * scale }}>{tpl.ornament}</Text>
    </View>
  );
}
