import { Injectable } from '@angular/core';

export interface ValueWithExpiry {
  value: string;
  expiry: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  public localStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
  }

  public get(key: string): unknown {
    if (this.isLocalStorageSupported) {
      return JSON.parse(this.localStorage.getItem(key));
    }

    return null;
  }

  public getWithExpiry(key: string) {
    const itemString = this.localStorage.getItem(key);
    const item: ValueWithExpiry = JSON.parse(itemString) as ValueWithExpiry;
    const { expiry, value } = item || {};

    if (!itemString || Date.now() > expiry) {
      this.localStorage.removeItem(key);
      return null;
    }

    return value;
  }

  public set(key: string, value: unknown) {
    if (this.isLocalStorageSupported) {
      this.localStorage.setItem(key, JSON.stringify(value));
    }
  }

  public setWithExpiry(key: string, value: string, ttl: number) {
    if (this.isLocalStorageSupported) {
      const item = {
        value,
        expiry: Date.now() + ttl,
      };
      this.localStorage.setItem(key, JSON.stringify(item));
    }
  }

  public remove(key: string) {
    if (this.isLocalStorageSupported) {
      this.localStorage.removeItem(key);
    }
  }

  private isLocalStorageSupported(): boolean {
    return Boolean(this.localStorage);
  }
}
