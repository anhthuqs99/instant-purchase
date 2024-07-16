import { Injectable } from '@angular/core';

const clientPaymentIntent = 'client_intent';
const orderID = 'order';
const orderExpiredAt = 'order_expired';
const dimissInstallationAlert = 'dismiss_installation_alert';
const stripeUpdatedAt = 'stripe_updated_at';
const dismissMediasModal = 'dismiss_Medias_Modal';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  public static paymentIntentClientSecret = clientPaymentIntent;
  public static orderID = orderID;
  public static orderExpiredAt = orderExpiredAt;
  public static dimissInstallationAlert = dimissInstallationAlert;
  public static stripeUpdatedAt = stripeUpdatedAt;
  public static dismissMediasModal = dismissMediasModal;
  public sessionStorage: Storage;

  constructor() {
    this.sessionStorage = window.sessionStorage;
  }

  public get(key: string) {
    if (this.isSessionStorageSupported) {
      return JSON.parse(this.sessionStorage.getItem(key));
    }
    return null;
  }

  public set(key: string, value: unknown) {
    if (this.isSessionStorageSupported) {
      this.sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  public remove(key: string) {
    if (this.isSessionStorageSupported) {
      this.sessionStorage.removeItem(key);
    }
  }

  private isSessionStorageSupported(): boolean {
    return !!this.sessionStorage;
  }
}
