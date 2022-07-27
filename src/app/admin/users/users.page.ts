import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Logger } from 'src/app/services/logger.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  credentials: FormGroup;
  emailToReset;

  constructor(
    private authService: AuthenticationService, 
    private loadingController: LoadingController, 
    private fb: FormBuilder, 
    private alertController: AlertController,
    private logger: Logger
  ) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: [''],
    });
  }
  get email() {
    return this.credentials.get('email');
  }
  get password() {
    return this.credentials.get('password');
  }
  get displayName() {
    return this.credentials.get('displayName');
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();


    const user = await this.authService.register(this.credentials.value);
  

    if (user) {
      await loading.dismiss();
      this.updateDisplay();
      this.authService.sendPasswordReset();
      this.showAlert('Success','User Successfully added and reset email sent');

    } else {
      await loading.dismiss();
      this.showAlert('Registration Failed', 'Please try again');
    }
  }

  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  updateEmail(event) {
    this.emailToReset = event;
    this.logger.debug(event);
  }

  updateDisplay() {
    this.logger.debug('did we pass id corectly? :', this.credentials.value.displayName);
    this.authService.updateDisplayName(this.credentials.value.displayName);
  }

  async sendPasswordResetNoEmail() {
    this.authService.sendPasswordResetNoEmail(this.emailToReset);
  }
}
