import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BilgePageRoutingModule } from './bilge-routing.module';

import { BilgePage } from './bilge.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BilgePageRoutingModule
  ],
  declarations: [BilgePage]
})
export class BilgePageModule {}
