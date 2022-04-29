import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnginesPageRoutingModule } from './engines-routing.module';

import { EnginesPage } from './engines.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnginesPageRoutingModule
  ],
  declarations: [EnginesPage]
})
export class EnginesPageModule {}
