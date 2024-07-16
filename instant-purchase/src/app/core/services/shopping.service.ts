import { PaymentMethods, PaymentResponse } from '@core/models/payment.model';
import { Injectable } from '@angular/core';
import { APIService } from '@core/services';
import { FullSaleDetail } from '@core/models';
import { firstValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ShoppingService {
  constructor(private readonly apiService: APIService) {}

  // eslint-disable-next-line max-params
  public async createPayment(
    method: PaymentMethods,
    bidID: string,
    recipientAddress: string,
    paymentMethodID?: string,
    returnURL?: string,
    web3Token?: string,
    web3Address?: string,
  ): Promise<PaymentResponse> {
    let headers: HttpHeaders = new HttpHeaders();
    if (web3Token && web3Address) {
      headers = headers.append('Web3Token', web3Token);
      headers = headers.append('Web3Address', web3Address);

      return firstValueFrom(
        this.apiService.post<PaymentResponse>(
          `payments?method=${method}`,
          { bidID, recipientAddress, paymentMethodID, returnURL },
          { withCredentials: true, headers },
        ),
      );
    }

    return firstValueFrom(
      this.apiService.post<PaymentResponse>(
        `payments?method=${method}`,
        { bidID, recipientAddress, paymentMethodID, returnURL },
        { withCredentials: true },
      ),
    );
  }

  public async getSale(
    saleID: string,
    expandParams?: string[],
    web3Token?: string,
    web3Address?: string,
  ): Promise<FullSaleDetail> {
    let headers: HttpHeaders = new HttpHeaders();
    if (web3Token && web3Address) {
      headers = headers.append('Web3Token', web3Token);
      headers = headers.append('Web3Address', web3Address);
    }

    let expandMore = this.formatExpansion(expandParams);
    expandMore = expandMore ? `?${expandMore}` : expandMore;
    return firstValueFrom(
      this.apiService.get<FullSaleDetail>(`sales/${saleID}${expandMore}`, {
        withCredentials: true,
        headers,
      }),
    );
  }

  private formatExpansion(params: string[]): string {
    return params && params.length
      ? params.map((p) => `${p}=true`).join('&')
      : '';
  }
}
