import type { DayKey, MonthKey } from '@/utils/dates';

/** All amounts are integer minor units of `currency` (see utils/money.ts). */
export type Minor = number;

export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card' | 'wallet' | 'custom';
export const ACCOUNT_TYPES: readonly AccountType[] = ['cash', 'bank', 'savings', 'credit_card', 'wallet', 'custom'];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: Minor;
  color: string;
  icon: string;
  archived: boolean;
  sortOrder: number;
  createdAt: string;
}

export type CategoryKind = 'expense' | 'income';

export interface Category {
  id: string;
  kind: CategoryKind;
  /** Translation key for built-in categories (null for user categories). */
  systemKey: string | null;
  /** User-provided name; overrides the translated system name when set. */
  name: string | null;
  icon: string;
  color: string;
  archived: boolean;
  sortOrder: number;
}

/**
 * - expense / income: affect statistics and the account balance.
 * - refund: money back for an expense; reduces spending of its category, increases the balance.
 * - transfer: between two of the user's accounts; NEVER counted as income or expense.
 * - adjustment: signed balance correction; NEVER counted as income or expense.
 */
export type TransactionType = 'expense' | 'income' | 'transfer' | 'refund' | 'adjustment';
export const TRANSACTION_TYPES: readonly TransactionType[] = ['expense', 'income', 'transfer', 'refund', 'adjustment'];

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile' | 'check' | 'other';
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['cash', 'card', 'bank_transfer', 'mobile', 'check', 'other'];

export interface Transaction {
  id: string;
  type: TransactionType;
  /** > 0 for every type except adjustment, which is signed and non-zero. */
  amount: Minor;
  /** Always equals the source account currency. */
  currency: string;
  accountId: string;
  /** Transfer destination. */
  toAccountId: string | null;
  /** Amount credited to the destination (in its currency). Equals `amount` for same-currency transfers. */
  toAmount: Minor | null;
  categoryId: string | null;
  date: DayKey;
  time: string | null;
  description: string;
  notes: string;
  paymentMethod: PaymentMethod | null;
  recurringRuleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'currency' | 'recurringRuleId'> & {
  recurringRuleId?: string | null;
};

export interface Budget {
  id: string;
  month: MonthKey;
  currency: string;
  /** Global monthly limit; null = sum of the category limits. */
  totalLimit: Minor | null;
  createdAt: string;
}

export interface BudgetCategoryLimit {
  budgetId: string;
  categoryId: string;
  limit: Minor;
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export const FREQUENCIES: readonly Frequency[] = ['daily', 'weekly', 'monthly', 'yearly', 'custom'];

export interface Schedule {
  frequency: Frequency;
  /** Every N periods; for `custom` this is a number of days. */
  interval: number;
  startDate: DayKey;
  endDate: DayKey | null;
}

export interface RecurringRule extends Schedule {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  amount: Minor;
  currency: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  description: string;
  /** true: due occurrences are recorded automatically; false: they wait for the user's confirmation. */
  autoPost: boolean;
  active: boolean;
  createdAt: string;
}

export type SubscriptionKind = 'streaming' | 'software' | 'cloud' | 'mobile' | 'internet' | 'gym' | 'other';
export const SUBSCRIPTION_KINDS: readonly SubscriptionKind[] = ['streaming', 'software', 'cloud', 'mobile', 'internet', 'gym', 'other'];

export interface Subscription extends Schedule {
  id: string;
  name: string;
  kind: SubscriptionKind;
  price: Minor;
  currency: string;
  categoryId: string | null;
  /** Days before the billing date to remind; null = no reminder. */
  reminderDays: number | null;
  active: boolean;
  notes: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: Minor;
  currency: string;
  targetDate: DayKey | null;
  description: string;
  color: string;
  icon: string;
  archived: boolean;
  createdAt: string;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  /** Positive = contribution, negative = withdrawal. Tracking only: never an expense. */
  amount: Minor;
  date: DayKey;
  note: string;
  createdAt: string;
}

export interface ExchangeRate {
  /** Currency converted FROM. */
  currency: string;
  /** Units of the main currency for ONE unit of `currency`, as an exact decimal string. */
  rate: string;
  source: 'manual';
  updatedAt: string;
}
