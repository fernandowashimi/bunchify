declare namespace Application {
  type Type = 'artists' | 'tracks';

  type Range = 'short_term' | 'medium_term' | 'long_term';

  interface Error extends globalThis.Error {
    status?: number;
  }

  interface GetTemplateInput {
    range: string;
    data: Array<Spotify.Artist | Spotify.Tracks>;
    profile: Spotify.PrivateUser | undefined;
  }

  interface GenerateImageInput {
    type: Type;
    range: Range;
    data: Array<Spotify.Artist | Spotify.Tracks>;
    profile: Spotify.PrivateUser | undefined;
  }

  interface GetProfileInput {
    token: string;
  }

  type GetProfileResponse = Spotify.PrivateUser;

  interface GetTopArtistsInput {
    token: string;
    type: Type;
    range: Range;
    limit?: number;
    offset?: number;
  }

  type GetTopResponse = Spotify.Paging<Spotify.Artist | Spotify.Tracks>;
}
