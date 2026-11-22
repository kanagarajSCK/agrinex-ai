"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredLocation,
  getStoredLocation,
  getSuggestedLocation,
  reverseGeocodeLocation,
  storeConfirmedLocation,
  type ConfirmedLocation,
  type LocationStatus,
  type ReverseGeocodeResult,
} from "@/lib/locations";

export type OnboardingTab = "gps" | "manual" | "suggested";

export interface LocationContextType {
  status: LocationStatus;
  location: ConfirmedLocation | null;
  detectedPending: ReverseGeocodeResult | null;
  isOnboardingOpen: boolean;
  onboardingInitialTab: OnboardingTab;
  errorMessage: string | null;
  openOnboarding: (tab?: OnboardingTab) => void;
  closeOnboarding: () => void;
  detectGpsLocation: () => Promise<void>;
  confirmDetectedGps: () => void;
  confirmManualLocation: (
    loc: Omit<ConfirmedLocation, "source" | "isConfirmed" | "updatedAt">
  ) => void;
  confirmSuggestedLocation: () => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>("not_configured");
  const [location, setLocation] = useState<ConfirmedLocation | null>(null);
  const [detectedPending, setDetectedPending] = useState<ReverseGeocodeResult | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingInitialTab, setOnboardingInitialTab] = useState<OnboardingTab>("gps");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize on mount from localStorage
  useEffect(() => {
    void Promise.resolve().then(() => {
      const stored = getStoredLocation();
      if (stored && stored.isConfirmed) {
        setLocation(stored);
        if (stored.source === "gps") {
          setStatus("selected_gps");
        } else if (stored.source === "manual") {
          setStatus("selected_manual");
        } else {
          setStatus("selected_suggested");
        }
      } else {
        // First visit experience: location not configured yet, open onboarding modal
        setStatus("not_configured");
        setIsOnboardingOpen(true);
      }
    });
  }, []);

  const openOnboarding = useCallback((tab: OnboardingTab = "gps") => {
    setOnboardingInitialTab(tab);
    setErrorMessage(null);
    setIsOnboardingOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
  }, []);

  const detectGpsLocation = useCallback(async () => {
    setErrorMessage(null);
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setErrorMessage("Browser geolocation is unavailable on your device or browser.");
      return;
    }

    setStatus("requesting_permission");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("detecting");
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const result = await reverseGeocodeLocation(lat, lon);
          setDetectedPending(result);
          setStatus("detected_pending_confirmation");
        } catch (err) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Unable to identify agricultural location from GPS coordinates."
          );
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("permission_denied");
          setErrorMessage(
            "Location permission is unavailable. You can still use AgriNex AI by selecting your farming location manually."
          );
        } else if (err.code === err.TIMEOUT) {
          setStatus("error");
          setErrorMessage("Location request timed out. Please try again or select manually.");
        } else {
          setStatus("error");
          setErrorMessage(
            "Unable to determine your GPS location. Please try again or select your location manually."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  }, []);

  const confirmDetectedGps = useCallback(() => {
    if (!detectedPending) return;

    const confirmed: ConfirmedLocation = {
      latitude: detectedPending.latitude,
      longitude: detectedPending.longitude,
      country: "India",
      state: detectedPending.state_name || "Unknown State",
      district: detectedPending.district_name || "Unknown District",
      subdistrict: detectedPending.subdistrict?.name_en || null,
      village: detectedPending.village?.name_en || null,
      locationId:
        detectedPending.village?.location_id ||
        detectedPending.district?.location_id ||
        detectedPending.state?.location_id ||
        null,
      stateCode: detectedPending.state?.state_code || null,
      districtCode: detectedPending.district?.district_code || null,
      subdistrictCode: null,
      villageCode: detectedPending.village?.lgd_code || null,
      formattedName: detectedPending.formatted_name,
      source: "gps",
      isConfirmed: true,
      villageCoverageAvailable: detectedPending.village_coverage_available,
      updatedAt: Date.now(),
    };

    storeConfirmedLocation(confirmed);
    setLocation(confirmed);
    setStatus("selected_gps");
    setDetectedPending(null);
    setIsOnboardingOpen(false);
  }, [detectedPending]);

  const confirmManualLocation = useCallback(
    (loc: Omit<ConfirmedLocation, "source" | "isConfirmed" | "updatedAt">) => {
      const confirmed: ConfirmedLocation = {
        ...loc,
        source: "manual",
        isConfirmed: true,
        updatedAt: Date.now(),
      };

      storeConfirmedLocation(confirmed);
      setLocation(confirmed);
      setStatus("selected_manual");
      setIsOnboardingOpen(false);
    },
    []
  );

  const confirmSuggestedLocation = useCallback(() => {
    const suggested = getSuggestedLocation();
    const confirmed: ConfirmedLocation = {
      ...suggested,
      isConfirmed: true,
      updatedAt: Date.now(),
    };

    storeConfirmedLocation(confirmed);
    setLocation(confirmed);
    setStatus("selected_suggested");
    setIsOnboardingOpen(false);
  }, []);

  const clearLocation = useCallback(() => {
    clearStoredLocation();
    setLocation(null);
    setStatus("not_configured");
    setDetectedPending(null);
    setIsOnboardingOpen(true);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        status,
        location,
        detectedPending,
        isOnboardingOpen,
        onboardingInitialTab,
        errorMessage,
        openOnboarding,
        closeOnboarding,
        detectGpsLocation,
        confirmDetectedGps,
        confirmManualLocation,
        confirmSuggestedLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
