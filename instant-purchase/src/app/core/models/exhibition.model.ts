import { Series } from '@core/models/series.model';
import { Artist, User } from '@core/models/user.model';
import {
  BidAsk,
  EngAuctionSetting,
  RevenueType,
  ReverseDutchAuctionSetting,
  ShoppingSetting,
} from './transaction.model';

export enum SaleModel {
  Shopping = 'shopping',
  EnglishAuction = 'english_auction',
  DutchAuction = 'dutch_auction',
  Airdrop = 'airdrop',
  ShoppingAirdrop = 'shopping_airdrop',
  ReverseDutchAuction = 'reverse_dutch_auction',
}
export enum ExhibitionType {
  solo = 'solo',
  group = 'group',
}
export enum ExhSaleStatus {
  AuctionOngoing = 'auctionOngoing',
  AutionClosing = 'autionClosing',
  Sale = 'sale',
}
export enum Blockchain {
  Autonomy = 'autonomy',
  Bitmark = 'bitmark',
  Tezos = 'tezos',
  Ethereum = 'ethereum',
}
export enum ExternalMarketplace {
  OpenSea = 'OpenSea',
  Objkt = 'Objkt',
}
export enum ExhibitionStatus {
  created,
  editorReview,
  operatorReview,
  issuing,
  issued,
}

export enum ContractVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export enum CountDownBannerType {
  Private,
  CollectingStartsIn,
  CollectingStarts,
  CollectingEndsIn,
  CollectingLive,
  CollectingHasEnded,
  SalePaused,
  MergeStartsIn,
  MergeStarts,
  MergeEndsIn,
  MergeHasEnded,
}

export enum ExhibitionFeatureType {
  SetSale = 'set-sale',
  SingleSale = 'single-sale',
  BundleSale = 'bundle-sale',
  Merge = 'merge',
}

export enum ExhibitionFeatureFragment {
  SetSale = 'setSale',
  SingleSale = 'singleSale',
  BundleSale = 'bundleSale',
  Merge = 'merge',
}

// TODO: convert logic of direction to js code
export enum Direction {
  Up = 'up',
  Down = 'down',
}

export interface Exhibition {
  id: string;
  slug: string;
  title: string;
  editable?: boolean;
  testingStartAt?: string;
  testingEndAt?: string;
  installationStartAt?: string;
  installationEndAt?: string;
  exhibitionStartAt?: string;
  exhibitionViewAt?: string;
  previewDuration?: number; // seconds
  note?: string;
  noteBrief?: string;
  noteTitle?: string;
  curator?: User;
  curatorAccountID?: string;
  partner?: User;
  metadata?: ExhibitionMetadata;
  ableToInstallSeries?: boolean;
  coverURI?: string;
  thumbnailCoverURI?: string;
  atTime?: string;
  noteShown?: boolean;
  updatedAt?: string;
  noteAuthor?: string;
  type?: string;
  auctionActive?: boolean;
  highlightOrder?: number;
  publicViewable?: boolean;
  saleStatus?: ExhSaleStatus;
  mintBlockchain?: Blockchain;
  contracts?: Contract[];
  hidden?: boolean;
  status?: ExhibitionStatus;
  settings?: {
    set_settings?: SetSettings;
    collaborator_amount: number;
    salePaused?: boolean;
    reserveSetting: Record<string, string>;
  };
  checkList?: PreInstallationCheckList;
}

export interface Checklist
  extends PreInstallationCheckList,
    PostInstallationCheckList {}

export interface PreInstallationCheckList {
  isCuratorProfileFilledOut?: boolean;
  areAllSeriesSpacedAdded?: boolean;
  areArtistsAssigned?: boolean;
  areArtistAliasesCorrect?: boolean;
}

export interface PostInstallationCheckList {
  isCuratorNoteFilledOut?: boolean;
  areAllSeriesInstalled?: boolean;
  doAllSeriesDisplayAndPlay?: boolean;
  areSeriesTitlesAndDescriptionsAdded?: boolean;
  areAllSeriesMetadataAdded?: boolean;
  areSeriesArranged?: boolean;
  areSaleMechanismsConfirmed?: boolean;
}

export interface Contract {
  exhibitionID: string;
  id: string;
  blockchainType: Blockchain;
  name: string;
  address: string;
  symbol: string;
  version?: string;
  exhibition?: Exhibition;
}

export interface ExhibitionDetail extends Exhibition {
  artists?: Artist[];
  series?: Series[];
  administrators?: string[];
  remainingSet?: number;
  setExpiredAt?: string;
  isFeatured?: boolean;
  numberOfSeries?: number;
  saleSettings?: SaleSetting;
  activeSetShoppingAsks?: BidAsk[];
  activeSetReverseDutAucAsks?: BidAsk[];
}

export interface ExhibitionRevenueShare {
  exhibitionID: string;
  saleType: RevenueType;
  platform: number;
  artist: number;
  curator: number;
  partner: number;
  seller: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecondaryMarket {
  name: string;
  url: string;
}

interface Sponsors {
  logo: string;
  url: string;
}

interface Gift {
  buttonName: string;
  deepLink: string;
  desktopDesc: string;
  mobileDesc: string;
}

interface ExhibitionMetadata {
  displayTitle: string;
  subheading: string;
  discordLink: string;
  closeUpTitle: string;
  closeUpLink: string;
  closeUpMessage: string;
  newsletterLink: string;
  privateViewMode: boolean;
  exhibitionSponsors?: Sponsors[];
  presentingSponsors?: Sponsors[];
  partnerships?: Sponsors[];
  gift?: Gift;
  secondaryMarkets?: SecondaryMarket[];
}

interface SaleSetting {
  english: AuctionSaleSetting;
  dutch: AuctionSaleSetting;
}
interface AuctionSaleSetting {
  initialDurationSecond: number;
}

interface SetSettings {
  amount: number;
  artwork_model: string;
  sale_model: SaleModel;
  started_at: string;
  ended_at: string;
  spec: SaleSpec;
  turnToSingleShoppingAfterEnded?: boolean;
}

interface SaleSpec {
  reverse_dutch?: ReverseDutchAuctionSetting;
  english?: EngAuctionSetting;
  shopping?: ShoppingSetting;
}

export interface ExhibitionFeature {
  type: ExhibitionFeatureType;
  displayIndex: number;
  title: string;
  description: string;
  fragment: string;
  linkedSection?: LinkedSection;
  listSeries?: Series[];
}

interface LinkedSection {
  name: string;
  fragment: string;
  direction: Direction;
}
