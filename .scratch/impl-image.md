Part of #1

Blocked by: auth PKCE ticket

## Implement

Story PNG route per [ADR 0004](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0004-story-image-vercel-og.md):

1. Spike one story template (tracks, short_term) as `@vercel/og` `ImageResponse` at 828×1792 with embedded Roboto Mono + remote images
2. If visual QA passes → rewrite artists + tracks templates; drop Puppeteer/Chromium deps
3. If spike fails → reopen ADR 0004 for `@sparticuz/chromium` escape hatch
