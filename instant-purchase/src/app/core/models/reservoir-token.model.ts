import { ArtworkDetail, OnchainListing } from './artwork.model';
import { FloorAskPrice, ShortCollection } from './reservoir-collection.model';
import { Blockchain } from './exhibition.model';
import { Series } from './series.model';
import { TRAVESS_MERGE_SERIES_ID } from '@shared/constants';

export class ReservoirToken {
  market?: {
    floorAsk?: {
      id?: string;
      price?: FloorAskPrice;
      source?: {
        url?: string;
      };
    };
  };

  token?: {
    chainId?: number;
    contract?: string;
    tokenId?: string;
    kind?: string;
    name?: string;
    image?: string;
    imageSmall?: string;
    imageLarge?: string;
    metadata?: Metadata;
    description?: string;
    rarityScore?: number;
    rarityRank?: number;
    supply?: string;
    remainingSupply?: string;
    media?: string;
    isFlagged?: boolean;
    isSpam?: boolean;
    metadataDisabled?: boolean;
    collection?: ShortCollection;
    lastAppraisalValue?: number;
  };
}

export class ReservoirTokenResponse {
  tokens: ReservoirToken[];
  continuation?: string;

  public static convertReservoirTokenToArtwork(
    reservoirToken: ReservoirToken
  ): ArtworkDetail {
    let onchainListing: OnchainListing;
    if (
      reservoirToken.market?.floorAsk?.price?.currency &&
      reservoirToken.market.floorAsk.price.amount?.decimal > 0
    ) {
      onchainListing = {
        price: reservoirToken.market.floorAsk.price.amount.decimal,
        currency: reservoirToken.market.floorAsk.price.currency.symbol || 'ETH',
      };
    }

    const series = this.convertReservoirTokenToSeries(reservoirToken);
    const artworkDetail: ArtworkDetail = {
      id: reservoirToken?.token?.tokenId,
      tokenID: reservoirToken?.token?.tokenId,
      series,
      index:
        reservoirToken?.token?.name?.split('#')?.length > 1
          ? Number(reservoirToken.token.name.split('#')[1])
          : 0,
      name: reservoirToken?.token?.name,
      blockchain: Blockchain.Ethereum,
      contractAddress: reservoirToken?.token?.contract,
      indexID: `eth-${reservoirToken?.token?.contract}-${reservoirToken?.token?.tokenId}`,
      isExternal: true,
      thumbnailURI: reservoirToken?.token?.imageLarge,
      marketplaceURL: reservoirToken?.market?.floorAsk?.source?.url,
      onchainListing,
      isTravessMergedArtwork: series?.id === TRAVESS_MERGE_SERIES_ID,
    };
    return artworkDetail;
  }

  private static convertReservoirTokenToSeries(
    reservoirToken: ReservoirToken
  ): Series {
    return {
      artist: {
        ID: reservoirToken?.token?.contract,
        alias: reservoirToken?.token?.collection?.name,
        slug: '',
      },
      title: reservoirToken?.token?.collection?.name,
      thumbnailURL:
        reservoirToken?.token?.collection?.imageUrl ||
        reservoirToken?.token?.image,
      settings: {
        maxArtwork: -1,
      },
    };
  }
}
