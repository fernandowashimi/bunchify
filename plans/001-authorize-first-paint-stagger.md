# 001 — Add Authorize first-paint stagger

- **Status**: TODO
- **Commit**: cbf800b
- **Severity**: MEDIUM
- **Category**: Missed opportunities
- **Estimated scope**: 2 files (`globals.css`, `authorize-screen.tsx`), ~40 lines

## Problem

The Authorize screen is the listener’s first brand moment. Brand mark, headline, and CTA mount with no entrance — everything appears at once with no stagger. Rare / first-time surfaces are where the delight budget lives; this one spends none.

```tsx
/* src/components/authorize-screen.tsx:27-66 — current */
<div className="flex flex-col items-center gap-12">
  <img
    src="/Bunchify_Typo_White.svg"
    alt="Bunchify"
    className="h-auto w-[min(36vw,210px)]"
  />
  <p className="font-heading max-w-[14ch] text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.05] font-bold tracking-tight">
    Your Spotify tops, made for Stories.
  </p>
  <div className="flex flex-col items-center gap-4">
    <Button
      nativeButton={false}
      render={<a href="/api/auth/login" />}
      className="h-11 px-7 text-base"
    >
      Connect Spotify
    </Button>
    {/* …legal copy… */}
  </div>
</div>
```

No entrance classes exist for this surface. The only first-arrival pattern in the app is `.story-arrive` on the Home story preview (`src/components/story-frame.tsx:24`, defined in `src/app/globals.css:159-187`).

## Target

Three groups enter on first paint, staggered 40ms apart, using opacity + transform only. Never block interaction (no `pointer-events: none` during the entrance).

```css
/* target — add near .story-arrive in src/app/globals.css */
.auth-enter {
  animation: auth-enter 280ms var(--ease-out) both;
}

.auth-enter-delay-1 {
  animation-delay: 40ms;
}

.auth-enter-delay-2 {
  animation-delay: 80ms;
}

@keyframes auth-enter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes auth-enter-reduced {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-enter {
    animation-name: auth-enter-reduced;
    animation-duration: 180ms;
  }

  .auth-enter-delay-1,
  .auth-enter-delay-2 {
    animation-delay: 0ms;
  }
}
```

Exact values (do not change):

| Token / value | Exact |
| --- | --- |
| Easing | `var(--ease-out)` → already `cubic-bezier(0.23, 1, 0.32, 1)` at `src/app/globals.css:52` |
| Duration | `280ms` |
| Stagger | `0ms` / `40ms` / `80ms` |
| From transform | `translateY(8px) scale(0.98)` — never `scale(0)` |
| Fill mode | `both` so delayed items stay at `from` until their delay (no flash) |
| Reduced motion | opacity-only keyframes, `180ms`, delays zeroed |

Markup target — class names only; keep structure and copy:

```tsx
/* src/components/authorize-screen.tsx — target classes */
<img
  src="/Bunchify_Typo_White.svg"
  alt="Bunchify"
  className="auth-enter h-auto w-[min(36vw,210px)]"
/>
<p className="auth-enter auth-enter-delay-1 font-heading max-w-[14ch] text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.05] font-bold tracking-tight">
  Your Spotify tops, made for Stories.
</p>
<div className="auth-enter auth-enter-delay-2 flex flex-col items-center gap-4">
  {/* Button + legal copy unchanged */}
</div>
```

## Repo conventions to follow

- Motion tokens live in `:root` in `src/app/globals.css` (`--ease-out`, `--ease-in-out`). Reuse them; do not invent a parallel cubic-bezier.
- One-shot entrances use CSS classes + `@keyframes` in `src/app/globals.css`, applied via `className` on the element — exemplar:

```css
/* src/app/globals.css:159-187 — exemplar */
.story-arrive {
  animation: story-spring 420ms cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes story-spring {
  from {
    opacity: 0.65;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

- Prefer `var(--ease-out)` over inlining `cubic-bezier(0.23, 1, 0.32, 1)` for the new class (token already exists; `story-arrive` predates consistent token use).
- Reduced-motion for **this** new entrance must keep a gentle opacity fade. Do **not** copy `.story-arrive { animation: none; }` for `.auth-enter`.
- No new dependencies (no Framer Motion / Motion). Plain CSS only.
- Product personality: playful consumer (Spotify tops → Stories). A short ease-out stagger fits; do not add bounce or spring configs here.

## Steps

1. In `src/app/globals.css`, immediately after the `.story-arrive` / `@keyframes story-spring` block (after line 187), add `.auth-enter`, `.auth-enter-delay-1`, `.auth-enter-delay-2`, `@keyframes auth-enter`, and `@keyframes auth-enter-reduced` exactly as in **Target**.

2. In the same file, extend the existing `@media (prefers-reduced-motion: reduce)` block (currently lines 189–194) so `.auth-enter` switches to `auth-enter-reduced` at `180ms` and both delay classes zero their `animation-delay`. Leave `.grid-drift` and `.story-arrive` rules unchanged inside that block:

```css
@media (prefers-reduced-motion: reduce) {
  .grid-drift,
  .story-arrive {
    animation: none;
  }

  .auth-enter {
    animation-name: auth-enter-reduced;
    animation-duration: 180ms;
  }

  .auth-enter-delay-1,
  .auth-enter-delay-2 {
    animation-delay: 0ms;
  }
}
```

3. In `src/components/authorize-screen.tsx`, add the entrance classes to the three groups only:
   - `img`: prepend `auth-enter` to its `className`
   - headline `p`: prepend `auth-enter auth-enter-delay-1`
   - CTA wrapper `div` (the one with `flex flex-col items-center gap-4`): prepend `auth-enter auth-enter-delay-2`
   Do not wrap in extra elements. Do not animate `<main>`, `<Atmosphere>`, or the outer `gap-12` container.

4. Confirm Connect Spotify remains immediately clickable during the stagger (no overlay, no `pointer-events` changes, no `disabled` on the link button).

## Boundaries

- Do NOT touch `home-screen.tsx`, `story-frame.tsx`, `button.tsx`, toast, toggle-group, or Atmosphere.
- Do NOT change Authorize copy, layout, spacing (`gap-12` / `gap-4`), or Button props.
- Do NOT add JS (`useEffect` mount flags, Framer Motion, WAAPI).
- Do NOT change `.story-arrive` durations, keyframes, or its reduced-motion `animation: none` behavior.
- Do NOT add new npm dependencies.
- Do NOT invent additional stagger steps (e.g. splitting Button vs legal copy) — exactly three groups.
- If the markup at `authorize-screen.tsx:27-66` no longer matches this plan’s excerpts (drift since commit `cbf800b`), STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `pnpm typecheck` — exit 0
  - `pnpm lint` — exit 0 (no new issues in the two touched files)
- **Feel check**:
  1. Open `/authorize` in a cold load (hard refresh). Confirm: logo → headline → CTA+legal, each ~40ms apart, rising slightly (`8px`) and settling with ease-out (fast start, soft landing). Total entrance finishes under ~360ms (`280ms + 80ms` delay).
  2. During the stagger, click **Connect Spotify** as soon as it appears — navigation to `/api/auth/login` must work; nothing should block the hit target.
  3. In DevTools → Animations, set playback to 10%. Confirm three separate `auth-enter` runs with delays `0 / 40ms / 80ms`, properties only `opacity` and `transform`, fill mode `both` (delayed items stay invisible until their turn — no content flash).
  4. Rendering panel → emulate `prefers-reduced-motion: reduce`. Confirm: opacity fade only (no translate/scale), ~180ms, no stagger delay. Atmosphere `grid-drift` still disabled as before.
  5. Reload twice more — entrance should feel the same each cold load; no bounce, no scale from `0`.
- **Done when**: the three groups use the classes above, values match the Target table exactly, reduced-motion is opacity-only, Connect Spotify is clickable throughout, and mechanical checks pass.
