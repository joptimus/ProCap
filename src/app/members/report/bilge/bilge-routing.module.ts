import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BilgePage } from './bilge.page';

const routes: Routes = [
  {
    path: '',
    component: BilgePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BilgePageRoutingModule {}
