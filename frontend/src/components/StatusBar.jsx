/**
 * @fileoverview Composant de barre de statut pour les états de chargement et d'erreur.
 * @module components/StatusBar
 */

/**
 * Affiche une barre de statut contextuelle (chargement ou erreur).
 * Retourne "null" si aucun statut n'est fourni.
 *
 * @component
 * @param {object} props
 * @param {Status|null} props.status - Objet décrivant l'état courant. Null = composant non rendu.
 * @param {"primary"|"accent"} [props.tone="primary"] - Palette de couleur pour l'état de chargement.
 * @param {boolean} [props.useHomeVisualTone=false] - Utilise le thème visuel de la page d'accueil (primary).
 * @param {boolean} [props.enableToneTransition=false] - Active les transitions CSS de changement de ton.
 * @returns {JSX.Element|null}
 *
 * @example
 * // Barre d'erreur
 * <StatusBar status={{ type: "error", message: "Une erreur est survenue." }} />
 *
 * @example
 * // Barre de chargement avec ton accent
 * <StatusBar status={{ type: "loading", message: "Recherche en cours…" }} tone="accent" />
 */
export default function StatusBar({
  status,
  tone = "primary",
  useHomeVisualTone = false,
  enableToneTransition = false,
}) {
  if (!status) return null;

  const isError = status.type === "error";
  const isLoading = status.type === "loading";

  const isAccent = tone === "accent";
  const useHomePrimaryTone = useHomeVisualTone && !isAccent;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`${enableToneTransition ? "search-tone-transition " : ""}search-status flex items-center gap-3 py-3 px-4 my-5 rounded-xl text-sm font-medium border
        ${isError ? "bg-red-500/10 text-red-400 border-red-500/25" : ""}
        ${isLoading && !isAccent ? useHomePrimaryTone ? "mediscan-primary-surface mediscan-primary-text" : "bg-primary-pale text-primary border-primary/20" : ""}
        ${isLoading && isAccent ? "mediscan-accent-surface mediscan-accent-text" : ""}
      `}
    >
      {isLoading && (
        <span className={`inline-block w-4 h-4 border-2 rounded-full animate-spin shrink-0
          ${!isAccent ? "search-status-spinner-primary" : ""}
          ${isAccent ? "border-accent/30 border-t-accent" : "border-primary/30 border-t-primary"}`}
        />
      )}
      {isError && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {status.message}
    </div>
  );
}
