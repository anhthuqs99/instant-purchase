import { Artwork } from './artwork.model';
import { Exhibition, ExhibitionRevenueShare } from './exhibition.model';
import { Post } from './post.model';
import { Metadata } from './series.model';
import { Artist, User } from './user.model';

export interface SourceExhibition extends Exhibition {
  id: string;
  slug: string;
  title: string;
  exhibitionStartAt: string;
  exhibitionViewAt: string;
  note: string;
  noteBrief: string;
  noteTitle: string;
  coverURI?: string;
  schedules?: Post[];
}

export interface SourceExhibitionDetail extends SourceExhibition {
  artists?: Artist[];
  curators?: User[];
  resourceIntroVideoUrl?: string;
}

export interface SourceExhSeries {
  // Hardcore
  artworks?: SourceArtworkDetail[];
  sourceURL?: string;
  id?: string;
  slug?: string;
  artistID?: string;
  artist: User;
  onchainID?: string;
  title?: string;
  medium?: string;
  description?: string;
  originalFileURI?: string;
  thumbnailURI?: string;
  thumbnailURL?: string;
  exhibitionID?: string;
  exhibition?: Exhibition;
  registeredAt?: string;
  metadata?: Metadata;
  mediumDescription?: string[];
  displayIndex?: number;
  createdAt?: string;
  updatedAt?: string;
  uniqueThumbnailPath?: string;
  uniquePreviewPath?: string;
  featuringIndex?: number;
  blockchain?: string;
  contractAddress?: string;
  resources?: string[];
  sourceTitle?: string;
  isCombineTitle?: boolean;
  type?: string;
  introVideoURL?: string;
}

export interface SourceArtworkDetail extends Artwork {
  // Hardcore
  blockchainExplorerUrl: string;
  firstSaleRevenueSetting: ExhibitionRevenueShare;
  resaleRevenueSetting: ExhibitionRevenueShare;
  collectorName?: string;
  tokenID?: string;
}
