import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { PhotosService } from 'src/app/services/photos.service';
import { resourceLimits } from 'worker_threads';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  reportNumber;
  reportFinal;
  image: any;
  image2: SafeResourceUrl;
  profile = null;
  customer: any;
  vessel: any;

  constructor(
    private dom: DomSanitizer,
    private authService: AuthenticationService,
    private route: Router, 
    private photoService: PhotosService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private data: DataService
    ) { 
    this.photoService.getUserProfile().subscribe((data) => {
       this.profile = data;
    });
    this.genRandom();
    this.reportId();
  }
  genRandom(){
    this.reportNumber = Math.floor(Math.random() * 10000000);
  }
  reportId () {
    var string1 = new String( "PCS" )
    var string2 = new String ( this.reportNumber );
    var string3 = string1.concat(string2.toString());
    this.reportFinal = string3;
    console.log(string1 , string2 , string3 );
  }

  ngOnInit() { 
   this.customer = this.data.customer;
   this.vessel = this.data.vessel;
   this.image = this.data.photos;
  }
  async logout() {
    await this.authService.logout();
    this.route.navigateByUrl('/', { replaceUrl: true });
  }
  logStuff() {
    console.log(this.data.engineMain);
    console.log(this.data.enginePort);
    console.log(this.data.bilgeData);
    console.log(this.data.customer);
    console.log(this.data.engineComments);
    console.log(this.data.clients);
    console.log(this.data.photos);

  }
  engine() {
    this.route.navigate(['members','engines']);
  }
  generator() {
    this.route.navigate(['members', 'generator']);
  }
  hvac() {
    this.route.navigate(['members', 'hvac']);
  }
  bilge() {
    this.route.navigate(['members', 'bilge']);
  }
  misc() {
    this.route.navigate(['members', 'misc']);
  }

  async uploadPhoto() {

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, // Camera, Photos or Prompt!
    });
    this.image = photo;
    this.data.photos = this.image;
    console.log('File uploaded');
    console.log(this.data.photos);
    console.log(this.image);
  }

  async uploadPhoto2() {

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, // Camera, Photos or Prompt!
    });
    this.image2 = this.dom.bypassSecurityTrustResourceUrl(photo && photo.base64String,);
    this.data.photos = this.image;
    console.log('File uploaded');
    console.log(this.data.photos);
    console.log(this.image);
  }
  
  async changeImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, // Camera, Photos or Prompt!
    });

    if (image) {
      const loading = await this.loadingController.create();
      await loading.present();
 
      const result = await this.photoService.uploadImage(image);
      loading.dismiss();
 
      if (!result) {
        const alert = await this.alertController.create({
          header: 'Upload failed',
          message: 'There was a problem uploading your avatar.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}