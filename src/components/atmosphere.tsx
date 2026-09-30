export function Atmosphere({ children }: { children: React.ReactNode }) {
  return (
    <div className="monument-sky relative min-h-svh overflow-hidden">
      <div className="grid-drift pointer-events-none absolute -inset-[20%]" aria-hidden="true" />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
