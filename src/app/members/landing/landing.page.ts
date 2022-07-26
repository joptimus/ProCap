import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { Logger } from 'src/app/services/logger.service';
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
  constructor(private route: Router, private authService: AuthenticationService, private localData: DataService, private logger: Logger) { }

  ngOnInit() {
    this.currentApplicationVersion = environment.appVersion;   
    this.logger.warn('this logger service worked', this.currentApplicationVersion);
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
  //   console.log('user display', this.userDisplay, this.localData.captainName[0].displayName);
  //   if (this.userDisplay === 'James Lewandowski') {
  //     this.localData.canView[0].view = true;
  //     console.log('canView is true');
  //   } else {
  //     this.canView = false;
  //     this.localData.canView[0].view = false;
    
  //   }
  // }

  // For Debugging
  // whoIsLoggedIn() {
  //   console.log('who is logged in:', this.authService.getCurrentUser());
  // }
  // async sendPasswordReset() {
  //   this.authService.sendPasswordReset();
  // }
}
