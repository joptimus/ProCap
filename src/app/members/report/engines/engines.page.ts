import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { getHours } from 'src/app/model/localFile';
// import { PhotosService } from 'src/app/services/photos.service';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}
hours: getHours;

@Component({
  selector: 'app-engines',
  templateUrl: './engines.page.html',
  styleUrls: ['./engines.page.scss'],
})
export class EnginesPage implements OnInit {
  images: LocalFile[] = [];

  enginePort = [];
  engineStarboard = [];
  engineMain = [];
  engineComments;
  engineHoursPort;
  engineHoursStarboard;
  engineHoursMain;
  portHours = [];
  starHours = [];
  type: string = 'Port';
  myInput: any;
  tabSelected: string;
  disableButton = false;
  disableMain = false;
  disableTabs = false;
  engineCount = [];
  convertedEngineCount: number;
  mainFocus = false;

  constructor(
    private data: DataService,
    private route: Router,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) // private photo: PhotosService

  {}

  async ngOnInit() {
  
    this.enginePort = this.data.enginePort;
    this.engineStarboard = this.data.engineStarboard;
    this.engineMain = this.data.engineMain;
    // this.engineComments = this.data.engineComments[0].comments;
    this.engineHoursMain = this.data.engineHoursMain[0].hours;
    this.engineHoursPort = this.data.engineHoursPort[0].hours;
    this.engineHoursStarboard = this.data.engineHoursStarboard[0].hours;
    this.portHours = this.data.engineHoursPort;
    this.starHours = this.data.engineHoursStarboard;
    this.engineCount = this.data.engineCount;
    

    this.loadFiles();
    console.log(this.engineHoursStarboard[0]);
    this.disableTabCheck();
    this.tabSelected = this.type;
    // this.images = this.photo.getImages();
  }

  disableTabCheck() {
    console.log('engine count : ', this.engineCount);
 
    this.convertedEngineCount = Number(this.engineCount);
    if(this.convertedEngineCount == 1) {
      this.disableTabs = true;
      this.mainFocus = true;
      this.type = 'Main';
    }
    if(this.convertedEngineCount == 2) {
      this.disableMain = true;
      this.type = 'Port';
    }
  }

  loadFilesAgain() {
    console.log('loaded files again');
   // this.tabSelected = 'Port';
    this.loadFiles();
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
    })
      .then(
        (result) => {
          this.loadFileData(result.files);
        },
        async (err) => {
          // Folder does not yet exists!
          await Filesystem.mkdir({
            path: IMAGE_DIR,
            directory: Directory.Data,
          });
        }
      )
      .then((_) => {
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
      this.images = this.images.filter((file) => file.name.startsWith(this.tabSelected));
      this.disableCheck();
    }
  }

  disableCheck() {
    if(this.images.length ==1) {
      this.disableButton = true;
    } else {
      this.disableButton = false;
    }
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveImage(image);
    }
  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = this.tabSelected + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }
  // Helper function
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path,
    });
    this.loadFiles();
  }
  goToMain() {
    this.route.navigate(['members', 'main']);
  }

  // updateRemarks(event) {
  //   this.engineComments = event.target.value;
  //   this.data.engineComments[0].comments = this.engineComments;
  //   console.log(this.engineComments);
  // }

  updateEngineHoursMain(event) {
    this.engineHoursMain = event.target.value;
    this.data.engineHoursMain[0].hours = this.engineHoursMain;
    console.log('dataService engineHoursMain value = ', this.data.engineHoursMain[0].hours);
    console.log('dataService event = ', event);
  }

  updateEngineHoursStarboard(event) {
    this.starHours[0].hours = event.target.value;
    this.data.engineHoursStarboard= this.starHours;
    console.log('dataService starHours value = ', this.starHours[0].hours);
  }

  updateEngineHoursPort(event) {
    this.portHours[0].hours = event.target.value;
    this.data.engineHoursPort = this.portHours;
    console.log('dataService engineHoursPort value = ', this.portHours[0].hours);
    console.log('event target value : ', event.target.value);
  }

  log() {
    console.log('log again', this.enginePort);
    this.data.enginePort = this.enginePort;
    
  }

  segmentChanged(ev: any) {
    this.tabSelected = ev.detail.value;
    this.loadFilesAgain();
    console.log('Segment changed', ev.detail);
    console.log(this.tabSelected);
    console.log(ev.detail.value);
  }
}
