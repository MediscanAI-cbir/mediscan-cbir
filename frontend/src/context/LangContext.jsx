import { useRef, useState } from "react";
import { en } from "../i18n/en";
import { fr } from "../i18n/fr";
import { LangContext } from "./lang-context";

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const [langVisible, setLangVisible] = useState(true);
  const timerRef = useRef(null);

  const t = lang === "fr" ? fr : en;

  const setLanguage = (newLang) => {
    if (newLang === lang) return;
    clearTimeout(timerRef.current);

    // Fade out
    setLangVisible(false);

    timerRef.current = setTimeout(() => {
      setLang(newLang);
      localStorage.setItem("lang", newLang);
      // Fade in
      setLangVisible(true);
    }, 160);
  };

  return (
    <LangContext.Provider value={{ lang, t, setLanguage, langVisible }}>
      {children}
    </LangContext.Provider>
  );
}
