import { createContext, useContext } from 'react';
import type { Client } from './client';
import type { PortalConfig } from './config';
import type { ScopeResult } from './scope';
import type { DistrictCard, Envelope, Overview } from './types';

export type Async<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; value: T };

export interface PortalState {
  config: PortalConfig;
  client: Client;
  overview: Async<Envelope<Overview>>;
  scope: Async<ScopeResult>;
  districts: Async<Envelope<DistrictCard>[]>;
  retry(): void;
}

export const PortalContext = createContext<PortalState | null>(null);

export function useBudgetPortal(): PortalState {
  const state = useContext(PortalContext);
  if (!state)
    throw new Error('useBudgetPortal() outside <BudgetPortalProvider>');
  return state;
}
