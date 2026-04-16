// src/components/FeaturesPage.jsx
import { useContext, useEffect, useState } from "react";
import { LangContext } from "../context/LangContext";

const FEATURE_ICONS = {
  speed: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  intelligence: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  multimodal: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  secure: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  analytics: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  api: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

const ICON_KEYS = Object.keys(FEATURE_ICONS);

export default function FeaturesPage() {
  const { t } = useContext(LangContext);
  const content = t.features;
  const featureList = content?.list ?? [];
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="bg-transparent py-16">

      {/* Hero */}
      <section
        className={`page-container text-center mb-16 ${ready ? "by-image-panel-enter-up" : "opacity-0"}`}
        style={{ animationDelay: "0ms" }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-title mb-4">
          {content?.headline ?? "Features"}
        </h1>
        {content?.description && (
          <p className="text-muted max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            {content.description}
          </p>
        )}
      </section>

      {/* Feature cards grid */}
      <section className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feature, i) => (
            <div
              key={i}
              className={`bg-surface border border-border rounded-2xl p-8 flex flex-col gap-4
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm
                ${ready ? "by-image-panel-enter-up" : "opacity-0"}`}
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              {/* Icône */}
              <div className="w-12 h-12 rounded-xl bg-primary-pale text-primary flex items-center justify-center flex-shrink-0">
                {FEATURE_ICONS[ICON_KEYS[i % ICON_KEYS.length]]}
              </div>

              {/* Contenu */}
              <div>
                <h3 className="text-lg font-bold text-title mb-2">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
