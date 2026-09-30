# pnpm 10 and the v2 target stack

v2 is a greenfield install under **pnpm 10** (pinned via `packageManager`) on **Node ≥20.9**, not an incremental yarn/Next 10 upgrade. Target at lock time: **Next 16.3.x**, **React 19.3.x**, **Tailwind 4**, **shadcn/ui** via CLI, **TanStack Query** for Home client cache against our BFF. Drop Chakra, Emotion, Mongo, and `yarn.lock`. Pin exact versions when scaffolding; never leave `"next": "latest"` unbound.
