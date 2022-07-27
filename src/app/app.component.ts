import { Component } from '@angular/core';
import { Data, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from './services/authentication.service';
import { DataService } from './services/data.service';
import { environment } from 'src/environments/environment';
import { Logger } from './services/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  currentApplicationVersion;
  date = Date.now();
  canView = true;
  userDisplay;

  constructor(
    private plaform: Platform,
    private checklistService: DataService,
    private authService: AuthenticationService,
    private localData: DataService,
    private route: Router,
    private logger: Logger
  ) {  }

  ngOnInit() {
    this.currentApplicationVersion = environment.appVersion;
    this.logger.debug(this.currentApplicationVersion);
  }
  goToAdmin() {
    this.route.navigate(['options']);
  }
  goToClients() {
    this.route.navigate(['clients']);
  }
  goToAddClients() {
    this.route.navigate(['add']);
  }
  goToDbSettings() {
    this.route.navigate(['settings']);
  }
  goToAddNewUser() {
    this.route.navigate(['users']);
  }
  startNewReport() {
    this.route.navigate(['members','select']);
  }
  goToProfile() {
    this.route.navigate(['profile']);
  }
  // checkIfAbleToView() {
  //   this.authService.getCurrentUser();
  //   this.userDisplay = this.localData.captainName[0].displayName;
  //   this.logger.debug('user display', this.userDisplay, this.localData.captainName[0].displayName);
  //   if (this.userDisplay === 'James Lewandowski') {
  //     this.canView = true;
  //     this.logger.debug(this.authService.getCurrentUser.name);
  //   } else {
  //     this.canView = false;
  //     this.logger.debug(this.authService.getCurrentUser.name);
  //   }
  // }

  async logout() {
    await this.authService.logout();
    this.route.navigateByUrl('/', { replaceUrl: true });
  }
}