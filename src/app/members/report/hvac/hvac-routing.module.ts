import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HvacPage } from './hvac.page';

const routes: Routes = [
  {
    path: '',
    component: HvacPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HvacPageRoutingModule {}
