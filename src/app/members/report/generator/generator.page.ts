import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AlertController, LoadingController, Platform } from '@ionic/angular';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-generator',
  templateUrl: './generator.page.html',
  styleUrls: ['./generator.page.scss'],
})
export class GeneratorPage implements OnInit {

  images: LocalFile[] = [];

  generatorData = [];
  genHours = [];
  generatorHours;
  genUploadDisable = false;

  constructor(
    
    private data: DataService,
    private platform: Platform,
    private loadingCtrl: LoadingController
    
    ) { }

  ngOnInit() {
    this.loadFiles();
    this.generatorData = this.data.generatorData;
    this.genHours = this.data.genHours;
    console.log('ngOnInit generatorData = ', this.generatorData, ' genHours = ', this.genHours)
  }

  log(){
    console.log(this.generatorData)
    this.data.generatorData = this.generatorData;
  }

  updateGenHours(event) {
    this.genHours[0].hours = event.target.value;
    this.data.genHours = this.genHours;
    console.log('dataService genHours = ', this.data.genHours[0].hours);
  }

  // public generatorData = [
  //   { id: '', label: 'Oil', isChecked: false },
  //   { id: '', label: 'Coolant', isChecked: false },
  //   { id: '', label: 'Hoses', isChecked: false },
  //   { id: '', label: 'Belts', isChecked: false },
  //   { id: '', label: 'Batteries', isChecked: false },
  //   { id: '', label: 'Seacocks', isChecked: false },
  //   { id: '', label: 'Strainers', isChecked: false },
  //   { id: '', label: 'Hours', isChecked: false },
    
  // ];

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
        this.images = this.images.filter(file => file.name.startsWith('Gen'));
        this.disableCheck();
     
    }
  }

  disableCheck() {
    if (this.images.length == 1) {
      this.genUploadDisable = true;
    } else {
      this.genUploadDisable = false;
    }
  }

  async uploadGenImage() {
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

    const fileName = 'Gen' + new Date().getTime() + '.jpeg';
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

}
