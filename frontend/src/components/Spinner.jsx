/**
 * @fileoverview Composant de chargement animé.
 * @module components/Spinner
 */

/**
 * Affiche un spinner de chargement.
 *
 * @component
 * @param {object} props
 * @param {string} [props.label] - Texte affiché sous (ou à côté de) le spinner.
 * @param {"primary"|"accent"} [props.tone="primary"] - Palette de couleur du spinner.
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Taille du spinner 
 * @param {boolean} [props.inline=false] - Si vrai, affiche le spinner et le label côte à côte (flex-row).
 * @returns {JSX.Element}
 *
 * @example
 * // Spinner de chargement centré avec label
 * <Spinner label="Chargement…" tone="accent" size="lg" />
 *
 * @example
 * // Spinner compact inline
 * <Spinner label="Analyse en cours" size="sm" inline />
 */
export default function Spinner({ label, tone = "primary", size = "md", inline = false }) {
  const sizeClass = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const colorClass =
    tone === "accent"
      ? "border-accent/20 border-t-accent/70"
      : "border-primary/20 border-t-primary/70";

  return (
    <div className={`flex ${inline ? "flex-row" : "flex-col"} items-center gap-3`}>
      <div className={`animate-spin rounded-full border-2 ${sizeClass} ${colorClass}`} />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}
