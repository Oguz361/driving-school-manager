"use client";

import { useEffect, useState } from "react";

export function useAnimationReset(): number {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Handle browser back/forward (Next.js soft navigation)
    const handlePopState = () => {
      setAnimationKey((prev) => prev + 1);
    };

    // Handle bfcache restore (full page navigation)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setAnimationKey((prev) => prev + 1);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return animationKey;
}
