'use client';

import type { ReactNode } from 'react';
import { StoreContext, buildStore } from './store';

/**
 * Wrap the app with this once (in layout.tsx) so that the Supabase
 * real-time subscription is created exactly once, no matter how many
 * components call useStore().
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const store = buildStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
