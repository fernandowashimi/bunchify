## Destination

A locked v2 migration plan: root `CONTEXT.md`, ADRs for hard choices, and an ordered set of implement tickets. Wayfinder sessions decide and document; they do **not** ship the migration code.

## Notes

- **Domain**: Bunchify — Spotify top artists/tracks → shareable story PNGs
- **Skills**: grilling, domain-modeling, research, prototype, codebase-design
- **Mode**: plan-only — produce decisions/docs/tickets, not the migration implementation
- **Product**: same Bunchify (authorize → home → story PNG); pages get a visual/UX redesign, not new IA
- **Host**: Vercel; keep existing Spotify app; clean break OK on internal routes/APIs
- **Auth**: Authorization Code + PKCE; session in httpOnly cookies (shape A); server-only Spotify BFF; TanStack Query on Home
- **Data**: drop Mongo (unused)
- **UI**: shadcn/ui + Tailwind; **Monument** visual system locked on [Prototype redesigned authorize + home in shadcn](https://github.com/fernandowashimi/bunchify/issues/8) (Syne + DM Sans; chrome-less authorize; preview-first home; faded drifting grid; trust line + Spotify Privacy Policy link); implement from `prototypes/v2-pages/`
- **App shape**: greenfield `src/app/` (no dual Pages/App Router) — ADR 0001
- **Packages**: pnpm 10; Next 16.3.x / React 19.3.x / Tailwind 4 — ADR 0002
- **Image PNG**: `@vercel/og` / Satori — ADR 0004
- **Architecture-review output**: done on [Review and lock v2 architecture](https://github.com/fernandowashimi/bunchify/issues/7); docs on branch `v2`

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Research Next.js latest greenfield App Router for this app](https://github.com/fernandowashimi/bunchify/issues/5): greenfield `src/app/` = root layout + `/` + `/authorize` Client pages + `api/image` Route Handler; replace `_app`/`_document`/`next/head`/`getStaticProps`/Pages API/`next/router` — [docs/research/next-app-router-greenfield.md](https://github.com/fernandowashimi/bunchify/blob/research/next-app-router-greenfield/docs/research/next-app-router-greenfield.md)
- [Research Spotify PKCE + httpOnly cookies on App Router](https://github.com/fernandowashimi/bunchify/issues/4): PKCE via App Router login/callback Route Handlers; httpOnly cookies for verifier/state + access/refresh; scope `user-top-read`; HTTPS/`127.0.0.1` callbacks on existing Spotify app; server-only Spotify calls — [docs/research/spotify-pkce-cookies.md](https://github.com/fernandowashimi/bunchify/blob/research/spotify-pkce-cookies/docs/research/spotify-pkce-cookies.md)
- [Research pnpm + dependency upgrade path from Next 10 / React 17 / Chakra](https://github.com/fernandowashimi/bunchify/issues/6): greenfield Next 16.3 + React 19.3 + Tailwind 4 + shadcn under pnpm 10/12; drop Chakra/Emotion/Mongo; do not incremental-upgrade from yarn/Next 10 — [docs/research/pnpm-upgrade-path.md](https://github.com/fernandowashimi/bunchify/blob/research/pnpm-upgrade-path/docs/research/pnpm-upgrade-path.md)
- [Research story image renderer on Vercel](https://github.com/fernandowashimi/bunchify/issues/3): prefer `@vercel/og`/Satori for 828×1792 stories; Sparticuz Chromium as fidelity escape hatch; drop `chrome-aws-lambda` — [docs/research/story-image-renderer.md](https://github.com/fernandowashimi/bunchify/blob/research/story-image-renderer/docs/research/story-image-renderer.md)
- [Grill Bunchify v2 design direction](https://github.com/fernandowashimi/bunchify/issues/2): evolve magenta `#EE1F9D` + lime (lime story-default only); dark social-share UI; geometric grotesque display + readable sans (mono on story); brand-led chrome-less authorize; preview-first home; keep marks; contained-playful motion
- [Review and lock v2 architecture](https://github.com/fernandowashimi/bunchify/issues/7): CONTEXT Session/Top + ADRs 0001–0004 on `v2`; implement order scaffold → auth BFF → `@vercel/og` → port UI (after prototype) → cutover; TanStack Query not SWR — [CONTEXT](https://github.com/fernandowashimi/bunchify/blob/v2/CONTEXT.md), [ADRs](https://github.com/fernandowashimi/bunchify/tree/v2/docs/adr), [#9](https://github.com/fernandowashimi/bunchify/issues/9)–[#13](https://github.com/fernandowashimi/bunchify/issues/13)
- [Prototype redesigned authorize + home in shadcn](https://github.com/fernandowashimi/bunchify/issues/8): **Monument** wins — Syne + DM Sans; sparse chrome-less authorize; preview-first home with control dock; faded drifting grid texture; trust line with Spotify account + Privacy Policy links; asset `prototypes/v2-pages/`

## Not yet specified

- Whether `react-colorful` stays or is replaced (decide on UI port)

## Out of scope

- New product screens/features beyond authorize + home
- Reviving Mongo logging
- Keeping implicit grant / `localStorage` tokens
- Dual-router coexistence
- Production cutover/release ops as a wayfinder decision (cutover is an implement ticket; destination was the plan)
- Logo/wordmark redesign (keep existing SVGs; evolve layout/color/type around them)
- Authorize “how it works” card section (hero + CTA + short privacy line only)

## Tickets

- [x] [Grill Bunchify v2 design direction](https://github.com/fernandowashimi/bunchify/issues/2)
- [x] [Research story image renderer on Vercel](https://github.com/fernandowashimi/bunchify/issues/3)
- [x] [Research Spotify PKCE + httpOnly cookies on App Router](https://github.com/fernandowashimi/bunchify/issues/4)
- [x] [Research Next.js latest greenfield App Router for this app](https://github.com/fernandowashimi/bunchify/issues/5)
- [x] [Research pnpm + dependency upgrade path from Next 10 / React 17 / Chakra](https://github.com/fernandowashimi/bunchify/issues/6)
- [x] [Review and lock v2 architecture](https://github.com/fernandowashimi/bunchify/issues/7)
- [x] [Prototype redesigned authorize + home in shadcn](https://github.com/fernandowashimi/bunchify/issues/8)

### Implement (handoff; not wayfinder decision tickets)

- [ ] [Implement: scaffold greenfield App Router + pnpm stack](https://github.com/fernandowashimi/bunchify/issues/9)
- [ ] [Implement: Spotify PKCE httpOnly cookies + server BFF](https://github.com/fernandowashimi/bunchify/issues/10) (blocked by #9)
- [ ] [Implement: story PNG via `@vercel/og`](https://github.com/fernandowashimi/bunchify/issues/11) (blocked by #10)
- [ ] [Implement: port authorize + home UI](https://github.com/fernandowashimi/bunchify/issues/12) (blocked by #10 + #8)
- [ ] [Implement: v2 cutover checklist](https://github.com/fernandowashimi/bunchify/issues/13) (blocked by #11 + #12)
