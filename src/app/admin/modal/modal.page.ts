import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { DbDataService, Client, Settings } from 'src/app/services/db-data.service';
 
@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  @Input() id: string;
  client: Client = null;
  setting: Settings = null;
 
  constructor(private dbService: DbDataService, private modalCtrl: ModalController, private toastCtrl: ToastController) { }
 
  ngOnInit() {
    this.dbService.getClientById(this.id).subscribe(res => {
      this.client = res;
    });
    this.dbService.getSettingsValuesById(this.id).subscribe(res => {
      this.setting = res;
      console.log(this.setting);
    });
  }
 
  async deleteClient() {
    await this.dbService.deleteClient(this.client)
    this.modalCtrl.dismiss();
  }
 
  async updateClient() {
    await this.dbService.updateClient(this.client);
    const toast = await this.toastCtrl.create({
      message: 'Note updated!.',
      duration: 2000
    });
    toast.present();
 
  }

  async updateSetting() {
    await this.dbService.updateSettingsValue(this.setting);
    const toast = await this.toastCtrl.create({
      message: 'Setting updated!.',
      duration: 2000
    });
    toast.present();
 
  }
  
}