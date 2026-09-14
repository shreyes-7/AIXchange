import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export function useGsap(animationCallback, dependencies = [], scopeRef = null) {
  const internalRef = useRef(null);
  const targetScope = scopeRef || internalRef;

  useLayoutEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      animationCallback(gsap);
    }, targetScope.current || undefined);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return targetScope;
}

export default useGsap;
