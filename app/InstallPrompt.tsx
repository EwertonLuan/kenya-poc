"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallPrompt() {
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
    useEffect(() => {
      // Detect if the app is already installed
      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  
      // Register service worker globally
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then(reg => console.log("Service Worker registered:", reg))
        .catch(err => console.error("Service Worker registration failed:", err));
      }
  
      // Listen for beforeinstallprompt event (for Chrome PWA install)
      const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
        event.preventDefault(); // Prevent automatic prompt
        setDeferredPrompt(event); // Store for later use
      };
  
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }, []);
  
    const handleInstallClick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User response to install prompt:", outcome);
        setDeferredPrompt(null);
      }
    };
  
    if (isStandalone) return null; // Hide if already installed
  
    return (
      <div>
        {deferredPrompt && <button onClick={handleInstallClick}>Install</button>}
      </div>
    );
  }