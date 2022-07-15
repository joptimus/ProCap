import { ChangeDetectorRef, Component, Input } from '@angular/core';
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
  @Input() id: string;
  client: Client = null;
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
    this.clientService.getClientById(this.id).subscribe(res => {
      this.client = res;
      console.log('clientService : ', res);
    });
  }
 
   openClient() {
    this.route.navigate(['detail']);
  }
  async deleteClient() {
    await this.clientService.deleteClient(this.client);
    
  }

  goToAddClient() {
    this.route.navigate(['add']);
  }
}

