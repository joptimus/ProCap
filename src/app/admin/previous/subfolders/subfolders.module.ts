import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubfoldersPageRoutingModule } from './subfolders-routing.module';

import { SubfoldersPage } from './subfolders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubfoldersPageRoutingModule
  ],
  declarations: [SubfoldersPage]
})
export class SubfoldersPageModule {}
