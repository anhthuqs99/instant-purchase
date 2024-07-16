import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstantPurchaseComponent } from './components/instant-purchase/instant-purchase.component';

const routes: Routes = [
  {
    path: '',
    component: InstantPurchaseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstantPurchaseRoutingModule {}
