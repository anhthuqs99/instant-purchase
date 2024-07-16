import { BidAskStatus } from '@core/models';

export interface ContractBid {
  auctionID?: string;
  amount?: string;
  bidder?: string;
  timestamp?: number;
  status?: BidAskStatus;
  createdAt?: string;
  creatorID?: string;
}

export interface Activity extends ContractBid {
  artworkName?: string;
  askID?: string;
  bidderAlias?: string;
  convertedUSD?: number;
}

export interface ContractHistoryBids {
  auction?: {
    endAt?: number;
    isSettled?: boolean;
  };
  highestBid?: ContractBid;
  endAt?: number | string;
  isSettled?: boolean;
  bids?: ContractBid[];
}

export interface AuctionActivityHistory extends ContractHistoryBids {
  onchainID?: string;
  artworkName?: string;
  artworkIndex?: number;
  askID?: string;
  ended?: boolean;
  auctionEndAt?: string;
  // We need to show both the private sale and public auction, this field is from our database
  isPrivate?: boolean;
}

export interface OnchainAuction {
  id: string;
  startAt?: number;
  endAt?: number;
  isSettled?: boolean;
  extendDuration?: number;
  extendThreshold?: number;
  minIncreaseAmount?: number;
  minIncreaseFactor?: number;
  minPrice?: number;
}

export interface ContractEvent {
  blockNumber?: number;
  timestamp?: string | number;
  returnValues: {
    auctionId?: string;
    bidder?: string;
    amount?: string;
    to?: string;
  };
}
