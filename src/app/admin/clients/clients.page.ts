import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { OnInit } from '@angular/core';
import { DbDataService, Client } from 'src/app/services/db-data.service';
import { ModalPage } from '../modal/modal.page';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Logger } from 'src/app/services/logger.service';

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
    private localData: DataService, 
    private modalCtrl: ModalController,
    private loadingController: LoadingController,
    private logger: Logger
    ) { 
    this.clientService.getClients().subscribe(res => {
      this.logger.debug(res);
      this.clients = res;
      this.cd.detectChanges();
    })
  }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Loading clients...',
      duration: 5000,
     });
     await loading.present();
    
    this.clientService.getClientById(this.id).subscribe(res => {
      this.client = res;
      //this.logger.debug('clientService : ', res);
    });
    loading.dismiss();
  }
 
   openClient(client: Client) {

    this.logger.debug('data sent to local ',client);
    this.localData.detailClientId[0] = client;
    this.route.navigate(['clients','detail']);
    
  }
  async deleteClient() {
    await this.clientService.deleteClient(this.client);
    
  }

  goToAddClient() {
    this.route.navigate(['add']);
  }
}

