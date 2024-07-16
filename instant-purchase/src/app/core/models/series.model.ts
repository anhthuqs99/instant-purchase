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
import { LibraryArtwork, OriginTokenInfo } from './library.model';
import {
  Artwork,
  ArtworkBlockchainStatus,
  ArtworkDetail,
  ArtworkModel,
  ArtworkSizes,
} from './artwork.model';
import { Utils } from '@shared/utils';
import { IndexerVersion } from '@core/services';
import { environment } from '@environment';
import { NO_YEAR_IN_TITLE_SERIES_IDS } from '@shared/exception-items';
import { TRAVESS_MERGE_SERIES_ID } from '@shared/constants';

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

export interface SeriesDetailForBanner extends SeriesDetail {
  installationStatus?: SeriesInstallationStatus;
  isADelegate?: boolean;
}

export class StaticData {
  static artworkModels(): string[][] {
    return [
      ['Multiple edition', ArtworkModel.multi],
      ['Single edition', ArtworkModel.single],
      ['Multiple unique edition', ArtworkModel.multi_unique],
    ];
  }

  static saleModels(): string[][] {
    return [
      ['Fixed-price', SaleModel.Shopping],
      ['Airdrop (Free)', SaleModel.Airdrop],
      ['Highest-Bid Auction (English Auction)', SaleModel.EnglishAuction],
    ];
  }

  static yesNoOptions(): Array<Array<string | boolean>> {
    return [
      ['Yes', true],
      ['No', false],
    ];
  }
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

// TODO: move this class to new model. Indexer from external folder
/**
 * Support multi version (v1, v2)
 * WARNING: Self-handle the indexer version
 */
export class TokenIndexer {
  balance: number;
  blockchain: Blockchain;
  contractAddress: string;
  contractType: string;
  edition: number;
  editionName?: string;
  id: string;
  indexID: string;
  mintedAt: string;
  mintAt: string;
  owner: string;
  owners: Map<string, number>;
  lastActivityTime: string;
  swapped: boolean;
  projectMetadata?: {
    latest: SeriesIndexerMetadata;
    origin: SeriesIndexerMetadata;
  };

  asset?: {
    indexID: string;
    thumbnailID: string;
    lastRefreshedTime: string;
    attributes?: Record<string, string>;
    metadata: {
      project: {
        latest: SeriesIndexerMetadata;
        origin: SeriesIndexerMetadata;
      };
    };
  };

  originTokenInfo: OriginTokenInfo[];
  source: string;
  thumbnailID?: string;

  public static convertToLibraryArtwork(
    tokenIndexer: TokenIndexer,
    indexerVersion: IndexerVersion
  ): LibraryArtwork {
    const series = TokenIndexer.convertToSeries(tokenIndexer, indexerVersion);
    const libraryArtwork: LibraryArtwork = {
      id: this.convertArtID(tokenIndexer),
      tokenID: tokenIndexer.id,
      series,
      index: tokenIndexer.edition,
      name: tokenIndexer.editionName,
      blockchain: tokenIndexer.blockchain as Blockchain,
      indexID: tokenIndexer.indexID,
      updatedAt: tokenIndexer.lastActivityTime,
      isExternal: tokenIndexer.swapped,
      blockchainStatus:
        ArtworkBlockchainStatus[ArtworkBlockchainStatus.settled],
      originTokenInfo: tokenIndexer.originTokenInfo,
      contractAddress: tokenIndexer.contractAddress,
      source: tokenIndexer.source,
      isTravessMergedArtwork: series?.id === TRAVESS_MERGE_SERIES_ID,
    };
    libraryArtwork.thumbnailURI =
      indexerVersion === IndexerVersion.V1
        ? tokenIndexer.projectMetadata?.latest?.thumbnailURL
        : tokenIndexer.asset?.metadata?.project.latest?.thumbnailURL;

    return libraryArtwork;
  }

  public static convertToArtworkDetail(
    tokenIndexer: TokenIndexer,
    indexerVersion: IndexerVersion
  ): ArtworkDetail {
    const thumbnailID =
      indexerVersion === IndexerVersion.V1
        ? tokenIndexer.thumbnailID
        : tokenIndexer.asset?.thumbnailID;
    let name =
      indexerVersion === IndexerVersion.V1
        ? tokenIndexer.projectMetadata?.latest?.title
        : tokenIndexer?.asset?.metadata?.project?.latest?.title;
    name = name?.trim() || '';
    const mintedAt = tokenIndexer.mintedAt || tokenIndexer.mintAt;
    if (mintedAt) {
      const date = new Date(mintedAt);
      name += ` (${date.getFullYear()})`;
    }

    if (tokenIndexer.source === IndexerSource.feral_file) {
      name += ` ${tokenIndexer.editionName}`;
    }

    const series = TokenIndexer.convertToSeries(tokenIndexer, indexerVersion);
    const artworkDetail: ArtworkDetail = {
      id: this.convertArtID(tokenIndexer),
      tokenID: tokenIndexer.id,
      series,
      index: tokenIndexer.edition,
      name,
      blockchain: tokenIndexer.blockchain as Blockchain,
      contractAddress: tokenIndexer.contractAddress,
      indexID: tokenIndexer.indexID,
      updatedAt: tokenIndexer.lastActivityTime,
      isExternal: tokenIndexer.swapped,
      source: tokenIndexer.source,
      balance: tokenIndexer.balance,
      mintedAt: tokenIndexer.mintedAt || tokenIndexer.mintAt,
      isTravessMergedArtwork: series?.id === TRAVESS_MERGE_SERIES_ID,
    };
    artworkDetail.isFromIndexer = true;
    artworkDetail.thumbnailURI =
      indexerVersion === IndexerVersion.V1
        ? tokenIndexer.projectMetadata?.latest?.thumbnailURL
        : tokenIndexer.asset?.metadata?.project?.latest?.thumbnailURL;
    artworkDetail.cloudflareThumbnailURI = thumbnailID
      ? `${environment.indexerImageURLPrefix}/${thumbnailID}/thumbnail`
      : null;

    return artworkDetail;
  }

  public static convertToSeries(
    tokenIndexer: TokenIndexer,
    indexerVersion: IndexerVersion
  ): Series {
    const series: Series = {
      artist: this.convertToArtist(tokenIndexer, indexerVersion),
    };

    // We add the mintedYear for indexer token
    // in case the title has #number, we should add the year to the middle part of the title
    const date = new Date(tokenIndexer.mintedAt);

    const latestAssetData =
      indexerVersion === IndexerVersion.V1
        ? tokenIndexer.projectMetadata.latest
        : tokenIndexer.asset?.metadata?.project?.latest;

    const title = latestAssetData?.title;
    const seriesID = latestAssetData?.assetURL?.split('/')?.pop();
    series.id = seriesID;
    series.title = NO_YEAR_IN_TITLE_SERIES_IDS.includes(seriesID)
      ? title.trim()
      : `${title.trim()} (${date.getFullYear()})`;

    series.thumbnailURL =
      indexerVersion === IndexerVersion.V1
        ? tokenIndexer.projectMetadata.latest?.thumbnailURL
        : tokenIndexer.asset?.metadata?.project?.latest.thumbnailURL;
    series.settings = {
      maxArtwork:
        indexerVersion === IndexerVersion.V1
          ? tokenIndexer.projectMetadata?.latest?.maxEdition
          : tokenIndexer.asset?.metadata?.project?.latest.maxEdition,
    };

    return series;
  }

  public static convertToArtist(
    tokenIndexer: TokenIndexer,
    indexerVersion: IndexerVersion
  ): User {
    return indexerVersion === IndexerVersion.V1
      ? {
          ID: tokenIndexer.projectMetadata?.latest?.artistID,
          alias: tokenIndexer.projectMetadata?.latest?.artistName,
          slug: '',
        }
      : {
          ID: tokenIndexer.asset?.metadata?.project?.latest?.artistID,
          alias: tokenIndexer.asset?.metadata?.project?.latest?.artistName,
          slug: '',
        };
  }

  private static convertArtID(tokenIndexer: TokenIndexer) {
    let ID = tokenIndexer.id;
    if (tokenIndexer.swapped) {
      ID =
        tokenIndexer.originTokenInfo?.length > 0
          ? tokenIndexer.originTokenInfo[0].id
          : Utils.bnToHex(tokenIndexer.id, false);
    }
    return ID;
  }
}

export class SeriesIndexerMetadata {
  artistID: string;
  artistName: string;
  assetID: string;
  assetURL: string;
  baseCurrency: string;
  galleryThumbnailURL: string; // It will be deprecated soon
  basePrice: number;
  maxEdition: number;
  source: IndexerSource;
  sourceURL: string;
  thumbnailURL: string;
  title: string;
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

export class NewSeriesShoppingAvailableAskCount {
  seriesID: string;
  count: number;
}

export class NewTS044ArtworkMerged {
  mergedArtwork: string;
  burnedArtwork: string[];
}
