import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, listAll, ref, Storage, uploadBytes, uploadString } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Photo } from '@capacitor/camera';
import { Observable } from 'rxjs';
import { DataService } from './data.service';
import { arrayBuffer } from 'stream/consumers';

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
    private auth: Auth
  ) {}

  // #region Client Services
  getClients(): Observable<Client[]> {
    const notesRef = collection(this.firestore, 'clients');
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
    console.log('dbService pdf Start');

    const path = `pdfUploads/${pdf.month}/${pdf.boatId}/${pdf.fileName}`;
    const storageRef = ref(this.storage, path);

    try {
      uploadString(storageRef, pdf.fileName, 'base64').then((snapshot) => {
        console.log('Uploaded a base64 string!');
      });

      const fileUrl = getDownloadURL(storageRef);

      const userDocRef = doc(this.firestore, `pdfs/${pdf.boatId}`);
      setDoc(userDocRef, { fileUrl });

      return true;
    } catch (error) {
      console.log('pdf Upload error: ', error);
      return null;
    }
  }

  addBlobPdfToStorage(pdf: PdfBlob) {
    console.log('dbService BLOB pdf Start');

    const path = `${pdf.month}/${pdf.boatId}/${pdf.reportId}`;
    const storageRef = ref(this.storage, path);

    uploadBytes(storageRef, pdf.fileName).then((snapshot) => {
      console.log('Uploaded a blob or file!');
    });
  }
  catch(error) {
    console.log('pdf Upload error: ', error);
    return null;
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

        console.log('Shashike this is listRef Response', result);
        console.log('Shashike this is folderRef Response', listRef);
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

        console.log('pdfData Response', result);
        console.log('pdf Data listRef', listRef);
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
        console.log('do ihave a blob file?', xhr.responseType);
        xhr.onload = (event) => {
          const blob = xhr.response;
          console.log('do ihave a blob file?', blob);
        };
        xhr.open('GET', url);
        xhr.send();

        // Or inserted into an <img> element
        const img = document.getElementById('myimg');
        img.setAttribute('src', url);
      })
      .catch((error) => {
        // Handle any errors
      });
  }

  getReportDetails(path) {
    this.pdfReports = [];
    const storage = getStorage();

    // Create a reference under which you want to list
    const listRef = ref(storage, `${path}/`);

    // Find all the prefixes and items.
    listAll(listRef).then((result) => {
      result.items.forEach(async (listRef) => {
        // All the prefixes under listRef.
        // You may call listAll() recursively on them.

        console.log('Shashike this is subfolders Response', result);
        console.log('Shashike this is subfolders Response', listRef);
        this.pdfReports.push({
          name: listRef.name,
          full: listRef.fullPath,
          parent: listRef.parent,
          storage: listRef.storage,
          url: await getDownloadURL(listRef),
        });
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
          console.log('Shashike this is listRef Response', res);
          console.log('Shashike this is folderRef Response', folderRef);
          this.cloudFiles.push({
            name: folderRef.name,
            full: folderRef.fullPath,
          });
        });
        res.items.forEach((itemRef) => {
          console.log('Shashike this is itemRef Response ', itemRef);
          // All the items under listRef.

          this.cloudFiles.push({
            name: itemRef.name,
            full: itemRef.fullPath,
          });
        });
        console.log('cloudfiles', this.cloudFiles);
      })
      .catch((error) => {
        console.log('error : ', error);
        // Uh-oh, an error occurred!
      });
    console.log('log at end of function', this.cloudFiles);
    return this.cloudFiles;
  }

  // #endregion
}
