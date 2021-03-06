import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { DbDataService, Client } from 'src/app/services/db-data.service';
import { DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
import { ImageCroppedEvent, LoadedImage, ImageCropperComponent } from 'ngx-image-cropper';
import { Capacitor } from '@capacitor/core';
import { Route, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Logger } from 'src/app/services/logger.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  @ViewChild('cropper') cropper: ImageCropperComponent;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  cropImgPreview: any = "";
  myImage = null;
  isMobile = Capacitor.getPlatform() !== 'web';

  credentials: FormGroup;
  base64Str: any;
  kbytes: number;
  photoData = null;
  vesselName = null;

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
    private clientService: DbDataService,
    private data: DataService,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private titleCase: TitleCasePipe,
    private imageCompress: NgxImageCompressService,
    private route: Router,
    private loadingCtrl: LoadingController,
    private logger: Logger
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      fullName: [''],
      fName: [''],
      lName: [''],
      vessel: [''],
      photo: [''],
      noEngines: [''],
      email: [''],
    });
    this.photoData = this.data.tempBoatUpload[0].data;
    //this.logger.info('the local photo Data ON INIT', this.photoData);
  }

  ionViewDidEnter () {
    this.photoData = this.data.tempBoatUpload[0].data;
  //  this.logger.debug('is there any photo data? ', this.photoData);
   // this.logger.debug('the local photo Data REFRESH', this.photoData);
  }

  update() {
    this.ngOnInit();
  }

  get fullName() {
    return this.credentials.get('fullName');
  }
  get password() {
    return this.credentials.get('password');
  }

  vesselNameCheck() {
    if (this.credentials.get('vessel').value === null) {
      let noName = 'No Name - ';
      this.vesselName = noName;
    }
  }

  async addClient() {
    const loading = await this.loadingController.create({
      message: 'Sending client to database...',
    });
    await loading.present();
    let transform = this.titleCase.transform(
      this.credentials.get('fullName').value
    );
    let names = transform.split(' ');
    let firstName = names[0];
    let lastName = names[1];

    if (this.credentials.get('vessel').value === '') {
      let noName = 'No Name - ';
      this.vesselName = noName + lastName;
    } else {
      this.vesselName = this.credentials.get('vessel').value;
    }

    this.logger.debug(transform);
    this.logger.debug('Split Full name : ', names,' firstName : ', firstName,' lastName : ', lastName);

    this.clientService.addClient({
      fullName: transform,
      fName: firstName,
      lName: lastName,
      vesselName: this.vesselName,
      vesselPhoto: this.photoData,
      noEngines: this.credentials.get('noEngines').value,
      email: this.credentials.get('email').value,
    });
    await loading.dismiss();
    this.data.tempBoatUpload[0].data = '';
    this.showAlert('User Added', 'Success!');
    this.ngOnInit();
  }

  goToBoatImg() {
    
    this.data.fromWhereIcame[0].from = 'addPage';
    this.route.navigate(['add', 'boat']);
  }

  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
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
      message: 'Compressing image...'
     });
     await loading.present();

    
    // this.croppedImage = null;
    if (image) {
      this.compressFile(image.dataUrl);
      await loading.dismiss();
    }
  }
  compressFile(image) {
    this.bytesBefore = this.imageCompress.byteCount(image);
    // this.logger.debug('Before compression:', this.bytesBefore + ' bytes');
    // this.logger.debug('Before compression:', this.bytesBefore / 1000 + ' KB');
    // this.logger.debug('Before compression:', this.bytesBefore / 1000000 + ' MB');
    this.imageCompress.compressFile(image, 2, 50, 50).then(
      (result: DataUrl) => {
        this.imgResultAfterCompress = result;
        //this.saveImage(this.imgResultAfterCompress);
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
      },
      (error: any) => console.error(error)
    );
  }

}
