import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';
import { ModalPage } from '../modal/modal.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  settings = [];
  userDisplay;

  constructor(private dataService: DbDataService, private modalCtrl: ModalController, private localData: DataService, private route: Router) { 

    this.checkIfAbleToView();

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

  checkIfAbleToView() {
  
    this.userDisplay = this.localData.captainName[0].displayName;
    //console.log('user display', this.userDisplay, this.localData.captainName[0].displayName);
    if (this.userDisplay === 'James Lewandowski') {
      this.localData.canView[0].view = true;
     // console.log('canView is true');
    } else {
     
      this.localData.canView[0].view = false;
      this.route.navigate(['landing']);
    
    }
  }
}
