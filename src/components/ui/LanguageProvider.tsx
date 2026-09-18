"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "zh" | "en";

interface LanguageContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
  readonly toggleLocale: () => void;
}

const STORAGE_KEY = "gco-locale";

const LanguageContext = createContext<LanguageContextValue | null>(null);
const DEFAULT_LANGUAGE_CONTEXT: LanguageContextValue = {
  locale: "zh",
  setLocale: () => undefined,
  toggleLocale: () => undefined,
};

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  // Chinese is the SSR and first-paint default. Reading storage in an effect
  // keeps the server markup identical to the first client render.
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // A blocked/full storage area must not make the language control fail.
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "zh" ? "en" : "zh");
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  // Standalone component tests and embedded consumers can render the shell
  // without the app layout. Keep that path Chinese-first; the root provider
  // supplies the persistent toggle in the actual application.
  return context ?? DEFAULT_LANGUAGE_CONTEXT;
}
