import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Blockchain } from '@core/models/exhibition.model';
import { environment } from '@environment';
import { AppSetting } from '@shared/constants';
import { countdown } from '@shared/countdown.helper';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class CurrencyService implements OnDestroy {
  private exchangeRate: number;
  private exchangeRateSubject = new BehaviorSubject(false);
  private exchangeRateTimer: Subscription;
  constructor(private httpClient: HttpClient) {
    this.getExchangeRate();
  }

  ngOnDestroy(): void {
    this.exchangeRateTimer.unsubscribe();
  }

  public currencyRoundFormat(currency: Blockchain | string) {
    switch (currency) {
      case Blockchain.Ethereum:
      case 'ETH':
        return AppSetting.ETHRoundFactor;
      case Blockchain.Bitmark:
      case 'USD':
      case 'USDC':
        return AppSetting.USDCRoundFactor;
      case Blockchain.Tezos:
      case 'XTZ':
        return AppSetting.XTZRoundFactor;
      default:
        return AppSetting.USDCRoundFactor;
    }
  }

  public convertETHToUSD(amount: number) {
    return this.exchangeRate * amount;
  }

  public convertUSDToETH(amount: number) {
    if (this.exchangeRate <= 0) {
      return 0;
    }

    return amount / this.exchangeRate;
  }

  public getCurrentExchangeRate() {
    return this.exchangeRate;
  }

  public getStatus() {
    return this.exchangeRateSubject;
  }

  private setupTimer() {
    if (this.exchangeRateTimer) {
      this.exchangeRateTimer.unsubscribe();
    }
    const currentTime = new Date();
    this.exchangeRateTimer = countdown(
      moment(currentTime).add(3, 'minutes'),
    ).subscribe(async (duration: moment.Duration) => {
      if (duration.asMilliseconds() <= 0) {
        this.getExchangeRate();
      }
    });
  }

  private getExchangeRate() {
    this.httpClient
      .get(`${environment.coinBaseURL}/prices/eth-usd/spot`)
      .subscribe({
        next: async (spot) => {
          this.exchangeRate = spot['data']?.['amount'];
          this.exchangeRateSubject.complete();
          this.setupTimer();
        },
        error: (error) => {
          console.log(error);
          this.exchangeRateSubject.complete();
        },
      });
  }
}
