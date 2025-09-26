self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [100, 50, 100],
      requireInteraction: true,
      actions: [
        {
          action: "open",
          title: "Open App",
          icon: "/icon-192x192.png",
        },
      ],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: "/",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
