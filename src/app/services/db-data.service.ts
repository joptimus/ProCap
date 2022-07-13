import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes, uploadString } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Photo } from '@capacitor/camera';
import { Observable } from 'rxjs';

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
@Injectable({
  providedIn: 'root',
})
export class DbDataService {
  constructor(private firestore: Firestore, private storage: Storage, private auth: Auth) {}

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

   addPdfToStorage(pdf: Pdf) {

    console.log('dbService pdf Start');

    const path = `pdfUploads/${pdf.month}/${pdf.boatId}/${pdf.fileName}`;
    const storageRef = ref(this.storage, path);

    try {
       uploadString(storageRef, pdf.fileName, 'base64').then((snapshot) => {
        console.log('Uploaded a base64 string!');
      });
      
      const fileUrl =  getDownloadURL(storageRef);

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
    
    const path = `pdfUploads/${pdf.month}/${pdf.boatId}/${pdf.reportId}`;
    const storageRef = ref(this.storage, path);

    uploadBytes(storageRef, pdf.fileName).then((snapshot) => {
      console.log('Uploaded a blob or file!');
    });

    } catch (error) {
      console.log('pdf Upload error: ', error);
      return null;
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
}
