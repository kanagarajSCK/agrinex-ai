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
  LANGUAGE_STORAGE_KEY,
  getStoredLanguage,
  languageLabels,
  storeLanguage,
  translations,
  type AppLanguage,
  type TranslationKey,
} from "@/lib/i18n";

export interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  languageLabel: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getStoredLanguage);

  // Sync document lang attribute and cross-tab storage changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY && event.newValue) {
        const next = event.newValue as AppLanguage;
        if (next === "en" || next === "ta" || next === "te" || next === "hi") {
          setLanguageState(next);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [language]);

  const setLanguage = useCallback((newLang: AppLanguage) => {
    setLanguageState(newLang);
    storeLanguage(newLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("agrinex-language-change", { detail: newLang })
      );
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const currentDict = translations[language] as Record<string, string>;
      if (currentDict && currentDict[key]) {
        return currentDict[key];
      }
      const enDict = translations.en as Record<string, string>;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return fallback ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languageLabel: languageLabels[language] || "English",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
