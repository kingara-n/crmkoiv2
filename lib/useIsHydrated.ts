"use client";

import { useEffect, useState } from "react";

/**
 * Zustand persists to localStorage, but Next.js renders the first pass on the
 * server with no localStorage available. To avoid hydration mismatches we
 * wait until after mount before reading the store on pages that depend on it.
 */
export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
