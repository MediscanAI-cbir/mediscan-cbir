/**
 * @fileoverview Page À propos présentant le projet MediScan CBIR, l'équipe et l'architecture.
 * @module components/AboutPage
 */

import { useContext, useEffect, useState } from "react";
import { LangContext } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Icône SVG du logo GitHub.
 * @component
 * @param {object} props
 * @param {string} [props.className=""]
 * @returns {JSX.Element}
 */
function GitHubMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 26"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58l-.02-2.04c-3.34.73-4.04-1.41-4.04-1.41A3.18 3.18 0 0 0 3.64 18c-1.09-.75.08-.73.08-.73a2.52 2.52 0 0 1 1.84 1.24 2.57 2.57 0 0 0 3.5 1 2.58 2.58 0 0 1 .77-1.61c-2.66-.3-5.46-1.33-5.46-5.91a4.63 4.63 0 0 1 1.23-3.21 4.3 4.3 0 0 1 .12-3.16s1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23a4.3 4.3 0 0 1 .12 3.16 4.62 4.62 0 0 1 1.23 3.21c0 4.59-2.81 5.61-5.48 5.91a2.9 2.9 0 0 1 .82 2.25l-.01 3.33c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

/**
 * Génère les initiales d'un nom complet (2 premières lettres de chaque mot).
 * @param {string} name - Nom complet.
 * @returns {string} Initiales en majuscules.
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
 * Avatar d'un membre de l'équipe.
 * Affiche la photo si disponible, sinon un cercle avec les initiales.
 *
 * @component
 * @param {object} props
 * @param {object} props.member - Données du membre.
 * @param {string} props.member.name - Nom du membre.
 * @param {string} [props.member.photo] - URL de la photo.
 * @param {"visual"|"semantic"} [props.member.color] - Couleur du fallback d'initiales.
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
 * Label de section en majuscules espacées (style "eyebrow").
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
 * Page À propos du projet MediScan CBIR.
 * 
 * - **Hero** : titre et description du projet.
 * - **Mission / Vision** : deux cartes avec images.
 * - **Architecture** : cartes présentant les outils techniques.
 * - **Pipeline** : liste ordonnée des étapes du pipeline CBIR.
 * - **Stack** : tags des technologies utilisées.
 * - **Équipe** : grille des membres avec avatar et lien GitHub.
 * - **Disclaimer** : mention légale sur l'usage médical.
 * 
 * @component
 * @returns {JSX.Element}
 */
export default function AboutPage() {
  
  const { t } = useContext(LangContext);
  const content = t.about;
  /** Déclenche les animations d'entrée après le premier frame */
  const [ready, setReady] = useState(false);
  /** Thème actif du site "light" ou "dark" */
  const { theme } = useTheme();

    /**
   * Retourne la classe CSS d'animation d'entrée selon la direction et le statut "ready".
   * @param {"up"|"left"|"right"} [dir="up"] - Direction d'entrée.
   * @param {number} [delay=0] - Délai non utilisé.
   * @returns {string}
   */
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const anim = (dir = "up", delay = 0) =>
    `${
      ready
        ? dir === "left"
          ? "by-image-panel-enter-left"
          : dir === "right"
          ? "by-image-panel-enter-right"
          : "by-image-panel-enter-up"
        : "opacity-0"
    }`;

  const pipeline = content.pipeline?.steps || [];
  const archCards = content.architecture?.cards || [];
  const stackItems = content.stack?.items || [];
  const teamMembers = content.team?.members || [];

  return (
    <div className="-mt-20 md:-mt-20">
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
                <div className="aspect-video overflow-hidden bg-semantic-pale">
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
                <div className="p-6">
                  <h3 className="font-semibold text-title mb-2">{data.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{data.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border my-12 mx-8 md:mx-21" />

        {/* ── Architecture ── */}
        <div className="mb-12">
          <SectionLabel>{content.architecture?.title}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {archCards.map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-border bg-bg overflow-hidden hover:border-text/20 transition-all duration-300 ${anim("up")}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-video overflow-hidden bg-visual-pale">
                  {card.image ? (
                    <img
                      src={theme === "dark" ? card.image_d : card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                      Image à venir
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-title mb-2">{card.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pipeline CBIR ── */}
        <div className="mb-12">
          <SectionLabel>{content.pipeline?.title}</SectionLabel>
          <ol className="flex flex-col">
            {pipeline.map((step, i) => (
              <li key={i} className="flex gap-4 items-start pb-6 last:pb-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-semantic-pale text-semantic text-xs font-bold flex items-center justify-center border border-border">
                    {i + 1}
                  </div>
                  {i < pipeline.length - 1 && (
                    <div className="flex-1 w-px bg-border mt-1 min-h-[24px]" />
                  )}
                </div>
                <div className="pt-1">
                  <h4 className="font-semibold text-title text-sm mb-0.5">{step.title}</h4>
                  <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Stack ── */}
        <div className="mb-12">
          <SectionLabel>{content.stack?.title}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {stackItems.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium border border-border rounded-full px-3 py-1 text-muted bg-bg hover:border-text/20 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Team ── */}
        {teamMembers.length > 0 && (
          <div className="mb-12">
            <SectionLabel>{content.team?.title}</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border border-border bg-bg flex flex-col items-center text-center hover:border-text/20 transition-all duration-300 ${anim("up")}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <TeamAvatar member={member} />
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {member.github && (
                      <a 
                        href={member.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group text-muted"
                      >
                        <GitHubMark className="w-4 h-4 md:w-4 md:h-4 group-hover:translate-y-[-2px] transition-transform" />
                      </a>
                    )}
                    
                    <h3 className="font-semibold text-title text-[12px] md:text-sm leading-tight whitespace-nowrap">
                      {member.name}
                    </h3>

                  </div>
                  <p className="text-xs text-muted">{member.role}</p>
                </div>
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