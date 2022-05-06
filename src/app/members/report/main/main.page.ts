import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { PhotosService } from 'src/app/services/photos.service';
import { resourceLimits } from 'worker_threads';
import { Directory, Filesystem } from '@capacitor/filesystem';

import pdfMake from 'pdfmake/build/pdfMake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}
@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  images: LocalFile[] = [];
  reportNumber;
  reportFinal;
  image: any;
  image2: SafeResourceUrl;
  profile = null;
  customer: any;
  vessel: any;

  constructor(
    private dom: DomSanitizer,
    private authService: AuthenticationService,
    private route: Router, 
    private photoService: PhotosService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private data: DataService
    ) { 
    this.photoService.getUserProfile().subscribe((data) => {
       this.profile = data;
    });
    this.genRandom();
    this.reportId();
  }
  genRandom(){
    this.reportNumber = Math.floor(Math.random() * 10000000);
  }
  reportId () {
    var string1 = new String( "PCS" )
    var string2 = new String ( this.reportNumber );
    var string3 = string1.concat(string2.toString());
    this.reportFinal = string3;
    console.log(string1 , string2 , string3 );
  }

  ngOnInit() { 
   this.customer = this.data.customer;
   this.vessel = this.data.vessel;
   this.image = this.data.photos;

   this.loadFiles();
  }
  async logout() {
    await this.authService.logout();
    this.route.navigateByUrl('/', { replaceUrl: true });
  }
  logStuff() {
    console.log(this.data.engineMain);
    console.log(this.data.enginePort);
    console.log(this.data.bilgeData);
    console.log(this.data.customer);
    console.log(this.data.engineComments);
    console.log(this.data.clients);
    console.log(this.data.photos);
    console.log(this.reportFinal);
    this.createPdf();

  }
  engine() {
    this.route.navigate(['members','engines']);
  }
  generator() {
    this.route.navigate(['members', 'generator']);
  }
  hvac() {
    this.route.navigate(['members', 'hvac']);
  }
  bilge() {
    this.route.navigate(['members', 'bilge']);
  }
  misc() {
    this.route.navigate(['members', 'misc']);
  }

  async loadFiles() {

    this.images = [];
    const loading = await this.loadingCtrl.create({
      message: 'Loading data...',
    });
    await loading.present();

    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
    }).then(result => {

      this.loadFileData(result.files);

    },
      async (err) => {
        // Folder does not yet exists!
        await Filesystem.mkdir({
          path: IMAGE_DIR,
          directory: Directory.Data,
        });
      }
    ).then(_ => {
      loading.dismiss();
    });
  }

  // Get the actual base64 data of an image
  // base on the name of the file
  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;

      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`,
      });
      //Load file based on what the file starts with
      //  this.images = this.images.filter(file => file.name.startsWith(this.tabSelected));
     
    }
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });
    console.log(image);
    if (image) {
      this.saveImage(image);
    }
  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'HomePage' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }
  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
  
  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
    this.loadFiles();
  }

  refreshPics() {
    this.loadFiles();
  }
  goToMain() {
    this.route.navigate(['members', 'main']);
  }


  createPdf() {
    const data = this.data.customer;
    const report = this.reportFinal;
    const image = this.images ? {image: this.images, width: 100 } : {};
    const dataa = this.data.engineMain;
    

    const docDefinition = {
      content: [
        {
          // text: report,
         
          
        }

      ]
    }
    pdfMake.createPdf(docDefinition).open();
    console.log(docDefinition);
  }
  
}