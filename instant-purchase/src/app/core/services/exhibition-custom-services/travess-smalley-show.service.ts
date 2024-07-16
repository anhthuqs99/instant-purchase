import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as Sentry from '@sentry/angular-ivy';
import { ArtworkDetail, SeriesDetail } from '@core/models';
import { Injectable } from '@angular/core';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root',
})
export class TravessSmalleyShowService {
  private beforeMintingArtworkTitles: string[] = [];

  constructor(private readonly http: HttpClient) {}

  public async getBeforeMintingArtworkTitles(
    series: SeriesDetail
  ): Promise<string[]> {
    if (this.beforeMintingArtworkTitles?.length) {
      return this.beforeMintingArtworkTitles;
    }

    try {
      this.beforeMintingArtworkTitles = await firstValueFrom(
        this.http.get<string[]>(this.getJsonFileName(series))
      );
    } catch (error) {
      Sentry.captureMessage(
        'TravessSmalleyShowService: getBeforeMintingArtworkTitles error ',
        error
      );
    }

    return this.beforeMintingArtworkTitles;
  }

  public async getBeforeMintingBundleArtworks(
    series: SeriesDetail,
    offset: number,
    limit = 50
  ): Promise<ArtworkDetail[]> {
    await this.getBeforeMintingArtworkTitles(series);
    const fakeArtworks: ArtworkDetail[] = [];
    const endIndex = Math.min(offset + limit, series.settings.maxArtwork);
    const promises: Array<Promise<ArtworkDetail>> = [];
    for (let index = offset; index < endIndex; index++) {
      promises.push(this.getBeforeMintingArtworkByIndex(index, series));
    }

    const artworks = await Promise.all(promises);
    fakeArtworks.push(...artworks);
    return fakeArtworks;
  }

  public async getBeforeMintingArtworkByIndex(
    index: number,
    series: SeriesDetail
  ): Promise<ArtworkDetail> {
    await this.getBeforeMintingArtworkTitles(series);
    const artworkName = await this.getArtworkName(series, index);
    const artwork = {
      index,
      seriesID: series.id,
      name: artworkName,
      virgin: true,
      previewURI: this.getArtworkPreview(series, index),
    };
    return artwork;
  }

  public getArtworkPreview(series: SeriesDetail, index: number) {
    return `${series.uniquePreviewPath}/${index}/`;
  }

  public async getArtworkName(
    series: SeriesDetail,
    index: number
  ): Promise<string> {
    const beforeMintingArtworkTitles = await this.getBeforeMintingArtworkTitles(
      series
    );
    return index < beforeMintingArtworkTitles.length
      ? `${beforeMintingArtworkTitles[index]}.png`
      : '';
  }

  private getJsonFileName(series: SeriesDetail) {
    return (
      `${environment.cloudFrontEndpoint}` +
      series.uniquePreviewPath.replaceAll(
        '_unique-previews',
        'artwork_list.json'
      )
    );
  }
}
