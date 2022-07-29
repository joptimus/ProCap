import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile, getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';
import { Logger } from './logger.service';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  captainName: any;
  response = [];

  constructor(
    private auth: Auth,
    private localData: DataService,
    private route: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private logger: Logger
  ) {}

  async presentAlert(head, sub, msg) {
    const alert = await this.alertController.create({
      header: head,
      subHeader: sub,
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async login({ email, password }) {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      this.logger.debug('logging user', user);
      this.localData.captainName[0].displayName = user.user.displayName;
      this.logger.debug(
        'Set user display name as: ',
        this.localData.captainName[0].displayName
      );
      return user;
    } catch (error) {
      this.logger.debug('auth service return error: ', error);
      return null;
    }
  }

  async register({ email, password, display }) {
    try {
      const user = await createUserWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error) {
      return null;
    }
  }

  logout() {
    return signOut(this.auth);
  }

  async updateDisplayName(displayName) {
    const loading = await this.loadingController.create({
      message: 'Updating display name...',
    });
    await loading.present();
    const auth = getAuth();
    updateProfile(auth.currentUser, { displayName: displayName })
      .then(() => {
        // Profile updated!

        loading.dismiss();
        this.presentAlert(
          'Success',
          'Display Name Updated',
          'Your display name has been successfully updated in the database'
        );

        this.logger.debug('User Display Name Updated');
      })
      .catch((error) => {
        this.logger.debug(error);
        // An error occurred

        this.presentAlert(
          'Service Failure',
          'Display Name not Updated',
          'ERROR: ' + error
        );
      });
  }

  async sendPasswordReset() {
    const auth = getAuth();
    sendPasswordResetEmail(auth, auth.currentUser.email)
      .then(() => {
        // Password reset email sent!
        // ..

        this.presentAlert(
          'Success',
          'Password Reset',
          'An email has been sent. Please follow the link to reset your password'
        );
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        this.presentAlert(
          'Error',
          'Password Reset Error',
          'ERROR CODE: ' + errorCode + ' : MESSAGE: ' + errorMessage
        );
        // ..
      });
  }

  async sendPasswordResetNoEmail(email) {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        // ..

        this.presentAlert(
          'Success',
          'Password Reset',
          'An email has been sent to ' + email + '. Please inform them to follow the link to reset thier password'
        );
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        this.presentAlert(
          'Error',
          'Password Reset Error',
          'ERROR CODE: ' + errorCode + ' : MESSAGE: ' + errorMessage
        );
        // ..
      });
  }

  async getCurrentUser() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // ...

      this.localData.captainName[0].displayName = user.displayName;
      this.localData.userProfile[0].uid = user.uid;
      this.localData.userProfile[0].displayName = user.displayName;
      this.localData.userProfile[0].email = user.email;
    } else {
      // No user is signed in.
      this.logger.debug('no one is logged in so we sign out');
      this.route.navigateByUrl('/', { replaceUrl: true });
      await this.presentAlert(
        'Token Expired',
        'Unable to Authenticate',
        'Unable to re-authenticate session. You must relog in again'
      );
      this.logout();
    }
    return this.response;
  }
}