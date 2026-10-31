import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createClient } from '../../lib/budget/client';
import { API_BASE, portalConfig } from '../../lib/budget/config';
import {
  PortalContext,
  type Async,
  type PortalState,
} from '../../lib/budget/context';
import { resolveScope, type ScopeResult } from '../../lib/budget/scope';

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

/** The settled state of `promise`; "loading" until it settles. */
function useSettled<T>(promise: Promise<T>): Async<T> {
  const [state, setState] = useState<{
    promise: Promise<T>;
    value: Async<T>;
  } | null>(null);
  useEffect(() => {
    let live = true;
    promise.then(
      value => live && setState({ promise, value: { status: 'ready', value } }),
      error =>
        live &&
        setState({ promise, value: { status: 'error', error: toError(error) } })
    );
    return () => {
      live = false;
    };
  }, [promise]);
  return state?.promise === promise ? state.value : { status: 'loading' };
}

/**
 * The districts to show: every district an in-scope DPWH office serves, plus
 * any the config names (a place-only scope, like this one, names its own).
 */
function districtIds(scope: ScopeResult, configured: string[]): string[] {
  const ids = new Set(configured);
  for (const q of scope.queries)
    for (const o of q.officeLens?.offices ?? [])
      for (const d of o.districts) ids.add(d.id);
  return [...ids];
}

/**
 * Loads the section's data once, from the BetterGov.ph Budget API, for the
 * project list, project and about pages that share it.
 */
export default function BudgetPortalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const config = portalConfig;
  const client = useMemo(() => createClient(API_BASE), []);
  const [attempt, setAttempt] = useState(0);

  // One set of requests per attempt; "Try again" makes a new set (failed
  // requests are not cached by the client).
  const loads = useMemo(() => {
    const scope = resolveScope(client, config);
    return {
      attempt,
      overview: client.overview(),
      scope,
      districts: scope.then(s =>
        Promise.all(
          districtIds(s, config.scope.districts ?? []).map(id =>
            client.district(id)
          )
        )
      ),
    };
  }, [client, config, attempt]);

  const overview = useSettled(loads.overview);
  const scope = useSettled(loads.scope);
  const districts = useSettled(loads.districts);

  const value: PortalState = {
    config,
    client,
    overview,
    scope,
    districts,
    retry: () => setAttempt(n => n + 1),
  };
  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}
