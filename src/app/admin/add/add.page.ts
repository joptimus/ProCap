import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { DbDataService, Client } from 'src/app/services/db-data.service';
import { DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  credentials: FormGroup;
  base64Str: any;
  kbytes: number;
  photoData = null;

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
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private titleCase: TitleCasePipe,
    private imageCompress: NgxImageCompressService,
    private loadingCtrl: LoadingController
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

  }

  get fullName() {
    return this.credentials.get('fullName');
  }
  get password() {
    return this.credentials.get('password');
  }

  async addClient() {
    const loading = await this.loadingController.create();
    await loading.present();
    let transform = this.titleCase.transform(this.credentials.get('fullName').value);
    let names = transform.split(" ");
    let firstName = names[0];
    let lastName = names[1];


    console.log(transform);
    console.log('Split Full name : ', names, ' firstName : ', firstName, ' lastName : ', lastName);

    this.clientService.addClient({
      fullName: transform,
      fName: firstName,
      lName: lastName,
      vesselName: this.credentials.get('vessel').value,
      vesselPhoto: this.imgResultAfterCompress,
      noEngines: this.credentials.get('noEngines').value,
      email: this.credentials.get('email').value,
    });
    await loading.dismiss();
    this.showAlert('User Added', 'Success!');
    this.ngOnInit();
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



  // async saveImage(photoBase64: string) {
  //   //const base64Data = await this.readAsBase64(photo);
  //   //console.log(base64Data);
  //   // console.log('compressed Image : ', photoBase64);

  //   const fileName = this.type + new Date().getTime() + '.jpeg';
  //   const savedFile = await Filesystem.writeFile({
  //     path: `${IMAGE_DIR}/${fileName}`,
  //     data: photoBase64,
  //     directory: Directory.Data,
  //   });
  //   console.log('saved: ', savedFile);
  //  // this.loadFiles();
  // }

  // async loadFiles() {
  //   this.images = [];
  //   console.log(this.images);
  //   const loading = await this.loadingCtrl.create({
  //     message: 'Loading data...',
  //   });
  //   await loading.present();

  //   Filesystem.readdir({
  //     path: IMAGE_DIR,
  //     directory: Directory.Data,
  //   })
  //     .then(
  //       (result) => {
  //         this.loadFileData(result.files);
  //       },
  //       async (err) => {
  //         // Folder does not yet exists!
  //         await Filesystem.mkdir({
  //           path: IMAGE_DIR,
  //           directory: Directory.Data,
  //         });
  //       }
  //     )
  //     .then((_) => {
  //       loading.dismiss();
  //     });
  // }

  // // Get the actual base64 data of an image
  // // base on the name of the file
  // async loadFileData(fileNames: string[]) {
  //   for (let f of fileNames) {
  //     const filePath = `${IMAGE_DIR}/${f}`;

  //     const readFile = await Filesystem.readFile({
  //       path: filePath,
  //       directory: Directory.Data,
  //     });

  //     this.images.push({
  //       name: f,
  //       path: filePath,
  //       data: `data:image/jpeg;base64,${readFile.data}`,
  //     });
  //     //Load file based on what the file starts with
  //     //  this.images = this.images.filter(file => file.name.startsWith(this.tabSelected));
      
  //   }
  // }
}
