declare namespace Spotify {
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
}
