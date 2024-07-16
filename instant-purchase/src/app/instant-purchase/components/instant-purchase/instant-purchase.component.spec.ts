import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantPurchaseComponent } from './instant-purchase.component';

describe('InstantPurchaseComponent', () => {
  let component: InstantPurchaseComponent;
  let fixture: ComponentFixture<InstantPurchaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstantPurchaseComponent]
    });
    fixture = TestBed.createComponent(InstantPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
