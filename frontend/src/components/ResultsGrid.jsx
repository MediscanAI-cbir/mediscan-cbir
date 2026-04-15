import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowLeftRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPortal } from "react-dom";
import { imageUrl } from "../api";
import { LangContext } from "../context/LangContext";

const DETAIL_MODAL_TRANSITION_MS = 420;
const DETAIL_MODAL_PANEL_TRANSITION_MS = 520;
const DETAIL_MODAL_BACKDROP_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DETAIL_MODAL_PANEL_EASE = "cubic-bezier(0.19, 1, 0.22, 1)";
const COMPARE_MODAL_TRANSITION_MS = 320;
const RESULTS_PER_PAGE = 6;
const BODY_MODAL_LOCK_CLASS = "search-modal-open";
const BODY_MODAL_LOCK_COUNT_ATTR = "data-search-modal-open-count";

function lockGlobalSearchModalUi() {
  if (typeof document === "undefined") return;

  const body = document.body;
  const currentCount = Number.parseInt(body.getAttribute(BODY_MODAL_LOCK_COUNT_ATTR) || "0", 10);
  const nextCount = Number.isNaN(currentCount) ? 1 : currentCount + 1;

  body.setAttribute(BODY_MODAL_LOCK_COUNT_ATTR, String(nextCount));
  body.classList.add(BODY_MODAL_LOCK_CLASS);
}

function unlockGlobalSearchModalUi() {
  if (typeof document === "undefined") return;

  const body = document.body;
  const currentCount = Number.parseInt(body.getAttribute(BODY_MODAL_LOCK_COUNT_ATTR) || "0", 10);
  const nextCount = Number.isNaN(currentCount) ? 0 : Math.max(0, currentCount - 1);

  if (nextCount === 0) {
    body.removeAttribute(BODY_MODAL_LOCK_COUNT_ATTR);
    body.classList.remove(BODY_MODAL_LOCK_CLASS);
    return;
  }

  body.setAttribute(BODY_MODAL_LOCK_COUNT_ATTR, String(nextCount));
}

function getCardClasses(tone, useHomeVisualTone) {
  if (tone === "accent") {
    return {
      shell: "mediscan-accent-surface",
      selected: "mediscan-accent-selected",
      rank: "border mediscan-accent-chip",
      checkbox: "border mediscan-accent-chip",
      checkboxHover: "hover:border-accent/30",
    };
  }
  return {
    shell: useHomeVisualTone ? "mediscan-primary-surface" : "",
    selected: useHomeVisualTone ? "mediscan-primary-selected" : "border-primary/50 ring-1 ring-primary/20",
    rank: useHomeVisualTone ? "border mediscan-primary-chip" : "bg-primary-pale text-primary",
    checkbox: useHomeVisualTone ? "border mediscan-primary-chip" : "bg-primary-pale border-primary/50",
    checkboxHover: useHomeVisualTone ? "hover:border-primary/30" : "hover:border-primary/50",
  };
}

function ScoreBar({ score, tone }) {
  const pct = Math.round(score * 100);
  const color = tone === "accent"
    ? (pct >= 70 ? "bg-accent/70" : pct >= 40 ? "bg-accent/35" : "bg-border")
    : (pct >= 70 ? "bg-primary/70" : pct >= 40 ? "bg-primary/35" : "bg-border");
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-muted font-medium uppercase tracking-wider">Score</span>
        <span className="text-xs font-bold text-text">{pct}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatCuiValue(cui) {
  if (Array.isArray(cui)) {
    return cui.filter(Boolean).join(", ");
  }
  return typeof cui === "string" ? cui.trim() : "";
}

function DetailItem({ label, value, mono = false }) {
  if (!value) return null;

  return (
    <div className="search-modal-panel rounded-[1.3rem] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className={`mt-2 text-sm text-text ${mono ? "font-mono break-all" : "leading-6"}`}>
        {value}
      </p>
    </div>
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function assignExternalRef(externalRef, node) {
  if (!externalRef) return;

  if (typeof externalRef === "function") {
    externalRef(node);
    return;
  }

  externalRef.current = node;
}

function getResultImageSrc(result) {
  return result.path || imageUrl(result.image_id);
}

function ResultDetailsModal({ result, originRect, tone, modeLabel, content, onClose }) {
  const imageSrc = getResultImageSrc(result);
  const cuiValue = formatCuiValue(result.cui);
  const scorePercent = `${Math.round(result.score * 100)}%`;
  const modalRef = useRef(null);
  const closeTimerRef = useRef(null);
  const scrollYRef = useRef(0);
  const openFrameRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);
  const [entryTransform, setEntryTransform] = useState({
    x: 0,
    y: 26,
    scale: 0.965,
  });

  function requestClose() {
    if (closeTimerRef.current) return;
    setIsOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, DETAIL_MODAL_TRANSITION_MS);
  }

  async function handleDownloadImage(event) {
    event.stopPropagation();
    if (downloadPending) return;

    setDownloadPending(true);

    try {
      const response = await fetch(imageSrc);
      if (!response.ok) {
        throw new Error(`Unable to download image (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${result.image_id || "mediscan-image"}.${extension}`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch {
      window.open(imageSrc, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadPending(false);
    }
  }

  useLayoutEffect(() => {
    if (!modalRef.current) return;

    if (!originRect) {
      openFrameRef.current = requestAnimationFrame(() => {
        setIsOpen(true);
      });
      return () => {
        cancelAnimationFrame(openFrameRef.current);
      };
    }

    const targetRect = modalRef.current.getBoundingClientRect();
    const sourceCenterX = originRect.left + (originRect.width / 2);
    const sourceCenterY = originRect.top + (originRect.height / 2);
    const targetCenterX = targetRect.left + (targetRect.width / 2);
    const targetCenterY = targetRect.top + (targetRect.height / 2);
    const sourceScale = Math.min(
      originRect.width / targetRect.width,
      originRect.height / targetRect.height,
    );

    setEntryTransform({
      x: sourceCenterX - targetCenterX,
      y: sourceCenterY - targetCenterY,
      scale: clamp(sourceScale, 0.2, 0.92),
    });

    openFrameRef.current = requestAnimationFrame(() => {
      setIsOpen(true);
    });

    return () => {
      cancelAnimationFrame(openFrameRef.current);
    };
  }, [originRect]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        requestClose();
      }
    }

    scrollYRef.current = window.scrollY;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    lockGlobalSearchModalUi();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      cancelAnimationFrame(openFrameRef.current);
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.overflow = previousBodyStyles.overflow;
      unlockGlobalSearchModalUi();
      window.scrollTo(0, scrollYRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-label={content.detailsTitle}
      onClick={requestClose}
      style={{
        paddingTop: "max(24px, env(safe-area-inset-top))", backgroundColor: isOpen ? "rgba(6, 12, 21, 0.96)" : "rgba(6, 12, 21, 0)",
        transition: `background-color ${DETAIL_MODAL_TRANSITION_MS}ms ${DETAIL_MODAL_BACKDROP_EASE}`,
      }}
    >
      <div
        ref={modalRef}
        className={`search-detail-modal search-detail-modal-${tone} relative flex max-h-[88vh] sm:max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]`}
        onClick={(event) => event.stopPropagation()}
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "translate3d(0px, 0px, 0px) scale(1)"
            : `translate3d(${entryTransform.x}px, ${entryTransform.y}px, 0px) scale(${entryTransform.scale})`,
          transition: `opacity ${DETAIL_MODAL_TRANSITION_MS}ms ${DETAIL_MODAL_PANEL_EASE}, transform ${DETAIL_MODAL_PANEL_TRANSITION_MS}ms ${DETAIL_MODAL_PANEL_EASE}`,
          transformOrigin: "center center",
          willChange: "opacity, transform",
        }}
      >
        <button
          type="button"
          onClick={requestClose}
          className="search-modal-close absolute right-4 top-4 z-55 flex h-10 w-10 items-center justify-center rounded-full transition-all"
          aria-label={content.closeDetails}
        >
          <X className="h-5 w-5" />
        </button>

        <div className={`search-detail-media search-detail-media-${tone} relative flex min-h-[300px] items-center justify-center overflow-hidden p-6 lg:min-h-[72vh] lg:p-8 mt-12 mx-4 mb-4 rounded-[1.35rem] lg:mt-0 lg:mx-0 lg:mb-0 lg:rounded-none`}>
          <img
            src={imageSrc}
            alt={result.caption || result.image_id}
            className="search-detail-image relative z-10 max-h-[68vh] w-full rounded-[1.35rem] object-contain"
          />
        </div>

        <div className="flex max-h-[88vh] sm:max-h-[92vh] flex-col overflow-y-auto px-5 pb-8 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone === "accent" ? "mediscan-accent-chip" : "mediscan-primary-chip border"}`}>
              {modeLabel}
            </span>
            <span className="search-modal-chip inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {content.rankLabel} #{result.rank}
            </span>
          </div>

          <h3 className="mt-5 text-2xl font-bold text-title sm:text-[1.9rem]">
            {content.detailsTitle}
          </h3>
          <p className="mt-2 text-sm font-medium text-muted">
            {result.image_id}
          </p>

          <div className="search-modal-panel mt-5 rounded-[1.25rem] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {content.captionLabel}
            </p>
            <p className="mt-3 text-sm leading-7 text-text sm:text-[0.95rem]">
              {result.caption || content.noCaption}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailItem label={content.scoreLabel} value={scorePercent} />
            <DetailItem label={content.rawScoreLabel} value={result.score.toFixed(4)} mono />
            <DetailItem label={content.identifierLabel} value={result.image_id} mono />
            <DetailItem label={content.cuiLabel} value={cuiValue || content.notAvailable} mono />
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={downloadPending}
              className={`search-detail-download inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                downloadPending ? "cursor-wait opacity-70" : ""
              } ${tone === "accent" ? "text-accent" : "text-primary"}`}
              aria-label={content.downloadImage}
              title={content.downloadImage}
            >
              <ArrowDownToLine className={`h-4.5 w-4.5 ${downloadPending ? "animate-pulse" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ResultCompareModal({ result, comparisonSource, originRect, tone, content, onClose }) {
  const imageSrc = getResultImageSrc(result);
  const cuiValue = formatCuiValue(result.cui);
  const scorePercent = `${Math.round(result.score * 100)}%`;
  const modalRef = useRef(null);
  const closeTimerRef = useRef(null);
  const scrollYRef = useRef(0);
  const openFrameRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [entryTransform, setEntryTransform] = useState({
    x: 0,
    y: 26,
    scale: 0.965,
  });

  function requestClose() {
    if (closeTimerRef.current) return;
    setIsOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, COMPARE_MODAL_TRANSITION_MS);
  }

  useLayoutEffect(() => {
    if (!modalRef.current) return;

    if (!originRect) {
      openFrameRef.current = requestAnimationFrame(() => {
        setIsOpen(true);
      });
      return () => {
        cancelAnimationFrame(openFrameRef.current);
      };
    }

    const targetRect = modalRef.current.getBoundingClientRect();
    const sourceCenterX = originRect.left + (originRect.width / 2);
    const sourceCenterY = originRect.top + (originRect.height / 2);
    const targetCenterX = targetRect.left + (targetRect.width / 2);
    const targetCenterY = targetRect.top + (targetRect.height / 2);
    const sourceScale = Math.min(
      originRect.width / targetRect.width,
      originRect.height / targetRect.height,
    );

    setEntryTransform({
      x: sourceCenterX - targetCenterX,
      y: sourceCenterY - targetCenterY,
      scale: clamp(sourceScale, 0.2, 0.92),
    });

    openFrameRef.current = requestAnimationFrame(() => {
      setIsOpen(true);
    });

    return () => {
      cancelAnimationFrame(openFrameRef.current);
    };
  }, [originRect]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        requestClose();
      }
    }

    scrollYRef.current = window.scrollY;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    lockGlobalSearchModalUi();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      cancelAnimationFrame(openFrameRef.current);
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.overflow = previousBodyStyles.overflow;
      unlockGlobalSearchModalUi();
      window.scrollTo(0, scrollYRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-10 sm:py-6 pb-4 sm:pt-0"
      role="dialog"
      aria-modal="true"
      aria-label={content.compareTitle}
      onClick={requestClose}
      style={{
        backgroundColor: isOpen ? "rgba(6, 12, 21, 0.96)" : "rgba(6, 12, 21, 0)",
        transition: `background-color ${COMPARE_MODAL_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
    >
      <div
        ref={modalRef}
        className={`search-compare-modal search-compare-modal-${tone} relative flex max-h-[88vh] sm:max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.75rem] border`}
        onClick={(event) => event.stopPropagation()}
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "translate3d(0px, 0px, 0px) scale(1)"
            : `translate3d(${entryTransform.x}px, ${entryTransform.y}px, 0px) scale(${entryTransform.scale})`,
          transition: `opacity ${COMPARE_MODAL_TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${COMPARE_MODAL_TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          transformOrigin: "center center",
        }}
      >
        <button
          type="button"
          onClick={requestClose}
          className="search-modal-close absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full transition-all lg:right-4 lg:top-4"
          style={{ top: "env(safe-area-inset-top, 12px)", margin: "8px" }}
          aria-label={content.closeDetails}
        >
          <X className="h-5 w-5" />
        </button>

        <div className={`search-modal-banner search-compare-banner search-compare-banner-${tone} relative px-5 pt-14 pb-4 sm:pt-5 sm:pb-5 sm:px-6 lg:px-8 lg:py-6`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone === "accent" ? "mediscan-accent-chip" : "mediscan-primary-chip border"}`}>
              {content.compareAction}
            </span>
            <span className="search-modal-chip inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {content.rankLabel} #{result.rank}
            </span>
            <span className="search-modal-chip inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {content.scoreLabel} {scorePercent}
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-bold text-title sm:text-[1.9rem]">
            {content.compareTitle}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="search-modal-panel rounded-[1.5rem] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[8px] lg:text-[10px] font-semibold uppercase tracking-[0.18em] ${tone === "accent" ? "mediscan-accent-chip" : "mediscan-primary-chip border"}`}>
                  {content.queryImageLabel}
                </span>
                {comparisonSource.meta && (
                  <span className="max-w-[60%] truncate text-[11px] font-medium text-muted">
                    {comparisonSource.meta}
                  </span>
                )}
              </div>
                <div className={`search-compare-frame search-compare-frame-${tone} relative mt-4 flex min-h-[160px] sm:min-h-[300px] items-center justify-center overflow-hidden rounded-[1.25rem] p-5`}>                <img
                  src={comparisonSource.src}
                  alt={comparisonSource.alt}
                  className="search-detail-image relative z-10 max-h-[58vh] w-full rounded-[1.15rem] object-contain"
                />
              </div>
            </div>

            <div className="search-modal-panel rounded-[1.5rem] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[8px] lg:text-[10px] font-semibold uppercase tracking-[0.18em] ${tone === "accent" ? "mediscan-accent-chip" : "mediscan-primary-chip border"}`}>
                  {content.selectedImageLabel}
                </span>
                <span className="max-w-[60%] truncate text-[11px] font-medium text-muted">
                  {result.image_id}
                </span>
              </div>
              <div className={`search-compare-frame search-compare-frame-${tone} relative mt-4 flex min-h-[300px] items-center justify-center overflow-hidden rounded-[1.25rem] p-5`}>
                <img
                  src={imageSrc}
                  alt={result.caption || result.image_id}
                  className="search-detail-image relative z-10 max-h-[58vh] w-full rounded-[1.15rem] object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="search-modal-chip inline-flex max-w-full items-center rounded-full px-4 py-2 text-[11px] font-medium text-text">
              {content.resultMetadataHint}
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.7fr))]">
            <div className="search-modal-panel rounded-[1.35rem] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                {content.resultCaptionLabel}
              </p>
              <p className="mt-3 text-sm leading-7 text-text">
                {result.caption || content.noCaption}
              </p>
            </div>
            <DetailItem label={content.resultScoreLabel} value={scorePercent} />
            <DetailItem label={content.resultCuiLabel} value={cuiValue || content.notAvailable} mono />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ResultCard({
  result,
  selected,
  onToggleSelect,
  onOpenDetails,
  onOpenCompare,
  content,
  tone,
  entryIndex = 0,
  animateOnMount = false,
  useHomeVisualTone = false,
  comparisonSource = null,
}) {
  const previewRef = useRef(null);
  const directImageSrc = result.path || "";
  const proxiedImageSrc = imageUrl(result.image_id);
  const [currentImageSrc, setCurrentImageSrc] = useState(directImageSrc || proxiedImageSrc);
  const [imageFailed, setImageFailed] = useState(false);
  const c = getCardClasses(tone, useHomeVisualTone);

  function handleImageError() {
    if (!imageFailed && directImageSrc && currentImageSrc !== proxiedImageSrc) {
      setCurrentImageSrc(proxiedImageSrc);
      return;
    }

    setImageFailed(true);
  }

  function handleOpenDetails() {
    const rect = previewRef.current?.getBoundingClientRect();
    if (rect) {
      onOpenDetails(result, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      return;
    }

    onOpenDetails(result, null);
  }

  function handleOpenCompare() {
    if (!onOpenCompare) return;

    const rect = previewRef.current?.getBoundingClientRect();
    if (rect) {
      onOpenCompare(result, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      return;
    }

    onOpenCompare(result, null);
  }

  function handleCardKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleOpenDetails();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenDetails}
      onKeyDown={handleCardKeyDown}
      aria-label={content.openDetails}
      className={`search-result-card bg-surface border rounded-2xl overflow-hidden transition-all group backdrop-blur-sm h-full min-h-[24rem] flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 ${animateOnMount ? "mediscan-results-card-enter" : ""} ${c.shell} ${selected ? c.selected : "border-border"}`}
      style={
        animateOnMount
          ? { animationDelay: `${Math.min(entryIndex * 90, 360)}ms` }
          : undefined
      }
    >
      <div ref={previewRef} className="search-result-preview bg-bg border-b border-border relative h-44 sm:h-56 shrink-0">
        {imageFailed ? (
          <div className="w-full h-full flex items-center justify-center text-[11px] text-muted bg-bg px-4 text-center">
            Image indisponible
          </div>
        ) : (
          <img
            src={currentImageSrc}
            alt={result.image_id}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-full object-contain"
          />
        )}
        <span className={`absolute top-2 left-2 ${c.rank} text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}>
          #{result.rank}
        </span>
        {onToggleSelect && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleSelect(result.image_id);
            }}
            onKeyDown={(event) => event.stopPropagation()}
            className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow ${selected ? `${c.checkbox}` : `bg-surface border-border ${c.checkboxHover}`}`}
          >
            {selected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="p-3.5 flex min-h-0 flex-1 flex-col">
        <p
          className="search-result-caption min-h-0 flex-1 overflow-hidden text-text text-xs leading-relaxed"
          title={result.caption}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
          }}
        >
          {result.caption}
        </p>
        <div className="mt-auto pt-2">
          {comparisonSource && (
            <div className="mb-0.5 flex items-center justify-center">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenCompare();
                }}
                onKeyDown={(event) => event.stopPropagation()}
                className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10px] font-medium text-muted transition-all duration-200 ${
                  tone === "accent"
                    ? "border-accent/14 bg-accent/5 hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                    : "border-primary/14 bg-primary/5 hover:border-primary/28 hover:bg-primary/10 hover:text-primary"
                }`}
                aria-label={content.compareAction}
                title={content.compareAction}
              >
                <ArrowLeftRight className="h-3 w-3" />
                <span>{content.compareAction}</span>
              </button>
            </div>
          )}
          <div className="-mt-1">
            <ScoreBar score={result.score} tone={tone} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  content,
  tone,
  useHomeVisualTone = false,
  showPageSummary = true,
}) {
  const isSinglePage = totalPages <= 1;
  const inactiveButtonClass = tone === "accent"
    ? "mediscan-accent-outline-button"
    : useHomeVisualTone
      ? "mediscan-primary-outline-button"
      : "border-primary/20 bg-primary/6 text-primary hover:border-primary/28 hover:bg-primary/10";
  const activeButtonClass = tone === "accent"
    ? "mediscan-accent-chip shadow-sm"
    : useHomeVisualTone
      ? "mediscan-primary-chip shadow-sm"
      : "border border-primary/20 bg-primary-pale text-primary shadow-sm";
  const pageTokens = (() => {
    if (totalPages <= 8) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const tokens = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) tokens.push("ellipsis-left");
    for (let page = start; page <= end; page += 1) {
      tokens.push(page);
    }
    if (end < totalPages - 1) tokens.push("ellipsis-right");

    tokens.push(totalPages);
    return tokens;
  })();

  return (
    <nav
      className="inline-flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center"
      aria-label={content.paginationLabel}
    >
      {showPageSummary ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {content.pageLabel} {currentPage} / {totalPages}
        </p>
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}

      <div className="flex max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={content.previousPage}
          title={content.previousPage}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${inactiveButtonClass}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageTokens.map((token) => {
          if (typeof token !== "number") {
            return (
              <span
                key={token}
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center text-xs font-bold text-muted"
              >
                ...
              </span>
            );
          }

          const isActive = token === currentPage;
          const isDisabled = isSinglePage;

          return (
            <button
              type="button"
              key={token}
              onClick={() => onPageChange(token)}
              disabled={isDisabled}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                isActive ? activeButtonClass : inactiveButtonClass
              } ${
                isDisabled ? "cursor-default opacity-65" : ""
              }`}
            >
              {token}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={content.nextPage}
          title={content.nextPage}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${inactiveButtonClass}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export default function ResultsGrid({
  data,
  useHomeVisualTone = false,
  className = "mt-8",
  headerHiddenOnDesktop = false,
  animateOnMount = false,
  selectedIds: controlledSelectedIds,
  onSelectedIdsChange,
  comparisonSource = null,
  cardsGridExternalRef = null,
  desktopLockedHeightClass = "",
  desktopThreeColumns = false,
  onExportJson = null,
  onExportCsv = null,
  onExportPdf = null,
}) {
  const { t } = useContext(LangContext);
  const content = t.search.results;
  const exportLabel = t.search.filters.export;
  const [localSelectedIds, setLocalSelectedIds] = useState([]);
  const [detailState, setDetailState] = useState(null);
  const [compareState, setCompareState] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeExport, setActiveExport] = useState(null);
  const sectionRef = useRef(null);
  const cardsGridRef = useRef(null);
  const resultRows = data?.results ?? [];
  const dataMode = data?.mode ?? null;
  const supportsSelectionSearch = typeof data?.onRelaunchMultiple === "function";
  const isSelectionControlled = Array.isArray(controlledSelectedIds) && typeof onSelectedIdsChange === "function";
  const selectedIds = isSelectionControlled ? controlledSelectedIds : localSelectedIds;
  const isVisual = dataMode === "visual";
  const tone = isVisual ? "primary" : "accent";
  const useHomePrimaryTone = useHomeVisualTone && isVisual;

  const modeLabel = isVisual
    ? content.visualMode
    : dataMode === "text"
      ? content.textMode
      : content.semanticMode;
  const modeColor = isVisual
    ? useHomePrimaryTone ? "border mediscan-primary-chip" : "bg-primary-pale text-primary border-primary/20"
    : "border mediscan-accent-chip";
  const exportDisabled = resultRows.length === 0 || Boolean(activeExport);
  const exportButtonClass = tone === "accent"
    ? "mediscan-accent-outline-button"
    : useHomePrimaryTone
      ? "mediscan-primary-outline-button"
      : "border-primary/20 bg-primary/6 text-primary hover:border-primary/28 hover:bg-primary/10";
  const totalPages = Math.max(1, Math.ceil(resultRows.length / RESULTS_PER_PAGE));
  const pageStartIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const paginatedResults = resultRows.slice(pageStartIndex, pageStartIndex + RESULTS_PER_PAGE);
  const desktopPlaceholderCount = Math.max(0, RESULTS_PER_PAGE - paginatedResults.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [resultRows, dataMode]);

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  if (!data) return null;

  function updateSelectedIds(updater) {
    if (isSelectionControlled) {
      const nextSelectedIds = typeof updater === "function" ? updater(controlledSelectedIds) : updater;
      onSelectedIdsChange(nextSelectedIds);
      return;
    }

    setLocalSelectedIds(updater);
  }

  function handleToggleSelect(imageId) {
    updateSelectedIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  }

  function handleOpenDetails(result, originRect) {
    setDetailState({ result, originRect });
  }

  function handleOpenCompare(result, originRect) {
    if (!comparisonSource?.src) return;
    setCompareState({ result, originRect });
  }

  function handlePageChange(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    if (safePage === currentPage) return;

    setCurrentPage(safePage);
  }

  function handleCardsGridRef(node) {
    cardsGridRef.current = node;
    assignExternalRef(cardsGridExternalRef, node);
  }

  async function handleExportClick(format, exportAction) {
    if (!exportAction || activeExport) return;

    setActiveExport(format);
    try {
      await Promise.resolve(exportAction());
    } finally {
      setActiveExport(null);
    }
  }

  return (
    <section
      ref={sectionRef}
      className={`${className} ${animateOnMount ? "mediscan-results-stage-enter" : ""} ${desktopLockedHeightClass ? `lg:flex lg:flex-col ${desktopLockedHeightClass}` : ""}`}
    >
      <div className={`flex justify-between items-center mb-4 flex-wrap gap-3 ${headerHiddenOnDesktop ? "lg:hidden" : ""}`}>
        <h2 className="text-lg font-bold text-title">
          {resultRows.length}{" "}
          {resultRows.length > 1 ? content.resultsFoundPlural : content.resultsFoundSingular}
        </h2>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${modeColor}`}>
          {modeLabel}
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          content={content}
          tone={tone}
          useHomeVisualTone={useHomePrimaryTone}
        />

        <div className="flex max-w-full flex-wrap items-center gap-2 md:justify-end md:pl-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {exportLabel}
          </span>
          <button
            type="button"
            onClick={() => handleExportClick("json", onExportJson)}
            disabled={exportDisabled || !onExportJson}
            className={`inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-45 ${exportButtonClass}`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => handleExportClick("csv", onExportCsv)}
            disabled={exportDisabled || !onExportCsv}
            className={`inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-45 ${exportButtonClass}`}
          >
            CSV
          </button>
          <button
            type="button"
            onClick={() => handleExportClick("pdf", onExportPdf)}
            disabled={exportDisabled || !onExportPdf}
            className={`inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-45 ${exportButtonClass}`}
          >
            {activeExport === "pdf" ? "PDF..." : "PDF"}
          </button>
        </div>
      </div>

      <div
        ref={handleCardsGridRef}
        className={`mb-8 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 ${desktopThreeColumns ? "lg:grid-cols-3" : "xl:grid-cols-3"} ${desktopLockedHeightClass ? "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1" : "lg:min-h-[49rem]"}`}
      >
        {paginatedResults.map((r, index) => (
          <ResultCard
            key={r.image_id}
            result={r}
            selected={selectedIds.includes(r.image_id)}
            onToggleSelect={supportsSelectionSearch ? handleToggleSelect : null}
            onOpenDetails={handleOpenDetails}
            onOpenCompare={comparisonSource?.src ? handleOpenCompare : null}
            content={content}
            tone={tone}
            entryIndex={index}
            animateOnMount={animateOnMount}
            useHomeVisualTone={useHomePrimaryTone}
            comparisonSource={comparisonSource}
          />
        ))}
        {Array.from({ length: desktopPlaceholderCount }, (_, index) => (
          <div
            key={`desktop-placeholder-${index}`}
            aria-hidden="true"
            className="hidden lg:block min-h-[24rem] rounded-2xl border border-transparent opacity-0 pointer-events-none"
          />
        ))}
      </div>

      {detailState && (
        <ResultDetailsModal
          result={detailState.result}
          originRect={detailState.originRect}
          tone={tone}
          modeLabel={modeLabel}
          content={content}
          onClose={() => setDetailState(null)}
        />
      )}

      {compareState && comparisonSource?.src && (
        <ResultCompareModal
          result={compareState.result}
          comparisonSource={comparisonSource}
          originRect={compareState.originRect}
          tone={tone}
          content={content}
          onClose={() => setCompareState(null)}
        />
      )}
    </section>
  );
}
