import { Injectable } from '@angular/core';
import { Utils } from '@shared/utils';

type PagesScrollPosition = {
  key: string;
  x: number;
  y: number;
  scrollHeight: number;
};

const maxQueue = 2;

@Injectable({
  providedIn: 'root',
})
export class ScrollPositionService {
  private readonly pagesScrollPosition: PagesScrollPosition[] = [];
  private readonly pagesNumberOfItems = new Map<string, number>();

  public pushScrollPosition(path: string) {
    const scrollPositionX =
      window.scrollX || document.documentElement.scrollLeft;
    const scrollPositionY =
      window.scrollY || document.documentElement.scrollTop;
    const newPosition = {
      key: path,
      x: scrollPositionX,
      y: scrollPositionY,
      scrollHeight: document.documentElement.scrollHeight,
    };
    this.pagesScrollPosition.push(newPosition);
    if (this.pagesScrollPosition.length > maxQueue) {
      this.pagesScrollPosition.shift();
    }
  }

  public async scroll(path: string, behavior?: ScrollBehavior) {
    const previousPosition = this.getPreviousPosition(path);
    if (!previousPosition) {
      return;
    }

    try {
      const checkHeightMillisecond = 50;
      // 10 seconds -> times
      const totalCheckCount = (10 * 1000) / checkHeightMillisecond;
      if (previousPosition) {
        const checkCount = await this.checkScrollHeight(
          previousPosition,
          checkHeightMillisecond,
          totalCheckCount,
          0,
        );

        if (checkCount < totalCheckCount) {
          window.scrollTo({
            top: previousPosition.y,
            left: previousPosition.x,
            behavior: behavior || ('instant' as ScrollBehavior),
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  public trackNumberOfItems(path: string, numberOfItems: number) {
    this.pagesNumberOfItems.set(path, numberOfItems);
  }

  public getPreviousNumberOfItems(path: string): number {
    return this.pagesNumberOfItems.get(path) || 0;
  }

  private async checkScrollHeight(
    previousPosition: PagesScrollPosition,
    interval: number,
    totalCheckCount: number,
    checkCount = 0,
  ): Promise<number> {
    if (
      document.documentElement.scrollHeight < previousPosition.scrollHeight &&
      checkCount < totalCheckCount
    ) {
      await Utils.delay(interval);
      return this.checkScrollHeight(
        previousPosition,
        interval,
        totalCheckCount,
        checkCount + 1,
      );
    }

    return checkCount;
  }

  private getPreviousPosition(path: string): PagesScrollPosition {
    let previousPosition: PagesScrollPosition;
    if (
      this.pagesScrollPosition?.length &&
      this.pagesScrollPosition.at(-1).key === path
    ) {
      previousPosition = this.pagesScrollPosition.pop();
    } else if (
      this.pagesScrollPosition?.length === maxQueue &&
      this.pagesScrollPosition[0].key === path
    ) {
      previousPosition = this.pagesScrollPosition.shift();
    }

    return previousPosition;
  }
}
