import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadString, } from '@angular/fire/storage';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { LocalFile } from '../model/localFile';

const IMAGE_DIR = 'stored-images';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {

  constructor(    
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage,
    private platform: Platform,
    private loadingCtrl: LoadingController
    ) { this.images = []; }


    public images: LocalFile[] = [];

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
        console.log('3');
  
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


      };
      this.getImages();
    }

    getImages() {
      let filterImages = this.images.filter(file => file.name.startsWith('bilge'));
      console.log(filterImages);
      return filterImages;
    }
  
    async selectImage() {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      console.log('I AM HERE', image);
      if (image) {
        this.saveImage(image);
      }
    }
  
    async saveImage(photo: Photo) {
      const base64Data = await this.readAsBase64(photo);
      console.log(base64Data);
  
      const fileName = 'bilge' + new Date().getTime() + '.jpeg';
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
      // this.presentToast('File removed.');
  }
    getUserProfile() {
      const user = this.auth.currentUser;
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return docData(userDocRef, { idField: 'id' });
    }
   
    async uploadImage(cameraFile: Photo) {
      const user = this.auth.currentUser;
      const path = `uploads/${user.uid}/profile.png`;
      const storageRef = ref(this.storage, path);
   
      try {
        await uploadString(storageRef, cameraFile.base64String, 'base64');
   
        const imageUrl = await getDownloadURL(storageRef);
   
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        await setDoc(userDocRef, {
          imageUrl,
        });
        return true;
      } catch (e) {
        return null;
      }
    }
  }
