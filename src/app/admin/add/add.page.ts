import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { DbDataService, Client } from 'src/app/services/db-data.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  credentials: FormGroup;

  constructor(
    private clientService: DbDataService,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      fullName: [''],
      fName: [''],
      lName: [''],
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
      vessel: [''],
      photo: [''],
      email: [''],
    });
  }

  get fullName() {
    return this.credentials.get('fullName');
  }
  get password() {
    return this.credentials.get('password');
  }

  async addClient() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.clientService.addClient({
      fullName: this.credentials.get('fullName').value,
      fName: this.credentials.get('fName').value,
      lName: this.credentials.get('lName').value,
      address: this.credentials.get('street').value,
      city: this.credentials.get('city').value,
      state: this.credentials.get('state').value,
      zipCode: this.credentials.get('zip').value,
      vesselName: this.credentials.get('vessel').value,
      vesselPhoto: this.credentials.get('photo').value,

      email: this.credentials.get('email').value,
    });
    await loading.dismiss();
    this.showAlert('User Added', 'Success!');
    this.ngOnInit();
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
