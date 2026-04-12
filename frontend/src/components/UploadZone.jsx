import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { LangContext } from "../context/LangContext";

export default function UploadZone({
  file,
  onFileSelect,
  onRemove,
  isAccent = false,
  useHomeVisualTone = false,
  fillHeight = false,
  enableToneTransition = false,
}) {
  const { t } = useContext(LangContext);
  const content = t.search.image;
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const toneSyncClass = enableToneTransition ? "search-tone-sync" : "";
  const uploadFrameClass = "w-full min-h-[15.5rem] sm:min-h-[17rem] lg:min-h-[20rem]";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const dropZoneColorClass = dragOver
    ? isAccent ? "border-accent bg-accent-pale" : "border-primary bg-primary-pale"
    : isAccent ? "mediscan-accent-surface hover:border-accent/40"
    : useHomeVisualTone ? "mediscan-primary-surface hover:border-primary/40"
    : "border-border hover:border-primary hover:bg-primary-pale/50 bg-surface";

  const iconColorClass = dragOver
    ? isAccent ? "bg-accent-pale text-accent border border-accent/30" : "bg-primary-pale text-primary border border-primary/30"
    : isAccent ? "mediscan-accent-chip border"
    : useHomeVisualTone ? "mediscan-primary-chip border"
    : "bg-primary-pale text-primary";

  function handleOpenFilePicker() {
    inputRef.current?.click();
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  }

  function handleChange(e) {
    if (e.target.files[0]) onFileSelect(e.target.files[0]);
  }

  if (file) {
    return (
      <div className={`mt-4 flex w-full ${fillHeight ? "min-h-0 flex-1 items-stretch" : "items-stretch"}`}>
        <div className={`${enableToneTransition ? "search-tone-transition " : ""}search-upload-preview mediscan-upload-preview-enter relative flex ${uploadFrameClass} flex-col overflow-hidden rounded-2xl border shadow-md ${isAccent ? "mediscan-accent-surface" : useHomeVisualTone ? "mediscan-primary-surface" : "bg-surface border-primary/40"}`}>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-5 sm:px-5">
            <img
              src={previewUrl}
              alt={content.previewAlt}
              className="block h-full max-h-[232px] w-full object-contain mediscan-upload-preview-image sm:max-h-[248px] lg:max-h-[268px]"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className={`${enableToneTransition ? "search-tone-transition " : ""}search-upload-remove absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border text-lg shadow backdrop-blur-sm transition-all cursor-pointer hover:bg-danger hover:text-on-strong ${
              isAccent
                ? "image-search-soft-control image-search-soft-control-accent"
                : useHomeVisualTone
                  ? "image-search-soft-control image-search-soft-control-primary"
                  : "bg-surface/90 text-muted border-border"
            }`}
          >
            &times;
          </button>
          <div
            className={`${enableToneTransition ? "search-tone-transition " : ""}search-upload-meta px-3 py-2 border-t ${
              isAccent
                ? "image-search-file-meta image-search-file-meta-accent"
                : useHomeVisualTone
                  ? "image-search-file-meta image-search-file-meta-primary"
                  : "bg-surface border-border"
            }`}
          >
            <p className={`${toneSyncClass} text-xs text-muted truncate font-mono`}>{file.name}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={content.uploadPrompt}
      onClick={handleOpenFilePicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenFilePicker();
        }
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`${enableToneTransition ? "search-tone-transition " : ""}search-upload-dropzone ${uploadFrameClass} mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center
        ${fillHeight ? "flex-1" : ""}
        ${dropZoneColorClass}`}
    >
      <div className={`${enableToneTransition ? "search-tone-transition " : ""}w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${iconColorClass}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p className={`${toneSyncClass} text-sm text-text font-medium`}>
        {content.uploadPrompt}{" "}
        <span className={`${toneSyncClass} font-semibold underline underline-offset-2 ${isAccent ? "mediscan-accent-text" : useHomeVisualTone ? "mediscan-primary-text" : "text-primary"}`}>
          {content.browseAction}
        </span>
      </p>
      <p className={`${toneSyncClass} text-muted text-[11px] mt-1`}>{content.acceptedFormats}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
