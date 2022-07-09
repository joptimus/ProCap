import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { DbDataService, Client, Settings } from 'src/app/services/db-data.service';
import { DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
 
@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  @Input() id: string;
  client: Client = null;
  setting: Settings = null;
  boatImage: string = null;
  imgResultUpload: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  bytesBefore: number;
  bytesAfter: number;
  difference: number;
  percentage: number;
 
  constructor(
    private dbService: DbDataService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private imageCompress: NgxImageCompressService,
    private loadingCtrl: LoadingController
    ) { }
 
  ngOnInit() {
    this.dbService.getClientById(this.id).subscribe(res => {
      this.client = res;
      console.log('this.client', this.client);
    });
    this.dbService.getSettingsValuesById(this.id).subscribe(res => {
      this.setting = res;

      console.log('this.setting', this.setting);
    });

  }

  // DB Calls
 
  async deleteClient() {
    await this.dbService.deleteClient(this.client)
    this.modalCtrl.dismiss();
  }
 
  async updateClient() {
    await this.dbService.updateClient(this.client);
    console.log(this.client);
    const toast = await this.toastCtrl.create({
      message: 'This client has been updated!',
      duration: 2000
    });
    this.modalCtrl.dismiss();
    toast.present();
    
 
  }

  async updateSetting() {
    await this.dbService.updateSettingsValue(this.setting);
    const toast = await this.toastCtrl.create({
      message: 'DB Setting updated!',
      duration: 2000
    });
    toast.present();
 
  }
 // #region
  
 // Camera

 async selectImage() {
  //this.buttonId(value);
  const image = await Camera.getPhoto({
    quality: 50,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Photos,
  });

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
      this.imgResultAfterCompress = result;
      this.client.vesselPhoto = result;
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
    (error: any) => console.error('this error', error)
  );
}

refresh(){
  this.imgResultAfterCompress
}

}