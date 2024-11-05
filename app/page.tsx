"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Smartphone } from "lucide-react";

// Add this type definition at the top of the file
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function Component() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return null; // Don't show anything if the app is already installed
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-6 h-6" />
          Add to Home Screen
        </CardTitle>
        <CardDescription>Install our app for easy access</CardDescription>
      </CardHeader>
      <CardContent>
        {isInstallable ? (
          <Button onClick={handleInstallClick} className="w-full">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add to Home Screen
          </Button>
        ) : isIOS ? (
          <div className="text-sm text-muted-foreground">
            <p>To install this app on your iOS device:</p>
            <ol className="list-decimal list-inside mt-2">
              <li>
                Tap the share button <span aria-label="share icon">⎋</span> in
                Safari
              </li>
              <li>
                Scroll down and tap Add to Home Screen{" "}
                <span aria-label="plus icon">➕</span>
              </li>
              <li>Tap Add in the top right corner</li>
            </ol>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This app can not be installed on your device or you have already
            installed it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
