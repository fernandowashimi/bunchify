const SPOTIFY_IMAGE_HOST = /(^|\.)scdn\.co$|(^|\.)spotifycdn\.com$/;

export function allowedStoryImageUrl(raw: string, apiBase: string): URL | null {
  let target: URL;
  let api: URL;
  try {
    target = new URL(raw);
    api = new URL(apiBase);
  } catch {
    return null;
  }

  if (target.username || target.password) return null;

  const spotifyHost = SPOTIFY_IMAGE_HOST.test(target.hostname);
  if (spotifyHost) {
    if (target.protocol !== "https:") return null;
    return target;
  }

  if (target.protocol === api.protocol && target.host === api.host) return target;
  return null;
}
