import React, { useEffect, useState } from "react";
import { useDestinationsStore } from "../services/slices/destinationsSlice";
import { initApp } from "../services/initApp";
import DestinationCard from "../components/destination/DestinationCard";
import Hero from "../components/Hero";
import ScrollToTopButton from "../components/ScrollToTop";
import { inspectRoles } from "../services/auth"
import PwaInstallModal from "../components/common/PwaInstallModal";
import LoadingScreen from "./LoadingScreen";


interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}
// localStorage.removeItem("itinera-installed");
// localStorage.removeItem("itinera-hide-install");

const isInstalled = (): boolean => {
  const nav = window.navigator as NavigatorStandalone;
  const standalone = nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  const localFlag = localStorage.getItem("itinera-installed") === "true";

  return standalone || localFlag;
};

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showInstallModal, setShowInstallModal] = useState(true); // default to true for testing
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const destinations = useDestinationsStore((state) => state.destinations);

  useEffect(() => {
    window.addEventListener("appinstalled", () => {
      console.log("🎉 Itinera was installed!");
      localStorage.setItem("itinera-installed", "true");
    });
  }, []);

  useEffect(() => {
    if (isInstalled()) {
      setShowInstallModal(false); // Hide the modal if already installed
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await initApp();
      } catch (err) {
        console.error("Failed to initialize app", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 👇 This is the event listener I was referring to
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent); // Save the event for later
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);


  if (loading) return <LoadingScreen />;

  inspectRoles();

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
        <ScrollToTopButton />
      </div>
      <PwaInstallModal
        show={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstall={() => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt");
              } else {
                console.log("User dismissed the install prompt");
              }
              setDeferredPrompt(null);
              setShowInstallModal(false);
            });
          } else {
            alert("Install prompt not available yet.");
          }
        }}
      />

    </>
  );
};

export default Home;
