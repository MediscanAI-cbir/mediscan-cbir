export function getResultsGridScrollTargetY(gridNode, extraOffset = 0) {
  if (!gridNode || typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  const navOffset = window.innerWidth >= 1024 ? 112 : window.innerWidth >= 768 ? 96 : 84;
  const gridTop = gridNode.getBoundingClientRect().top + window.scrollY;
  const visualAlignmentOffset = 26;
  const targetY = gridTop - navOffset - 12 + visualAlignmentOffset + extraOffset;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  return Math.max(0, Math.min(targetY, maxScroll));
}
