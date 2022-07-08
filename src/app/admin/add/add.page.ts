import { TitleCasePipe } from '@angular/common';
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
    private alertController: AlertController,
    private titleCase: TitleCasePipe
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      fullName: [''],
      fName: [''],
      lName: [''],
      vessel: [''],
      photo: [''],
      noEngines: [''],
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
    let transform = this.titleCase.transform(this.credentials.get('fullName').value);
    let names = transform.split(" ");
    let firstName = names[0];
    let lastName = names[1];


    console.log(transform);
    console.log('Split Full name : ', names, ' firstName : ', firstName, ' lastName : ', lastName);

    this.clientService.addClient({
      fullName: transform,
      fName: firstName,
      lName: lastName,
      vesselName: this.credentials.get('vessel').value,
      vesselPhoto: this.credentials.get('photo').value,
      noEngines: this.credentials.get('noEngines').value,
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
