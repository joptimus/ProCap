import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile, getAuth } from '@angular/fire/auth';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  captainName: any;


  constructor(private auth: Auth, private localData: DataService) {}

  async register ({ email, password}) {
    try {
      const user = await createUserWithEmailAndPassword(this.auth, email, password);
     return user; }
     catch (error) {
      return null;
    }
  }

  async updateDisplayName(displayName) {
    const auth = getAuth();
    updateProfile(auth.currentUser, {
      displayName: displayName,
    }).then(() => {
      // Profile updated!
      // ...
      console.log('User Display Name Updated');
    }).catch((error) => {
      console.log(error);
      // An error occurred
      // ...
    });

  }

  async getCurrentUser() {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // ...
      console.log(user.displayName, ' is logged in');
      this.localData.captainName[0].displayName = user.displayName;

    } else {
      // No user is signed in.
      console.log('no one is logged in so we sign out');
      this.logout();
    }

  }

  async login ({ email, password}) {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('logging user',user);
      this.localData.captainName[0].displayName = user.user.displayName;
      console.log('Set user display name as: ', this.localData.captainName[0].displayName);
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
