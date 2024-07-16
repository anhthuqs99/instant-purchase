import { Injectable } from '@angular/core';

const sortingStorage = 'sortingStorage';

export enum CollectPageType {
  HighestBidAuction = 'highestBidAuction',
  GroupAuction = 'groupAuction',
  FixedPrice = 'fixedPrice',
  Secondary = 'secondary',
}

export enum SortBy {
  artistName = 'artistName',
  seriesMaxArtwork = 'seriesMaxArtwork',
  availableAmount = 'availableAmount',
  auctionEndedAt = 'auctionEndedAt',
  name = 'name',
  artworkSize = 'artworkSize',
  floorPrice = 'floorPrice',
  highestBidPrice = 'highestBidPrice',
  price = 'price',
  remainArtwork = 'remainArtwork',
  title = 'title',
  chain = 'mintBlockchain',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

class SortParam {
  sortBy: SortBy;
  sortOrder: SortOrder;

  constructor(sortBy: SortBy, sortOrder: SortOrder) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

class SortingStorage {
  highestBidAuction: SortParam;
  groupAuction: SortParam;
  fixedPrice: SortParam;
  secondary: SortParam;

  constructor(
    highestBidAuction?: SortParam,
    groupAuction?: SortParam,
    fixedPrice?: SortParam,
    secondary?: SortParam
  ) {
    this.highestBidAuction = highestBidAuction;
    this.groupAuction = groupAuction;
    this.fixedPrice = fixedPrice;
    this.secondary = secondary;
  }
}

@Injectable({
  providedIn: 'root',
})
export class SortingStorageService {
  public currentSortingParam: SortParam;
  highestBidSortBy: SortBy[] = [
    SortBy.title,
    SortBy.artistName,
    SortBy.name,
    SortBy.auctionEndedAt,
    SortBy.highestBidPrice,
    SortBy.chain,
  ];
  groupSortBy: SortBy[] = [
    SortBy.title,
    SortBy.artistName,
    SortBy.availableAmount,
    SortBy.auctionEndedAt,
    SortBy.floorPrice,
    SortBy.chain,
  ];
  fixedPriceSortBy: SortBy[] = [
    SortBy.title,
    SortBy.artistName,
    SortBy.seriesMaxArtwork,
    SortBy.remainArtwork,
    SortBy.price,
    SortBy.chain,
  ];
  secondarySortBy: SortBy[] = [
    SortBy.title,
    SortBy.artistName,
    SortBy.artworkSize,
    SortBy.remainArtwork,
    SortBy.price,
    SortBy.chain,
  ];

  public getSortingParams(collectPageType: CollectPageType): string {
    const sorting = localStorage.getItem(sortingStorage);
    let sortingStorageObject = JSON.parse(sorting) as SortingStorage;
    if (!sortingStorageObject) {
      sortingStorageObject = new SortingStorage();
    }
    this.setDefaultValueIfNeeded(sortingStorageObject);
    switch (collectPageType) {
      case CollectPageType.HighestBidAuction:
        if (
          !this.highestBidSortBy.includes(
            sortingStorageObject.highestBidAuction.sortBy
          )
        ) {
          sortingStorageObject.highestBidAuction = new SortParam(
            SortBy.title,
            SortOrder.ASC
          );
        }
        this.currentSortingParam = sortingStorageObject.highestBidAuction;
        return this.sortingParams(sortingStorageObject.highestBidAuction);
      case CollectPageType.GroupAuction:
        if (
          !this.groupSortBy.includes(sortingStorageObject.groupAuction.sortBy)
        ) {
          sortingStorageObject.groupAuction = new SortParam(
            SortBy.title,
            SortOrder.ASC
          );
        }
        this.currentSortingParam = sortingStorageObject.groupAuction;
        return this.sortingParams(sortingStorageObject.groupAuction);
      case CollectPageType.FixedPrice:
        if (
          !this.fixedPriceSortBy.includes(
            sortingStorageObject.fixedPrice.sortBy
          )
        ) {
          sortingStorageObject.fixedPrice = new SortParam(
            SortBy.title,
            SortOrder.ASC
          );
        }
        this.currentSortingParam = sortingStorageObject.fixedPrice;
        return this.sortingParams(sortingStorageObject.fixedPrice);
      case CollectPageType.Secondary:
        if (
          !this.secondarySortBy.includes(sortingStorageObject.secondary.sortBy)
        ) {
          sortingStorageObject.secondary = new SortParam(
            SortBy.title,
            SortOrder.ASC
          );
        }
        this.currentSortingParam = sortingStorageObject.secondary;
        return this.sortingParams(sortingStorageObject.secondary);
      default:
        return '';
    }
  }

  public setSortingParams(collectPageType: CollectPageType, sortBy: SortBy) {
    const sorting = localStorage.getItem(sortingStorage);
    const sortingStorageObject = JSON.parse(sorting) as SortingStorage;
    this.currentSortingParam = this.getSortParam(sortBy);
    switch (collectPageType) {
      case CollectPageType.HighestBidAuction:
        sortingStorageObject.highestBidAuction = this.currentSortingParam;
        break;
      case CollectPageType.GroupAuction:
        sortingStorageObject.groupAuction = this.currentSortingParam;
        break;
      case CollectPageType.FixedPrice:
        sortingStorageObject.fixedPrice = this.currentSortingParam;
        break;
      case CollectPageType.Secondary:
        sortingStorageObject.secondary = this.currentSortingParam;
        break;
    }
    localStorage.setItem(sortingStorage, JSON.stringify(sortingStorageObject));
  }

  private setDefaultValueIfNeeded(sortingStorageObject: SortingStorage) {
    this.currentSortingParam = new SortParam(SortBy.title, SortOrder.ASC);
    if (!sortingStorageObject.highestBidAuction) {
      sortingStorageObject.highestBidAuction = this.currentSortingParam;
    }
    if (!sortingStorageObject.groupAuction) {
      sortingStorageObject.groupAuction = this.currentSortingParam;
    }
    if (!sortingStorageObject.fixedPrice) {
      sortingStorageObject.fixedPrice = this.currentSortingParam;
    }
    if (!sortingStorageObject.secondary) {
      sortingStorageObject.secondary = this.currentSortingParam;
    }
    localStorage.setItem(sortingStorage, JSON.stringify(sortingStorageObject));
  }

  private sortingParams(sortParam: SortParam): string {
    return `sortBy=${sortParam.sortBy}&sortOrder=${sortParam.sortOrder}`;
  }

  private getSortParam(destSortingBy: SortBy): SortParam {
    const sortOrder =
      this.currentSortingParam.sortBy === destSortingBy
        ? this.switchSortOrder(this.currentSortingParam.sortOrder)
        : SortOrder.ASC;
    return new SortParam(destSortingBy, sortOrder);
  }

  private switchSortOrder(sortOrder: SortOrder): SortOrder {
    return sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
  }
}
