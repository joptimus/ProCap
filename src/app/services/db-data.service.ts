import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  deleteDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Client {
  id?: string;
  fullName: string;
  fName: string;
  lName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  vesselName: string;
  vesselPhoto: string;
  lastInspec?: number;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class DbDataService {
  constructor(private firestore: Firestore) {}

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
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      vesselName: client.vesselName,
      vesselPhoto: client.vesselPhoto,
      lastInspec: client.lastInspec,
      email: client.email,
    });
  }
}
