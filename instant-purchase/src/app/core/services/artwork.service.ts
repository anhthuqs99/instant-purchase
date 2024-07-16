import { Injectable } from '@angular/core';
import {
  Artwork,
  ArtworkAttribute,
  ArtworkDetail,
  Blockchain,
  CreatedToken,
  Exhibition,
  ExpansionData,
  ReservoirTokenResponse,
} from '@core/models';
import { APIService } from './api.service';
import { firstValueFrom, map } from 'rxjs';
import { PageRequest } from '@core/models/page.model';
import { Utils } from '@shared/utils';
import { TRAVESS_MERGE_SERIES_ID } from '@shared/constants';

@Injectable({
  providedIn: 'root',
})
export class ArtworkService {
  constructor(private readonly apiService: APIService) {}
  public convertArtworkAttributeToExpansionData(
    artworkAttributes: ArtworkAttribute[],
  ): ExpansionData[] {
    if (artworkAttributes) {
      const expansionData: ExpansionData[] = [];
      artworkAttributes.forEach((item) => {
        expansionData.push({
          title: item.traitType,
          leftData: item.value,
          rightData: this.formatNumberWithTwoDecimals(item.percentage) + '%',
        });
      });
      return expansionData;
    }

    return [];
  }

  public getArtworkByID(artworkID: string, expandParameters?: string[]) {
    const expandMore = this.formatExpansion(expandParameters);
    return this.apiService
      .get<ArtworkDetail>(`artworks/${artworkID}?${expandMore}`)
      .pipe(
        map((data) => {
          this.formatArtwork(data);
          return data;
        }),
      );
  }

  public async getArtworksByIDs(ids: string[], page?: PageRequest) {
    let path =
      ids.length > 0 ? `artworks?ids=${ids.join('&ids=')}` : 'artworks';
    const queryString = Utils.getQueryString({ ...page });
    path += queryString ? `&${queryString}` : '';
    return firstValueFrom(
      this.apiService
        .get<Artwork[]>(path)
        .pipe(map((data) => data.map((item) => this.formatArtwork(item)))),
    );
  }

  public async getCreatedTokensInFF(
    artistIDs: string[],
    seriesID?: string,
    page?: PageRequest,
  ): Promise<CreatedToken[]> {
    let path = `tokens?artistIDs=${artistIDs.join('&artistIDs=')}`;
    const queryString = Utils.getQueryString({ ...page, seriesID });
    path += queryString ? `&${queryString}` : '';
    return firstValueFrom(this.apiService.get<CreatedToken[]>(path));
  }

  public async getGlobalTokensByCollection(
    collectionID: string,
    page?: PageRequest,
  ): Promise<ReservoirTokenResponse> {
    let path = `reservoir/tokens?collection=${collectionID}`;
    const queryString = Utils.getQueryString({ ...page });
    path += queryString ? `&${queryString}` : '';
    return firstValueFrom(this.apiService.get<ReservoirTokenResponse>(path));
  }

  public async getTokenReservoir(
    tokenIDs: string[],
    collectionID?: string,
    page?: PageRequest,
  ): Promise<ReservoirTokenResponse> {
    let path = `reservoir/tokens?tokens=${tokenIDs.join('&tokens=')}`;
    const queryString = Utils.getQueryString({
      ...page,
      collection: collectionID,
    });
    path += queryString ? `&${queryString}` : '';
    return firstValueFrom(this.apiService.get<ReservoirTokenResponse>(path));
  }

  public getFeaturedWorks() {
    return this.apiService.get<ArtworkDetail[]>(
      'artworks/featured?includeActiveSwap=true',
    );
  }

  public getArtworkBlockchain(artwork: ArtworkDetail, exhibition: Exhibition) {
    if (exhibition.mintBlockchain === Blockchain.Bitmark && artwork.swap) {
      return artwork.swap?.blockchainType;
    }

    return exhibition.mintBlockchain;
  }

  public getArtworkAttributeByID(
    artworkID: string,
  ): Promise<ArtworkAttribute[]> {
    return firstValueFrom(
      this.apiService.get<ArtworkAttribute[]>(
        `artwork-attributes?artworkID=${artworkID}`,
      ),
    );
  }

  public formatArtwork(artwork: Artwork) {
    artwork.isTravessMergedArtwork =
      artwork.seriesID === TRAVESS_MERGE_SERIES_ID;
    return artwork;
  }

  private formatNumberWithTwoDecimals(value: number): string {
    const formattedValue = Number.parseFloat(value.toFixed(2));

    return formattedValue % 1 === 0
      ? formattedValue.toString()
      : formattedValue.toFixed(2);
  }

  private formatExpansion(params: string[]): string {
    return params && params.length
      ? params.map((p) => `${p}=true`).join('&')
      : '';
  }
}
