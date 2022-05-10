import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { DbDataService, Client } from 'src/app/services/db-data.service';
 
@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  @Input() id: string;
  client: Client = null;
 
  constructor(private clientService: DbDataService, private modalCtrl: ModalController, private toastCtrl: ToastController) { }
 
  ngOnInit() {
    this.clientService.getClientById(this.id).subscribe(res => {
      this.client = res;
    });
  }
 
  async deleteClient() {
    await this.clientService.deleteClient(this.client)
    this.modalCtrl.dismiss();
  }
 
  async updateClient() {
    await this.clientService.updateClient(this.client);
    const toast = await this.toastCtrl.create({
      message: 'Note updated!.',
      duration: 2000
    });
    toast.present();
 
  }
}