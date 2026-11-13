import type { IconName } from '@factory/design-system';
import type { Href } from 'expo-router';

import type { OperationType } from '@/database/repositories/operationsRepository';

/** Tool catalogue shown on the dashboard (labels are i18n keys: tools.<id>.title / .subtitle). */
export interface ToolDefinition {
  id: 'compress' | 'resize' | 'convert' | 'pdfTools' | 'imageToPdf' | 'pdfToImages';
  group: 'images' | 'pdf';
  icon: IconName;
  href: Href;
  /** Extra search keywords are in i18n: tools.<id>.keywords */
}

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'compress', group: 'images', icon: 'contract-outline', href: '/tools/compress' },
  { id: 'resize', group: 'images', icon: 'resize-outline', href: '/tools/resize' },
  { id: 'convert', group: 'images', icon: 'swap-horizontal-outline', href: '/tools/convert' },
  { id: 'pdfTools', group: 'pdf', icon: 'documents-outline', href: '/tools/pdf' },
  { id: 'imageToPdf', group: 'pdf', icon: 'images-outline', href: '/tools/image-to-pdf' },
  { id: 'pdfToImages', group: 'pdf', icon: 'image-outline', href: '/tools/pdf-to-images' },
];

/** Icon per operation type (history, results). */
export const OPERATION_ICONS: Record<OperationType, IconName> = {
  image_compress: 'contract-outline',
  image_resize: 'resize-outline',
  image_convert: 'swap-horizontal-outline',
  pdf_merge: 'git-merge-outline',
  pdf_split: 'cut-outline',
  pdf_extract: 'copy-outline',
  image_to_pdf: 'images-outline',
  pdf_to_images: 'image-outline',
};

/** Case- and accent-insensitive tool search over the localized title, subtitle and keywords. */
export function normaliseSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesTool(query: string, haystack: string[]): boolean {
  const q = normaliseSearch(query);
  if (!q) return true;
  const text = normaliseSearch(haystack.join(' '));
  return q.split(/\s+/).every((word) => text.includes(word));
}
