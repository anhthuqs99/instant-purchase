import { Exhibition } from '@core/models/exhibition.model';
import { Injectable } from '@angular/core';
import { APIService } from '@core/services/api.service';
import * as moment from 'moment';
import { environment } from '@environment';
import { UserService } from '@core/services/user.service';
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
  constructor(
    private readonly apiService: APIService,
    private readonly userService: UserService
  ) {}

  public async createShoppingBidOfArtwork(
    askID: string,
    seriesID: string,
    exhibition: Exhibition,
    method: PaymentMethods,
    isEditionSale: boolean,
    web3Token?: string,
    web3Address?: string
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
          'seconds'
        )
      )
    ) {
      const code = await hashOrderChecksum(
        this.userService.getMe().ID + (isEditionSale ? seriesID : askID)
      );
      const payload = isEditionSale
        ? { seriesID, method, code }
        : { askID, method, code };
      return firstValueFrom(
        this.apiService.post<BidAskDetail>('shoppings/bids', payload, {
          withCredentials: true,
          headers,
        })
      );
    }

    const payload = isEditionSale ? { seriesID, method } : { askID, method };
    return firstValueFrom(
      this.apiService.post<BidAskDetail>('shoppings/bids', payload, {
        withCredentials: true,
        headers,
      })
    );
  }

  public async createSeriesBundleShoppingSale(
    seriesID: string,
    quantity: number,
    saleType: SaleType
  ) {
    if (saleType === SaleType.seriesRandomBundle) {
      return this.createSeriesRandomBundleShoppingSale(seriesID, quantity);
    }

    return this.createSeriesSequenceBundleShoppingSale(seriesID, quantity);
  }

  public async createSeriesRandomBundleShoppingSale(
    seriesID: string,
    quantity: number,
    web3Token?: string,
    web3Address?: string
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
        }
      )
    );
  }

  public async createSeriesSequenceBundleShoppingSale(
    seriesID: string,
    quantity: number,
    web3Token?: string,
    web3Address?: string
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
        }
      )
    );
  }

  public async cancelSeriesBundleShoppingSale(
    askID: string,
    saleType: SaleType
  ) {
    if (saleType === SaleType.seriesRandomBundle) {
      return this.cancelSeriesRandomBundleShoppingSale(askID);
    }

    return this.cancelSeriesSequenceBundleShoppingSale(askID);
  }

  public async cancelSeriesRandomBundleShoppingSale(askID: string) {
    return firstValueFrom(
      this.apiService.patch(
        `random-bundle-shopping/${askID}/cancellation`,
        null,
        {
          withCredentials: true,
        }
      )
    );
  }

  public async cancelSeriesSequenceBundleShoppingSale(askID: string) {
    return firstValueFrom(
      this.apiService.patch(
        `sequence-bundle-shopping/${askID}/cancellation`,
        null,
        {
          withCredentials: true,
        }
      )
    );
  }

  public async getPurchasingSeriesBundleShoppingSale(
    seriesID: string,
    saleType: SaleType
  ) {
    if (saleType === SaleType.seriesRandomBundle) {
      return this.getPurchasingSeriesRandomBundleShoppingSale(seriesID);
    }

    return this.getPurchasingSeriesSequenceBundleShoppingSale(seriesID);
  }

  public async getPurchasingSeriesRandomBundleShoppingSale(seriesID: string) {
    return firstValueFrom(
      this.apiService.get<SaleDetail>(
        `random-bundle-shopping/active?seriesID=${seriesID}&includeAsk=true&includeBid=true&includePayment=true`,
        {
          withCredentials: true,
        }
      )
    );
  }

  public async getPurchasingSeriesSequenceBundleShoppingSale(seriesID: string) {
    return firstValueFrom(
      this.apiService.get<SaleDetail>(
        `sequence-bundle-shopping/active?seriesID=${seriesID}&includeAsk=true&includeBid=true&includePayment=true`,
        {
          withCredentials: true,
        }
      )
    );
  }

  public async cancelBid(
    bidID: string,
    web3Token?: string,
    web3Address?: string
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
      })
    );
  }

  public async getAsk(askID: string): Promise<BidAskDetail> {
    return firstValueFrom(
      this.apiService.get<BidAskDetail>(`asks/${askID}`, {
        withCredentials: true,
      })
    );
  }

  public async getBid(bidID: string): Promise<EngAucBid> {
    return firstValueFrom(
      this.apiService.get<EngAucBid>(`bids/${bidID}`, {
        withCredentials: true,
      })
    );
  }

  public canCancelSale(sale: SaleDetail): boolean {
    // The following situation not allow to cancel sale:
    // ask linked with a not expired sale
    // ask linked with a sale under status processing, succeeded
    // ask linked with an expired sale, sale linked with a bid and payment status is under processing, authorized or succeeded
    if (sale) {
      if (sale.status !== SaleStatus.submitted) {
        return false;
      }

      const payment = (sale?.bid as BidAskDetail)?.payment;
      if (
        payment &&
        (payment.source === PaymentMethods.crypto ||
          payment.status !== PaymentStatus.failed)
      ) {
        return false;
      }

      return true;
    }

    return true;
  }
}
