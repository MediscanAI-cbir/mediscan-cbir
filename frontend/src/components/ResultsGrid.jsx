import { useState } from "react";
import { imageUrl } from "../api";

function ScoreBar({ score, tone }) {
  const pct = Math.round(score * 100);
  const color = tone === "accent"
    ? (pct >= 70 ? "bg-accent" : pct >= 40 ? "bg-accent/50" : "bg-border")
    : (pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-primary/50" : "bg-border");
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

function ResultCard({ result, onRelaunch, selected, onToggleSelect, tone }) {
  const c = tone === "accent" ? {
    selected: "border-accent ring-2 ring-accent/30",
    rank: "bg-accent",
    checkbox: "bg-accent border-accent",
    checkboxHover: "hover:border-accent",
    relaunch: "border-accent/40 text-accent hover:bg-accent hover:text-white",
  } : {
    selected: "border-primary ring-2 ring-primary/30",
    rank: "bg-primary",
    checkbox: "bg-primary border-primary",
    checkboxHover: "hover:border-primary",
    relaunch: "border-primary/40 text-primary hover:bg-primary hover:text-white",
  };

  return (
    <div className={`bg-surface border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group backdrop-blur-sm ${selected ? c.selected : "border-border"}`}>
      <div className="bg-bg border-b border-border relative">
        <img
          src={imageUrl(result.image_id)}
          alt={result.image_id}
          loading="lazy"
          className="w-full aspect-square object-contain"
        />
        <span className={`absolute top-2 left-2 ${c.rank} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow`}>
          #{result.rank}
        </span>
        {onToggleSelect && (
          <button
            onClick={() => onToggleSelect(result.image_id)}
            className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow ${selected ? `${c.checkbox}` : `bg-surface border-border ${c.checkboxHover}`}`}
          >
            {selected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-text text-xs leading-relaxed line-clamp-3">{result.caption}</p>
        <p className="text-muted text-[10px] mt-1.5 font-mono truncate">{result.image_id}</p>
        <ScoreBar score={result.score} tone={tone} />
        {onRelaunch && (
          <button
            onClick={() => onRelaunch(result.image_id)}
            className={`mt-3 w-full text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${c.relaunch}`}
          >
            Rechercher depuis cette image
          </button>
        )}
      </div>
    </div>
  );
}

export default function ResultsGrid({ data }) {
  const [selectedIds, setSelectedIds] = useState([]);

  if (!data) return null;

  const isVisual = data.mode === "visual";
  const tone = isVisual ? "primary" : "accent";

  const modeLabel = isVisual ? "Visuel (DINOv2)" : data.mode === "text" ? "Texte (BioMedCLIP)" : "Sémantique (BioMedCLIP)";
  const modeColor = isVisual
    ? "bg-primary-pale text-primary border-primary/20"
    : "bg-accent-pale text-accent border-accent/20";

  const selectionBg = isVisual
    ? "bg-primary-pale border-primary/20"
    : "bg-accent-pale border-accent/20";
  const selectionText = isVisual ? "text-primary" : "text-accent";
  const selectionBtnBorder = isVisual ? "border-primary/30 text-primary hover:bg-primary/10" : "border-accent/30 text-accent hover:bg-accent/10";
  const selectionBtnPrimary = isVisual ? "bg-primary hover:bg-primary/90" : "bg-accent hover:bg-accent/90";

  function handleToggleSelect(imageId) {
    setSelectedIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  }

  function handleRelaunchMultiple() {
    if (selectedIds.length >= 2 && data.onRelaunchMultiple) {
      data.onRelaunchMultiple(selectedIds);
      setSelectedIds([]);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-text">
          {data.results.length} résultat{data.results.length > 1 ? "s" : ""} trouvé{data.results.length > 1 ? "s" : ""}
        </h2>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${modeColor}`}>
          {modeLabel}
        </span>
      </div>

      {selectedIds.length >= 2 && (
        <div className={`mb-4 p-3 border rounded-xl flex items-center justify-between gap-3 ${selectionBg}`}>
          <span className={`text-sm font-medium ${selectionText}`}>
            {selectedIds.length} images sélectionnées
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${selectionBtnBorder}`}
            >
              Annuler
            </button>
            <button
              onClick={handleRelaunchMultiple}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all ${selectionBtnPrimary}`}
            >
              Rechercher depuis la sélection
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {data.results.map((r) => (
          <ResultCard
            key={r.image_id}
            result={r}
            onRelaunch={data.onRelaunch}
            selected={selectedIds.includes(r.image_id)}
            onToggleSelect={handleToggleSelect}
            tone={tone}
          />
        ))}
      </div>
    </section>
  );
}
