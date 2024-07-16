import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'instant-purchase', pathMatch: 'full' },
  {
    path: 'instant-purchase',
    loadChildren: () =>
      import('./instant-purchase/instant-purchase.module').then(
        (m) => m.InstantPurchaseModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
