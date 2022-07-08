import { Component } from '@angular/core';
import { Data, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from './services/authentication.service';
import { DataService } from './services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  currentApplicationVersion;
  date = Date.now();

  constructor(
    private plaform: Platform,
    private checklistService: DataService,
    private authService: AuthenticationService,
    private route: Router
  ) {
    this.ngOnInit();
  }

  ngOnInit() {
    this.currentApplicationVersion = environment.appVersion;
    console.log(this.currentApplicationVersion);
  }
  gpToAdmin() {
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
  async logout() {
    await this.authService.logout();
    this.route.navigateByUrl('/', { replaceUrl: true });
  }
}