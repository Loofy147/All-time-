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
  const [persistentStorage, setPersistentStorage] = useState<boolean | null>(null);

  useEffect(() => {
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    );

    if ("storage" in navigator && "persist" in navigator.storage) {
      void navigator.storage.persist().then(setPersistentStorage);
    }

    if ("serviceWorker" in navigator) {
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

  function update() {
    navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }

  const storageLabel =
    persistentStorage === true
      ? "Storage protected"
      : persistentStorage === false
        ? "Storage best-effort"
        : "Storage checking";

  if (installed) {
    return (
      <>
        <span className="status-pill status-ok" title={storageLabel}>
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
