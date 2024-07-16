import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { firstValueFrom } from 'rxjs';

export enum PriceConvertPairs {
  ETH2USD = 'eth-usd',
  USD2ETH = 'usd-eth',
  XTZ2USD = 'xtz-usd',
  USD2XTZ = 'usd-xtz',
}

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  constructor(private readonly apiService: APIService) {}

  public async getExchangeRate(pair: PriceConvertPairs): Promise<number> {
    return firstValueFrom(this.apiService.get<number>(`exchange-rate/${pair}`));
  }
}
