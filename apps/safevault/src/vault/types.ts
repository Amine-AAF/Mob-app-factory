/**
 * Vault item model.
 *
 * Every item is stored as two independent ciphertexts:
 *  - `meta`   : what lists, search and the dashboard need (title, username, URL, tags,
 *               category, favourite, masked card digits…). Decrypted at unlock.
 *  - `secret` : passwords, note bodies, card numbers, identity documents, history.
 *               Decrypted on demand only, for the item being viewed/edited/copied.
 *
 * Only `id`, `type` and the created/updated timestamps are stored in clear (see SECURITY.md §5).
 */
export const ENTRY_TYPES = ['login', 'note', 'card', 'identity'] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export interface BaseMeta {
  title: string;
  categoryId: string;
  favorite: boolean;
  tags: string[];
  /** epoch ms, null if never opened. Encrypted with the rest of the meta. */
  lastViewedAt: number | null;
}

export interface LoginMeta extends BaseMeta {
  url: string;
  username: string;
  email: string;
}

export interface NoteMeta extends BaseMeta {
  /** 'plain' or 'markdown-lite' (bold, bullet lists, headings). */
  format: 'plain' | 'simple';
}

export interface CardMeta extends BaseMeta {
  cardholder: string;
  brand: CardBrand;
  /** Last four digits only. */
  last4: string;
  /** "MM/YY" */
  expiry: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'maestro' | 'other';

export const IDENTITY_TEMPLATES = ['personal', 'passport', 'driving_license', 'address', 'professional'] as const;
export type IdentityTemplate = (typeof IDENTITY_TEMPLATES)[number];

export interface IdentityMeta extends BaseMeta {
  template: IdentityTemplate;
}

export interface PasswordHistoryEntry {
  password: string;
  /** When this password stopped being the current one (epoch ms). */
  replacedAt: number;
}

export interface LoginSecret {
  password: string;
  description: string;
  notes: string;
  /** epoch ms of the last password change (audit "old password" check). */
  passwordUpdatedAt: number;
  history: PasswordHistoryEntry[];
}

export interface NoteSecret {
  body: string;
}

export interface CardSecret {
  number: string;
  notes: string;
}

export interface IdentitySecret {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  documentNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  dateOfBirth: string;
  company: string;
  jobTitle: string;
  extra: string;
}

export interface MetaByType {
  login: LoginMeta;
  note: NoteMeta;
  card: CardMeta;
  identity: IdentityMeta;
}

export interface SecretByType {
  login: LoginSecret;
  note: NoteSecret;
  card: CardSecret;
  identity: IdentitySecret;
}

export type AnyMeta = MetaByType[EntryType];
export type AnySecret = SecretByType[EntryType];

/** Decrypted summary held in memory while the vault is unlocked. No secrets. */
export type VaultItem = {
  [K in EntryType]: { id: string; type: K; createdAt: number; updatedAt: number; meta: MetaByType[K] };
}[EntryType];

export type VaultItemOf<K extends EntryType> = Extract<VaultItem, { type: K }>;

export interface ItemInput<K extends EntryType = EntryType> {
  id?: string;
  type: K;
  meta: MetaByType[K];
  secret: SecretByType[K];
}

export interface Category {
  id: string;
  /** Key of a built-in category ("work"), or null for user-created ones. */
  builtin: string | null;
  /** User-chosen name; empty for an untouched built-in (the UI translates the builtin key). */
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
}

export const DEFAULT_CATEGORY_ID = 'cat_other';
