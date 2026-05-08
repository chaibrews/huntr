export default function FullPageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <img src="/huntr-logo.svg" alt="" className="w-10" />
          <span className="text-3xl font-medium tracking-wide text-foreground">
            hunt<span className="text-primary-darker">R</span>.
          </span>
        </div>
        <div
          className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary-darker animate-spin"
          aria-label="Loading"
        />
      </div>
    </div>
  );
}
