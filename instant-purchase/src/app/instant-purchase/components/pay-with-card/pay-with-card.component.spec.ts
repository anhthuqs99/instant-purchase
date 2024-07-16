import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayWithCardComponent } from './pay-with-card.component';

describe('PayWithCardComponent', () => {
  let component: PayWithCardComponent;
  let fixture: ComponentFixture<PayWithCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayWithCardComponent]
    });
    fixture = TestBed.createComponent(PayWithCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
