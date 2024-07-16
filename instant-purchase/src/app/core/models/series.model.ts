import {
  Blockchain,
  Exhibition,
  SaleModel,
  SecondaryMarket,
} from '@core/models/exhibition.model';
import { User } from '@core/models/user.model';
import {
  ShoppingSetting,
  AirdropSetting,
  EngAuctionSetting,
  DutchAuctionSetting,
  SaleType,
} from './transaction.model';
import { Artwork, ArtworkModel, ArtworkSizes } from './artwork.model';

export enum SeriesPreviewHTMLTag {
  iframe = 'iframe',
  iframePDF = 'iframePDF',
  object = 'object',
  video = 'video',
  audio = 'audio',
  image = 'image',
  stream = 'stream',
}
export enum SeriesInstallationStatus {
  NotStarted = 'NotStarted',
  Processing = 'Processing',
  Incomplete = 'Incomplete',
  Done = 'Done',
}

export enum GenerativeMediumTypes {
  software = 'software',
  '3d' = '3d',
}
export enum MediumTypes {
  unknown = 'unknown',
  image = 'image',
  video = 'video',
  software = 'software',
  pdf = 'pdf',
  audio = 'audio',
  '3d' = '3d',
  'animated gif' = 'animated gif',
  txt = 'txt',
}
export enum TypesOfSoftware {
  software,
  '3d',
  'animated gif',
}
export enum IndexerSource {
  feral_file = 'feralfile',
}
export enum ArtOptions {
  playInLoop = 'playInLoop',
  enableMicPermission = 'enableMicPermission',
  enableCamPermission = 'enableCamPermission',
  customHTML = 'customHTML',
}
export enum AssetStatus {
  received,
  processing,
  succeeded,
  failed,
}

export const BlockchainInstructions = {
  ethereum: 'https://ethereum.org/en/wallets/find-wallet/',
  tezos: 'https://tezos.com/learn/store-and-use/',
};
export const FileUseIframe: string[] = ['html', 'text/html'];
export const FileUseIframePDF: string[] = ['pdf', 'application/pdf'];
export const FileUseObject: string[] = ['txt'];
export const FileUseVideo: string[] = [
  'mp4',
  'mov',
  'wmv',
  'quicktime',
  'avi',
  'webm',
  'mkv',
];
export const FileUseAudio: string[] = ['mp3', 'm4a', 'wav', 'wma', 'aac'];
export const FileUseImage: string[] = [
  'png',
  'jpg',
  'jpeg',
  'bmp',
  'gif',
  'svg',
  'application/xml',
];
export const MIMETypeUseStream: string[] = ['application/x-mpegurl'];
export const MIMETypeVideo = 'video/*';
export const MIMETypeAudio = 'audio/*';
export const MIMETypeImage = 'image/*';
export const MIMETypeObject = 'text/csv';

export interface Series {
  id?: string;
  slug?: string;
  artistID?: string;
  artist?: User;
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
  displayIndex?: number;
  createdAt?: string;
  updatedAt?: string;
  uniqueThumbnailPath?: string;
  uniquePreviewPath?: string;
  featuringIndex?: number;
  settings?: Settings;
  artworkSizes?: ArtworkSizes;
  blockchains?: string[];
  mintedAt?: string;
}

export interface SeriesDetail extends Series {
  originalFile?: FileInfo;
  previewFile?: FileInfo;
  artwork?: Artwork;
  exhibition?: Exhibition;
  externalSource?: string;
}

export class Settings {
  baseCurrency?: string;
  basePrice?: number;
  artworkModel?: ArtworkModel;
  maxArtwork?: number;
  burnedVirginArtwork?: number;
  saleModel?: SaleModel;
  bitmarkReservation?: number;
  saleSettings?: SaleSettings;
  tradeSeries?: boolean;
  transferToCurator?: boolean;
  publisherProof?: number;
  artistReservation?: number;
  promotionalReservation?: number;
  initialSaleType?: SaleType;
  setSettings?: {
    starting_index: number;
  };
}

export class SaleSettings {
  english?: EngAuctionSetting;
  dutch?: DutchAuctionSetting;
  shopping?: ShoppingSetting;
  airdrop?: AirdropSetting;
}

export interface FileInfo {
  filename?: string;
  uri: string;
  status: string;
  version?: string;
  metadata?: FileAssetMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileAssetMetadata {
  urlOverwrite: string;
}

export interface Metadata {
  playInLoop?: boolean;
  mediumDescription?: string[];
  collectorReceives?: string[];
  bundleDescription?: string;
  cameraRequired?: boolean;
  microphoneRequired?: boolean;
  includeHTML?: boolean;
  panAndZoom?: boolean;
  isFeralfileFrame?: boolean;
  externalURLs?: Record<string, string>;
  secondaryMarkets?: SecondaryMarket[];
  targetMigrationBlockchain?: Blockchain;
  renderImagePixel?: boolean;
  photoURL?: string;
  galleryURL?: string;
  latestRevealedArtworkIndex?: number;
}
