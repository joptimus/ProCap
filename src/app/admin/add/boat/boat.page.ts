import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ImageCroppedEvent, LoadedImage, ImageCropperComponent } from 'ngx-image-cropper';
import { LoadingController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-boat',
  templateUrl: './boat.page.html',
  styleUrls: ['./boat.page.scss'],
})
export class BoatPage implements OnInit {
  @ViewChild('cropper') cropper: ImageCropperComponent;
  croppedImage: any = '';
  myImage = null;

  isMobile = Capacitor.getPlatform() !== 'web';

  bytesBefore: number;
  bytesAfter: number;
  difference: number;
  percentage: number;

  imgResultBeforeCompress: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  imgResultAfterResize: DataUrl = '';
  imgResultUpload: DataUrl = '';
  imgResultAfterResizeMax: DataUrl = '';
  imgResultMultiple: UploadResponse[] = [];

  constructor(
    private imageCompress: NgxImageCompressService,
    private loadingCtrl: LoadingController,
    private dataService: DataService,
    private route: Router
  ) {}

  ngOnInit() {
    this.selectImage();
  }

  async selectImage() {
    //this.buttonId(value);
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.croppedImage = null;
    if (image) {
      this.compressFile(image.dataUrl);
    }
  }

  compressFile(image) {
    this.bytesBefore = this.imageCompress.byteCount(image);
    console.log('Before compression:', this.bytesBefore + ' bytes');
    console.log('Before compression:', this.bytesBefore / 1000 + ' KB');
    console.log('Before compression:', this.bytesBefore / 1000000 + ' MB');
    this.imageCompress.compressFile(image, 2, 50, 50).then(
      (result: DataUrl) => {
       // this.imgResultAfterCompress = result;
        this.myImage = result;
        //this.saveImage(this.imgResultAfterCompress);
        this.bytesAfter = this.imageCompress.byteCount(result);
        this.difference = this.bytesBefore - this.bytesAfter;
        this.percentage =
          ((this.bytesBefore - this.bytesAfter) / this.bytesBefore) * 100;
        let percent = this.percentage.toFixed(2);
        console.log(
          'Size in bytes after compression is now:',
          this.bytesAfter + ' bytes'
        );
        console.log('After compression:', this.bytesAfter / 1000 + ' KB');
        console.log('After compression:', this.bytesAfter / 1000000 + ' MB');

        console.log('File reduced by (KB):', this.difference / 1000 + ' KB');
        console.log('File reduced by (MB):', this.difference / 1000000 + ' MB or ', percent,'%');
      },
      (error: any) => console.error(error)
    );
  }

  // #region This is the CROPPER IMAGE CODE

  imageLoaded() {
    this.loadingCtrl.dismiss();
  }

  loadImageFailed() {
    console.log('Image failed to Load');
  }

  async cropImage() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.croppedImage = this.cropper.crop().base64;
    //console.log(this.croppedImage);
    this.dataService.tempBoatUpload[0].data = this.croppedImage;
    //console.log('DATA SERVICE',this.dataService.tempBoatUpload[0].data);
    this.myImage = null;
    this.navigateBack();
  }

  navigateBack() {
    this.route.navigate(['add']);
    this.loadingCtrl.dismiss();
  }
}
