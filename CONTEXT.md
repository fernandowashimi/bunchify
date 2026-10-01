# Bunchify

Spotify top artists and tracks turned into shareable story images.

## Language

**Authorize**:
The landing page where a listener connects Spotify before using Bunchify.
_Avoid_: Login page, sign-in, OAuth page

**Home**:
The generator page where a listener chooses top type, range, and colors and produces a story.
_Avoid_: Dashboard, app, editor, studio

**Story**:
The vertical shareable PNG (Instagram Stories / status sized) Bunchify generates from a listener's top artists or tracks.
_Avoid_: OG image, export, poster, card (when meaning the PNG)

**Listener**:
A person who authorizes Spotify and generates stories.
_Avoid_: User, customer, account

**Session**:
The listener's Spotify auth state held in httpOnly cookies (access token, refresh token, optional expiry) — not a database user record, and not the Authorize handshake.
_Avoid_: Account, login, JWT user, AuthProvider token, PKCE verifier, OAuth state

**Top**:
The Spotify top artists or tracks payload (for a chosen type and time range) used to build a story.
_Avoid_: Stats, ranking, playlist, library
