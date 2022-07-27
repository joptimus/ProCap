import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';
import { Logger } from 'src/app/services/logger.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userDisplay;
  userEmail;
  userUid;

  constructor(
    private authService: AuthenticationService,
    private localData: DataService,
    private loadingController: LoadingController,
    private logger: Logger
  ) {}

  async ngOnInit() {
    await this.authService.getCurrentUser();
    this.userDisplay = this.localData.userProfile[0].displayName;
    this.userEmail = this.localData.userProfile[0].email;
    this.userUid = this.localData.userProfile[0].uid;
  }

  async updateUser() {
    const loading = await this.loadingController.create({
      message: 'Updating display name....',
    });
    await loading.present();
    const newValue = this.userDisplay;
    await this.authService.updateDisplayName(newValue);
    this.logger.debug('did we get a display value? :', newValue);
    loading.dismiss();
  }

  updateUserDisplay(event) {
    this.userDisplay = event;
    // this.logger.debug(event);
  }
}
