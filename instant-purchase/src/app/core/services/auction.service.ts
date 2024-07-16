import { PaymentMethods, PaymentResponse } from '@core/models/payment.model';
import {
  AuctionDetail,
  BidAskDetail,
  EngAuctionSetting,
} from './../models/transaction.model';
import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuctionService {
  constructor(private apiService: APIService) {}

  public async getAuction(
    auctionID: string,
    expandParameters?: string[]
  ): Promise<AuctionDetail> {
    let expandMore = this.formatExpansion(expandParameters);
    expandMore = expandMore ? `?${expandMore}` : expandMore;
    return firstValueFrom(
      this.apiService.get<AuctionDetail>(`auctions/${auctionID}${expandMore}`)
    );
  }

  // english auction

  public async engAuctionCreateBid(
    auctionID: string,
    amount: string,
    recipientAddress: string
  ): Promise<BidAskDetail> {
    return firstValueFrom(
      this.apiService.post<BidAskDetail>(
        `english-auctions/${auctionID}/bids`,
        { amount, recipientAddress },
        { withCredentials: true }
      )
    );
  }

  public biddingPricePromoted(
    auctionSetting: EngAuctionSetting,
    highestBid: number
  ): number {
    const gapPriceFactor = highestBid * auctionSetting.minIncrementFactor;
    const gapPrice =
      auctionSetting.minIncrementAmount > gapPriceFactor
        ? auctionSetting.minIncrementAmount
        : gapPriceFactor;
    return highestBid + gapPrice;
  }

  // eslint-disable-next-line max-params
  public async createPayment(
    method: PaymentMethods,
    bidID: string,
    recipientAddress?: string,
    paymentMethodID?: string,
    returnURL?: string
  ): Promise<PaymentResponse> {
    return firstValueFrom(
      this.apiService.post<PaymentResponse>(
        `payments?method=${method}`,
        { bidID, recipientAddress, paymentMethodID, returnURL },
        { withCredentials: true }
      )
    );
  }

  // end english auction
  // ------------

  // reverse dutch auction
  public async createBidOnReverseDutchAuction(
    auctionID: string,
    askID?: string,
    method?: PaymentMethods
  ): Promise<BidAskDetail> {
    return firstValueFrom(
      this.apiService.post<BidAskDetail>(
        `reverse-dutch-auctions/${auctionID}/bids`,
        { askID, method },
        { withCredentials: true }
      )
    );
  }
  // end reverse dutch auction

  private formatExpansion(params: string[]): string {
    return params && params.length
      ? params.map(p => `${p}=true`).join('&')
      : '';
  }
}
