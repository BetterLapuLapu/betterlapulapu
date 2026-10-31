import type { BridgeGroup } from './types';

/** The dot beside each status, in the design system's colours. */
export const GROUP_DOT: Record<BridgeGroup, string> = {
  house_only: 'bg-primary-600',
  nep_only: 'bg-white ring-2 ring-inset ring-ink-secondary',
  unchanged: 'bg-rule',
  increased: 'bg-go',
  decreased: 'bg-alert',
  scope_review: 'bg-accent-500',
};

/** The bar across the top of each status tile, in the same colours. */
export const GROUP_BAR: Record<BridgeGroup, string> = {
  house_only: 'border-t-primary-600',
  nep_only: 'border-t-ink-secondary',
  unchanged: 'border-t-rule',
  increased: 'border-t-go',
  decreased: 'border-t-alert',
  scope_review: 'border-t-accent-500',
};
