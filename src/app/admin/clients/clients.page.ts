import { ChangeDetectorRef, Component } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { OnInit } from '@angular/core';
import { DbDataService, Client } from 'src/app/services/db-data.service';
import { ModalPage } from '../modal/modal.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {

  clients = [];

  constructor(
    private clientService: DbDataService, 
    private route: Router, 
    private cd: ChangeDetectorRef, 
    private alertCtrl: AlertController, 
    private modalCtrl: ModalController) { 
    this.clientService.getClients().subscribe(res => {
      console.log(res);
      this.clients = res;
      this.cd.detectChanges();
    })
  }

  ngOnInit() {
  }
  
  async addClient() {
    const alert = await this.alertCtrl.create({
      header: 'Add Note',
      inputs: [
        {
          name: 'fullName',
          placeholder: 'Full Name',
          type: 'text'
        },
        {
          name: 'fName',
          placeholder: 'Learn Ionic',
          type: 'text'
        },
        {
          name: 'lName',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'address',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'city',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'state',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'zipCode',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'vesselName',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'vesselPhoto',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'lastInspec',
          placeholder: 'My cool note',
          type: 'text'
        },
        {
          name: 'email',
          placeholder: 'My cool note',
          type: 'text'
        }

      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Add',
          handler: (res) => {
            this.clientService.addClient({   
              fullName: res.fullName,
              fName: res.fName,
              lName: res.lName,
              address: res.address,
              city: res.city,
              state: res.state,
              zipCode: res.zipCode,
              vesselName: res.vesselName,
              vesselPhoto: res.vesselPhoto,
              lastInspec: res.lastInspec,
              email: res.email });
          } 
        }
      ]
    });
 
    await alert.present();
  }
 
  async openClient(client: Client) {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: { id: client.id },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8
    });
 
    await modal.present();
  }

  goToAddClient() {
    this.route.navigate(['add']);
  }
}

