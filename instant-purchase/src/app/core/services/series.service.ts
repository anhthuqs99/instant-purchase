import { SeriesDetail } from '@core/models/series.model';
import { Injectable } from '@angular/core';
import { APIService } from '@core/services/api.service';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { NO_YEAR_IN_TITLE_SERIES_IDS } from '@shared/exception-items';
@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  constructor(private readonly apiService: APIService) {}

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

  private formatExpansion(params: string[]): string {
    return params && params.length
      ? params.map((p) => `${p}=true`).join('&')
      : '';
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
