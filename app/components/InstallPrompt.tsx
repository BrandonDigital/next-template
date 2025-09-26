"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: boolean }).MSStream;
    const isStandaloneMode = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    console.log("InstallPrompt Debug:", {
      isIOS: isIOSDevice,
      isStandalone: isStandaloneMode,
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia("(display-mode: standalone)").matches,
    });

    setIsIOS(isIOSDevice);
    setIsStandalone(isStandaloneMode);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired", e);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Check if browser supports PWA installation
    const isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    console.log("Browser detection:", { isChrome, isEdge, isSafari });

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  if (!isClient) {
    return (
      <div className='p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md'>
        <h3 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
          Install App
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
      </div>
    );
  }

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className='p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md'>
      <h3 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
        Install App
      </h3>
      <button
        onClick={isIOS ? undefined : handleInstallClick}
        disabled={!deferredPrompt && !isIOS}
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {deferredPrompt
          ? "Install App"
          : isIOS
          ? "Tap Share Button Below ⬇️"
          : "Look for Install Icon in Address Bar"}
      </button>
      {isClient && (
        <div className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
          <p>Debug info:</p>
          <ul className='list-disc list-inside mt-2'>
            <li>Deferred Prompt: {deferredPrompt ? "✅" : "❌"}</li>
            <li>iOS Device: {isIOS ? "✅" : "❌"}</li>
            <li>Standalone Mode: {isStandalone ? "✅" : "❌"}</li>
          </ul>
        </div>
      )}
      {!isIOS && !deferredPrompt && (
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4'>
          <h4 className='font-semibold text-blue-800 dark:text-blue-200 mb-2'>
            💻 How to Install on Desktop:
          </h4>
          <ul className='text-sm text-blue-700 dark:text-blue-300 space-y-1'>
            <li>
              • <strong>Chrome/Edge:</strong> Look for install icon (⊕) in
              address bar
            </li>
            <li>
              • <strong>Safari:</strong> Develop → Enter Responsive Design Mode
            </li>
            <li>
              • <strong>Firefox:</strong> Menu → More Tools → Install
            </li>
          </ul>
        </div>
      )}
      {isIOS && (
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4'>
          <h4 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
            📱 How to Install on iPhone/iPad:
          </h4>
          <ol className='text-sm text-yellow-700 dark:text-yellow-300 space-y-1'>
            <li>
              1. Tap the <strong>Share</strong> button{" "}
              <span className='text-lg'>⎋</span> at the bottom of Safari
            </li>
            <li>
              2. Scroll down and tap{" "}
              <strong>&quot;Add to Home Screen&quot;</strong>{" "}
              <span className='text-lg'>➕</span>
            </li>
            <li>
              3. Tap <strong>&quot;Add&quot;</strong> to confirm
            </li>
            <li>
              4. Open the app from your home screen to enable push notifications
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
