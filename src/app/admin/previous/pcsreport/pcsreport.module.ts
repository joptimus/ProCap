import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PcsreportPageRoutingModule } from './pcsreport-routing.module';

import { PcsreportPage } from './pcsreport.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PcsreportPageRoutingModule
  ],
  declarations: [PcsreportPage]
})
export class PcsreportPageModule {}
