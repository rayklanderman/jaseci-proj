// AI Task Manager Service Worker
const CACHE_NAME = "ai-task-manager-v2";
const urlsToCache = ["/", "/manifest.json", "/icon.svg", "/vite.svg"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("🚀 AI Task Manager service worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching app shell");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log("❌ Cache failed:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("✅ AI Task Manager service worker activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isApiRequest =
    !isSameOrigin ||
    requestUrl.pathname.startsWith("/api") ||
    requestUrl.pathname.startsWith("/tasks") ||
    requestUrl.pathname.startsWith("/HealthCheck") ||
    requestUrl.pathname.startsWith("/health") ||
    requestUrl.pathname.startsWith("/ai-");

  if (isApiRequest) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.log("⚠️ API request failed, no cache fallback:", error);
        return new Response(JSON.stringify({ error: "Network unavailable" }), {
          headers: { "Content-Type": "application/json" },
          status: 503,
        });
      })
    );
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          console.log("📋 Serving from cache:", event.request.url);
          return response;
        }

        console.log("🌐 Fetching from network:", event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== "basic"
            ) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            console.log("❌ Network fetch failed:", event.request.url, error);
            if (event.request.destination === "document") {
              return caches.match("/");
            }
            return new Response(
              JSON.stringify({ error: "Network unavailable" }),
              {
                headers: { "Content-Type": "application/json" },
                status: 503,
              }
            );
          });
      })
      .catch((error) => {
        console.log("❌ Cache match failed:", error);
        if (event.request.destination === "document") {
          return caches.match("/");
        }
        return new Response("Offline", { status: 503 });
      })
  );
});

// Background sync for task updates when back online
self.addEventListener("sync", (event) => {
  if (event.tag === "task-sync") {
    console.log("🔄 Syncing tasks in background...");
    event.waitUntil(syncTasks());
  }
});

// Push notifications for task reminders
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: data.tag || "task-reminder",
      requireInteraction: data.priority === "high",
      actions: [
        {
          action: "complete",
          title: "✅ Mark Complete",
        },
        {
          action: "snooze",
          title: "⏰ Remind Later",
        },
      ],
      data: data,
    };

    event.waitUntil(
      self.registration.showNotification("🤖 AI Task Manager", options)
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "complete") {
    // Handle task completion
    const taskId = event.notification.data.taskId;
    event.waitUntil(completeTask(taskId));
  } else if (event.action === "snooze") {
    // Reschedule notification
    const taskData = event.notification.data;
    event.waitUntil(snoozeTask(taskData));
  } else {
    // Open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Helper functions
async function syncTasks() {
  try {
    // Sync pending tasks with server
    const response = await fetch("/api/sync-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync" }),
    });

    if (response.ok) {
      console.log("✅ Tasks synced successfully");
    }
  } catch (error) {
    console.log("❌ Task sync failed:", error);
  }
}

async function completeTask(taskId) {
  try {
    await fetch(`/api/tasks/${taskId}/complete`, {
      method: "POST",
    });
    console.log("✅ Task completed via notification");
  } catch (error) {
    console.log("❌ Failed to complete task:", error);
  }
}

async function snoozeTask(taskData) {
  // Reschedule for 1 hour later
  const snoozeTime = Date.now() + 3600000; // 1 hour

  setTimeout(() => {
    self.registration.showNotification("🔔 Snoozed Reminder", {
      body: taskData.body,
      icon: "/icon.svg",
      tag: taskData.tag,
      data: taskData,
    });
  }, 3600000);

  console.log("⏰ Task snoozed for 1 hour");
}
