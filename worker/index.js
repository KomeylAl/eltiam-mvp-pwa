/* eslint-disable no-restricted-globals */
/** @type {ReturnType<typeof setTimeout>[]} */
const reminderTimeouts = [];

const NOTIFICATION_DB = "eltiamNotifications";
const NOTIFICATION_STORE = "flags";

/** @type {Promise<IDBDatabase> | null} */
let notificationDbPromise = null;

function openNotificationDB() {
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

function getFlag(key) {
  return openNotificationDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(NOTIFICATION_STORE, "readonly");
        const req = tx.objectStore(NOTIFICATION_STORE).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      })
  );
}

function setFlag(key, value) {
  return openNotificationDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(NOTIFICATION_STORE, "readwrite");
        const req = tx.objectStore(NOTIFICATION_STORE).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      })
  );
}

function clearAllTimeouts() {
  reminderTimeouts.forEach(clearTimeout);
  reminderTimeouts.length = 0;
}

function showReminderNotification(slot) {
  return self.registration.showNotification(slot.title, {
    body: slot.body,
    icon: "/icons/icon-small.png",
    badge: "/icons/icon-small.png",
    tag: slot.id,
    dir: "rtl",
    lang: "fa",
    data: { url: slot.url },
  });
}

function scheduleReminders(slots, flags) {
  clearAllTimeouts();
  const now = Date.now();

  slots.forEach((slot) => {
    const delay = slot.timestamp - now;
    if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;

    const flag = flags?.[slot.id];
    if (flag?.completed || flag?.notified) return;

    const id = setTimeout(async () => {
      try {
        const currentFlag = await getFlag(slot.id);
        if (currentFlag?.completed) return;

        await showReminderNotification(slot);
        await setFlag(slot.id, { notified: true });
      } catch (err) {
        console.error("[SW] reminder error:", err);
      }
    }, delay);

    reminderTimeouts.push(id);
  });
}

self.addEventListener("message", (event) => {
  const { type, slots, flags, enabled } = event.data || {};

  if (type === "SCHEDULE_REMINDERS" && enabled) {
    scheduleReminders(slots || [], flags || {});
  }

  if (type === "CANCEL_REMINDERS") {
    clearAllTimeouts();
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home/measurements";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});
