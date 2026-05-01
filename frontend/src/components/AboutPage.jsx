/**
 * @fileoverview Documentation for components/AboutPage.
 * @module components/AboutPage
 */

import { useContext, useEffect, useState } from "react";
import { LangContext } from "../context/LangContextValue";
import { useTheme } from "../context/useTheme";

function LinkedInMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/**
 * Documentation for components/AboutPage.
 * @param {string} name
 * @returns {string}
 */
function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/**
 * Documentation for components/AboutPage.
 *
 * @component
 * @param {object} props
 * @param {object} props.member
 * @param {string} props.member.name
 * @param {string} [props.member.photo]
 * @param {"visual"|"semantic"} [props.member.color]
 * @returns {JSX.Element}
 */
function TeamAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isVisual = member.color === "visual";

  if (member.photo && !imageFailed) {
    return (
      <img
        src={member.photo}
        alt={member.name}
        className="w-36 h-36 rounded-full object-cover mb-3 flex-shrink-0"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-base mb-3 flex-shrink-0 ${
        isVisual
          ? "bg-visual-pale text-visual"
          : "bg-semantic-pale text-semantic"
      }`}
    >
      {initials(member.name)}
    </div>
  );
}

/**
 * Label de section style "eyebrow" en majuscules.
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
      {children}
    </p>
  );
}

/**
 * Documentation for components/AboutPage.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function AboutPage() {

  const { t } = useContext(LangContext);
  const content = t.about;

  /** Set to true after the first frame to trigger animations. */
  const [ready, setReady] = useState(false);
  /** Active site theme. */
  const { theme } = useTheme();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * Documentation for components/AboutPage.
   * @param {"up"|"left"|"right"} [dir="up"]
   * @returns {string}
  */
  const anim = (dir = "up") =>
    `${
      ready
        ? dir === "left"
          ? "by-image-panel-enter-left"
          : dir === "right"
          ? "by-image-panel-enter-right"
          : "by-image-panel-enter-up"
        : "opacity-0"
    }`;

  const teamMembers = content.team?.members || [];

  return (
    <div className="home-page about-page-surface -mt-20 md:-mt-20">
      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 pt-28 md:pt-32 pb-20">

        {/* ── Hero ── */}
        <div
          className={`mb-10 mt-4 md:mt-6 ${anim("up")}`}
        >
          <p className="home-hero-label mb-1 text-[0.6rem] md:text-[0.72rem] font-semibold uppercase tracking-[0.15em] md:tracking-[0.22em]">
            {content.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-title tracking-tight mb-3 leading-tight">
            {content.headline}
          </h1>
          <div className="w-10 h-0.5 bg-semantic mb-5 rounded" />
          <p className="text-base md:text-lg text-muted max-w-xl leading-relaxed">
            {content.description}
          </p>
        </div>


        {/* ── Mission / Vision ── */}
        <div className="mb-12">
          <SectionLabel>{content.missionVision}</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { data: content.mission },
              { data: content.vision },
            ].map(({ data }, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-border bg-bg overflow-hidden hover:border-text/20 transition-all duration-300 ${
                  i === 0 ? anim("left") : anim("right")
                }`}
              >
                <div className="h-48 overflow-hidden bg-semantic-pale">
                  {data.image ? (
                    <img
                      src={theme === "dark" ? data.image_d : data.image}
                      alt={data.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                      Image à venir
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-title mb-1">{data.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{data.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border my-12 mx-8 md:mx-21" />

        {/* ── Team ── */}
        {teamMembers.length > 0 && (
          <div className="mb-12">
            <SectionLabel>{content.team?.title}</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {teamMembers.map((member, idx) => (
                <a
                  key={idx}
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-6 rounded-2xl border border-border bg-bg flex flex-col items-center text-center hover:border-text/20 transition-all duration-300 ${anim("up")}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <TeamAvatar member={member} />
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {member.linkedin && (
                      <LinkedInMark className="w-4 h-4 flex-shrink-0 text-muted" />
                    )}
                    <h3 className="font-semibold text-title text-[12px] md:text-sm leading-tight whitespace-nowrap">
                      {member.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted">{member.role}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <div className="p-4 rounded-xl border border-border bg-bg flex gap-3 text-sm text-muted leading-relaxed">
          <span>
            <span className="underline font-semibold">{content.disclaimer?.note}</span> {content.disclaimer?.text}
          </span>
        </div>

      </div>
    </div>
  );
}
