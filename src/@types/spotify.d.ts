declare namespace Spotify {
  interface AlbumRestriction {
    reason: 'market' | 'product' | 'explicit' | string;
  }

  interface Artist {
    external_urls: ExternalUrl;
    followers: Followers;
    genres: Array<string>;
    href: string;
    id: string;
    images: Array<Image>;
    name: string;
    popularity: number;
    type: string;
    uri: string;
  }

  interface ExplicitContentSettings {
    filter_enabled: boolean;
    filter_locked: boolean;
  }

  interface ExternalId {
    ean: string;
    isrc: string;
    upc: string;
  }

  interface ExternalUrl {
    spotify: string;
  }

  interface Followers {
    href: string | null;
    total: number;
  }

  interface Image {
    height: number | null;
    url: string;
    width: number | null;
  }

  interface Paging<T> {
    href: string;
    items: Array<T>;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  }

  interface PrivateUser {
    country: string;
    display_name: string;
    explicit_content: ExplicitContentSettings;
    external_urls: ExternalUrl;
    followers: Followers;
    href: string;
    id: string;
    images: Array<Image>;
    product: string;
    type: string;
    uri: string;
  }

  interface SimplifiedAlbum {
    album_group: 'album' | 'single' | 'compilation' | 'appears_on';
    album_type: 'album' | 'single' | 'compilation';
    artists: SimplifiedArtist;
    available_markets: Array<string>;
    external_urls: ExternalUrl;
    href: string;
    id: string;
    images: Array<Image>;
    name: string;
    release_date: string;
    release_date_precision: 'year' | 'month' | 'day';
    restrictions: AlbumRestriction;
    type: 'album';
    uri: string;
  }

  interface SimplifiedArtist {
    external_urls: ExternalUrl;
    href: string;
    id: string;
    name: string;
    type: 'artist';
    uri: string;
  }

  interface Tracks {
    album: SimplifiedAlbum;
    artists: Array<Artist>;
    available_markets: Array<string>;
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalId;
    external_urls: ExternalUrl;
    href: string;
    id: string;
    is_local: boolean;
    is_playable: boolean;
    name: string;
    popularity: number;
    preview_url: string | null;
    restrictions: TrackRestriction;
    track_number: number;
    type: 'track';
    uri: string;
  }

  interface TrackRestriction {
    reason: 'market' | 'product' | 'explicit';
  }
}
