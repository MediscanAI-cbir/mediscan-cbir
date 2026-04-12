import { lazy, Suspense } from "react";
import SearchHubView from "./SearchHubView";
import Spinner from "./Spinner";

const ImageSearchView = lazy(() => import("./ImageSearchView"));
const TextSearchView = lazy(() => import("./TextSearchView"));

function SearchViewLoader() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16">
      <div className="flex min-h-[45vh] items-center justify-center rounded-2xl border border-border bg-surface/70 px-6 py-12 shadow-sm backdrop-blur-sm">
        <Spinner label="Chargement de l’interface…" />
      </div>
    </div>
  );
}

export default function SearchPage({
  view = "hub",
  onSearchViewChange,
  onSearchToneChange,
}) {
  const pageShellClass = view === "hub"
    ? "-mt-16 md:-mt-20 pt-16 md:pt-20"
    : "-mt-16 md:-mt-20";

  const views = {
    hub: (
      <SearchHubView
        onChooseImage={() => onSearchViewChange?.("image")}
        onChooseText={() => onSearchViewChange?.("text")}
        useSharedSurface
      />
    ),
    image: (
      <Suspense fallback={<SearchViewLoader />}>
        <ImageSearchView
          onBack={() => onSearchViewChange?.("hub")}
          onChromeToneChange={onSearchToneChange}
          useSharedSurface
        />
      </Suspense>
    ),
    text: (
      <Suspense fallback={<SearchViewLoader />}>
        <TextSearchView
          onBack={() => onSearchViewChange?.("hub")}
          onChromeToneChange={onSearchToneChange}
        />
      </Suspense>
    ),
  };

  return (
    <div className={`${pageShellClass} relative isolate overflow-x-hidden`}>
      <div className="relative z-10">{views[view] ?? views.hub}</div>
    </div>
  );
}
