"use client";

import React, { useRef, useEffect } from "react";
import TopLoadingBar from "react-top-loading-bar";
import { usePathname } from "next/navigation";

export default function TopLoadingBarClient() {
  const loadingBarRef = useRef<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart();
    }
    const timer = setTimeout(() => {
      if (loadingBarRef.current) {
        loadingBarRef.current.complete();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <TopLoadingBar color="#CC322D" ref={loadingBarRef} height={3} shadow={true} />
  );
} 