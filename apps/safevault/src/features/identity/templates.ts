import type { IdentitySecret, IdentityTemplate } from '@/vault/types';

export type IdentityField = Exclude<keyof IdentitySecret, never>;

/** Fields shown (in order) for each identity template. Labels: `identity.fields.<field>`. */
export const IDENTITY_FIELDS: Record<IdentityTemplate, IdentityField[]> = {
  personal: ['fullName', 'dateOfBirth', 'phone', 'email', 'address', 'extra'],
  passport: ['fullName', 'documentNumber', 'issuingCountry', 'dateOfBirth', 'issueDate', 'expiryDate', 'extra'],
  driving_license: ['fullName', 'documentNumber', 'issuingCountry', 'dateOfBirth', 'issueDate', 'expiryDate', 'extra'],
  address: ['fullName', 'address', 'phone', 'email', 'extra'],
  professional: ['fullName', 'company', 'jobTitle', 'email', 'phone', 'address', 'documentNumber', 'extra'],
};

/** Fields hidden by default (revealed on demand) because they identify the person. */
export const SENSITIVE_IDENTITY_FIELDS: readonly IdentityField[] = ['documentNumber', 'dateOfBirth', 'address'];

export const MULTILINE_IDENTITY_FIELDS: readonly IdentityField[] = ['address', 'extra'];

export const TEMPLATE_ICONS: Record<IdentityTemplate, string> = {
  personal: 'person-circle',
  passport: 'globe',
  driving_license: 'car',
  address: 'home',
  professional: 'id-card',
};
