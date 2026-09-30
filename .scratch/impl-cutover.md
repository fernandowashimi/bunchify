Part of #1

Blocked by: story image ticket; port authorize + home ticket

## Implement

Production cutover checklist after product paths work on App Router:

- Env cleanup (drop implicit-era vars; align redirect URI + scopes)
- Remove obsolete Spotify Dashboard redirect URIs
- Delete any leftover v1 paths/deps
- Confirm Vercel deploy + story download + authorize → home happy path
