import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstantPurchaseRoutingModule } from './instant-purchase-routing.module';
import { InstantPurchaseComponent } from './components/instant-purchase/instant-purchase.component';
import { PayWithCardComponent } from './components/pay-with-card/pay-with-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CustomCurrencyPipe } from './currency.pipe';

@NgModule({
  declarations: [
    InstantPurchaseComponent,
    PayWithCardComponent,
    CustomCurrencyPipe,
  ],
  imports: [
    CommonModule,
    InstantPurchaseRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class InstantPurchaseModule {}
