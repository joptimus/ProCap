import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PcsreportPage } from './pcsreport.page';

const routes: Routes = [
  {
    path: '',
    component: PcsreportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PcsreportPageRoutingModule {}
