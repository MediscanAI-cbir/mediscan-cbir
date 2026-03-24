import { Hospital, Search } from "lucide-react";
import { useState, useContext } from "react";
import { LangContext } from "../context/lang-context";
import UploadZone from "./UploadZone";
import Controls from "./Controls";
import StatusBar from "./StatusBar";
import ResultsGrid from "./ResultsGrid";
import { searchImage } from "../api";

const searchModeIcons = {
  search: Search,
  hospital: Hospital,
};

export default function SearchPage() {
  const { t } = useContext(LangContext);
  const content = t.search;

  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("visual");
  const [k, setK] = useState(5);
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileSelect(f) {
    if (!f.type.match(/^image\/(jpeg|png)$/)) {
      setStatus({ type: "error", message: "Only JPEG and PNG files are accepted." });
      return;
    }
    setFile(f);
    setStatus(null);
  }

  function handleRemove() {
    setFile(null);
    setResults(null);
    setStatus(null);
  }

  async function handleSearch() {
    if (!file) return;
    setLoading(true);
    setStatus({ type: "loading", message: content.searching });
    setResults(null);

    try {
      const data = await searchImage(file, mode, k);
      setResults(data);
      setStatus(null);
    } catch (err) {
      setStatus({ type: "error", message: err.message || content.error });
    } finally {
      setLoading(false);
    }
  }

  // Apply theme colors based on mode
  const themeClass = mode === "visual"
    ? "from-primary-pale to-surface"
    : "from-accent-pale to-surface";

  return (
    <div className={`bg-gradient-to-b ${themeClass} transition-colors duration-300`}>
      {/* Header */}
      <section className="max-w-[1400px] mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-3">{content.headline}</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          {content.description}
        </p>
      </section>

      {/* Search Interface */}
      <div className="max-w-[1400px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload - Left Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm backdrop-blur-sm">
                <h2 className="font-bold text-text mb-1">{content.step1}</h2>
                <p className="text-sm text-muted mb-4">{content.step1Desc}</p>
                <UploadZone file={file} onFileSelect={handleFileSelect} onRemove={handleRemove} />
              </div>
            </div>
          </div>

          {/* Controls & Results - Right */}
          <div className="lg:col-span-2">
            {/* Controls */}
            <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm backdrop-blur-sm mb-6">
              <h2 className="font-bold text-text mb-4">{content.step2}</h2>
              <Controls
                mode={mode}
                onModeChange={setMode}
                k={k}
                onKChange={setK}
                onSearch={handleSearch}
                disabled={!file || loading}
              />
            </div>

            {/* Status */}
            <StatusBar status={status} />

            {/* Results */}
            {results && (
              <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm backdrop-blur-sm">
                <h2 className="font-bold text-text mb-4">{content.step3}</h2>
                <ResultsGrid data={results} />
              </div>
            )}

            {/* Empty State */}
            {!results && !loading && file && (
              <div className="bg-surface rounded-2xl p-12 border border-border shadow-sm backdrop-blur-sm text-center">
                <p className="text-muted">Configure your search and click "{content.search}" to find matching images.</p>
              </div>
            )}

            {!file && !results && (
              <div className="bg-gradient-to-br from-primary-pale to-accent-pale rounded-2xl p-12 border border-primary/20 shadow-sm text-center">
                <div className="flex justify-center mb-4">
                  <Search className="w-10 h-10 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Ready to search?</h3>
                <p className="text-muted">Upload a medical image on the left to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="bg-surface border-t border-border py-16 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-text text-center mb-12">{content.howWorks}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: content.visual.name,
                icon: content.visual.icon,
                desc: content.visual.desc,
                use: content.visual.use,
                color: "primary",
              },
              {
                name: content.semantic.name,
                icon: content.semantic.icon,
                desc: content.semantic.desc,
                use: content.semantic.use,
                color: "accent",
              },
            ].map((mode) => {
              const ModeIcon = searchModeIcons[mode.icon];
              const isBg = mode.color === "primary" ? "from-primary-pale to-surface" : "from-accent-pale to-surface";
              const border = mode.color === "primary" ? "border-primary/20" : "border-accent/20";
              return (
                <div key={mode.name} className={`bg-gradient-to-br ${isBg} border ${border} rounded-2xl p-8`}>
                  <div className="mb-3">
                    {ModeIcon ? <ModeIcon className="w-10 h-10 text-text" strokeWidth={1.8} /> : null}
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-2">{mode.name}</h3>
                  <p className="text-muted mb-4">{mode.desc}</p>
                  <p className="text-sm font-semibold text-text">{mode.use}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className={`${mode === "visual" ? "bg-primary-pale border-primary/20" : "bg-accent-pale border-accent/20"} border-t py-8`}>
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <p className="text-sm text-muted">
            {content.footer}
          </p>
        </div>
      </section>
    </div>
  );
}
