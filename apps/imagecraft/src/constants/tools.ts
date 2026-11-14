import type { IconName } from '@factory/design-system';

/**
 * Tool catalogue shown on Home and in the Tools tab. Routes are typed by Expo Router.
 * `editorPanel` tools open the editor directly on one panel.
 */
export type ToolId = 'edit' | 'crop' | 'resize' | 'compress' | 'convert' | 'filters' | 'text' | 'watermark' | 'social' | 'collage' | 'batch';

export interface ToolDef {
  id: ToolId;
  icon: IconName;
  route: '/tools/resize' | '/tools/compress' | '/tools/convert' | '/tools/social' | '/tools/collage' | '/tools/batch' | '/(tabs)/edit';
  editorPanel?: 'crop' | 'adjust' | 'filters' | 'text' | 'watermark';
  group: 'essentials' | 'creative' | 'productivity';
  premium?: boolean;
}

export const TOOLS: readonly ToolDef[] = [
  { id: 'edit', icon: 'brush-outline', route: '/(tabs)/edit', group: 'essentials' },
  { id: 'crop', icon: 'crop-outline', route: '/(tabs)/edit', editorPanel: 'crop', group: 'essentials' },
  { id: 'resize', icon: 'resize-outline', route: '/tools/resize', group: 'essentials' },
  { id: 'compress', icon: 'contract-outline', route: '/tools/compress', group: 'essentials' },
  { id: 'convert', icon: 'swap-horizontal-outline', route: '/tools/convert', group: 'essentials' },
  { id: 'filters', icon: 'color-filter-outline', route: '/(tabs)/edit', editorPanel: 'filters', group: 'creative' },
  { id: 'text', icon: 'text-outline', route: '/(tabs)/edit', editorPanel: 'text', group: 'creative' },
  { id: 'watermark', icon: 'water-outline', route: '/(tabs)/edit', editorPanel: 'watermark', group: 'creative', premium: true },
  { id: 'social', icon: 'share-social-outline', route: '/tools/social', group: 'creative' },
  { id: 'collage', icon: 'grid-outline', route: '/tools/collage', group: 'creative' },
  { id: 'batch', icon: 'layers-outline', route: '/tools/batch', group: 'productivity' },
];

export const QUICK_TOOLS: readonly ToolId[] = ['compress', 'resize', 'crop', 'convert'];

export function findTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}

/** Ratios offered by the crop tool (null = free). */
export const CROP_RATIOS: readonly { id: string; value: number | null }[] = [
  { id: 'free', value: null },
  { id: 'original', value: -1 },
  { id: '1:1', value: 1 },
  { id: '4:5', value: 4 / 5 },
  { id: '3:4', value: 3 / 4 },
  { id: '2:3', value: 2 / 3 },
  { id: '9:16', value: 9 / 16 },
  { id: '4:3', value: 4 / 3 },
  { id: '3:2', value: 3 / 2 },
  { id: '16:9', value: 16 / 9 },
];

/** Long-edge presets of the resizer. */
export const RESIZE_PRESETS: readonly { id: string; longEdge: number }[] = [
  { id: 'hd', longEdge: 1280 },
  { id: 'full_hd', longEdge: 1920 },
  { id: 'qhd', longEdge: 2560 },
  { id: 'uhd', longEdge: 3840 },
  { id: 'web', longEdge: 1024 },
  { id: 'thumbnail', longEdge: 320 },
];
