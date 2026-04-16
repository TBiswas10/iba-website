"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCopy, Lang } from "@/lib/copy";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => undefined,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("iba-lang");
    if (saved === "bn" || saved === "en") {
      setLang(saved);
    }
  }, []);

  const changeLanguage = (next: Lang) => {
    setLang(next);
    window.localStorage.setItem("iba-lang", next);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang: changeLanguage,
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useCopy() {
  const { lang } = useLanguage();
  return getCopy(lang);
}
