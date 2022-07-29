import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { Logger } from 'src/app/services/logger.service';
import { DbDataService } from 'src/app/services/db-data.service';
import { LoadingController } from '@ionic/angular';
//import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  currentApplicationVersion;
  userDisplay;
  canView = false;
  constructor(
    private route: Router, 
    private authService: AuthenticationService, 
    private localData: DataService, 
    private clientService: DbDataService,
    private loadingController: LoadingController,
    private logger: Logger) { }

  ngOnInit() {
    this.currentApplicationVersion = environment.appVersion;   
    this.logger.warn('this logger service worked', this.currentApplicationVersion);
    this.loadClients();

  }

  async loadClients() {

    // * Temporary loading of Client List
    // * Need to rework calls

    const start = await this.loadingController.create({ message: 'Loading Clients...' });
    await start.present();
    await this.clientService.getClients().subscribe((res) => {
      // this.logger.debug('getClients Service :', res);
       this.localData.clientList = res;
       this.logger.debug('triggered localData client list: ', this.localData.clientList);
       start.dismiss();
     });
     
  }

  startReport() {
    this.route.navigate(['members','select']);
  }

  admin() {
    this.route.navigate(['options']);
  }

  inspections() {
    this.route.navigate(['inspections']);
  }
  
  async logout() {
    await this.authService.logout();
    this.route.navigateByUrl('/', { replaceUrl: true });
  }

  // checkIfAbleToView() {
  //   this.authService.getCurrentUser();
  //   this.userDisplay = this.localData.captainName[0].displayName;
  //   this.logger.debug('user display', this.userDisplay, this.localData.captainName[0].displayName);
  //   if (this.userDisplay === 'James Lewandowski') {
  //     this.localData.canView[0].view = true;
  //     this.logger.debug('canView is true');
  //   } else {
  //     this.canView = false;
  //     this.localData.canView[0].view = false;
    
  //   }
  // }

  // For Debugging
  // whoIsLoggedIn() {
  //   this.logger.debug('who is logged in:', this.authService.getCurrentUser());
  // }
  // async sendPasswordReset() {
  //   this.authService.sendPasswordReset();
  // }
}
