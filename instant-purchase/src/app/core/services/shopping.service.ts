import { PaymentMethods, PaymentResponse } from '@core/models/payment.model';
import { Injectable } from '@angular/core';
import { APIService } from '@core/services';
import { FullSaleDetail, SaleStatus } from '@core/models';
import { firstValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

const InstantPurchaseCallbackURI = '/app/instant-purchase?';

export interface InstantPurchaseToken {
  id: string;
  params?: {
    saleID?: string;
    seriesID?: string;
    saleStatus?: SaleStatus;
    quantity?: number;
  };
}

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
    web3Address?: string
  ): Promise<PaymentResponse> {
    let headers: HttpHeaders = new HttpHeaders();
    if (web3Token && web3Address) {
      headers = headers.append('Web3Token', web3Token);
      headers = headers.append('Web3Address', web3Address);

      return firstValueFrom(
        this.apiService.post<PaymentResponse>(
          `payments?method=${method}`,
          { bidID, recipientAddress, paymentMethodID, returnURL },
          { withCredentials: true, headers }
        )
      );
    }

    return firstValueFrom(
      this.apiService.post<PaymentResponse>(
        `payments?method=${method}`,
        { bidID, recipientAddress, paymentMethodID, returnURL },
        { withCredentials: true }
      )
    );
  }

  public async getSale(
    saleID: string,
    expandParams?: string[],
    web3Token?: string,
    web3Address?: string
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
      })
    );
  }

  public async getMineActiveSale(
    askID: string,
    seriesID?: string
  ): Promise<FullSaleDetail> {
    let parameter = askID ? `askID=${askID}` : `seriesID=${seriesID}`;
    parameter = parameter.concat('&includePayment=true');

    return firstValueFrom(
      this.apiService.get<FullSaleDetail>(
        `accounts/me/active-sale?${parameter}`,
        {
          withCredentials: true,
        }
      )
    );
  }

  public getInstantPurchaseURL(
    token: string,
    seriesID?: string,
    askID?: string,
    quantity?: number,
    chain?: string
  ) {
    let callbackURL = location.origin + InstantPurchaseCallbackURI;
    if (seriesID) {
      callbackURL += `sr=${seriesID}`;
    }

    if (quantity) {
      callbackURL += `&qty=${quantity}`;
    }

    if (askID) {
      callbackURL += `ask=${askID}`;
    }

    return firstValueFrom(
      this.apiService.post<{ link: string }>('instant-purchase/deep-link', {
        token,
        callbackURL,
        chain,
      })
    );
  }

  public createInstantPurchaseToken() {
    return firstValueFrom(
      this.apiService.post<InstantPurchaseToken>('instant-purchase')
    );
  }

  public async getInstantPurchaseToken(token: string) {
    return firstValueFrom(
      this.apiService.get<InstantPurchaseToken>(`instant-purchase/${token}`)
    );
  }

  private formatExpansion(params: string[]): string {
    return params && params.length
      ? params.map(p => `${p}=true`).join('&')
      : '';
  }
}
