Part of #1

Blocked by: none (first implement ticket)

## Implement

Scaffold greenfield Bunchify v2 per [ADR 0001](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0001-greenfield-app-router.md) and [ADR 0002](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0002-pnpm-and-target-stack.md):

- Node ≥20.9, pnpm 10 (`packageManager`), Next 16.3.x / React 19.3.x / Tailwind 4 / shadcn CLI / TanStack Query
- `src/app/` only (root layout, `/`, `/authorize` stubs)
- Delete yarn lock, Chakra, Emotion, Mongo, and `src/pages`

Do not port product UI or auth yet.
