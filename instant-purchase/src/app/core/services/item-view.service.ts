import { Injectable } from '@angular/core';

export enum ViewType {
  ListView = 'asList',
  GridView = 'asGrid',
}

@Injectable({
  providedIn: 'root',
})
export class ItemViewService {
  private viewType: ViewType;

  public getCurrentViewType() {
    return this.viewType || ViewType.ListView;
  }
  public updateViewType(type: ViewType) {
    this.viewType = type;
    return this.viewType;
  }
}
