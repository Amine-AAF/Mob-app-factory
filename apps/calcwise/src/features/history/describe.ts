import type { TFunction } from 'i18next';

import type { Formatters } from '@/hooks/useFormat';
import type { HistoryEntry, HistoryLine } from '@/types';
import { Dec } from '@/utils/decimal';
import { displayExpression } from '@/utils/numberFormat';

/**
 * Turns a stored history entry into localized text at display time, so entries
 * follow the current language and number format (they're stored canonically).
 */
export function describeEntry(entry: HistoryEntry, t: TFunction, f: Formatters): { title: string; detail: string; result: string; copyText: string } {
  const title = t(`tools.${entry.tool}.name`);
  if (!entry.payload) {
    const result = safeNumber(entry.result, f);
    return { title, detail: displayExpression(entry.expression, f.locale), result, copyText: result };
  }
  const currency = entry.payload.currency ?? f.currency;
  const fmtLine = (l: HistoryLine) => {
    const suffix = l.suffix ? (l.suffix.includes('.') ? ` ${t(l.suffix)}` : ` ${l.suffix}`) : '';
    const value = l.kind === 'number' && l.suffix ? f.line({ ...l, suffix: undefined }, currency) : f.line(l, currency);
    return `${t(l.label)}: ${value}${suffix}`;
  };
  const mode = entry.payload.mode ? `${t(entry.payload.mode)} · ` : '';
  const detail = mode + entry.payload.inputs.map(fmtLine).join(' · ');
  const main = entry.payload.outputs[0];
  const result = entry.payload.outputs.map(fmtLine).join('\n');
  const copyText = main ? f.line(main, currency) : '';
  return { title, detail, result, copyText };
}

function safeNumber(raw: string, f: Formatters): string {
  try {
    return f.number(new Dec(raw));
  } catch {
    return raw;
  }
}

/** A stored result that can be sent back to the calculator (plain decimal). */
export function reusableValue(entry: HistoryEntry): string | null {
  if (entry.payload) {
    const main = entry.payload.outputs[0];
    return main && main.kind !== 'text' ? main.value : null;
  }
  return /^-?\d+(\.\d+)?(E[+-]?\d+)?$/.test(entry.result) ? entry.result : null;
}
