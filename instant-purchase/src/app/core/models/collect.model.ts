import { SaleModel, Blockchain } from '@core/models/exhibition.model';
import { ArtworkModel } from './artwork.model';
export interface BaseDrop {
  exhibitionTitle: string;
  exhibitionSlug: string;
  exhibitionThumbnail: string;
  exhibitionMaxArtwork: number;
  seriesTitle: string;
  seriesSlug: string;
  seriesThumbnail: string;
  artistAlias: string;
  artistSlug: string;
  soloArtistAlias: string;
  soloArtistSlug: string;
  seriesMaxArtwork: number;
  type: string;
  exhibitionType: string;
}

export interface FixedPriceArtwork extends BaseDrop {
  uniqueThumbnail: string;
  exhibitionID: string;
  askID: string;
  identifier: string;
  artworkIndex: number;
  exhibitionStartAt: string;
  mintBlockchain: Blockchain;
  price: number;
  remainArtwork: number;
  artworkModel: ArtworkModel;
  exh_migrating?: boolean;
  exhSaleModel: SaleModel;
  setExpiredAt: string;
  shoppingEndedAt: string;
}

export interface SecondarySaleGroup extends BaseDrop {
  seriesID: string;
  minPrice: number;
  maxPrice: number;
  availableAmount: number;
}

export interface CollectAuction {
  auctionID: string;
  exhibitionID: string;
  exhibitionTitle: string;
  exhibitionSlug: string;
  exhibitionMaxArtwork: number;
  exhibitionThumbnail: string;
  seriesThumbnail: string;
  seriesTitle: string;
  seriesSlug: string;
  artistAlias: string;
  artistSlug: string;
  soloArtistAlias: string;
  soloArtistSlug: string;
  seriesMaxArtwork: number;
  exhibitionType: string;
  auctionEndedAt: string;
  type: string;
  minBidPrice: number;
}

export interface HighestBidAuction extends CollectAuction {
  index: number;
  name: string;
  highestBidPrice: number;
}

export interface GroupAuction extends CollectAuction {
  availableAmount: number;
  activeBids: number;
  floorPrice: number;
}
