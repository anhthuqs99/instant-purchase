import { Exhibition } from '@core/models/exhibition.model';
import { Injectable } from '@angular/core';
import { APIService } from '@core/services/api.service';
import * as moment from 'moment';
import { environment } from '@environment';
import { hashOrderChecksum } from '@core/logic/checksum.logic';
import {
  BidAskDetail,
  EngAucBid,
  FullSaleDetail,
  PaymentMethods,
  PaymentStatus,
  SaleDetail,
  SaleStatus,
  SaleType,
} from '@core/models';
import { firstValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export enum CreditPurchaseState {
  InitiatingPurchase = 'collect.initiating-purchase',
  SendingPayment = 'collect.sending-payment',
  WaitingForPaymentConfirm = 'collect.waiting-for-payment-confirm',
  PurchaseComplete = 'collect.purchase-complete',
}

export enum CryptoPurchaseState {
  InitiatingPurchase = 'Initiating purchase...',
  AwaitingPayment = 'Awaiting payment',
  ReceivePayment = 'Receiving Payment',
  PaymentConfirmation = 'Waiting for payment confirmation...',
  PaymentComplete = 'Payment Complete',
  SaleComplete = 'Sale Complete',
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private readonly apiService: APIService) {}

  public async createShoppingBidOfArtwork(
    askID: string,
    seriesID: string,
    exhibition: Exhibition,
    method: PaymentMethods,
    isEditionSale: boolean,
    web3Token?: string,
    web3Address?: string,
  ): Promise<BidAskDetail> {
    const now = new Date();
    let headers: HttpHeaders = new HttpHeaders();
    if (web3Token && web3Address) {
      headers = headers.append('Web3Token', web3Token);
      headers = headers.append('Web3Address', web3Address);
    }

    if (
      moment(now).isSameOrAfter(moment(exhibition.exhibitionStartAt)) &&
      moment(now).isBefore(
        moment(exhibition.exhibitionStartAt).add(
          Number.parseFloat(environment.launchThresholdSeconds),
          'seconds',
        ),
      )
    ) {
      const code = await hashOrderChecksum(
        web3Address + (isEditionSale ? seriesID : askID),
      );
      const payload = isEditionSale
        ? { seriesID, method, code }
        : { askID, method, code };
      return firstValueFrom(
        this.apiService.post<BidAskDetail>('shoppings/bids', payload, {
          withCredentials: true,
          headers,
        }),
      );
    }

    const payload = isEditionSale ? { seriesID, method } : { askID, method };
    return firstValueFrom(
      this.apiService.post<BidAskDetail>('shoppings/bids', payload, {
        withCredentials: true,
        headers,
      }),
    );
  }

  public async createSeriesRandomBundleShoppingSale(
    seriesID: string,
    quantity: number,
    web3Token?: string,
    web3Address?: string,
  ) {
    let headers: HttpHeaders = new HttpHeaders();
    if (web3Token && web3Address) {
      headers = headers.append('Web3Token', web3Token);
      headers = headers.append('Web3Address', web3Address);
    }

    return firstValueFrom(
      this.apiService.post<SaleDetail>(
        'random-bundle-shopping',
        { seriesID, quantity },
        {
          headers,
          withCredentials: true,
        },
      ),
    );
  }

  public async createSeriesSequenceBundleShoppingSale(
    seriesID: string,
    quantity: number,
    web3Token?: string,
    web3Address?: string,
  ) {
    let headers: HttpHeaders = new HttpHeaders();
    if (web3Token && web3Address) {
      headers = headers.append('Web3Token', web3Token);
      headers = headers.append('Web3Address', web3Address);
    }

    return firstValueFrom(
      this.apiService.post<FullSaleDetail>(
        'sequence-bundle-shopping',
        { seriesID, quantity },
        {
          headers,
          withCredentials: true,
        },
      ),
    );
  }

  public async cancelBid(
    bidID: string,
    web3Token?: string,
    web3Address?: string,
  ) {
    let headers: HttpHeaders = new HttpHeaders();
    if (web3Token && web3Address) {
      headers = headers.append('Web3Token', web3Token);
      headers = headers.append('Web3Address', web3Address);
    }

    return firstValueFrom(
      this.apiService.post(`bids/${bidID}/cancellation`, null, {
        withCredentials: true,
        headers,
      }),
    );
  }

  public async getAsk(askID: string): Promise<BidAskDetail> {
    return firstValueFrom(
      this.apiService.get<BidAskDetail>(`asks/${askID}`, {
        withCredentials: true,
      }),
    );
  }

  public async getBid(bidID: string): Promise<EngAucBid> {
    return firstValueFrom(
      this.apiService.get<EngAucBid>(`bids/${bidID}`, {
        withCredentials: true,
      }),
    );
  }
}
