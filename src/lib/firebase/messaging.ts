"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  type Messaging,
} from "firebase/messaging";
import { firebaseConfig, isFirebaseConfigured, vapidKey } from "./config";

let messagingInstance: Messaging | null = null;

export async function isMessagingSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!isFirebaseConfigured()) return false;
  return isSupported();
}

function getFirebaseApp() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!(await isMessagingSupported())) return null;

  if (!messagingInstance) {
    messagingInstance = getMessaging(getFirebaseApp());
  }

  return messagingInstance;
}

export async function registerFirebaseServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );
  await navigator.serviceWorker.ready;
  return registration;
}

export async function obtainFcmToken(): Promise<string | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  try {
    const registration = await registerFirebaseServiceWorker();
    return await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    console.error("[FCM] Failed to obtain token:", error);
    return null;
  }
}
