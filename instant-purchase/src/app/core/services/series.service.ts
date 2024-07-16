import { SwapStatus } from '@core/models/swap.model';
import { Series, SeriesDetail, TokenIndexer } from '@core/models/series.model';
import { Injectable } from '@angular/core';
import { APIService } from '@core/services/api.service';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environment';
import {
  Blockchain,
  Contract,
  Exhibition,
  SaleModel,
} from '@core/models/exhibition.model';
import Web3 from 'web3';
import {
  AppSetting,
  TRAVESS_MERGE_SERIES_ID,
  YOKO_ONO_EDITION_ID,
  YOKO_ONO_PRIVATE_SERIES_ID,
} from '@shared/constants';
import { Utils } from '@shared/utils';
import {
  Artwork,
  ArtworkDetail,
  ArtworkModel,
  TokenMetadata,
} from '@core/models/artwork.model';
import { CollectionResponse } from '@core/models/reservoir-collection.model';
import { ReservoirTokenResponse, SaleType } from '@core/models';
import { PageRequest } from '@core/models/page.model';
import { SeriesAttribute } from '@core/models/john-gerrard.model';
import { ArtworkService } from './artwork.service';
import { NO_YEAR_IN_TITLE_SERIES_IDS } from '@shared/exception-items';

const web3 = new Web3(Web3.givenProvider || 'wss://walletconnect.bitmark.com');
export const RESERVOIR_TOKENS_QUERY_KEY = '/tokens/v6';
export enum IndexerVersion {
  V1 = 'v1',
  V2 = 'v2',
}

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  constructor(
    private readonly apiService: APIService,
    // private readonly exhibitionService: ExhibitionService,
    private readonly artworkService: ArtworkService,
  ) {}

  public async getSeriesDetail(
    id: string,
    expandParameters?: string[],
  ): Promise<SeriesDetail> {
    let expandMore = this.formatExpansion(expandParameters);
    expandMore = expandMore ? `?${expandMore}` : expandMore;
    return firstValueFrom(
      this.apiService
        .get<SeriesDetail>(`series/${id}${expandMore}`, {
          withCredentials: true,
        })
        .pipe(
          map((data) => {
            this.formatSeriesDetail(data);
            return data;
          }),
        ),
    );
  }

  public async getListSeriesInSet(
    exhibitionID: string,
    expandParameters?: string[],
  ): Promise<SeriesDetail[]> {
    let expandMore = this.formatExpansion(expandParameters);
    expandMore = expandMore ? `&${expandMore}` : expandMore;
    return firstValueFrom(
      this.apiService
        .get<SeriesDetail[]>(
          `series?exhibitionID=${exhibitionID}&sortBy=displayIndex&sortOrder=ASC${expandMore}`,
          {
            withCredentials: true,
          },
        )
        .pipe(map((data) => this.filterSeriesInSet(data)))
        .pipe(map((data) => data.map((item) => this.formatSeriesDetail(item)))),
    );
  }

  public async getSeries(
    exhibitionID: string,
    expandParameters?: string[],
  ): Promise<SeriesDetail[]> {
    let expandMore = this.formatExpansion(expandParameters);
    expandMore = expandMore ? `&${expandMore}` : expandMore;
    return firstValueFrom(
      this.apiService
        .get<SeriesDetail[]>(
          `series?exhibitionID=${exhibitionID}&sortBy=displayIndex&sortOrder=ASC${expandMore}`,
          {
            withCredentials: true,
          },
        )
        .pipe(
          map((data) =>
            data.filter(
              (art) => art.settings?.artworkModel !== ArtworkModel.unknown,
            ),
          ),
        )
        .pipe(map((data) => data.map((item) => this.formatSeriesDetail(item)))),
    );
  }

  public async getSeriesOfArtist(
    artistIDs: string | string[],
    page?: PageRequest,
    expandParams?: string[],
    issuedOnly = false,
  ): Promise<SeriesDetail[]> {
    let expandMore = this.formatExpansion(expandParams);
    expandMore = expandMore ? `&${expandMore}` : '';
    const queryString = Utils.getQueryString({ ...page });
    expandMore += queryString ? `&${queryString}` : '';
    const path =
      typeof artistIDs === 'string'
        ? `series?artistID=${artistIDs}${expandMore}`
        : `series?artistIDs=${artistIDs.join('&artistIDs=')}${expandMore}`;
    return firstValueFrom(
      this.apiService
        .get<SeriesDetail[]>(path, {
          withCredentials: true,
        })
        .pipe(map((data) => (issuedOnly ? this.filterIssuedArts(data) : data)))
        .pipe(map((data) => data.map((item) => this.formatSeriesDetail(item)))),
    );
  }

  public async getReservoirCollectionByID(id: string) {
    const path = `reservoir/collections?id=${id}&excludeSpam=true`;
    return firstValueFrom<CollectionResponse>(
      this.apiService.get<CollectionResponse>(path, { withCredentials: true }),
    );
  }

  public async getCollectionOfArtist(
    artistID: string,
    page?: PageRequest,
    sortingParameters?: string,
  ) {
    let path = `reservoir/collections?creator=${artistID}&excludeSpam=true`;
    const queryString = Utils.getQueryString({ ...page });
    path += queryString ? `&${queryString}` : '';
    path += sortingParameters ? `&${sortingParameters}` : '';
    return firstValueFrom<CollectionResponse>(
      this.apiService.get<CollectionResponse>(path, { withCredentials: true }),
    );
  }

  // eslint-disable-next-line max-params
  public async getAllSeries(
    expandParameters?: string[],
    sortingParameters?: string,
    pagingParameters?: string,
    filterParameters?: string,
    searchParameter?: string,
  ) {
    let expandMore = this.formatExpansion(expandParameters);
    expandMore = expandMore ? `?${expandMore}` : expandMore;
    if (sortingParameters) {
      expandMore += `&${sortingParameters}`;
    }

    if (pagingParameters) {
      expandMore += `&${pagingParameters}`;
    }

    if (filterParameters) {
      expandMore += `&${filterParameters}`;
    }

    if (searchParameter) {
      expandMore += `&${searchParameter}`;
    }

    return firstValueFrom(
      this.apiService
        .get<SeriesDetail[]>(`series${expandMore}`, {
          withCredentials: true,
        })
        .pipe(map((data) => data.map((item) => this.formatSeriesDetail(item)))),
    );
  }

  public async getArtworksOfSeriesByID(
    seriesID: string,
    pagingParameters?: string,
    sortingParameters?: string,
    expandParameters?: string[],
    filterParameters?: string,
  ): Promise<ArtworkDetail[]> {
    const parameters = [
      pagingParameters,
      sortingParameters,
      filterParameters,
      this.formatExpansion(expandParameters),
    ];
    if (seriesID === TRAVESS_MERGE_SERIES_ID) {
      parameters.push('filterBurned=true');
    }

    let expandMore = parameters.filter(Boolean).join('&');
    expandMore = expandMore ? `&${expandMore}` : '';
    return firstValueFrom<ArtworkDetail[]>(
      this.apiService
        .get<ArtworkDetail[]>(`artworks?seriesID=${seriesID}${expandMore}`, {
          withCredentials: true,
        })
        .pipe(
          map((data) =>
            data.map((item) => this.artworkService.formatArtwork(item)),
          ),
        ),
    );
  }

  public async getViewableTokenIDs(
    seriesID: string,
    pagingParameters?: string,
    filterParameters?: string,
  ) {
    // Only support for John Jerrard exhibition before minting
    const expandParameters = [pagingParameters, filterParameters]
      .filter(Boolean)
      .join('&');
    return firstValueFrom(
      this.apiService.get<string[]>(
        `artwork-attributes/artwork-ids?seriesID=${seriesID}&${expandParameters}`,
      ),
    );
  }

  public async getArtworksByOwner(
    ownerID: string,
    expandParams?: string[],
    skipAirDrop = false,
  ): Promise<ArtworkDetail[]> {
    let expandMore = this.formatExpansion(expandParams);
    expandMore = expandMore ? `&${expandMore}` : expandMore;
    return firstValueFrom(
      this.apiService
        .get<ArtworkDetail[]>(`artworks?ownerID=${ownerID}${expandMore}`, {
          withCredentials: true,
        })
        .pipe(
          map((data) => {
            if (skipAirDrop) {
              return data.filter(
                (ed) =>
                  Boolean(ed.series) &&
                  ed.series.settings.saleModel !== SaleModel.Airdrop,
              );
            }

            return data;
          }),
        )
        .pipe(
          map((data) =>
            data.map((item) => this.artworkService.formatArtwork(item)),
          ),
        ),
    );
  }

  public async getAttributesOfSeriesByID(
    seriesID: string,
  ): Promise<SeriesAttribute[]> {
    return firstValueFrom(this.apiService.get(`series/${seriesID}/attributes`));
  }

  public isArtworkSwapping(artwork: Artwork): boolean {
    return (
      artwork.swap &&
      artwork.swap.status !== SwapStatus.complete &&
      !artwork.swap.token
    );
  }

  public isArtworkSwapped(artwork: Artwork): boolean {
    return (
      artwork.swap &&
      artwork.swap.status === SwapStatus.complete &&
      !!artwork.swap.token
    );
  }

  public isInPreviewPeriod(series: Series): boolean {
    return (
      Date.now() <
      new Date(series.settings?.saleSettings?.shopping?.startedAt).getTime()
    );
  }

  public isOnSingleShoppingSalePeriod(series: SeriesDetail): boolean {
    const saleStartDate =
      series.settings?.saleSettings?.shopping?.startedAt &&
      new Date(series.settings?.saleSettings?.shopping?.startedAt);
    const saleEndDate =
      series.settings?.saleSettings?.shopping?.endedAt &&
      new Date(series.settings?.saleSettings?.shopping?.endedAt);
    const now = Date.now();
    return (
      saleStartDate &&
      now >= saleStartDate.getTime() &&
      (!saleEndDate || now <= saleEndDate.getTime())
    );
  }

  public isInSet(series: Series): boolean {
    return (
      (!series.settings?.initialSaleType ||
        series.settings?.initialSaleType === SaleType.set) &&
      series?.settings?.artworkModel !== ArtworkModel.single &&
      series.settings?.maxArtwork !== -1
    );
  }

  public isYokoOnoEdition(seriesID: string): boolean {
    return seriesID === YOKO_ONO_EDITION_ID;
  }

  public isYokoOnoPrivateSeries(seriesID: string): boolean {
    return seriesID === YOKO_ONO_PRIVATE_SERIES_ID;
  }

  public isSingle(series: Series): boolean {
    return series?.settings?.artworkModel === ArtworkModel.single;
  }

  public isEdition(series: Series): boolean {
    return series?.settings?.artworkModel === ArtworkModel.multi;
  }

  public isMergeSeries(series: Series): boolean {
    return series.id === TRAVESS_MERGE_SERIES_ID;
  }

  public isBundleSale(series: Series): boolean {
    return [
      SaleType.seriesRandomBundle,
      SaleType.seriesSequenceBundle,
    ].includes(series?.settings?.initialSaleType);
  }

  public isSingleSale(series: Series): boolean {
    return series?.settings?.initialSaleType === SaleType.single;
  }

  public isSingleShoppingSale(series: Series): boolean {
    return (
      this.isSingleSale(series) &&
      series.settings?.saleModel === SaleModel.Shopping
    );
  }

  public isCollectedArtwork(artwork: Artwork): boolean {
    return !artwork.virgin;
  }

  public async getWeb3Series(
    ownerID: string,
    pageParameters: string,
    indexerVersion?: IndexerVersion,
  ): Promise<TokenIndexer[]> {
    const versionPath = indexerVersion === IndexerVersion.V1 ? '' : 'v2/';
    const path = `${environment.nftIndexerURL}/${versionPath}nft?owner=${ownerID}&${pageParameters}`;
    return firstValueFrom(this.apiService.get<TokenIndexer[]>(path));
  }

  public async getWeb3ArtworkDetail(
    indexIDs: string[],
    indexerVersion?: IndexerVersion,
  ): Promise<TokenIndexer[]> {
    const path = `${environment.nftIndexerURL}/${
      indexerVersion || 'v2'
    }/nft/query`;
    return firstValueFrom(
      this.apiService.post<TokenIndexer[]>(path, {
        ids: indexIDs,
      }),
    );
  }

  public async getReservoirTokenByTokenIdentifies(
    tokenIdentifies: string[],
  ): Promise<ReservoirTokenResponse> {
    return firstValueFrom(
      this.apiService.get<ReservoirTokenResponse>(
        `${
          environment.reservoirURL
        }${RESERVOIR_TOKENS_QUERY_KEY}?${tokenIdentifies.join('&')}`,
      ),
    );
  }

  public async syncArtwork() {
    return firstValueFrom(
      this.apiService.post('accounts/me/refresh-artwork', null, {
        withCredentials: true,
      }),
    );
  }

  public formatArtworkIndexID(artwork: ArtworkDetail, exhibition: Exhibition) {
    if (!artwork.indexID && exhibition?.mintBlockchain) {
      let contractAddress: string;
      let blockchain: Blockchain;
      if (exhibition.mintBlockchain === Blockchain.Bitmark && artwork.swap) {
        contractAddress = artwork.swap.contractAddress;
        blockchain = artwork.swap.blockchainType;
      } else {
        contractAddress = exhibition.contracts[0]?.address;
        blockchain = exhibition.mintBlockchain;
      }

      switch (blockchain) {
        case Blockchain.Tezos:
          if (artwork?.swap?.token) {
            artwork.indexID = `tez-${contractAddress}-${artwork.swap.token}`;
          } else {
            artwork.indexID = `tez-${contractAddress}-${artwork.id}`;
          }
          break;
        case Blockchain.Ethereum:
          if (artwork?.swap?.token) {
            artwork.indexID = `eth-${contractAddress}-${artwork.swap.token}`;
          } else {
            artwork.indexID = `eth-${contractAddress}-${artwork.id}`;
          }
          break;
        case Blockchain.Bitmark:
          artwork.indexID = `bmk--${artwork.id}`;
          break;
        default:
          break;
      }
    }
  }

  public isAirDrop(art: Series): boolean {
    return art.settings?.saleModel === SaleModel.Airdrop;
  }

  public async customPreviewFromTokenMetadata(
    contract: Contract,
    tokenID: string,
  ): Promise<string> {
    if (contract?.blockchainType === Blockchain.Ethereum && tokenID) {
      const rpcEndpoint = AppSetting.ethPRCEndpoint[
        Number.parseInt(environment.walletChainID, 10)
      ] as string;
      const tokenIDHex = Utils.bnToHex(tokenID);
      const result = await firstValueFrom(
        this.apiService.post<string>(rpcEndpoint, {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: contract.address,
              data: `0xc87b56dd${tokenIDHex}`, // Default interface is 8 digits at prefix
            },
            'latest',
          ],
          id: 1,
        }),
      );
      const tokenURL = web3.eth.abi
        .decodeParameter('string', result)
        .toString();
      const tokenResponse = await fetch(tokenURL);
      const tokenMetadata = (await tokenResponse.json()) as TokenMetadata;
      return tokenMetadata?.animation_url;
    }

    return null;
  }

  public formatBundleDescription(series: Series): string {
    let bundleDescription = series.metadata?.bundleDescription;
    if (bundleDescription?.startsWith('Collector receives:')) {
      bundleDescription = bundleDescription.substring(
        'Collector receives:'.length,
      );
    }
    return bundleDescription;
  }

  public async getOriginPreviewByIndex(
    seriesID: string,
    index: number,
  ): Promise<string> {
    return firstValueFrom(
      this.apiService.get<string>(
        `series/${seriesID}/${index}/original-image-presigned-url`,
      ),
    );
  }

  public filterSeriesNotInSet(listSeries: Series[]) {
    return listSeries?.filter((series) => !this.isInSet(series));
  }

  public filterSeriesInSet(listSeries: Series[]) {
    return listSeries?.filter((series) => this.isInSet(series));
  }

  public filterEditionsNotInSet(listSeries: Series[]) {
    return listSeries?.filter(
      (series) => this.isEdition(series) && !this.isInSet(series),
    );
  }

  public filterSingleShoppingSeries(listSeries: Series[]) {
    return listSeries?.filter((series) => this.isSingleShoppingSale(series));
  }

  public async getNumberOfRemainingEditions(seriesID: string) {
    return firstValueFrom(
      this.apiService.get<number>(`series/${seriesID}/shoppings/count`),
    );
  }

  public async getNumberOfRemainingRandomBundleArtworks(seriesID: string) {
    return firstValueFrom(
      this.apiService.get<number>(
        `series/${seriesID}/random-bundle-artwork-count`,
      ),
    );
  }

  public getSaleEndTime(series: Series) {
    return this.isSingleShoppingSale(series)
      ? series.settings?.saleSettings?.shopping?.endedAt
      : series.exhibition?.settings?.set_settings.ended_at;
  }

  private formatExpansion(params: string[]): string {
    return params && params.length
      ? params.map((p) => `${p}=true`).join('&')
      : '';
  }

  private filterIssuedArts(series: Series[]) {
    if (series?.length) {
      return series.filter((art) => art.onchainID);
    }

    return series;
  }

  private formatSeriesDetail(series: SeriesDetail): SeriesDetail {
    let date = new Date(series.createdAt);
    if (series.mintedAt) {
      date = new Date(series.mintedAt);
    }

    // Exception
    if (!NO_YEAR_IN_TITLE_SERIES_IDS.includes(series.id)) {
      series.title = `${series.title} (${date.getFullYear()})`;
    }

    return series;
  }
}
