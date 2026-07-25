/* eslint-disable no-undef */
importScripts("/firebase-sw-config.js");
importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js"
);

firebase.initializeApp(self.FIREBASE_CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "التیام";
  const body =
    payload.notification?.body || payload.data?.body || "پیام جدید دریافت شد.";

  return self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-small.png",
    badge: "/icons/icon-small.png",
    dir: "rtl",
    lang: "fa",
    data: payload.data || {},
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/home/measurements";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
