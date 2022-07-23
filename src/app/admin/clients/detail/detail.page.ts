import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { DbDataService, Client, Settings } from 'src/app/services/db-data.service';
import { DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
 

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  @Input() id: string;
  client: Client;
  setting: Settings = null;
  boatImage: string = null;
  imgResultUpload: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  bytesBefore: number;
  bytesAfter: number;
  difference: number;
  percentage: number;
  photoData = null;

  tempBoat;

  clientData = [];

  constructor(
    private dbService: DbDataService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private imageCompress: NgxImageCompressService,
    private loadingCtrl: LoadingController,
    private route: Router,
    private localData: DataService
  ) { }

  ngOnInit() {
    this.clientData = this.localData.detailClientId;
    this.dbService.getClientById(this.clientData[0].id).subscribe(res => {
      this.client = res;

      this.photoData = this.client.vesselPhoto;
      //console.log('is there ngOnIt Photo Data?', this.photoData);
      //console.log('this.client', this.client);
    });
    this.dbService.getSettingsValuesById(this.id).subscribe(res => {
      this.setting = res;


      //console.log('this.setting', this.setting);
    });
  
    this.tempBoat = this.localData.tempBoatUpload[0].data;

  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter start');
    this.tempBoat = this.localData.tempBoatUpload[0].data;
    //console.log('tempBoat ', this.tempBoat, ' photoData ', this.photoData);
    if(this.tempBoat != '' && this.photoData == '') {
      this.photoData = this.tempBoat;
      this.client.vesselPhoto = this.photoData;
      //console.log('ionViewWIllEnter photodata : ', this.photoData)
    }
  }

  goToBoatImg() {
    this.route.navigate(['add', 'boat']);
    this.localData.fromWhereIcame[0].from = 'detail';
  }

  // DB Calls
 
  async deleteClient() {
    await this.dbService.deleteClient(this.client);
    const toast = await this.toastCtrl.create({
      message: 'This client has been DELETED!',
      duration: 2000
    });
    
    toast.present();
    this.route.navigate(['clients']);
  }
 
  async updateClient() {
    
    await this.dbService.updateClient(this.client);
    console.log(this.client);
    const toast = await this.toastCtrl.create({
      message: 'This client has been updated!',
      duration: 2000
    });
    
    toast.present();
    this.localData.tempBoatUpload[0].data = '';
 
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

  const MAX_MEGABYTE = 1;
  this.bytesBefore = this.imageCompress.byteCount(image);
  console.log('Before compression:', this.bytesBefore + ' bytes');
  console.log('Before compression:', this.bytesBefore / 1000 + ' KB');
  console.log('Before compression:', this.bytesBefore / 1000000 + ' MB');
 // this.imageCompress.compressFile(image, 2, 50, 50).then(
  this.imageCompress.uploadAndGetImageWithMaxSize(MAX_MEGABYTE).then(
    (result: DataUrl) => {
      this.imgResultAfterCompress = result;
      this.client.vesselPhoto = result;
      this.photoData = result;
      //this.saveImage(this.imgResultAfterCompress);
      this.bytesAfter = this.imageCompress.byteCount(result);
      this.difference = this.bytesBefore - this.bytesAfter;
      this.percentage =
        ((this.bytesBefore - this.bytesAfter) / this.bytesBefore) * 100;
      let percent = this.percentage.toFixed(2);
        // console.log('Size in bytes after compression is now:', this.bytesAfter + ' bytes');
        // console.log('After compression:', this.bytesAfter / 1000 + ' KB');
        // console.log('After compression:', this.bytesAfter / 1000000 + ' MB');
        
        console.log('Original Size: ', this.bytesBefore / 1000000 + ' MB');
        console.log('After compression:', this.bytesAfter / 1000000 + ' MB');
        console.log('File reduced by (MB):', this.difference / 1000000 + ' MB or ', percent,  '%');
      
    },
    (error: any) => console.error('this error', error)
  );
}

// refresh(){
//   this.imgResultAfterCompress
// }


}
