/**
 * @fileoverview Mobile browser chrome synchronization for iOS viewport edges.
 * @module hooks/useMobileViewportChrome
 */

import { useLayoutEffect, useRef } from "react";

const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";
const THEME_COLOR_META_SELECTOR = 'meta[name="theme-color"]';
const NAV_BUTTON_COLOR_META_SELECTOR = 'meta[name="msapplication-navbutton-color"]';

/**
 * @param {string} value
 * @returns {boolean}
 */
function isUsableColor(value) {
  const normalized = value?.trim();
  return Boolean(
    normalized &&
      normalized !== "transparent" &&
      normalized !== "rgba(0, 0, 0, 0)"
  );
}

/**
 * Keep meta theme-color values in the most widely accepted runtime format.
 * @param {string} value
 * @returns {string}
 */
function normalizeColorForMeta(value) {
  const normalized = value.trim();
  const srgbMatch = normalized.match(
    /^color\(srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\)$/i
  );

  if (!srgbMatch) return normalized;

  const channels = srgbMatch.slice(1, 4).map((channel) => {
    const value255 = Math.round(Number.parseFloat(channel) * 255);
    return Math.min(255, Math.max(0, value255));
  });
  const alpha = srgbMatch[4] ? Number.parseFloat(srgbMatch[4]) : 1;

  return alpha < 1
    ? `rgba(${channels.join(", ")}, ${alpha})`
    : `rgb(${channels.join(", ")})`;
}

/**
 * @param {string} selector
 * @param {string} name
 * @returns {HTMLMetaElement[]}
 */
function getOrCreateMetas(selector, name) {
  if (typeof document === "undefined") return [];

  const metas = Array.from(document.querySelectorAll(selector));
  if (metas.length > 0) return metas;

  const meta = document.createElement("meta");
  meta.setAttribute("name", name);
  document.head.appendChild(meta);
  return [meta];
}

/**
 * Move the meta node to the end of the head so iOS repaints browser chrome.
 * @param {HTMLMetaElement|null} meta
 */
function reattachMeta(meta) {
  if (meta) {
    document.head.appendChild(meta);
  }
}

/**
 * @param {string} expectedColor
 * @returns {boolean}
 */
function areChromeMetasSynced(expectedColor) {
  const themeColorMetas = Array.from(
    document.querySelectorAll(THEME_COLOR_META_SELECTOR)
  );
  const navButtonMetas = Array.from(
    document.querySelectorAll(NAV_BUTTON_COLOR_META_SELECTOR)
  );
  const metas = [...themeColorMetas, ...navButtonMetas];

  return (
    metas.length > 0 &&
    metas.every((meta) =>
      meta.getAttribute("content") === expectedColor &&
      !meta.hasAttribute("media")
    )
  );
}

/**
 * Read the single mobile edge color painted behind the iOS status area.
 * CSS keeps this color aligned with the home surface in light and dark mode.
 * @param {HTMLElement} shell
 * @returns {string}
 */
function readMobileEdgeColor(shell) {
  const rootBackground = window
    .getComputedStyle(document.documentElement)
    .backgroundColor?.trim();

  if (isUsableColor(rootBackground)) {
    return rootBackground;
  }

  const shellBackground = window.getComputedStyle(shell).backgroundColor?.trim();
  return isUsableColor(shellBackground) ? shellBackground : "";
}

/**
 * Keep iPhone/browser chrome aligned with the shared mobile top edge.
 * Desktop remains owned by ThemeContext.
 * @param {object} params
 * @param {{page: string, searchView: string}} params.route
 * @param {boolean} params.mobileMenuOpen
 * @returns {{shellRef: React.RefObject<HTMLElement|null>, mobilePage: string, mobileSearchView: string}}
 */
export default function useMobileViewportChrome({
  route,
  mobileMenuOpen,
}) {
  const shellRef = useRef(null);
  const mobilePage = route.page;
  const mobileSearchView = route.page === "search" ? route.searchView : "none";

  useLayoutEffect(() => {
    const root = document.documentElement;
    const mobileQuery = window.matchMedia?.(MOBILE_VIEWPORT_QUERY);
    let expectedMetaChromeColor = "";

    root.dataset.mobilePage = mobilePage;
    root.dataset.mobileSearchView = mobileSearchView;
    root.dataset.mobileMenuOpen = mobileMenuOpen ? "true" : "false";
    delete root.dataset.mobileSurface;
    delete root.dataset.mobileFooterChrome;
    delete root.dataset.mobileFooterVisible;
    root.style.removeProperty("--mobile-page-bg");
    root.style.removeProperty("--mobile-root-bg");

    const syncMobileMetaColor = () => {
      if (mobileQuery && !mobileQuery.matches) return;

      const shell = shellRef.current;
      if (!shell) return;

      const mobileChromeColor = readMobileEdgeColor(shell);
      if (!mobileChromeColor) return;

      const metaChromeColor = normalizeColorForMeta(mobileChromeColor);
      expectedMetaChromeColor = metaChromeColor;

      const themeColorMetas = getOrCreateMetas(
        THEME_COLOR_META_SELECTOR,
        "theme-color"
      );
      const navButtonMetas = getOrCreateMetas(
        NAV_BUTTON_COLOR_META_SELECTOR,
        "msapplication-navbutton-color"
      );

      [...themeColorMetas, ...navButtonMetas].forEach((meta) => {
        meta.setAttribute("content", metaChromeColor);
        meta.removeAttribute("media");
        reattachMeta(meta);
      });
    };

    const handleMobileQueryChange = () => {
      syncMobileMetaColor();
    };
    let scheduledFrame = 0;
    const scheduleMobileMetaColorSync = () => {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = window.requestAnimationFrame(syncMobileMetaColor);
    };

    syncMobileMetaColor();
    const syncFrame = window.requestAnimationFrame(syncMobileMetaColor);
    const syncTimeout = window.setTimeout(syncMobileMetaColor, 0);
    const syncLateTimeout = window.setTimeout(syncMobileMetaColor, 120);
    const rootObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(scheduleMobileMetaColorSync)
        : null;
    const metaObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => {
            if (
              expectedMetaChromeColor &&
              !areChromeMetasSynced(expectedMetaChromeColor)
            ) {
              scheduleMobileMetaColorSync();
            }
          })
        : null;

    rootObserver?.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });
    metaObserver?.observe(document.head, {
      attributes: true,
      attributeFilter: ["content", "media", "name"],
      childList: true,
      subtree: true,
    });
    window.addEventListener("resize", scheduleMobileMetaColorSync);

    if (mobileQuery?.addEventListener) {
      mobileQuery.addEventListener("change", handleMobileQueryChange);
    } else {
      mobileQuery?.addListener?.(handleMobileQueryChange);
    }

    return () => {
      window.cancelAnimationFrame(syncFrame);
      window.cancelAnimationFrame(scheduledFrame);
      window.clearTimeout(syncTimeout);
      window.clearTimeout(syncLateTimeout);
      rootObserver?.disconnect();
      metaObserver?.disconnect();
      window.removeEventListener("resize", scheduleMobileMetaColorSync);
      if (mobileQuery?.removeEventListener) {
        mobileQuery.removeEventListener("change", handleMobileQueryChange);
      } else {
        mobileQuery?.removeListener?.(handleMobileQueryChange);
      }
    };
  }, [mobilePage, mobileSearchView, mobileMenuOpen]);

  return {
    shellRef,
    mobilePage,
    mobileSearchView,
  };
}
