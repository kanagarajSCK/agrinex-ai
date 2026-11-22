export type AppLanguage = "en" | "ta" | "te" | "hi";

export const LANGUAGE_STORAGE_KEY = "agrinex-language";

export const languageLabels: Record<AppLanguage, string> = {
  en: "English",
  ta: "தமிழ்",
  te: "తెలుగు",
  hi: "हिन्दी",
};

export const translations = {
  en: {
    dashboard: "Overview",
    assistant: "AI Assistant",
    weather: "Weather intelligence",
    markets: "Market intelligence",
    crops: "Crop intelligence",
    farms: "My farms",
    advisories: "Advisory history",
    settings: "Profile & settings",
    selectedLocation: "Selected farm location",
    language: "Language",
    loading: "Loading…",
    unavailable: "Unavailable",
    retry: "Retry",
    clear: "Clear",
  },
  ta: {
    dashboard: "மேற்கோள்",
    assistant: "AI உதவியாளர்",
    weather: "வானிலை தகவல்",
    markets: "சந்தை தகவல்",
    crops: "பயிர் தகவல்",
    farms: "என் பண்ணைகள்",
    advisories: "ஆலோசனை வரலாறு",
    settings: "சுயவிவரம் & அமைப்புகள்",
    selectedLocation: "தேர்ந்தெடுத்த பண்ணை இடம்",
    language: "மொழி",
    loading: "ஏற்றுகிறது…",
    unavailable: "கிடைக்கவில்லை",
    retry: "மீண்டும் முயற்சி",
    clear: "அழி",
  },
  te: {
    dashboard: "అవలోకనం",
    assistant: "AI సహాయకుడు",
    weather: "వాతావరణ సమాచారం",
    markets: "మార్కెట్ సమాచారం",
    crops: "పంట సమాచారం",
    farms: "నా పొలాలు",
    advisories: "సలహా చరిత్ర",
    settings: "ప్రొఫైల్ & సెట్టింగ్స్",
    selectedLocation: "ఎంచుకున్న పొలం స్థానం",
    language: "భాష",
    loading: "లోడ్ అవుతోంది…",
    unavailable: "అందుబాటులో లేదు",
    retry: "మళ్లీ ప్రయత్నించండి",
    clear: "తుడిచివేయి",
  },
  hi: {
    dashboard: "ओवरव्यू",
    assistant: "AI सहायक",
    weather: "मौसम जानकारी",
    markets: "मंडी जानकारी",
    crops: "फसल जानकारी",
    farms: "मेरे फार्म",
    advisories: "सलाह इतिहास",
    settings: "प्रोफ़ाइल और सेटिंग्स",
    selectedLocation: "चयनित खेत स्थान",
    language: "भाषा",
    loading: "लोड हो रहा है…",
    unavailable: "उपलब्ध नहीं",
    retry: "फिर कोशिश करें",
    clear: "साफ़ करें",
  },
} as const;

export function getStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "ta" || stored === "te" || stored === "hi" ? stored : "en";
}

export function storeLanguage(language: AppLanguage) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}
