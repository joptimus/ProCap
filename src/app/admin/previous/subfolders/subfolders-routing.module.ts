import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubfoldersPage } from './subfolders.page';

const routes: Routes = [
  {
    path: '',
    component: SubfoldersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubfoldersPageRoutingModule {}
