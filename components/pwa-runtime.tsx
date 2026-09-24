"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaRuntime() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    );

    const onControllerChange = () => window.location.reload();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

      void navigator.serviceWorker.register("/sw.js").then((registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  async function update() {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!registration) return;

    if (!registration.waiting) {
      await registration.update();
    }

    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
  }

  if (installed) {
    return (
      <>
        <span className="status-pill status-ok" title="Running as an installed app">
          Installed app
        </span>
        {updateAvailable ? (
          <button className="compact-button" onClick={update}>
            Update
          </button>
        ) : null}
      </>
    );
  }

  return (
    <>
      {updateAvailable ? (
        <button className="compact-button" onClick={update}>
          Update
        </button>
      ) : null}
      {installEvent ? (
        <button className="compact-button primary" onClick={install}>
          Install app
        </button>
      ) : (
        <span className="status-pill">
          Browser app
        </span>
      )}
    </>
  );
}
