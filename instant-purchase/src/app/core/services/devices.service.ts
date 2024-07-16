import { Injectable, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export enum ScreenSize {
  SM = 425,
  MD = 768,
  LG = 1024,
  XL = 1400,
  XXL = 1824,
  XXXL = 2560,
}
export enum ScreenType {
  small,
  medium,
  large,
}
export enum DetectType {
  number,
  type,
}

@Injectable({
  providedIn: 'root',
})
export class DevicesService {
  @Input() detectSize: DetectType = 0;
  screenSize: Subject<number> = new Subject();

  public static iOSDetector(): boolean {
    return (
      /iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  public static isMobile(): boolean {
    return /iPhone|iPod|Android/i.test(navigator.userAgent);
  }

  public static isAutonomyIRL(): boolean {
    return /autonomy/i.test(navigator.userAgent);
  }

  public static isSafariBrowser(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  public setSize(width: number): Observable<number> {
    if (this.detectSize === DetectType.number) {
      this.screenSize.next(width);
    } else {
      if (width <= ScreenSize.MD) {
        this.screenSize.next(ScreenType.small);
      } else if (width > ScreenSize.MD) {
        this.screenSize.next(ScreenType.medium);
      }
      if (width > ScreenSize.LG) {
        this.screenSize.next(ScreenType.large);
      }
    }
    return this.screenSize;
  }
}
