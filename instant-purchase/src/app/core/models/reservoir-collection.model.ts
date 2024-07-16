export interface FloorAskPrice {
  currency?: {
    contract?: string;
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  amount?: {
    raw?: string;
    decimal?: number;
    usd?: number;
    native?: number;
  };
}

export interface ShortCollection {
  id?: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  slug?: string;
  symbol?: string;
  creator?: string;
  tokenCount?: string;
  metadataDisabled?: boolean;
  floorAskPrice?: FloorAskPrice;
}

export interface BPSRecipient {
  bps?: number;
  recipient?: string;
}

export interface Collection extends ShortCollection {
  chainId?: number;
  createdAt?: string;
  updatedAt?: string;
  contractDeployedAt?: string;
  banner?: string;
  twitterUrl?: string;
  discordUrl?: string;
  externalUrl?: string;
  twitterUsername?: string;
  openseaVerificationStatus?: string;
  description?: string;
  isSpam?: boolean;
  isNsfw?: boolean;
  isMinting?: boolean;
  sampleImages?: string[];
  onSaleCount?: string;
  primaryContract?: string;
  tokenSetId?: string;
  royalties?: {
    recipient?: string;
    breakdown?: BPSRecipient[];
    bps?: number;
  };

  allRoyalties?: {
    onchain?: BPSRecipient[];
    opensea?: BPSRecipient[];
  };

  floorAsk?: {
    id?: string;
    price?: number;
    maker?: string;
    validFrom?: number;
    validUntil?: number;
    token?: string;
  };

  topBid?: {
    id?: string;
    sourceDomain?: string;
    price?: number;
    maker?: string;
    validFrom?: number;
    validUntil?: number;
  };

  collectionBidSupported?: boolean;
  ownerCount?: number;
  contractKind?: string;
  mintedTimestamp?: number;
}

export interface CollectionResponse {
  collections?: Collection[];
  continuation?: string;
}
