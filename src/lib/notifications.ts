import { db } from "./db";
import {
  FORM_REMINDERS_ENABLED_KEY,
  FormType,
  getActiveSlot,
  INTERVENTION_SLOTS,
  isRecordInSlot,
  MEASUREMENT_SLOTS,
  NOTIFIED_PREFIX,
  slotKey,
  todayDateString,
  type ActivationSlot,
} from "@/utils/schedule";

const NOTIFICATION_DB = "eltiamNotifications";
const NOTIFICATION_STORE = "flags";

type NotificationFlag = {
  completed?: boolean;
  notified?: boolean;
};

let notificationDbPromise: Promise<IDBDatabase> | null = null;

function openNotificationDB(): Promise<IDBDatabase> {
  if (notificationDbPromise) return notificationDbPromise;

  notificationDbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(NOTIFICATION_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(NOTIFICATION_STORE)) {
        req.result.createObjectStore(NOTIFICATION_STORE);
      }
    };
    req.onsuccess = () => {
      const dbConn = req.result;
      dbConn.onclose = () => {
        notificationDbPromise = null;
      };
      dbConn.onversionchange = () => {
        dbConn.close();
        notificationDbPromise = null;
      };
      resolve(dbConn);
    };
    req.onerror = () => {
      notificationDbPromise = null;
      reject(req.error);
    };
  });

  return notificationDbPromise;
}

async function getFlag(key: string): Promise<NotificationFlag | null> {
  const dbConn = await openNotificationDB();
  return new Promise((resolve, reject) => {
    const tx = dbConn.transaction(NOTIFICATION_STORE, "readonly");
    const req = tx.objectStore(NOTIFICATION_STORE).get(key);
    req.onsuccess = () => resolve((req.result as NotificationFlag) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function setFlag(key: string, value: NotificationFlag): Promise<void> {
  const dbConn = await openNotificationDB();
  return new Promise((resolve, reject) => {
    const tx = dbConn.transaction(NOTIFICATION_STORE, "readwrite");
    const req = tx.objectStore(NOTIFICATION_STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function isRemindersEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FORM_REMINDERS_ENABLED_KEY) === "true";
}

export function setRemindersEnabled(enabled: boolean): void {
  localStorage.setItem(FORM_REMINDERS_ENABLED_KEY, enabled ? "true" : "false");
  window.dispatchEvent(
    new CustomEvent("reminders-changed", { detail: enabled })
  );
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

function wasNotifiedLocally(key: string): boolean {
  return localStorage.getItem(`${NOTIFIED_PREFIX}${key}`) === "1";
}

function markNotifiedLocally(key: string): void {
  localStorage.setItem(`${NOTIFIED_PREFIX}${key}`, "1");
}

async function isSlotCompleted(
  formType: FormType,
  slot: ActivationSlot,
  date: string
): Promise<boolean> {
  const table = formType === "measurement" ? "measurements" : "interventions";
  const records: { date: string; time: string; q_number: number }[] = await db[
    table
  ]
    .where("date")
    .equals(date)
    .toArray();

  const inSlot = records.filter((r) => isRecordInSlot(r.time, slot));
  const answered = new Set(inSlot.map((r) => r.q_number));
  return answered.size >= 3;
}

export async function syncCompletionFlags(date = todayDateString()): Promise<void> {
  const configs: { formType: FormType; slots: ActivationSlot[] }[] = [
    { formType: "measurement", slots: MEASUREMENT_SLOTS },
    { formType: "intervention", slots: INTERVENTION_SLOTS },
  ];

  for (const { formType, slots } of configs) {
    for (const slot of slots) {
      const key = slotKey(formType, slot.start, date);
      const completed = await isSlotCompleted(formType, slot, date);
      if (completed) {
        await setFlag(key, { completed: true, notified: true });
      }
    }
  }
}

export async function showFormReminder(
  title: string,
  body: string,
  url: string,
  tag: string
): Promise<void> {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;

  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-small.png",
    badge: "/icons/icon-small.png",
    tag,
    data: { url },
    dir: "rtl",
    lang: "fa",
  };

  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
}

export async function syncScheduleToServiceWorker(): Promise<void> {
  if (!isRemindersEnabled() || Notification.permission !== "granted") return;
  if (!("serviceWorker" in navigator)) return;

  await syncCompletionFlags();

  const { getUpcomingReminders } = await import("@/utils/schedule");
  const slots = getUpcomingReminders();
  const reg = await navigator.serviceWorker.ready;

  const flags: Record<string, NotificationFlag> = {};
  for (const slot of slots) {
    flags[slot.id] = (await getFlag(slot.id)) ?? {};
  }

  reg.active?.postMessage({
    type: "SCHEDULE_REMINDERS",
    enabled: true,
    slots,
    flags,
  });
}

export async function cancelServiceWorkerReminders(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  reg.active?.postMessage({ type: "CANCEL_REMINDERS" });
}

export async function checkAndNotifyActiveSlots(): Promise<void> {
  if (!isRemindersEnabled()) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const date = todayDateString(now);
  const minute = now.getMinutes();

  // Notify at slot start (:00–:09) or if app opened mid-slot (:00–:14)
  if (minute > 14) return;

  await syncCompletionFlags(date);

  const checks: {
    formType: FormType;
    slots: ActivationSlot[];
    url: string;
    title: string;
  }[] = [
    {
      formType: "measurement",
      slots: MEASUREMENT_SLOTS,
      url: "/home/measurements",
      title: "⏰ وقت سنجش روزانه",
    },
    {
      formType: "intervention",
      slots: INTERVENTION_SLOTS,
      url: "/home/interventions",
      title: "⏰ وقت فرم مداخله",
    },
  ];

  for (const { formType, slots, url, title } of checks) {
    const activeSlot = getActiveSlot(slots, now);
    if (!activeSlot) continue;

    const key = slotKey(formType, activeSlot.start, date);
    if (wasNotifiedLocally(key)) continue;

    const flag = await getFlag(key);
    if (flag?.completed) continue;

    const completed = await isSlotCompleted(formType, activeSlot, date);
    if (completed) {
      await setFlag(key, { completed: true, notified: true });
      continue;
    }

    await showFormReminder(
      title,
      `بازه ${activeSlot.label} — لطفاً فرم را تکمیل کنید.`,
      url,
      key
    );

    markNotifiedLocally(key);
    await setFlag(key, { notified: true });
  }
}

export async function onFormAnswerSubmitted(formType: FormType): Promise<void> {
  if (!isRemindersEnabled()) return;

  const now = new Date();
  const date = todayDateString(now);
  const slots =
    formType === "measurement" ? MEASUREMENT_SLOTS : INTERVENTION_SLOTS;
  const activeSlot = getActiveSlot(slots, now);
  if (!activeSlot) return;

  const completed = await isSlotCompleted(formType, activeSlot, date);
  if (completed) {
    const key = slotKey(formType, activeSlot.start, date);
    await setFlag(key, { completed: true, notified: true });
    markNotifiedLocally(key);
  }

  await syncScheduleToServiceWorker();
}

export async function enableFormReminders(): Promise<boolean> {
  const permission = await requestNotificationPermission();
  if (permission !== "granted") return false;

  setRemindersEnabled(true);
  await syncScheduleToServiceWorker();
  await checkAndNotifyActiveSlots();
  return true;
}

export async function disableFormReminders(): Promise<void> {
  setRemindersEnabled(false);
  await cancelServiceWorkerReminders();
}
