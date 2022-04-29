import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnginesPage } from './engines.page';

const routes: Routes = [
  {
    path: '',
    component: EnginesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnginesPageRoutingModule {}
