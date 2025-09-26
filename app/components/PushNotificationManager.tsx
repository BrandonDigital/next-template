"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "../actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      console.log("Push notifications not supported:", {
        serviceWorker: "serviceWorker" in navigator,
        pushManager: "PushManager" in window,
        userAgent: navigator.userAgent,
        isSecure: window.location.protocol === "https:",
      });
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isClient) {
    return (
      <div className='p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
        <h3 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
          Push Notifications
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className='p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
        <h3 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
          Push Notifications
        </h3>
        {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
          <div>
            <p className='text-yellow-600 dark:text-yellow-400 mb-4'>
              ⚠️ Push notifications require the app to be installed on your home
              screen first.
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              On iOS, you need to:
              <br />
              1. Install this app to your home screen
              <br />
              2. Open the app from your home screen
              <br />
              3. Then push notifications will be available
            </p>
          </div>
        ) : (
          <p className='text-red-600 dark:text-red-400'>
            Push notifications are not supported in this browser.
          </p>
        )}
        <div className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
          <p>Debug info:</p>
          <ul className='list-disc list-inside mt-2'>
            <li>
              Service Worker: {"serviceWorker" in navigator ? "✅" : "❌"}
            </li>
            <li>
              Push Manager:{" "}
              {typeof window !== "undefined" && "PushManager" in window
                ? "✅"
                : "❌"}
            </li>
            <li>
              HTTPS:{" "}
              {typeof window !== "undefined" &&
              window.location.protocol === "https:"
                ? "✅"
                : "❌"}
            </li>
            <li>User Agent: {navigator.userAgent}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
      <h3 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
        Push Notifications
      </h3>
      {subscription ? (
        <div className='space-y-4'>
          <p className='text-green-600 dark:text-green-400'>
            You are subscribed to push notifications.
          </p>
          <button
            onClick={unsubscribeFromPush}
            className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
          >
            Unsubscribe
          </button>
          <div className='flex gap-2'>
            <input
              type='text'
              placeholder='Enter notification message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <button
              onClick={sendTestNotification}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            >
              Send Test
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          <p className='text-gray-600 dark:text-gray-400'>
            You are not subscribed to push notifications.
          </p>
          <button
            onClick={subscribeToPush}
            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
          >
            Subscribe
          </button>
        </div>
      )}
    </div>
  );
}
