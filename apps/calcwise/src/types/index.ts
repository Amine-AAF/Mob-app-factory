import type { ToolId } from '@/constants/tools';

/** How a stored canonical value is displayed (re-localized at read time). */
export type ValueKind = 'number' | 'money' | 'percent' | 'text' | 'integer';

export interface HistoryLine {
  /** i18n key of the label, e.g. "loan.principal". */
  label: string;
  /** Canonical value: a decimal string ("1234.5") or raw text for kind "text". */
  value: string;
  kind: ValueKind;
  /** Optional i18n key or unit symbol appended to the value. */
  suffix?: string;
}

export interface HistoryPayload {
  /** i18n key of a sub-mode ("percentage.modes.of"). */
  mode?: string;
  currency?: string;
  inputs: HistoryLine[];
  outputs: HistoryLine[];
}

export interface HistoryEntry {
  id: number;
  tool: ToolId;
  expression: string;
  result: string;
  payload: HistoryPayload | null;
  createdAt: string;
}
