Part of #1

Blocked by: scaffold greenfield ticket

## Implement

Auth + Spotify BFF per [ADR 0003](https://github.com/fernandowashimi/bunchify/blob/v2/docs/adr/0003-spotify-pkce-httponly-cookies.md):

- Route Handlers: `/api/auth/login`, `/api/auth/callback`, `/api/auth/logout`
- httpOnly cookies: access + refresh + optional expiry; scope `user-top-read`
- Server Spotify client with refresh on expiry/401
- BFF: `/api/me`, `/api/top` (or equivalent)
- Middleware: unauthenticated `/` → `/authorize`
- Register HTTPS + `127.0.0.1` redirect URIs on the existing Spotify app
