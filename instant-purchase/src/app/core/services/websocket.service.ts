import { environment } from '@environment';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { SyncBalance } from '@core/models/payment.model';
import { Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  LostBid,
  NewAucStatus,
  NewEngAucBid,
  NewDutAucBid,
  NewExhSaleStatus,
  NewPaymentFailed,
  NewSaleSucceeded,
  RejectedBid,
} from '@core/models/transaction.model';
import {
  NewSeriesShoppingAvailableAskCount,
  NewTS044ArtworkMerged,
} from '@core/models';

export enum WebsocketEvent {
  syncWallet = 'syncWallet',
  lostBid = 'lostBid',
  newBid = 'newBid',
  newDutAucBid = 'newDutAucBid',
  newExhSaleStatus = 'newExhSaleStatus',
  newAucStatus = 'newAucStatus',
  rejectedBid = 'rejectedBid',
  newPaymentFailed = 'newPaymentFailed',
  newSaleSucceeded = 'newSaleSucceeded',
  newSeriesShoppingAvailableAskCount = 'newSeriesShoppingAvailableAskCount',
  newTS044ArtworkMerged = 'newTS044ArtworkMerged',
}

enum ClientMethod {
  add = 'add',
  del = 'del',
  clear = 'clear',
  list = 'list',
}

export class WebsocketResponse {
  accountID?: string;
  data?:
    | SyncBalance
    | LostBid
    | NewEngAucBid
    | NewDutAucBid
    | NewExhSaleStatus
    | NewAucStatus
    | RejectedBid
    | NewPaymentFailed
    | NewSaleSucceeded
    | NewSeriesShoppingAvailableAskCount
    | NewTS044ArtworkMerged;
  event: string;
  action?: ClientMethod;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  subject: WebSocketSubject<WebsocketResponse>;
  private readonly eventMaps = new Map<WebsocketEvent | string, number>();
  private callbackMaps: Map<
    WebsocketEvent | string,
    EventEmitter<
      | SyncBalance
      | LostBid
      | NewEngAucBid
      | NewDutAucBid
      | NewExhSaleStatus
      | NewAucStatus
      | RejectedBid
      | NewPaymentFailed
      | NewSaleSucceeded
      | NewSeriesShoppingAvailableAskCount
      | NewTS044ArtworkMerged
    >
  >;

  constructor() {
    this.subject = webSocket<WebsocketResponse>(environment.eventsURL);
    this.subject.subscribe(msg => {
      const event = <WebsocketEvent>msg.event;
      if (this.callbackMaps.has(event)) {
        this.callbackMaps.get(event).emit(msg.data);
      }
    });
    this.registerEvent();
  }

  private registerEvent() {
    // eslint-disable-next-line
    this.callbackMaps = new Map<WebsocketEvent, EventEmitter<any>>([
      [WebsocketEvent.syncWallet, new EventEmitter<SyncBalance>()],
      [WebsocketEvent.lostBid, new EventEmitter<LostBid>()],
      [WebsocketEvent.newBid, new EventEmitter<NewEngAucBid>()],
      [WebsocketEvent.newDutAucBid, new EventEmitter<NewDutAucBid>()],
      [WebsocketEvent.newExhSaleStatus, new EventEmitter<NewExhSaleStatus>()],
      [WebsocketEvent.newAucStatus, new EventEmitter<NewAucStatus>()],
      [WebsocketEvent.rejectedBid, new EventEmitter<RejectedBid>()],
      [WebsocketEvent.newPaymentFailed, new EventEmitter<NewPaymentFailed>()],
      [WebsocketEvent.newSaleSucceeded, new EventEmitter<NewSaleSucceeded>()],
      [
        WebsocketEvent.newTS044ArtworkMerged,
        new EventEmitter<NewTS044ArtworkMerged>(),
      ],
    ]);
  }

  // eslint-disable-next-line
  subscribeOn(event: WebsocketEvent | string): EventEmitter<any> {
    if (this.eventMaps.has(event)) {
      this.eventMaps.set(event, this.eventMaps.get(event) + 1);
    } else {
      this.eventMaps.set(event, 1);
      this.subject.next({
        action: ClientMethod.add,
        event: event,
      });
    }

    if (!this.callbackMaps.has(event)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.callbackMaps.set(event, new EventEmitter());
    }

    return this.callbackMaps.get(event);
  }

  unsubscribeOn(event: WebsocketEvent, subscription: Subscription) {
    subscription.unsubscribe();
    if (this.eventMaps.has(event)) {
      this.eventMaps.set(event, this.eventMaps.get(event) - 1);
      if (this.eventMaps.get(event) <= 0) {
        this.subject.next({
          action: ClientMethod.del,
          event: event,
        });
        this.eventMaps.delete(event);
      }
    }

    // for debug only
    // this.subject.next({
    //     action: ClientMethod.list,
    //     event: ""
    // })
  }

  ngOnDestroy(): void {
    this.subject.next({
      action: ClientMethod.clear,
      event: '',
    });
  }
}
