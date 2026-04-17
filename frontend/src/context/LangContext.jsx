import { createContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { en } from "../i18n/en";
import { fr } from "../i18n/fr";
import { es } from "../i18n/es";
import { de } from "../i18n/de";
import { it } from "../i18n/it";
import { pt } from "../i18n/pt";
import { tr } from "../i18n/tr";
import { zh } from "../i18n/zh";
import { ar } from "../i18n/ar";
import { ja } from "../i18n/ja";
import { ko } from "../i18n/ko";

export const LangContext = createContext();

const translations = { en, fr, es, de, it, pt, tr, zh, ar, ja, ko };

function canUseAnimatedViewTransitions() {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const userAgent = window.navigator.userAgent;
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|Chromium|Android/i.test(userAgent);
  return !prefersReduced && !isSafari && typeof document.startViewTransition === "function";
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const [langVisible, setLangVisible] = useState(true);
  const timerRef = useRef(null);

  const t = translations[lang] || translations["en"];

  useEffect(() => {
    document.documentElement.lang = lang; 

    // Gérer la direction de l'interface pour les utilisateurs arabes
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    localStorage.setItem("lang", lang);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [lang]);

  const setLanguage = (newLang) => {
    if (newLang === lang) return;

    if (!canUseAnimatedViewTransitions()) {
      clearTimeout(timerRef.current);
      setLangVisible(false);
      timerRef.current = setTimeout(() => {
        setLang(newLang);
        setLangVisible(true);
      }, 160);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setLang(newLang);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        { opacity: [1, 0], transform: ["translateY(0)", "translateY(-6px)"] },
        { duration: 260, easing: "ease-in", pseudoElement: "::view-transition-old(root)" }
      );
      document.documentElement.animate(
        { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0)"] },
        { duration: 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };

  return (
    <LangContext.Provider value={{ lang, t, setLanguage, langVisible }}>
      {children}
    </LangContext.Provider>
  );
}
