import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc, setDoc, orderBy, query } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, listAll, ref, Storage, uploadBytes, uploadString, getMetadata, uploadBytesResumable } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Photo } from '@capacitor/camera';
import { Observable } from 'rxjs';
import { DataService } from './data.service';
import { arrayBuffer } from 'stream/consumers';
import { Logger } from './logger.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

// #region Interfaces //
export interface Client {
  id?: string;
  fullName: string;
  fName: string;
  lName: string;
  vesselName?: string;
  vesselPhoto?: string;
  noEngines?: string;
  email?: string;
}

export interface Settings {
  id?: string;
  name: string;
  value: string;
}

export interface Pdf {
  id?: string;
  fileName: string;
  reportId: string;
  clientName: any;
  boatId: string;
  month: string;
}

export interface PdfBlob {
  id?: string;
  fileName: Blob;
  reportId: string;
  clientName: any;
  boatId: string;
  month: string;
}

export interface Files {
  name?: string;
  full: string;
}

export interface SubFolder {
  name?: string;
  full: string;
}

// #endregion

@Injectable({
  providedIn: 'root',
})
export class DbDataService {
  pdfReports = [];
  folders = [];
  temp = [];
  cloudFiles = [];
  subFolders = [];
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private data: DataService,
    private route: Router,
    private auth: Auth,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private logger: Logger
  ) {}

  redirectHome() {
    this.route.navigate(['members', 'landing']);
  }
  async presentAlert(head, sub, msg) {
    const alert = await this.alertController.create({
      header: head,
      subHeader: sub,
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }
  async showSuccess() {
    const alert = await this.alertController.create({
      header: 'Success',
      subHeader: 'Inspection Report Filed',
      message:
        'Your inspection report has been submitted and uploaded successfully',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.redirectHome();
          },
        },
      ],
    });

    await alert.present();
  }

  // #region Client Services
  getClients(): Observable<Client[]> {
    const notesRef = query(
      collection(this.firestore, 'clients'),
      orderBy('lName')
    );
    return collectionData(notesRef, { idField: 'id' }) as Observable<Client[]>;
  }

  getClientById(id): Observable<Client> {
    const noteDocRef = doc(this.firestore, `clients/${id}`);
    return docData(noteDocRef, { idField: 'id' }) as Observable<Client>;
  }

  addClient(client: Client) {
    const notesRef = collection(this.firestore, 'clients');
    return addDoc(notesRef, client);
  }

  deleteClient(client: Client) {
    const noteDocRef = doc(this.firestore, `clients/${client.id}`);
    return deleteDoc(noteDocRef);
  }
  updateClient(client: Client) {
    const noteDocRef = doc(this.firestore, `clients/${client.id}`);
    return updateDoc(noteDocRef, {
      fullName: client.fullName,
      fName: client.fName,
      lName: client.lName,
      vesselName: client.vesselName,
      vesselPhoto: client.vesselPhoto,
      noEngines: client.noEngines,
      email: client.email,
    });
  }

  // #endregion

  // #region Settings Services

  getSettingsValues(): Observable<Settings[]> {
    const ref = collection(this.firestore, 'settings');
    return collectionData(ref, { idField: 'id' }) as Observable<Settings[]>;
  }

  getSettingsValuesById(id): Observable<Settings> {
    const ref = doc(this.firestore, `settings/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<Settings>;
  }

  addSettingsValue(setting: Settings) {
    const ref = collection(this.firestore, 'settings');
    return addDoc(ref, setting);
  }

  deleteSettingsValue(setting: Settings) {
    const ref = doc(this.firestore, `settings/${setting.id}`);
    return deleteDoc(ref);
  }

  updateSettingsValue(setting: Settings) {
    const ref = doc(this.firestore, `settings/${setting.id}`);
    return updateDoc(ref, { name: setting.name, value: setting.value });
  }

  // #endregion

  // #region Storing PDF Services

  addPdfToStorage(pdf: Pdf) {
    this.logger.debug('dbService pdf Start');

    const path = `pdfUploads/${pdf.month}/${pdf.boatId}/${pdf.fileName}`;
    const storageRef = ref(this.storage, path);

    try {
      uploadString(storageRef, pdf.fileName, 'base64').then((snapshot) => {
        this.logger.debug('Uploaded a base64 string!');
      });

      const fileUrl = getDownloadURL(storageRef);

      const userDocRef = doc(this.firestore, `pdfs/${pdf.boatId}`);
      setDoc(userDocRef, { fileUrl });

      return true;
    } catch (error) {
      this.logger.error('pdf Upload error: ', error);
      return null;
    }
  }

  addBlobPdfToStorage(pdf: PdfBlob) {
    this.logger.debug('dbService BLOB pdf Start');

    const path = `${pdf.month}/${pdf.boatId}/${pdf.reportId}`;
    const storageRef = ref(this.storage, path);
 
    try {
    uploadBytes(storageRef, pdf.fileName).then((snapshot) => {
      this.logger.debug('Uploaded file: ', snapshot);
    });
  } catch(error) {
    this.logger.error('pdf Upload error: ', error);
    this.presentAlert('Error', 'Error in saving PDF', error);
    return null;
  }
}
async updateProgress(progressBar) {
  if(progressBar === 100) {
    
    const loading = await this.loadingController.create({ message: 'Saving to Database...' + progressBar + '%', duration: 3000});
    await loading.present();

  } else {
  const loading = await this.loadingController.create({ message: 'Saving to Database...' + progressBar + '%', duration: 2000});
  await loading.present();
  }
}

async addBlob(pdf: PdfBlob) {
  let progressBar;
  
  const path = `${pdf.month}/${pdf.boatId}/${pdf.reportId}`;
  const storageRef = ref(this.storage, path);
  const uploadTask = uploadBytesResumable(storageRef, pdf.fileName);

// Listen for state changes, errors, and completion of the upload.
uploadTask.on('state_changed',
  (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    progressBar = progress;
    this.updateProgress(progress);
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;
      case 'storage/canceled':
        // User canceled the upload
        break;

      // ...

      case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        break;
    }
    this.logger.error('There was an upload error, erro code : ', error.code);
  }, 
  () => {
    // Upload completed successfully, now we can get the download URL
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
    });
    // loading.dismiss();
    this.showSuccess();
  }
);






}

  // #endregion

  // #region FileTree Services

  getFolders() {
    this.folders = [];
    const storage = getStorage();

    // Create a reference under which you want to list
    const listRef = ref(storage, '');

    // Find all the prefixes and items.
    listAll(listRef).then((result) => {
      result.prefixes.forEach(async (listRef) => {
        // All the prefixes under listRef.
        // You may call listAll() recursively on them.

        // this.logger.debug('Shashike this is listRef Response', result);
        // this.logger.debug('Shashike this is folderRef Response', listRef);
        this.folders.push({
          name: listRef.bucket,
          full: listRef.fullPath,
          storage: listRef.storage,
          //url: folderRef.toString()
        });
      });
    });
    return this.folders;
  }

  getSubFolders(id) {
    this.subFolders = [];
    const storage = getStorage();

    // Create a reference under which you want to list
    const listRef = ref(storage, `${id}/`);

    // Find all the prefixes and items.
    listAll(listRef).then((result) => {
      result.prefixes.forEach(async (listRef) => {
        // All the prefixes under listRef.
        // You may call listAll() recursively on them.

        this.logger.debug('pdfData Response', result);
        this.logger.debug('pdf Data listRef', listRef);
        this.subFolders.push({
          name: listRef.name,
          fullPath: listRef.fullPath,
          parent: listRef.parent,
          storage: listRef.storage,
          url: ref.toString(),
          ref: ref,
        });
      });
    });
    return this.subFolders;
  }

  getDownloadURL(path) {
    const storage = getStorage();
    getDownloadURL(ref(storage, `${path}/`))
      .then((url) => {
        // `url` is the download URL for 'images/stars.jpg'

        // This can be downloaded directly:
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        this.logger.debug('do ihave a blob file?', xhr.responseType);
        xhr.onload = (event) => {
          const blob = xhr.response;
          this.logger.debug('do ihave a blob file?', blob);
        };
        xhr.open('GET', url);
        xhr.send();

        // Or inserted into an <img> element
        const img = document.getElementById('myimg');
        img.setAttribute('src', url);
      })
      .catch((error) => {
        this.logger.error('error in getDownloadURL :', error);
        // Handle any errors
      });
  }

  getReportDetails(path) {
    this.pdfReports = [];
    const storage = getStorage();
    let pdfSize;

    // Create a reference under which you want to list
    const listRef = ref(storage, `${path}/`);

    // Find all the prefixes and items.
    listAll(listRef).then((result) => {
      result.items.forEach(async (listRef) => {
        // All the prefixes under listRef.
        // You may call listAll() recursively on them.
        getMetadata(listRef)
          .then(async (metadata) => {
            // Metadata now contains the metadata for 'images/forest.jpg'
            pdfSize = (metadata.size * 0.95) / 1000000;
            this.logger.debug('metadata size: ', metadata.size);
            this.logger.debug('converted size', pdfSize);
            this.pdfReports.push({
              name: listRef.name,
              full: listRef.fullPath,
              parent: listRef.parent,
              storage: listRef.storage,
              timeCreated: metadata.timeCreated,
              size: pdfSize,
              url: await getDownloadURL(listRef),
            });
          })
          .catch((error) => {
            // Uh-oh, an error occurred!
            this.logger.error('Error in getReportDetails : ', error);
          });
        this.logger.debug('getReportDetails result ', result);
        this.logger.debug('getReportDetails listRef', listRef);
        // this.pdfReports.push({
        //   name: listRef.name,
        //   full: listRef.fullPath,
        //   parent: listRef.parent,
        //   storage: listRef.storage,
        //   url: await getDownloadURL(listRef),
        // });
      });
    });
    return this.pdfReports;
  }

  getInspectionFiles() {
    this.cloudFiles = [];
    const storage = getStorage();

    // Create a reference under which you want to list
    const listRef = ref(storage, 'pdfUploads/July');

    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
          this.logger.debug('getInspectedFiles listRef Response', res);
          this.logger.debug('getInspectedFiles folderRef Response', folderRef);
          this.cloudFiles.push({
            name: folderRef.name,
            full: folderRef.fullPath,
          });
        });
        res.items.forEach((itemRef) => {
          this.logger.debug('getInspectedFiles itemRef Response ', itemRef);
          // All the items under listRef.

          this.cloudFiles.push({
            name: itemRef.name,
            full: itemRef.fullPath,
          });
        });
        this.logger.debug('cloudfiles', this.cloudFiles);
      })
      .catch((error) => {
        this.logger.error('error : ', error);
        // Uh-oh, an error occurred!
      });
    this.logger.debug('log at end of function', this.cloudFiles);
    return this.cloudFiles;
  }

  // #endregion
}
