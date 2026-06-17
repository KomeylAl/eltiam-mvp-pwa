"use client";

import {
  checkAndNotifyActiveSlots,
  isRemindersEnabled,
  syncScheduleToServiceWorker,
} from "@/lib/notifications";
import { useEffect, useState } from "react";

const CHECK_INTERVAL_MS = 60_000;

export function useFormReminders() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isRemindersEnabled());

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setEnabled(typeof detail === "boolean" ? detail : isRemindersEnabled());
    };

    window.addEventListener("reminders-changed", onChange);
    return () => window.removeEventListener("reminders-changed", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const run = async () => {
      try {
        await checkAndNotifyActiveSlots();
        await syncScheduleToServiceWorker();
      } catch (err) {
        console.error("[reminders]", err);
      }
    };

    run();

    const interval = setInterval(run, CHECK_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}
