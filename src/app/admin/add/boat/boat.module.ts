import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BoatPageRoutingModule } from './boat-routing.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BoatPage } from './boat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BoatPageRoutingModule,
    ImageCropperModule
  ],
  declarations: [BoatPage]
})
export class BoatPageModule {}
