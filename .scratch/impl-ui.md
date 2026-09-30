Part of #1

Blocked by: auth PKCE ticket; Prototype redesigned authorize + home in shadcn (#8)

## Implement

Port Authorize and Home to shadcn/Tailwind using prototype reaction from #8 and [design direction](https://github.com/fernandowashimi/bunchify/issues/2):

- Brand-led Authorize; preview-first Home
- Wire BFF + TanStack Query; drop implicit grant / `localStorage` UX
- Color picker choice (keep `react-colorful` or replace) lands here from prototype
- Concrete font faces and tokens from prototype reaction
