import { Payment, SupportCurrencies } from '@core/models/payment.model';
import { User, UserDetail } from '@core/models/user.model';
import { Series } from '@core/models/series.model';
import { ExhSaleStatus, SaleModel } from './exhibition.model';
import { ArtworkDetail } from './artwork.model';

export enum TransactionType {
  receipt,
  invoice,
  transfer,
}
export enum RevenueType {
  first_sale = 'first_sale',
  resale = 'resale',
}
export enum SaleType {
  set = 'set',
  single = 'single',
  notForSale = 'not_for_sale',
  seriesSequenceBundle = 'series_sequence_bundle',
  seriesRandomBundle = 'series_random_bundle',
}
export enum BidAskType {
  single = 'single',
  set = 'set',
}
export enum OrderStatus {
  submitted = 'submitted',
  processing = 'processing',
  succeeded = 'succeeded',
  canceled = 'canceled',
  failed = 'failed',
}
export enum SaleStatus {
  submitted = 'submitted',
  processing = 'processing',
  succeeded = 'succeeded',
  canceled = 'canceled',
  failed = 'failed',
}
export enum BidAskStatus {
  active = 'active',
  unmatched = 'unmatched',
  matched = 'matched',
  canceled = 'canceled',
  payment = 'payment',
  rejected = 'rejected',
}
export enum AuctionStatus {
  opening = 'opening',
  matching = 'matching',
  ended = 'ended',
}
export enum AuctionType {
  english = 'english',
  dutch = 'dutch',
  reverse_dutch = 'reverse_dutch',
}
export enum PaymentMethod {
  card = 'card',
  crypto = 'crypto',
}
export enum TransferETHTokenStatus {
  created = 'created',
  payment = 'payment',
  processing = 'processing',
  cancelled = 'cancelled',
  complete = 'complete',
  failed = 'failed',
}
export enum UISetAskStatus {
  active = 'active',
  pending = 'pending',
  sold = 'sold',
  canceled = 'canceled',
  reserved = 'reserved',
  a2p = 'a2p',
  activeBid = 'active-bid',
}

export interface Transaction {
  id: string;
  type: string;
  accountID: string;
  counterpartyID: string;
  sellerID: string;
  buyerID: string;
  artistID: string;
  artworkID: string;
  artworkIndex: number;
  maxArtwork: number;
  paymentMethod: string;
  paymentTxID: string;
  currency: string;
  price: Record<string, number>;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetail extends Transaction {
  series: Series;
  artist: User;
  buyer: User;
  seller: User;
}

export interface Sale {
  id: string;
  askID: string;
  bidID: string;
  price: number;
  status: SaleStatus;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
  metadata: SaleMetadata;
}
export interface SaleDetail extends Sale {
  bid: BidAsk;
  ask: BidAsk;
}
export interface FullSaleDetail extends Sale {
  bid: FullBidAskDetail;
  ask: FullBidAskDetail;
  buyer: User;
}
export class BidAsk {
  id?: string;
  creatorID?: string;
  exhibitionID?: string;
  type?: string;
  saleModel?: SaleModel;
  initialDrop?: boolean;
  saleType?: SaleType;
  status?: BidAskStatus;
  auctionID?: string;
  price?: number;
  currency?: SupportCurrencies;
  equivalentPrice?: number;
  specs?: {
    preferredArtwork?: number;
    activeAt?: string;
    expiredAt?: string;
  };
  metadata?: BidAskMetadata;
  artworkIndex?: number;
  createdAt?: string;
  updatedAt?: string;
  sale?: SaleDetail;
  isPrivate?: boolean;
}

interface BidAskMetadata {
  newAskIDs: string[];
  bundleAskCreator?: string;
  bundleQuantity?: number;
  bundleSeriesID?: string;
}

export class BidAskDetail extends BidAsk {
  creator?: User;
  artworks?: ArtworkDetail[];
  auction?: AuctionDetail;
  payment?: Payment;
}
export interface FullBidAskDetail extends BidAsk {
  creator: UserDetail;
  sale: FullSaleDetail;
  artworks: ArtworkDetail[];
  payment: Payment;
}

export interface EngAucBid extends BidAskDetail {
  relayTxID?: string;
  relayGasFeeInUsd?: string;
}

export interface Auction {
  id: string;
  onchainID: string;
  type: AuctionType;
  settings: {
    english?: EngAuctionSetting;
    dutch?: DutchAuctionSetting;
    reverse_dutch?: ReverseDutchAuctionSetting;
  };
  status: AuctionStatus;
  startedAt: string;
  endedAt: string;
  floorBid?: number;
  artworkSize?: number;
  bidAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuctionWithArtwork extends Auction {
  artworkIndex: number;
}

export interface AuctionDetail extends Auction {
  ask: BidAskDetail;
  asks: BidAskDetail[];
  winningInfo: DutchAuctionResult;
}

export interface ShoppingSetting {
  startedAt?: string;
  endedAt?: string;
  price?: number;
}

export interface EngAuctionSetting {
  extensionSecond?: number;
  extensionTriggerSecond?: number;
  initialDurationSecond?: number;
  minIncrementAmount?: number;
  minIncrementFactor?: number;
  minPrice?: number;
  turnToShoppingAfterEnded?: boolean;
  startedAt?: string;
}

export interface DutchAuctionSetting {
  initialDurationSecond: number;
  firstArtwork: number;
  lastArtwork: number;
  minPrice: number;
}

export class AirdropSetting {
  startedAt?: string;
  duration?: number;
}

export interface DutchAuctionResult {
  winningPrice: number;
  lastWinningBidTime: string;
  totalBidAmount: number;
  winnerAmount: number;
}

export interface DutchAuctionBidInfo {
  lowestBid: number;
  medianBid: number;
  highestBid: number;
}

export class LostBid {
  id: string;
  auctionID: string;
  auctionType: AuctionType;
  newBid: number;
  by: string;
  accountID: string;
}

export class NewEngAucBid {
  id: string;
  auctionID: string;
  auctionType: AuctionType;
  newBid: number;
  by: string;
  accountID: string;
  auction: AuctionDetail;
}

export class NewDutAucBid {
  id: string;
  auctionID: string;
  auctionType: AuctionType;
  lowestBid: number;
  medianBid: number;
  highestBid: number;
  bidAmount: number;
  auction: AuctionDetail;
}

export class NewExhSaleStatus {
  id: string;
  saleStatus: ExhSaleStatus;
}

export class NewAucStatus {
  id: string;
  status: AuctionStatus;
}

export class RejectedBid {
  id: string;
  auctionID: string;
  auctionType: AuctionType;
  reason: number;
}

export class NewPaymentFailed {
  artworkID: string;
}

export class NewSaleSucceeded {
  id: string;
  txid: string;
}

class SaleMetadata {
  equivalentPrices: Record<SupportCurrencies, number>;
  creditCardCost: number;
}

export interface TransferETHToken {
  id: string;
  artworkID: string;
  senderID: string;
  recipientID: string;
  fee: number;
  currency: string;
  status: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
  payment: Payment;
}

// revert dutch auction
export interface ReverseDutchAuctionSetting {
  startPrice: number;
  endPrice: number;
  exponentialPriceDropDurationSecond: number;
  linearPriceDropDurationSecond: number;
  priceDropDecayRate: number;
  turnToShoppingAfterEnded: boolean;
  startedAt: string;
  endedAt: string;
}

export interface AsksStatusShorten {
  askID?: string;
  status?: BidAskStatus;
  txID?: string;
  saleStatus?: SaleStatus;
  saleExpiredAt?: string;
  buyerID?: string;
  buyer?: string;
  buyerAddress?: string;
  linkedBuyerAccounts?: User[];
  artworkIndex: number;
  artworkName: string;
  virgin?: boolean;
  clientStatus?: UISetAskStatus;
  collector?: string;
  bid?: ShortenBid;
  auction?: AuctionDetail;
  auctionEnded?: boolean;
  // This one support for private sale
  isPrivate?: boolean;
  salePrice?: number;
  saleCreatedAt?: string;
}

export interface ShortenBid {
  bidder?: string;
  bidderID?: string;
  bidderAddress?: string;
  price?: number;
  status?: BidAskStatus;
}

export interface ReverseDutchAuctionPrice {
  currentPrice: number;
  nextPrice: number;
  dropAt: string;
}
