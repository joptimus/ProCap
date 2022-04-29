import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MiscPageRoutingModule } from './misc-routing.module';

import { MiscPage } from './misc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MiscPageRoutingModule
  ],
  declarations: [MiscPage]
})
export class MiscPageModule {}
