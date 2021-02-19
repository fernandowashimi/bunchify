declare namespace Application {
  interface Error extends globalThis.Error {
    status?: number;
  }

  interface GenerateImageInput {
    type: 'profile' | 'artists' | 'tracks';
    range: 'short_term' | 'medium_term' | 'long_term';
    data: Array<Spotify.Artist>;
    profile: Spotify.PrivateUser | undefined;
  }

  interface GetProfileInput {
    token: string;
  }

  type GetProfileResponse = Spotify.PrivateUser;

  interface GetTopArtistsInput {
    token: string;
    range: 'short_term' | 'medium_term' | 'long_term';
    limit?: number;
    offset?: number;
  }

  type GetTopArtistsReponse = Spotify.Paging<Spotify.Artist>;
}
