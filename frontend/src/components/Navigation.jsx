import { useContext } from "react";
import { LangContext } from "../context/lang-context";
import LanguageSelector from "./LanguageSelector";

export default function Navigation({ currentPage, onPageChange }) {
  const { t } = useContext(LangContext);

  const mainTabs = [
    { id: "home", label: t.nav.home },
    { id: "search", label: t.nav.scan },
    { id: "how", label: t.nav.features },
    { id: "contact", label: t.nav.contact },
  ];

  return (
    <header className="bg-surface/78 backdrop-blur-xl border-b border-border shadow-sm sticky top-0 z-40 transition-colors duration-300">
      {/* SVG filter: rend le fond blanc du logo transparent en mode nuit */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="remove-white-logo" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                     -1 -1 -1 3 0"
            />
          </filter>
        </defs>
      </svg>

      <div className="max-w-[1400px] mx-auto px-6 py-4 relative flex items-center justify-center min-h-[108px]">
        {/* Logo + Brand */}
        <button
          onClick={() => onPageChange("home")}
          className="hover:opacity-95 transition-opacity cursor-pointer flex-shrink-0 fixed left-4 top-4 z-50"
        >
          <img
            src="/Logo.png"
            alt="MediScan AI"
            className="theme-logo h-[72px] md:h-[84px] w-auto object-contain"
            style={{ display: "block" }}
          />
        </button>

        {/* Main navigation */}
        <nav className="flex gap-1 justify-center flex-wrap rounded-2xl border border-border bg-surface/72 px-2 py-2 shadow-lg backdrop-blur-lg">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onPageChange(tab.id)}
              className={`relative px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 group
                ${currentPage === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-text hover:bg-bg-soft"
                }`}
            >
              {tab.label}
              {/* Underline indicator for active */}
              {currentPage === tab.id && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
              )}
            </button>
          ))}
        </nav>

        {/* Language Selector */}
        <LanguageSelector />
      </div>
    </header>
  );
}
