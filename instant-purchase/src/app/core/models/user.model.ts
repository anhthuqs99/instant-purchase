import { Blockchain } from '@core/models/exhibition.model';
import { BidAskType } from './transaction.model';
export enum StripeStatus {
  none = '',
  inactive = 'inactive',
  pending = 'pending',
  active = 'active',
}

export enum WalletApp {
  Autonomy = 'Autonomy',
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  Beacon = 'Beacon',
}
export enum WalletConnectPage {
  ConnectWallet = 'ConnectWallet',
  SignIn = 'SignIn',
  TransferArtwork = 'TransferArtwork',
  WithdrawFunds = 'WithdrawFunds',
  SetSale = 'SetSale',
  DisconnectWeb3 = 'DisconnectWeb3',
}

export enum MigrationStatus {
  Created = 'created',
  Processing = 'processing',
  Cancelled = 'cancelled',
  Completed = 'completed',
  Failed = 'failed',
}

export enum UserSortBy {
  AZ = 'A to Z',
  Recent = 'Recent',
}
export class UserBalance {
  balance: number;
  currency: string;
}

export interface User {
  ID?: string;
  slug: string;
  alias: string;
  avatarURI?: string;
  bio?: string;
  fullName?: string;
  isArtist?: boolean;
  isCurator?: boolean;
  isOperator?: boolean;
  isEditor?: boolean;
  isPayable?: boolean;
  verified?: boolean;
  type?: Blockchain;
  metadata?: UserMetadata;
  linkedAccounts?: UserDetail[];
  collaborationAccounts?: UserDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Artist extends User {
  email?: string;
  location: string;
  website: string;
}

export interface Me extends User {
  bio?: string;
  email?: string;
  location?: string;
  website?: string;
  totpActivated?: boolean;
  totpRecoveryBlockTime?: string;
  stripeConnect?: StripeConnect;
  ethDropAddress?: string;
  vaultAddresses?: VaultAddress;
  requiredRoyaltyAddresses?: {
    ethereum: boolean;
    tezos: boolean;
  };
  shippingProfile?: ShippingProfile;
  isRoyaltiesRecipient?: boolean;
  web3Balance?: number;
  childs?: Me[];
  possessingArtworkMigrationPreferredBlockchains?: string[];
  ongoingMigration?: Migration;
  isOngoingMigration?: boolean;
  metadata?: UserMetadata;
}

export interface Identity {
  id: string;
  type: Blockchain;

  web3Balance?: number;
}

export interface UserDetail extends User {
  bio: string;
  location: string;
  website: string;
  vaultAddresses?: VaultAddress;
  childs?: UserDetail[];
}

export interface AccountExternalLinks {
  text?: string;
  link: string;
}

export interface ShippingProfile {
  fullName: string;
  email: string;
  address1: string;
  address2: string;
  state: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
}

export interface MoMAShippingProfile extends ShippingProfile {
  editionID: string;
  txID: string;
}

interface UserMetadata {
  referEmailAccountID?: string;
  externalLinks?: AccountExternalLinks[];
  tezosRoyaltiesAddress?: string;
  ethereumRoyaltiesAddress?: string;
  tezosArtistAddress?: string;
  ethereumArtistAddress?: string;
  instagramID?: string;
  twitterID?: string;
  features: Feature[];
  linkedAddresses: string[];
}

export interface Feature {
  title?: string;
  description?: string;
  link?: string;
}

interface Migration {
  id: string;
  accountID: string;
  status: MigrationStatus;
}

interface StripeConnect {
  accountID: string;
  service: string;
  status: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface VaultAddress {
  bitmark: string;
  ethereum: string;
  tezos: string;
}
