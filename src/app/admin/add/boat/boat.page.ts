import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';

import { DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ImageCroppedEvent, LoadedImage, ImageCropperComponent } from 'ngx-image-cropper';
import { AlertController, LoadingController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { Logger } from 'src/app/services/logger.service';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-boat',
  templateUrl: './boat.page.html',
  styleUrls: ['./boat.page.scss'],
})
export class BoatPage implements OnInit {
  @ViewChild('cropper') cropper: ImageCropperComponent;
  croppedImage: any = '';
  myImage = null;

  fromWhere;

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
    private route: Router,
    private alertController: AlertController,
    private logger: Logger
  ) {}

  ngOnInit() {
    this.selectImage();
    this.fromWhere = this.dataService.fromWhereIcame[0].from;
    this.logger.debug('onInit :', this.fromWhere);
  }

  async presentAlert(header, sub, message) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: sub,
      message: message,
      buttons: ['OK']
    });
    this.logger.error('Error Alert presented',
    'header: ' + header,
    'subHeader: ' + sub,
    'message: ' + message, 
    );
    await alert.present();
  }

  async selectImage() {
    //this.buttonId(value);
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    const loading = await this.loadingCtrl.create({
      message: 'Uploading Photo',
    });
    await loading.present();

    this.myImage = image.dataUrl;
    this.croppedImage = null;

    await loading.dismiss();
    // if (image) {
    //   this.compressFile(image.dataUrl);
    // }
  }

  compressFile(image) {
    this.bytesBefore = this.imageCompress.byteCount(image);
    this.imageCompress.compressFile(image, 2, 30, 30).then(
      (result: DataUrl) => {
        this.imgResultAfterCompress = result;
        if (this.imageCompress.byteCount(result) > 1000000) {
          this.loadingCtrl.dismiss();
          this.logger.debug('did this work?');
          this.presentAlert(
            'Compression Error', 
            'Photo exceeds max size allowed', 
            'The image is too big. The current size is ' + this.imageCompress.byteCount(result) /1000000 + ' MB and the max size is 1MB. Please try cropping the image smaller');
        } else {

       this.saveImage(this.imgResultAfterCompress);
        //this.dataService.tempBoatUpload[0].data = this.myImage;
        this.bytesAfter = this.imageCompress.byteCount(result);
        this.difference = this.bytesBefore - this.bytesAfter;
        this.percentage = ((this.bytesBefore - this.bytesAfter) / this.bytesBefore) * 100;
        let percent = this.percentage.toFixed(2);
        // this.logger.debug('Size in bytes after compression is now:', this.bytesAfter + ' bytes');
        // this.logger.debug('After compression:', this.bytesAfter / 1000 + ' KB');
        // this.logger.debug('After compression:', this.bytesAfter / 1000000 + ' MB');
        
        this.logger.debug('Original Size: ', this.bytesBefore / 1000000 + ' MB');
        this.logger.debug('After compression:', this.bytesAfter / 1000000 + ' MB');
        this.logger.debug('File reduced by (MB):', this.difference / 1000000 + ' MB or ', percent,  '%');
        };
      },
      (error: any) => console.error(error)
    );
  }

  async saveImage(photoBase64: string) {
    //const base64Data = await this.readAsBase64(photo);
    //this.logger.debug(base64Data);
    // this.logger.debug('compressed Image : ', photoBase64);

    const fileName = 'tempUpload' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: photoBase64,
      directory: Directory.Data,
    });
    this.logger.info('saved: ', savedFile);

    this.croppedImage = photoBase64;
    this.dataService.tempBoatUpload[0].data = this.croppedImage;
    //this.logger.debug('this.cropped Image = ', this.croppedImage);
    this.navigateBack();
  }

  // #region This is the CROPPER IMAGE CODE

  imageLoaded() {
    this.loadingCtrl.dismiss();
  }

  loadImageFailed() {
    this.logger.error('Image failed to Load');
  }

  async cropImage() {
    const loading = await this.loadingCtrl.create({
      message: 'Cropping and saving photo to database...'
    });
    await loading.present();

    this.croppedImage = this.cropper.crop().base64;
    this.compressFile(this.croppedImage);
    //this.logger.debug(this.croppedImage);
   
    
    //this.logger.debug('DATA SERVICE', this.dataService.tempBoatUpload[0].data);
    this.myImage = null;
    
  }

  // #endregion /////

  navigateBack() {
    this.logger.debug('what is this.Fromwhere start ', this.fromWhere);
    if (this.fromWhere === 'addPage') {
      this.route.navigate(['add']);
      this.loadingCtrl.dismiss();
    }
    if (this.fromWhere === 'detail') {
      this.logger.debug('what is this.Fromwhere ', this.fromWhere);
      this.route.navigate(['clients','detail']);
      this.loadingCtrl.dismiss();
    }
   
  }
}
