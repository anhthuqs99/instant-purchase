import { Series } from '@core/models/series.model';
import { Artwork } from '@core/models/artwork.model';
import { BidAsk } from '@core/models/transaction.model';

export interface LibrarySeries extends Series {
  artworks: LibraryArtwork[];
}

export interface LibraryArtwork extends Artwork {
  activeAsk?: BidAsk;
  statusQuo?: string;
  statusDescription?: string;
  isOwned?: boolean;
  series?: Series;
  uniqueThumbnail?: string;
  originTokenInfo?: OriginTokenInfo[];
}

export interface OriginTokenInfo {
  id?: string;
  blockchain?: string;
}

export enum SeriesSortType {
  Title,
}
export enum ArtworkSortType {
  SeriesTitle,
  Number,
  Price,
  Status,
  MarketStatus,
}
export enum SortDirection {
  Asc,
  Desc,
  None,
}

export class SortHelper {
  static sortSeries(type: SeriesSortType, direction: SortDirection) {
    const seriesProperty = 'title';

    return (a: LibrarySeries, b: LibrarySeries) => {
      if (direction === SortDirection.Asc) {
        return a[seriesProperty] < b[seriesProperty] ? -1 : 1;
      } else if (direction === SortDirection.Desc) {
        return a[seriesProperty] < b[seriesProperty] ? 1 : -1;
      }
      return 0;
    };
  }

  static sortArtworks(type: ArtworkSortType, direction: SortDirection) {
    let extractProperty;
    switch (type) {
      case ArtworkSortType.SeriesTitle:
        extractProperty = (target: LibraryArtwork) => target.series.title;
        break;
      case ArtworkSortType.Number:
        extractProperty = (target: LibraryArtwork) => target.index;
        break;
      case ArtworkSortType.Status:
        // artwork mostly update ownerAccountID every transactions, idealy, that's time user collect/receive (from transfer)
        extractProperty = (target: LibraryArtwork) => target.updatedAt;
        break;
      case ArtworkSortType.MarketStatus:
        extractProperty = (target: LibraryArtwork) =>
          `${target.activeAsk ? '0' : '1'}`;
        break;
    }

    return (a: LibraryArtwork, b: LibraryArtwork) => {
      const aProperty = extractProperty(a);
      const bProperty = extractProperty(b);

      if (aProperty === bProperty || direction === SortDirection.None) {
        return 0;
      }

      if (direction === SortDirection.Asc) {
        return aProperty < bProperty ? -1 : 1;
      }

      return aProperty < bProperty ? 1 : -1;
    };
  }
}
