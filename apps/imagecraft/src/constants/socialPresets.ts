import type { Size } from '@/types/image';

/**
 * Social media export presets.
 *
 * Dimensions follow each platform's published recommendations as reviewed on 2026-11-13
 * (sources listed in docs/social-presets.md). Platforms change them: re-check before each
 * release. Values are data, so updating one never requires touching the rendering code.
 */
export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin' | 'pinterest' | 'whatsapp';

export interface SocialPreset {
  /** Also the i18n key suffix: social.presets.<id> */
  id: string;
  platform: SocialPlatform;
  size: Size;
  /** Human ratio shown in the UI. */
  ratio: string;
  premium: boolean;
  /** cover = fill the frame (overflow cropped), contain = fit with a background colour. */
  defaultFit: 'cover' | 'contain';
}

export const SOCIAL_PRESETS: readonly SocialPreset[] = [
  { id: 'instagram_post', platform: 'instagram', size: { width: 1080, height: 1080 }, ratio: '1:1', premium: false, defaultFit: 'cover' },
  { id: 'instagram_portrait', platform: 'instagram', size: { width: 1080, height: 1350 }, ratio: '4:5', premium: false, defaultFit: 'cover' },
  { id: 'instagram_story', platform: 'instagram', size: { width: 1080, height: 1920 }, ratio: '9:16', premium: false, defaultFit: 'cover' },
  { id: 'instagram_reel_cover', platform: 'instagram', size: { width: 1080, height: 1920 }, ratio: '9:16', premium: true, defaultFit: 'cover' },
  { id: 'tiktok', platform: 'tiktok', size: { width: 1080, height: 1920 }, ratio: '9:16', premium: true, defaultFit: 'cover' },
  { id: 'youtube_thumbnail', platform: 'youtube', size: { width: 1280, height: 720 }, ratio: '16:9', premium: false, defaultFit: 'cover' },
  { id: 'youtube_shorts_cover', platform: 'youtube', size: { width: 1080, height: 1920 }, ratio: '9:16', premium: true, defaultFit: 'cover' },
  { id: 'facebook_post', platform: 'facebook', size: { width: 1200, height: 630 }, ratio: '1.91:1', premium: false, defaultFit: 'cover' },
  { id: 'facebook_cover', platform: 'facebook', size: { width: 1640, height: 624 }, ratio: '2.63:1', premium: true, defaultFit: 'cover' },
  { id: 'linkedin_post', platform: 'linkedin', size: { width: 1200, height: 627 }, ratio: '1.91:1', premium: true, defaultFit: 'cover' },
  { id: 'linkedin_banner', platform: 'linkedin', size: { width: 1584, height: 396 }, ratio: '4:1', premium: true, defaultFit: 'cover' },
  { id: 'pinterest_pin', platform: 'pinterest', size: { width: 1000, height: 1500 }, ratio: '2:3', premium: true, defaultFit: 'cover' },
  { id: 'whatsapp_status', platform: 'whatsapp', size: { width: 1080, height: 1920 }, ratio: '9:16', premium: false, defaultFit: 'contain' },
];

export const PLATFORM_ICONS: Record<SocialPlatform, 'logo-instagram' | 'logo-tiktok' | 'logo-youtube' | 'logo-facebook' | 'logo-linkedin' | 'logo-pinterest' | 'logo-whatsapp'> = {
  instagram: 'logo-instagram',
  tiktok: 'logo-tiktok',
  youtube: 'logo-youtube',
  facebook: 'logo-facebook',
  linkedin: 'logo-linkedin',
  pinterest: 'logo-pinterest',
  whatsapp: 'logo-whatsapp',
};

export function findPreset(id: string): SocialPreset | undefined {
  return SOCIAL_PRESETS.find((p) => p.id === id);
}

/** Bounds for the user-defined custom canvas (Premium). */
export const CUSTOM_CANVAS_LIMITS = { min: 64, max: 4096 } as const;

export const BACKGROUND_SWATCHES = ['#FFFFFF', '#000000', '#F2EFE9', '#1E1B2E', '#FF5C8A', '#5B3DF5', '#22C55E', '#FACC15'] as const;
