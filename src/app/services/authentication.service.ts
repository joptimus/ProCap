import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  constructor(private auth: Auth) {}

  async register ({ email, password}) {
    try {
      const user = await createUserWithEmailAndPassword(this.auth, email, password);
     return user; }
     catch (error) {
      return null;
    }
  }

  async login ({ email, password}) {
    try {
     return user;
    }
     catch (error) {
      console.log('auth service return error: ', error); 
      return null;
    }
  }
  
  logout() {
    return signOut(this.auth);
  }

}
