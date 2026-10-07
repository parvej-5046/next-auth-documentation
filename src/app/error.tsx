"use client";

export default function RouteError({ retry }: { retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-md border border-border px-3 py-2 text-sm hover:bg-border"
      >
        Try again
      </button>
    </main>
  );
}
