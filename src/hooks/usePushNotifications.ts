"use client";

import { useCallback, useEffect, useState } from "react";
import { onMessage, type MessagePayload } from "firebase/messaging";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import {
  dismissPrompt,
  isPromptDismissed,
  setRegisteredDevice,
  shouldSkipRegistration,
} from "@/lib/firebase/device-storage";
import {
  getFirebaseMessaging,
  isMessagingSupported,
  obtainFcmToken,
} from "@/lib/firebase/messaging";
import { registerDevice } from "@/services/pulse.service";

export type PushNotificationState = {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  isRegistering: boolean;
  shouldShowPrompt: boolean;
  acceptPrompt: () => Promise<void>;
  dismissPrompt: () => void;
};

export function usePushNotifications(): PushNotificationState {
  const { user, isLoading } = useUser();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [isRegistering, setIsRegistering] = useState(false);
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  const syncPermission = useCallback(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }

    setPermission(Notification.permission);
    return Notification.permission;
  }, []);

  const registerDeviceIfNeeded = useCallback(async () => {
    if (!user) return;

    const currentPermission = syncPermission();
    if (currentPermission !== "granted") return;

    setIsRegistering(true);
    try {
      const token = await obtainFcmToken();
      if (!token) return;

      if (shouldSkipRegistration(user.id, token)) return;

      await registerDevice(token);
      setRegisteredDevice(user.id, token);
    } catch (error) {
      console.error("[Push] Device registration failed:", error);
    } finally {
      setIsRegistering(false);
    }
  }, [syncPermission, user]);

  const evaluatePrompt = useCallback(async () => {
    if (!user || isLoading) return;

    const supported = await isMessagingSupported();
    setIsSupported(supported);
    if (!supported) return;

    const currentPermission = syncPermission();

    if (currentPermission === "granted") {
      await registerDeviceIfNeeded();
      return;
    }

    if (currentPermission === "denied") return;
    if (isPromptDismissed()) return;

    setShouldShowPrompt(true);
  }, [isLoading, registerDeviceIfNeeded, syncPermission, user]);

  const acceptPrompt = useCallback(async () => {
    setShouldShowPrompt(false);

    if (typeof window === "undefined" || !("Notification" in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      await registerDeviceIfNeeded();
    }
  }, [registerDeviceIfNeeded]);

  const handleDismissPrompt = useCallback(() => {
    setShouldShowPrompt(false);
    dismissPrompt();
  }, []);

  useEffect(() => {
    void evaluatePrompt();
  }, [evaluatePrompt]);

  useEffect(() => {
    if (!isSupported) return;

    let cancelled = false;
    let unsubscribe = () => {};

    void (async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging || cancelled) return;

      unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
        const title =
          payload.notification?.title || payload.data?.title || "التیام";
        const body =
          payload.notification?.body ||
          payload.data?.body ||
          "پیام جدید دریافت شد.";

        toast(body, { icon: "🔔", duration: 5000 });

        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: "/icons/icon-small.png",
            dir: "rtl",
            lang: "fa",
            data: payload.data,
          });
        }
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isRegistering,
    shouldShowPrompt,
    acceptPrompt,
    dismissPrompt: handleDismissPrompt,
  };
}
