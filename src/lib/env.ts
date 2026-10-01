export function spotifyEnv() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const accounts = (process.env.SPOTIFY_ACCOUNTS_URL ?? "https://accounts.spotify.com").replace(/\/$/, "");
  const api = (process.env.SPOTIFY_API_URL ?? "https://api.spotify.com").replace(/\/$/, "");

  if (!clientId || !redirectUri) {
    throw new Error("Missing Spotify server environment.");
  }

  return {
    clientId,
    redirectUri,
    accounts,
    api,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  };
}

export function appUrl(path: string) {
  return new URL(path, new URL(spotifyEnv().redirectUri).origin);
}
