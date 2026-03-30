import { useState } from "react";
import { imageUrl } from "../api";

function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "bg-accent" : pct >= 40 ? "bg-primary" : "bg-border";
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

function ResultCard({ result, onRelaunch, selected, onToggleSelect }) {
  return (
    <div className={`bg-surface border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group backdrop-blur-sm ${selected ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
      <div className="bg-bg border-b border-border relative">
        <img
          src={imageUrl(result.image_id)}
          alt={result.image_id}
          loading="lazy"
          className="w-full aspect-square object-contain"
        />
        <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          #{result.rank}
        </span>
        {onToggleSelect && (
          <button
            onClick={() => onToggleSelect(result.image_id)}
            className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow ${selected ? "bg-primary border-primary" : "bg-surface border-border hover:border-primary"}`}
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
        <p className="text-text text-xs leading-relaxed line-clamp-3">
          {result.caption}
        </p>
        <p className="text-muted text-[10px] mt-1.5 font-mono truncate">{result.image_id}</p>
        <ScoreBar score={result.score} />
        {onRelaunch && (
          <button
            onClick={() => onRelaunch(result.image_id)}
            className="mt-3 w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary hover:text-white transition-all"
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
  const modeLabel = isVisual ? "Visuel (DINOv2)" : "Sémantique (BioMedCLIP)";
  const modeColor = isVisual ? "bg-primary-pale text-primary border-primary/20" : "bg-accent-pale text-accent border-accent/20";

  function handleToggleSelect(imageId) {
    setSelectedIds((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
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
        <div className="mb-4 p-3 bg-primary-pale border border-primary/20 rounded-xl flex items-center justify-between gap-3">
          <span className="text-sm text-primary font-medium">
            {selectedIds.length} images sélectionnées
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleRelaunchMultiple}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all"
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
          />
        ))}
      </div>
    </section>
  );
}