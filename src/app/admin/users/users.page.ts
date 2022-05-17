import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  credentials: FormGroup;

  constructor(
    private authService: AuthenticationService, 
    private loadingController: LoadingController, 
    private fb: FormBuilder, 
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  get email() {
    return this.credentials.get('email');
  }
  get password() {
    return this.credentials.get('password');
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();


    const user = await this.authService.register(this.credentials.value);
    await loading.dismiss();

    if (user) {
      this.showAlert('Success','User Successfully added');
    } else {
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
}
