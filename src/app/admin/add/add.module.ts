import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPageRoutingModule } from './add-routing.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AddPage } from './add.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    AddPageRoutingModule,
    ImageCropperModule
  ],
  declarations: [AddPage]
})
export class AddPageModule {}
