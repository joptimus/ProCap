import { Component } from '@angular/core';
import { Data, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from './services/authentication.service';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  date = Date.now();

  constructor(
    private plaform: Platform, 
    private checklistService: DataService, 
    private authService: AuthenticationService, 
    private router: Router) 
    { this.initializeApp(); }

  initializeApp() {
    // this.plaform.ready().then(() => {
    //   this.authService.authenticationState.subscribe(state => {
    //   console.log('Auth Changed: ', state);
    //   if (state) {
    //     this.router.navigate(['members','landing']);
    //   } else {
    //     this.router.navigate(['login']);
//       // }
//     });
//   });
 };
}