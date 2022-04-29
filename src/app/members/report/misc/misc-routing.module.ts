import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MiscPage } from './misc.page';

const routes: Routes = [
  {
    path: '',
    component: MiscPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiscPageRoutingModule {}
