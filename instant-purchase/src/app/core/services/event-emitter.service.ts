import { Injectable, EventEmitter } from '@angular/core';
import { Me } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class EventEmitterService {
  public static Events = {
    IsDisabledMinting: 'is-disabled-minting',
    IsHideHeader: 'is-hide-header',
    IsHideHeaderOnly: 'is-hide-header-only',
    IsHideFooter: 'is-hide-footer',
    HeaderUp: 'header-up',
    IsDarken: 'turn-to-dark',
    UpdateMe: 'update-me',
  };

  private static eventEmitters = {};

  public static get(
    eventName: string
  ): EventEmitter<string | boolean | number | Me> {
    this.eventEmitters[eventName] =
      this.eventEmitters[eventName] || new EventEmitter();
    return this.eventEmitters[eventName];
  }
}
