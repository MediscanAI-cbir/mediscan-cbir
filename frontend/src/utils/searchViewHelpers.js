import { getResultCuiSet } from "./searchResults";

export function clearTimeoutRef(timeoutRef) {
  window.clearTimeout(timeoutRef.current);
}

export function getSelectedCaptionFilters(activeFilterIds, availableFilters) {
  return activeFilterIds
    .map((filterId) => availableFilters.find((entry) => entry.id === filterId))
    .filter(Boolean);
}

export function buildAvailableCuiByType(rows, cuiTypes) {
  const found = { modalite: new Set(), anatomie: new Set(), finding: new Set() };

  for (const result of rows) {
    const cuis = getResultCuiSet(result);
    for (const [type, entries] of Object.entries(cuiTypes)) {
      if (!(type in found)) {
        continue;
      }

      for (const { cui } of entries) {
        if (cuis.has(cui)) {
          found[type].add(cui);
        }
      }
    }
  }

  return {
    modalite: cuiTypes.modalite.filter(({ cui }) => found.modalite.has(cui)),
    anatomie: cuiTypes.anatomie.filter(({ cui }) => found.anatomie.has(cui)),
    finding: cuiTypes.finding.filter(({ cui }) => found.finding.has(cui)),
  };
}

export function restartNoteHighlight(setter, timerRef) {
  window.clearTimeout(timerRef.current);
  setter(false);

  requestAnimationFrame(() => {
    setter(true);
    timerRef.current = window.setTimeout(() => {
      setter(false);
    }, 2200);
  });
}

export function getGuideHighlightClasses(isHighlighted, tone = "accent") {
  if (!isHighlighted) {
    return {
      icon: "",
      heading: "",
      chip: "",
      title: "",
      copy: "",
    };
  }

  const suffix = tone === "primary" ? "primary" : "accent";

  return {
    icon: `quick-note-icon-glow-${suffix}`,
    heading: `quick-note-heading-glow-${suffix}`,
    chip: `quick-note-chip-glow-${suffix}`,
    title: `quick-note-title-glow-${suffix}`,
    copy: `quick-note-copy-glow-${suffix}`,
  };
}

export function scrollToInfoSection({
  sectionId,
  eyebrowId,
  scrollTimerRef,
  onComplete,
}) {
  const targetSection = document.getElementById(sectionId);
  const targetEyebrow = eyebrowId ? document.getElementById(eyebrowId) : null;

  if (!targetSection) {
    return;
  }

  const targetNode = targetEyebrow || targetSection;
  const targetTop = targetNode.getBoundingClientRect().top + window.scrollY;
  const topOffset = window.innerWidth >= 1024 ? 78 : window.innerWidth >= 768 ? 72 : 66;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetY = Math.max(0, Math.min(targetTop - topOffset, maxScroll));

  window.clearTimeout(scrollTimerRef.current);

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    window.scrollTo(0, targetY);
    onComplete?.();
    return;
  }

  window.scrollTo({ top: targetY, behavior: "smooth" });
  scrollTimerRef.current = window.setTimeout(() => {
    scrollTimerRef.current = 0;
    onComplete?.();
  }, 760);
}
