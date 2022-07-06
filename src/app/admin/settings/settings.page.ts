import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DbDataService } from 'src/app/services/db-data.service';
import { ModalPage } from '../modal/modal.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  settings = [];

  constructor(private dataService: DbDataService, private modalCtrl: ModalController) { 

    this.dataService.getSettingsValues().subscribe(response => {
      console.log(response);
      this.settings = response;
    })
  }

  ngOnInit() {
  }

  async openSetting(i) {
    console.log(i);
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: { id: i.id },
      breakpoints: [ 0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });
    modal.present();
  }

}
