/**
 * @fileoverview Icônes SVG réutilisables représentant les modes de recherche CBIR.
 * @module components/icons
 */


/**
 * Icône représentant le mode de recherche **Visuel** (similarité par descripteurs visuels).
 * Visuellement : deux cercles concentriques.
 *
 * @component
 * @param {object} props
 * @param {string} [props.className="h-4 w-4"] - Classes Tailwind appliquées au SVG.
 * @returns {JSX.Element}
 *
 * @example
 * <VisualModeIcon className="h-6 w-6 text-primary" />
 */
export function VisualModeIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Icône représentant le mode de recherche **Sémantique / Interprétatif**
 *
 * @component
 * @param {object} props
 * @param {string} [props.className="h-4 w-4"] - Classes Tailwind appliquées au SVG.
 * @returns {JSX.Element}
 *
 * @example
 * <InterpretiveModeIcon className="h-6 w-6 text-accent" />
 */
export function InterpretiveModeIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
