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
    { id: "about", label: t.nav.aboutUs },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-transparent">
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

      <div className="max-w-[1400px] mx-auto px-[3vw] flex items-center justify-between h-16 md:h-20">
        
        {/* Logo */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => onPageChange("home")}
            className="hover:opacity-95 transition-opacity cursor-pointer"
          >
            <img
              src="/logo.svg"
              alt="MediScan AI"
              className="h-[clamp(40px,14vw,64px)] w-auto object-contain"
            />
          </button>
        </div>

        {/* NAVBAR FLOTTANTE */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-[0.5vw] rounded-2xl border border-border bg-surface/70 px-[1vw] py-1.5 shadow-lg backdrop-blur-lg">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onPageChange(tab.id)}
                className={`relative px-[clamp(0.5rem,1.5vw,1.25rem)] py-1.5 text-[clamp(11px,1.2vw,14px)] font-medium rounded-lg transition-all duration-200 whitespace-nowrap
                  ${
                    currentPage === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-text hover:bg-bg-soft"
                  }`}
              >
                {tab.label}
                {currentPage === tab.id && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="flex-1 flex justify-end">
          <div className="scale-[clamp(0.8,1vw,1)] origin-right">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}