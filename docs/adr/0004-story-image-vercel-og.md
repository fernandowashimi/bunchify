# Story PNGs via @vercel/og / Satori

Story generation uses **`@vercel/og` (Satori → PNG)** at **828×1792**, not `chrome-aws-lambda` or a default Chromium path. Templates become JSX with embedded fonts (Roboto Mono on the story); remote Spotify images stay runtime fetches. **`@sparticuz/chromium` + `puppeteer-core`** remains the documented escape hatch if a visual spike fails Satori fidelity or needs unsupported CSS. The first image implement step is that spike; reopen this ADR only if the escape hatch is chosen.
