"use client";

import { useInView, type UseInViewOptions } from "motion/react";
import { useEffect, useRef, useState, RefObject } from "react";

interface UseBfcacheSafeInViewOptions {
  margin?: string;
  once?: boolean;
}

export function useBfcacheSafeInView(
  options: UseBfcacheSafeInViewOptions = {}
): [RefObject<HTMLDivElement | null>, boolean] {
  const { margin = "0px", once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [forcedVisible, setForcedVisible] = useState(false);
  const isInView = useInView(ref, { once, margin: margin as UseInViewOptions["margin"] });

  useEffect(() => {
    // Handle browser back/forward (Next.js soft navigation)
    const handlePopState = () => {
      setForcedVisible(true);
    };

    // Handle bfcache restore (full page navigation)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setForcedVisible(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return [ref, isInView || forcedVisible];
}
