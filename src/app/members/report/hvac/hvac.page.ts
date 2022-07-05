import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { AlertController, LoadingController, Platform } from '@ionic/angular';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-hvac',
  templateUrl: './hvac.page.html',
  styleUrls: ['./hvac.page.scss'],
})
export class HvacPage implements OnInit {
  images: LocalFile[] = [];
  dirtyImages: LocalFile[] = [];
  cleanImages: LocalFile[] = [];
  cleanPicDisable = false;
  dirtyPicDisable = false;
  hvacData = [];
  image: string;
  base64Str: any;
  kbytes: number;

  constructor(
    private data: DataService,
    private platform: Platform,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadFiles();
    this.hvacData = this.data.hvacData;
  }

  log() {
    this.data.hvacData = this.hvacData;
    console.log(this.data.hvacData);
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
      this.images = this.images.filter((file) => file.name.startsWith('HVAC'));
      this.disableCheck();
    }
  }

  disableCheck() {
    this.cleanImages = this.images.filter((file) =>
      file.name.startsWith('HVAC-Clean')
    );
    if (this.cleanImages.length == 1) {
      this.cleanPicDisable = true;
    }
    if (this.cleanImages.length == 0) {
      this.cleanPicDisable = false;
    }
    this.dirtyImages = this.images.filter((file) =>
      file.name.startsWith('HVAC-Dirty')
    );
    if (this.dirtyImages.length == 1) {
      this.dirtyPicDisable = true;
    }
    if (this.dirtyImages.length == 0) {
      this.dirtyPicDisable = false;
    }
  }

  async selectDirtyImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveDirtyImage(image);
    }
  }

  async saveDirtyImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'HVAC-Dirty' + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  async selectCleanImage() {
    const image = await Camera.getPhoto({
      quality: 10,
      width: 175,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveCleanImage(image);
    }
  }

  async saveCleanImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);
    this.calculateImageSize(base64Data);
    const fileName = 'HVAC-Clean' + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    this.calculateImageSize(base64Data);
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
  calculateImageSize(base64String) {
    let padding;
    let inBytes;
    let base64StringLength;
    
    if (base64String.endsWith('==')) {
      padding = 2;
    } else if (base64String.endsWith('=')) {
      padding = 1;
    } else {
      padding = 0;
    }

    base64StringLength = base64String.length;
    console.log(base64StringLength);
    inBytes = (base64StringLength / 4) * 3 - padding;
    console.log(inBytes);
    this.kbytes = inBytes / 1000;
    console.log(this.kbytes);
    return this.kbytes;
  }
}
