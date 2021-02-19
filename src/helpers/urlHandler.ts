const buildUrl = (params: {
  baseUrl: string;
  clientId: string;
  type: string;
  redirectUri: string;
  scope: string;
}): string => {
  const { baseUrl, clientId, type, redirectUri, scope } = params;
  return `${baseUrl}?client_id=${clientId}&response_type=${type}&redirect_uri=${redirectUri}&scope=${scope}`;
};

const validateUrl = (): void => {
  const errorEntries = window.location.href.match(/error=([^&]*)/);

  if (errorEntries) {
    const message = errorEntries[1] === 'access_denied' ? 'Access denied' : 'Something went wrong';
    throw new Error(message);
  }
};

const parseUrl = (): string | null => {
  validateUrl();

  const { hash } = window.location;
  const tokenEntries = hash.match(/access_token=([^&]*)/);
  // const expiresIn = hash.match(/expires_in=([^&]*)/);

  if (!tokenEntries) {
    return null;
  }

  return tokenEntries[1];
};

export { buildUrl, parseUrl };
