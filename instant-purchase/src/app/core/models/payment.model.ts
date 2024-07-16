export enum WBalances {
  BTC = 'Bitcoin',
  ETH = 'Ethereum',
  USDC = 'USD Coin',
  XTZ = 'Tezos',
}
export enum SupportCurrencies {
  BTC = 'BTC',
  ETH = 'ETH',
  USDC = 'USDC',
  XTZ = 'XTZ',
  USD = 'USD',
}
export enum CryptoWalletCurrencies {
  ethereum = 'ETH',
  bitmark = 'USDC',
  tezos = 'XTZ',
}
export enum DepositAddresses {
  BTC = 'BTC',
  ETH = 'ETH',
  USDC = 'ETH',
}
export enum PaymentMethods {
  card = 'card',
  crypto = 'crypto',
}
export enum PaymentStatus {
  submitted = 'submitted',
  processing = 'processing',
  succeeded = 'succeeded',
  failed = 'failed',
  canceled = 'canceled',
  require_action = 'require_action',
  authorized = 'authorized',
  refunded = 'refunded',
}
export enum WalletTXSType {
  deposit = 'deposit',
  withdrawal = 'withdrawal',
  conversion = 'conversion',
}
export enum WHistoryStatus {
  submitted = 'submitted',
  processing = 'processing',
  completed = 'completed',
}
export enum StripePaymentIntentStatus {
  succeeded = 'succeeded',
  processing = 'processing',
  canceled = 'canceled',
  payment_failed = 'requires_payment_method',
}

export class SyncBalance {
  availableBalances: Record<SupportCurrencies, number>;
  totalBalances: Record<SupportCurrencies, number>;
}

export interface PaymentResponse {
  payment: Payment;
  buyArtworksSaleData: SaleData;
  buyBulkArtworksSaleData: SaleData;
  signature: Signature;
}

export interface Payment {
  id: string;
  amount: number;
  creator: string;
  currency: string;
  discount: number;
  reference: string;
  serviceFee: number;
  source: PaymentMethods;
  status: PaymentStatus;
  metadata: PaymentMetadata;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleData {
  cost: string;
  destination: string;
  payByVaultContract: boolean;
  expiryTime: string;
  price: number;
  revenueShares: RevenueShare[] | RevenueShare[][];
  tokenIds?: string[];
  nonce?: string;
  seriesId?: string;
  quantity?: number;
}

export interface RevenueShare {
  recipient: string;
  bps: string;
}

export interface Signature {
  r: string;
  s: string;
  v: string;
}

export interface WWalletTX {
  id: string;
  type: WalletTXSType;
  amount: number;
  fees: Record<SupportCurrencies, number>;
  totalFee: number;
  exchangeRate: number;
  associatedWalletTxID: string;
  party: string;
  counterparty: string;
  destCurrency: SupportCurrencies;
  sourceCurrency: SupportCurrencies;
  status: WHistoryStatus;
  metadata: Record<string, string | number>;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface WWalletHistory extends WWalletTX {
  associatedWalletTx: WWalletTX;
}

interface PaymentMetadata {
  depositAddress: string;
  redirectToURL: string;
}
