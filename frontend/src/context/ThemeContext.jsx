/**
 * @fileoverview Documentation for context/ThemeContext.
 * @module context/ThemeContext
 */

import { useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import {
  COLOR_PALETTES,
  DEFAULT_PALETTE_ID,
  PALETTE_STORAGE_KEY,
  applyPaletteVariables,
  isPaletteId,
} from "../theme/palettes";
import { ThemeContext } from "./ThemeContextValue";

const THEME_COLOR_META_SELECTOR = 'meta[name="theme-color"]';
const COLOR_SCHEME_META_SELECTOR = 'meta[name="color-scheme"]';
const APPLE_STATUS_BAR_META_SELECTOR = 'meta[name="apple-mobile-web-app-status-bar-style"]';
const NAV_BUTTON_COLOR_META_SELECTOR = 'meta[name="msapplication-navbutton-color"]';

/**
 * Documentation for context/ThemeContext.
 * @param {string} selector
 * @param {string} name
 * @returns {HTMLMetaElement}
 */
function getOrCreateMeta(selector, name) {
  let meta = document.querySelector(selector);
  if (meta) return meta;

  meta = document.createElement("meta");
  meta.setAttribute("name", name);
  document.head.appendChild(meta);
  return meta;
}

/**
 * Moving the meta node to the end of <head> nudges iOS Safari to repaint the
 * status/address bars after a runtime theme switch.
 * @param {HTMLMetaElement} meta
 */
function reattachMeta(meta) {
  document.head.appendChild(meta);
}

/**
 * Documentation for context/ThemeContext.
 * @returns {boolean}
 */
function canUseAnimatedViewTransitions() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return !prefersReduced && typeof document.startViewTransition === "function";
}

/**
 * Documentation for context/ThemeContext.
 * @returns {"light"|"dark"}
 */
function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Documentation for context/ThemeContext.
 * @returns {string}
 */
function getInitialPalette() {
  const params = new URLSearchParams(window.location.search);
  const paletteFromUrl = params.get("palette");
  if (isPaletteId(paletteFromUrl)) {
    return paletteFromUrl;
  }

  const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
  if (isPaletteId(stored)) {
    return stored;
  }

  return DEFAULT_PALETTE_ID;
}

/**
 * Keep mobile browser chrome on the same existing background token as the page
 * shell. No color is introduced here; the value comes from the active palette.
 * @param {HTMLElement} root
 * @param {"light"|"dark"} nextTheme
 */
function syncThemeColorMeta(root, nextTheme) {
  const themeBackground = root.style.getPropertyValue("--palette-bg").trim();
  if (!themeBackground) return;

  let themeColorMetas = Array.from(document.querySelectorAll(THEME_COLOR_META_SELECTOR));
  if (themeColorMetas.length === 0) {
    const themeColorMeta = document.createElement("meta");
    themeColorMeta.setAttribute("name", "theme-color");
    document.head.appendChild(themeColorMeta);
    themeColorMetas = [themeColorMeta];
  }

  themeColorMetas.forEach((themeColorMeta) => {
    themeColorMeta.setAttribute("content", themeBackground);
    themeColorMeta.removeAttribute("media");
    reattachMeta(themeColorMeta);
  });

  const navButtonMeta = getOrCreateMeta(NAV_BUTTON_COLOR_META_SELECTOR, "msapplication-navbutton-color");
  navButtonMeta.setAttribute("content", themeBackground);
  reattachMeta(navButtonMeta);

  const colorSchemeMeta = getOrCreateMeta(COLOR_SCHEME_META_SELECTOR, "color-scheme");
  colorSchemeMeta.setAttribute("content", nextTheme === "dark" ? "dark light" : "light dark");
  reattachMeta(colorSchemeMeta);

  const appleStatusMeta = getOrCreateMeta(
    APPLE_STATUS_BAR_META_SELECTOR,
    "apple-mobile-web-app-status-bar-style"
  );
  appleStatusMeta.setAttribute("content", nextTheme === "dark" ? "black-translucent" : "default");
  reattachMeta(appleStatusMeta);

  root.style.backgroundColor = themeBackground;
  root.style.colorScheme = nextTheme;
  if (document.body) {
    document.body.style.backgroundColor = themeBackground;
    document.body.style.colorScheme = nextTheme;
  }
  const appRoot = document.getElementById("root");
  if (appRoot) {
    appRoot.style.backgroundColor = themeBackground;
  }

  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      themeColorMetas.forEach(reattachMeta);
      reattachMeta(navButtonMeta);
      root.style.backgroundColor = themeBackground;
      if (document.body) {
        document.body.style.backgroundColor = themeBackground;
      }
      if (appRoot) {
        appRoot.style.backgroundColor = themeBackground;
      }
    });
  }
}

/**
 * Apply theme attributes and palette variables together so page edges and
 * browser chrome cannot briefly keep the previous mode's background.
 * @param {"light"|"dark"} nextTheme
 * @param {string} nextPalette
 */
function applyThemeDocumentState(nextTheme, nextPalette) {
  const root = document.documentElement;
  root.dataset.theme = nextTheme;
  root.removeAttribute("data-palette");
  root.style.colorScheme = nextTheme;
  applyPaletteVariables(root, nextTheme, nextPalette);
  syncThemeColorMeta(root, nextTheme);
}

/**
 * Documentation for context/ThemeContext.
 * @param {{children: React.ReactNode}} props
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [palette, setPaletteState] = useState(getInitialPalette);

  useLayoutEffect(() => {
    applyThemeDocumentState(theme, palette);
    localStorage.setItem("theme", theme);
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [theme, palette]);

  /**
   * Documentation for context/ThemeContext.
   * @param {"light"|"dark"} newTheme
   * @param {number} [clickX]
   * @param {number} [clickY]
   */
  function setTheme(newTheme, clickX, clickY) {
    if (newTheme === theme) return;

    /**
     * Commit document-level theme state from the click itself so mobile browser
     * chrome and open menus repaint before any later route/render effect.
     */
    const commitDocumentTheme = () => {
      applyThemeDocumentState(newTheme, palette);
      localStorage.setItem("theme", newTheme);
    };

    if (!canUseAnimatedViewTransitions()) {
      commitDocumentTheme();
      setThemeState(newTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      commitDocumentTheme();
      flushSync(() => setThemeState(newTheme));
    });

    // Circle expanding from the clicked button center
    transition.ready.then(() => {
      const x = clickX ?? window.innerWidth / 2;
      const y = clickY ?? window.innerHeight / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }

  /**
   * Change la palette active si l'identifiant est valide.
   * @param {string} newPalette
   */
  function setPalette(newPalette) {
    if (!isPaletteId(newPalette) || newPalette === palette) return;
    setPaletteState(newPalette);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, palette, setPalette, palettes: COLOR_PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
}
