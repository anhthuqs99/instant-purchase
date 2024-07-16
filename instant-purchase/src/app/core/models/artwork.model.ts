import { Blockchain } from './exhibition.model';
import { Swap } from './swap.model';
import { Series, SeriesDetail } from './series.model';
import { BidAsk, BidAskDetail } from './transaction.model';
import { User } from './user.model';

export enum ArtworkModel {
  multi = 'multi',
  single = 'single',
  multi_unique = 'multi_unique',
  unknown = 'unknown',
}

export enum ArtworkStatus {
  submitted,
  processing,
  settled,
}
export enum ArtworkBlockchainStatus {
  pending = 'pending',
  settled = 'settled',
  failed = 'failed',
}
export enum ArtworkCategory {
  CE = 'CE',
  NE = 'NE',
  AP = 'AP',
  AE = 'AE',
  PP = 'PP',
}

export interface CreatedToken {
  contractAddress?: string;
  blockchain: Blockchain;
  tokenID: string;
}

export interface Artwork {
  id?: string;
  tokenID?: string;
  seriesID?: string;
  blockchainStatus?: string;
  // status: string,
  currency?: string;
  index?: number;
  name?: string;
  mintedAt?: string;
  onSale?: boolean;
  owner?: User;
  ownerAccountID?: string;
  price?: number;
  purchasedPrice?: number;
  purchasedCurrency?: string;
  includedGift?: boolean;
  isPurchasing?: boolean;
  isReserved?: boolean;
  isArchived?: boolean;
  isExternal?: boolean;
  virgin?: boolean;
  swap?: Swap;
  collectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  blockchain?: Blockchain;
  contractAddress?: string;
  indexID?: string;
  category?: ArtworkCategory;
  previewURI?: string;
  thumbnailURI?: string;
  cloudflareThumbnailURI?: string;
  artworkAttributes?: ArtworkAttribute[];
  metadata?: ArtworkMetadata;
  source?: string;
  marketplaceURL?: string;
  onchainListing?: OnchainListing;
  isFromIndexer?: boolean;
  isTravessMergedArtwork?: boolean;
}

export interface ArtworkOfSeries extends Artwork {
  statusQuo: string;
  statusDescription: string;
  isOwned: boolean;
  series: Series;
  activeAsk: BidAsk;
}

export interface ArtworkDetail extends Artwork {
  series?: SeriesDetail;
  uniqueThumbnail?: string;
  activeAsk?: BidAskDetail;
  ask?: BidAskDetail;
  auctionAsk?: BidAskDetail;
  balance?: number;
  contractAddress?: string;
  mintedAt?: string;
}

export interface ArtworkWithAsk extends Artwork {
  activeAsk?: BidAskDetail;
  ask?: BidAskDetail;
  auctionAsk?: BidAskDetail;
}
export class ArtworkSizes {
  AP?: number;
  PP?: number;
  AE?: number;
}

export class TokenMetadata {
  name: string;
  artwork_id: string;
  image: string;
  animation_url: string;
}

export class ArtworkAttribute {
  traitType: string;
  value: string;
  percentage: number;
}

export class ArtworkMetadata {
  previewCloudFlareURL?: string;
  thumbnailCloudFlareURL?: string;
  alternativePreviewURI?: string;
  viewableAt?: string;
  ts044MergedIndexes?: number[];
}

export interface TokenOwner {
  domainName: string;
  address: string;
}

export class OnchainListing {
  price: number;
  currency: string;
}
