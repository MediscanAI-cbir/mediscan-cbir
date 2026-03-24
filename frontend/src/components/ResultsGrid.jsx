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

function ResultCard({ result }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group backdrop-blur-sm">
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
      </div>
      <div className="p-3.5">
        <p className="text-text text-xs leading-relaxed line-clamp-3">
          {result.caption}
        </p>
        <p className="text-muted text-[10px] mt-1.5 font-mono truncate">{result.image_id}</p>
        <ScoreBar score={result.score} />
      </div>
    </div>
  );
}

export default function ResultsGrid({ data }) {
  if (!data) return null;

  const isVisual = data.mode === "visual";
  const modeLabel = isVisual ? "Visuel (DINOv2)" : "Sémantique (BioMedCLIP)";
  const modeColor = isVisual ? "bg-primary-pale text-primary border-primary/20" : "bg-accent-pale text-accent border-accent/20";

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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {data.results.map((r) => (
          <ResultCard key={r.image_id} result={r} />
        ))}
      </div>
    </section>
  );
}
