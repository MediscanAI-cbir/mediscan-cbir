export default function StatusBar({ status }) {
  if (!status) return null;

  const isError = status.type === "error";
  const isLoading = status.type === "loading";

  return (
    <div
      className={`flex items-center gap-3 py-3 px-4 my-5 rounded-xl text-sm font-medium border
        ${isError ? "bg-red-500/10 text-red-400 border-red-500/25" : ""}
        ${isLoading ? "bg-primary-pale text-primary border-primary/20" : ""}
      `}
    >
      {isLoading && (
        <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
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
