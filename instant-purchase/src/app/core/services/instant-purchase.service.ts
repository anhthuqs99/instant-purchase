import { Injectable } from '@angular/core';
import { APIService } from '@core/services/api.service';
import { firstValueFrom } from 'rxjs';

export interface InstantPurchase {
  id: string;
  params?: InstantPurchaseParams;
}

export interface InstantPurchaseParams {
  seriesID: string;
  quantity: number;
  saleID: string;
  saleStatus: string;
}

@Injectable({
  providedIn: 'root',
})
export class InstantPurchaseService {
  constructor(private apiService: APIService) {}

  public createInstantPurchase(artworkID: string) {
    return this.apiService.post('instant-purchase', { artworkID }, null);
  }

  public getInstantPurchase(instantPurchaseID: string) {
    return firstValueFrom(
      this.apiService.get<InstantPurchase>(
        `instant-purchase/${instantPurchaseID}`,
        null
      )
    );
  }

  public putInstantPurchase(data: any) {
    return firstValueFrom(this.apiService.put(`instant-purchase`, data, null));
  }
}
