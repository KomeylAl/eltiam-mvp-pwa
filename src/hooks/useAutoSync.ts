"use client";

import { syncWithServer } from "@/lib/dbActions";
import { useEffect } from "react";

export function useAutoSync() {
  useEffect(() => {
    const run = () => {
      void syncWithServer({ silent: true });
    };

    if (navigator.onLine) {
      run();
    }

    window.addEventListener("online", run);

    const onVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        run();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("online", run);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}
