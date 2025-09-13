import { useEffect, useLayoutEffect } from 'react';

// SSR-safe layout effect: uses useEffect on the server to avoid warnings
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
