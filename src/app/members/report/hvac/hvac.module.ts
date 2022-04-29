import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HvacPageRoutingModule } from './hvac-routing.module';

import { HvacPage } from './hvac.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HvacPageRoutingModule
  ],
  declarations: [HvacPage]
})
export class HvacPageModule {}
