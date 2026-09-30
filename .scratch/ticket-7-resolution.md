## Resolution

**Locked v2 architecture** (plan-only; no migration code this session).

### Glossary
Root [`CONTEXT.md`](https://github.com/fernandowashimi/bunchify/blob/v2/CONTEXT.md) adds **Session** and **Top** alongside Authorize / Home / Story / Listener.

### ADRs (on `v2`)
- [0001 Greenfield App Router only](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0001-greenfield-app-router.md)
- [0002 pnpm 10 and the v2 target stack](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0002-pnpm-and-target-stack.md) (Next 16.3.x / React 19.3.x / Tailwind 4 / shadcn / **TanStack Query**)
- [0003 Spotify PKCE with httpOnly cookies and a server BFF](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0003-spotify-pkce-httponly-cookies.md) (cookie shape A; scope `user-top-read`; middleware gate)
- [0004 Story PNGs via `@vercel/og` / Satori](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0004-story-image-vercel-og.md) (Sparticuz escape hatch; spike in implement ticket)

### Ordered implement tickets
1. [Implement: scaffold greenfield App Router + pnpm stack](https://github.com/fernandowashimi/bunchify/issues/9)
2. [Implement: Spotify PKCE httpOnly cookies + server BFF](https://github.com/fernandowashimi/bunchify/issues/10)
3. [Implement: story PNG via `@vercel/og`](https://github.com/fernandowashimi/bunchify/issues/11)
4. [Implement: port authorize + home UI](https://github.com/fernandowashimi/bunchify/issues/12) (also blocked by prototype #8)
5. [Implement: v2 cutover checklist](https://github.com/fernandowashimi/bunchify/issues/13)

### Still deferred (not architecture)
- Font faces / tokens and color-picker choice → [Prototype redesigned authorize + home in shadcn](https://github.com/fernandowashimi/bunchify/issues/8)
