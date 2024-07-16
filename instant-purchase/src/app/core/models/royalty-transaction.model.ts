import { ArtworkDetail } from './artwork.model';
import { SaleType } from './transaction.model';
import { User } from './user.model';

export enum Marketplace {
  FeralFile = 'Feral File',
  OpenSea = 'OpenSea',
}

export enum SaleHistoryStatus {
  submitted = 'submitted',
  processing = 'processing',
  succeeded = 'succeeded',
}

export interface RoyaltyTransactionResponse {
  earning: Earning;
  txs: RoyaltyTransaction[];
}

export interface RoyaltyTransaction {
  buyerID: string;
  createdAt: string;
  currency: string;
  artwork: ArtworkDetail;
  id: string;
  marketplace: Marketplace;
  price: Price;
  salePaymentMetadata: SalePaymentMetadata;
  saleType: string;
  sellerID: string;
  status: string;
  updatedAt: string;
  recipientID: string;
  txID: string;
}

interface Price {
  earn: number;
  net: number;
  sale: number;
  royaltyRate: number;
}

interface SalePaymentMetadata {
  createdAt: string;
  payeeAddress: string;
  recipientAddress: string;
}

export interface Earning {
  USDC: number;
  USD: number;
  ETH: number;
  XTZ: number;
}

export interface SaleInfo {
  artwork: ArtworkDetail;
  artist: User;
}

export interface SaleHistory {
  id: string;
  artworkID: string;
  senderID: string;
  sender: User;
  recipientID: string;
  recipient: User;
  artistID: string;
  saleInfo: SaleInfo[];
  exhibitionTitle?: string;
  price: number;
  currency: string;
  createdAt: string;
  type: SaleHistoryType;
  metadata: {
    commission: boolean;
  };
  isRecipient: boolean;
  status: SaleHistoryStatus;
  paymentFee: number;
  saleType: SaleType;
}

export interface OrderHistory {
  paging: {
    offset: number;
    limit: number;
    total: number;
  };
  result: SaleHistory[];
}

export interface RevenueHistory {
  paging: {
    offset: number;
    limit: number;
    total: number;
  };
  result: RoyaltyTransactionResponse;
}

export enum SaleHistoryType {
  sale = 'sale',
  transfer = 'transfer',
  revenue = 'revenue',
}

export interface RoyaltyTransactionResponse {
  earning: Earning;
  txs: RoyaltyTransaction[];
}

export interface RoyaltyTransaction {
  buyerID: string;
  createdAt: string;
  currency: string;
  artwork: ArtworkDetail;
  id: string;
  marketplace: Marketplace;
  price: Price;
  salePaymentMetadata: SalePaymentMetadata;
  saleType: string;
  sellerID: string;
  status: string;
  updatedAt: string;
  recipientID: string;
}

export interface Earning {
  USDC: number;
  USD: number;
  ETH: number;
  XTZ: number;
}

interface Price {
  earn: number;
  net: number;
  sale: number;
  royaltyRate: number;
}

interface SalePaymentMetadata {
  createdAt: string;
  payeeAddress: string;
  recipientAddress: string;
}
