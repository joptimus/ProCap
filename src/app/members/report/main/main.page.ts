import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AlertController, AngularDelegate, LoadingController, Platform } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { PhotosService } from 'src/app/services/photos.service';
import { resourceLimits } from 'worker_threads';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { EmailComposerOptions } from '@awesome-cordova-plugins/email-composer/ngx';
import pdfMake from 'pdfmake/build/pdfMake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';

pdfMake.vfs = pdfFonts.pdfMake.vfs;



const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}
interface hours {
  hours: number;
}
@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  // Initialization of Variables
  images: LocalFile[] = [];
  reportNumber;
  reportFinal;
  image: any;
  image2: SafeResourceUrl;
  profile = null;
  customer: any;
  vessel: any;
  bilgePics = [];
  enginePort = [];
  engineStar = [];
  engineMain = [];
  genPics = [];
  miscPics = [];
  strainerDirty = [];
  strainerClean = [];
  engineComments;
  pdfObj = null;
  logoData = null;
  comingSoon = null;
  submitBtnDisable = true;
  pics = null;
  clientLastName = [];

  hasAccount = false;
  currentImage = null;
  pdfData = null;

  constructor(
    // private dom: DomSanitizer,
    private authService: AuthenticationService,
    private route: Router,
    private photoService: PhotosService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private fileOpener: FileOpener,
    private http: HttpClient,
    private emailComposer: EmailComposer,
    private data: DataService
  ) {
    this.photoService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
    this.genRandom();
    this.reportId();
  }

  async checkAccount() {
    this.hasAccount = await this.emailComposer.hasAccount();
    console.log('Does this have an account? : ', this.hasAccount);
  }
  async openEmail() {
    const email: EmailComposerOptions = {
      to: 'jlewan27@gmail.com',
      cc: 'jlewan27@gmail.com',
      attachments: [`${this.pdfData}`, 'application/pdf'],
      subject: this.reportFinal,
      body: 'Hey Bob, what do you think about this?',
    };

    await this.emailComposer.open(email);
  }

  genRandom() {
    this.reportNumber = Math.floor(Math.random() * 10000000);
  }
  reportId() {
    var string1 = new String('PCS');
    var string2 = new String(this.reportNumber);
    var string3 = string1.concat(string2.toString());
    this.reportFinal = string3;
    console.log(string1, string2, string3);
  }

  ngOnInit() {
    this.engineComments = this.data.engineComments[0].comments;
    this.customer = this.data.customer;
    this.vessel = this.data.vessel;
    this.image = this.data.photos;
    this.clientLastName = this.data.clientLast;
    console.log('vessel = ' + this.vessel);
    this.loadFiles();
    this.loadLocalAssetToBase64();
    this.loadComingSoon();
    this.disableCheck();
    console.log(this.clientLastName);
  }

  loadLocalAssetToBase64() {
    this.http.get('./assets/img/proCapLogo.png', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.logoData = reader.result;
        }
        reader.readAsDataURL(res);
      });
  }

  loadComingSoon() {
    this.http.get('./assets/img/coming-soon.png', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.comingSoon = reader.result;
        }
        reader.readAsDataURL(res);
      });
  }
  updateRemarks(event) {
    this.engineComments = event.target.value;
    this.data.engineComments[0].comments = this.engineComments;
    console.log(this.engineComments);
  }

  async logout() {
    await this.authService.logout();
    this.route.navigateByUrl('/', { replaceUrl: true });
  }
  async logStuff() {
    // console.log(this.data.engineMain);
    // console.log(this.data.enginePort);
    // console.log(this.data.bilgeData);
    // console.log(this.data.customer);
    // console.log(this.data.engineComments);
    // console.log(this.data.clients);
    // console.log(this.data.photos);
    // console.log(this.reportFinal);
    this.engineHoursCheck();
   
  }
  
  deleteAllPictures() {
    this.images.forEach(file  => {
      this.deleteImage(file);
      
    });
  }

  // Navigation buttons 
  engine() {
    this.route.navigate(['members', 'engines']);
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
  redirectHome() {
    this.route.navigate(['members','landing']);
  }
  goToMain() {
    this.route.navigate(['members', 'main']);
  }
  // End of Navigation Buttons


  // Images Start ///////////////////////////////////////////////////////////////////////////
  async selectPortImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });
    console.log(image);
    if (image) {
      this.savePortImage(image);
    }
  }

  async savePortImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'Port' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  async selectStarImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });
    console.log(image);
    if (image) {
      this.saveStarImage(image);
    }
  }

  async saveStarImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'Starboard' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  async selectGenImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });
    console.log(image);
    if (image) {
      this.saveGenImage(image);
    }
  }

  async saveGenImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'Gen' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }


  async selectDirtyImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveDirtyImage(image);
    }
  }

  async saveDirtyImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'HVAC-Dirty' + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  async selectCleanImage() {
    const image = await Camera.getPhoto({
      quality: 10,
      width: 175,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveCleanImage(image);
    }
  }

  async saveCleanImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'HVAC-Clean' + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  async selectBilgeImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveBilgeImage(image);
    }
  }

  async saveBilgeImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'BILGE' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  async selectMiscImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveMiscImage(image);
    }
  }

  async saveMiscImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'MISC' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    this.loadFiles();
  }

  async loadFiles() {
    this.images = [];
    console.log(this.images);
    const loading = await this.loadingCtrl.create({
      message: 'Loading data...',
    });
    await loading.present();

    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
    })
      .then(
        (result) => {
          this.loadFileData(result.files);
        },
        async (err) => {
          // Folder does not yet exists!
          await Filesystem.mkdir({
            path: IMAGE_DIR,
            directory: Directory.Data,
          });
        }
      )
      .then((_) => {
        loading.dismiss();
      });
  }

  // Get the actual base64 data of an image
  // base on the name of the file
  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;

      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`,
      });
      //Load file based on what the file starts with
      //  this.images = this.images.filter(file => file.name.startsWith(this.tabSelected));
      this.disableCheck();
    }
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    console.log(image);
    if (image) {
      this.saveImage(image);
    }
  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    console.log(base64Data);

    const fileName = 'HomePage' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });
    console.log('saved: ', fileName);
    this.loadFiles();
  }

  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }
  // Helper function
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path,
    });
    this.refreshPics();
  }

  // Images End /////////////////////////////////////////////////////////////////////


  refreshPics() {
    this.loadFiles();
    this.disableCheck();
    
  }


  disableCheck() {
    this.bilgePics = this.images.filter((file) => file.name.startsWith('BILGE'));
    this.enginePort = this.images.filter((file) => file.name.startsWith('Port'));
    this.engineStar = this.images.filter((file) => file.name.startsWith('Starboard'));
    this.engineMain = this.images.filter((file) => file.name.startsWith('Main'));
    this.genPics = this.images.filter((file) => file.name.startsWith('Gen'));
    this.strainerDirty = this.images.filter((file) => file.name.startsWith('HVAC-Dirty'));
    this.strainerClean = this.images.filter((file) => file.name.startsWith('HVAC-Clean'));
    this.miscPics = this.images.filter((file) => file.name.startsWith('MISC'));
    
    if (this.bilgePics.length == 1 && this.enginePort.length == 1  && this.engineStar.length == 1  && this.genPics.length == 1  && this.strainerClean.length == 1  && this.strainerDirty.length == 1  &&  this.miscPics.length == 2 ) {
                  this.submitBtnDisable = false;
                } else {
                  this.submitBtnDisable = true;
                }
                console.log('disable check value : ', this.submitBtnDisable);
  }

  async engineHoursCheck() {

    if( this.data.engineHoursPort[0].hours == 0) {
      this.showPortAlert();
    } else if (this.data.engineHoursStarboard[0].hours ==0)  { 
      this.showStarAlert();
    } else if (this.data.genHours[0].hours == 0) {
      this.showGenAlert();
    } else {
      const loading = await this.loadingController.create();
      await loading.present();
      await this.createPdf();
      await loading.dismiss();
      this.deleteAllPictures();
      this.redirectHome();
      this.engineComments = [""];
    }

  }

  async showPortAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Port Engine Missing Data',
      message: 'There are no hours entered for the Port Engine.  Please enter hours then resubmit',
      buttons: [
        {
          text: 'OK',
          handler: () => { this.route.navigate(['members', 'engines'])
        }
    }]
    });

    await alert.present();
  }

  async showStarAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Starboard Engine Missing Data',
      message: 'There are no hours entered for the Starboard Engine.  Please enter hours then resubmit',
      buttons:  [
        {
          text: 'OK',
          handler: () => { this.route.navigate(['members', 'engines'])
        }
    }]
    });

    await alert.present();
  }

  async showGenAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Generator Engine Missing Data',
      message: 'There are no hours entered for the Generator Engine.  Please enter hours then resubmit',
      buttons: [
        {
          text: 'OK',
          handler: () => { this.route.navigate(['members', 'generator'])
        }
    }]
    });

    await alert.present();
  }

  downloadPdf() {
    if (this.platform.is('cordova')) {
      this.pdfObj.getBase64(async (data) => {
        try {
          let path = `pdf/${this.reportFinal}.pdf`;
  
          const result = await Filesystem.writeFile({
            path,
            data: data,
            directory: Directory.Documents,
            recursive: true
            // encoding: Encoding.UTF8
          });
          this.fileOpener.open(`${result.uri}`, 'application/pdf');
          this.pdfData = result.uri;
  
        } catch (e) {
          console.error('Unable to write file', e);
        }
      });
    } else {
      // On a browser simply use download!
      this.pdfObj.download();
      
    }
  }

  createPdf() {
    const reportId = this.reportFinal;
    const data = this.data.engineMain;
    const portHours = this.data.engineHoursPort[0].hours;
    const starHours = this.data.engineHoursStarboard[0].hours;
    const genHours = this.data.genHours[0].hours;
    
    var date = new Date();
    let dateText = date.toLocaleDateString();

    // Filter Images to display in different sections of report
    this.bilgePics = this.images.filter((file) => file.name.startsWith('BILGE'));
    this.enginePort = this.images.filter((file) => file.name.startsWith('Port'));
    this.engineStar = this.images.filter((file) => file.name.startsWith('Starboard'));
    this.engineMain = this.images.filter((file) => file.name.startsWith('Main'));
    this.genPics = this.images.filter((file) => file.name.startsWith('Gen'));
    this.strainerDirty = this.images.filter((file) => file.name.startsWith('HVAC-Dirty'));
    this.strainerClean = this.images.filter((file) => file.name.startsWith('HVAC-Clean'));
    this.miscPics = this.images.filter((file) => file.name.startsWith('MISC'));
    
    // Debug Logs
    // console.log();
    // console.log(path);
    // console.log(portHours);
    // console.log(this.strainerDirty);

    const docDefinition = {
      compress: true,
      content: [
        {
          columns: [
            {
              image: this.logoData,
              width: 250,
              margin: [0, -30, 0, 0],
            },

            [
              {
                text: 'Monthly Inspection',
                color: '#333333',
                width: '*',
                fontSize: 20,
                bold: true,
                alignment: 'right',
                margin: [0, 0, 0, 15],
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'Inspection No.',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 12,
                        alignment: 'right',
                      },

                      {
                        text: reportId,
                        bold: true,
                        color: '#333333',
                        fontSize: 12,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Inspector',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 12,
                        alignment: 'right',
                      },

                      {
                        text: 'Capt. Bob Files',
                        bold: true,
                        color: '#333333',
                        fontSize: 12,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Date Inspected',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 12,
                        alignment: 'right',
                      },
                      {
                        text: dateText,
                        bold: true,
                        color: '#333333',
                        fontSize: 12,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Status',
                        color: '#aaaaab',
                        bold: true,
                        fontSize: 12,
                        alignment: 'right',
                        width: '*',
                      },
                      {
                        text: 'COMPLETE',
                        bold: true,
                        fontSize: 14,
                        alignment: 'right',
                        color: 'green',
                        width: 100,
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        {
          columns: [
            {
              text: 'Vessel',
              bold: true,
              color: '#aaaaab',
              fontSize: 12,
              alignment: 'left',
              margin: [0, 20, 0, 5],
            },
            {
              text: 'Client',
              bold: true,
              color: '#aaaaab',
              alignment: 'right',
              margin: [0, 20, 0, 5],
            },
          ],
        },
        {
          columns: [
            {
              image: this.comingSoon,
              width: 200,
            },
            {
              text: this.customer + '\n  \n  \n',
              bold: true,
              color: '#333333',
              alignment: 'right',
            },
          ],
        },
        {
          columns: [
            {
              text: '',
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
            {
              text: '',
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
          ],
        },
        '\n\n',
        {
          width: '100%',
          alignment: 'center',
          text: 'Inspection Report',
          bold: true,
          margin: [0, 10, 0, 10],
          fontSize: 12,
        },

        {
          table: {
            widths: [59, '*', '*', 10, '*', '*', 10, 71, '*'],
            //	heights: [20, '*', 20],
            headerRows: 1,
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  text: 'Engines',
                  colSpan: 3,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'header',
                },
                {
                  //Column 2
                  text: '',
                },
                {
                  //Column 3
                  text: '',
                },
                {
                  //Middle column
                  //Column 4
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Column 5
                  text: 'Generator',
                  colSpan: 2,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'header',
                },
                {
                  //Column 6
                  text: '',
                },
                {
                  //Middle column
                  //Column 7
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Middle column
                  //Column 8
                  //Column 5
                  text: 'AC System',
                  style: 'header',
                  colSpan: 2,
                  alignment: 'center',
                  border: [false, false, false, false],
                },
                {
                  //Middle column
                  //Column 9
                  text: '',
                  border: [false, false, false, false],
                },
              ],

              //Row data
              [
                //Row 1
                {
                  text: '',
                  border: [false, false, false, true],
                },
                {
                  text: 'Port',
                  border: [false, false, false, true],
                  style: 'subHeader',
                },
                {
                  text: 'Starboard',
                  border: [false, false, false, true],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: '',
                  border: [false, false, false, true],
                },
                {
                  text: 'Completed',
                  border: [false, false, false, true],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, true],
                  style: 'subHeader',
                },
                {
                  text: 'Completed',
                  border: [false, false, false, true],
                  style: 'subHeader',
                },
              ],

              //Row 2

              [
                {
                  text: 'Oil',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Oil',
                  border: [false, false, false, false],
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: 'Pumps',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],

              //Row 3

              [
                {
                  text: 'Coolant',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Coolant',
                  border: [false, false, false, false],
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: 'Seacock(s)',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 4

              [
                {
                  text: 'Trans Fluid',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Hoses',
                  border: [false, false, false, false],
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: 'Strainer(s)',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 5

              [
                {
                  text: 'Hoses',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Belts',
                  border: [false, false, false, false],
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: 'Return Filters',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 6

              [
                {
                  text: 'Belts',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Batteries',
                  border: [false, false, false, false],
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 7

              [
                {
                  text: 'Batteries',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Seacocks',
                  border: [false, false, false, false],
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 8

              [
                {
                  text: 'Seacocks',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Strainers',
                  border: [false, false, false, false],
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 9

              [
                {
                  text: 'Alternator',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                //Insert Hours here for Generator
                {
                  text: '# Hours',
                  border: [false, false, false, false],
                },
                {
                  text: genHours,
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 10

              [
                {
                  text: 'Leak',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                //Insert Hours here for Generator
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 11

              [
                {
                  text: 'Test Run',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                //Insert Hours here for Generator
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              //Row 12

              [
                //Insert Hours here for Generator
                {
                  text: '# Hours',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: portHours,
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: starHours,
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                {
                  text: 'Bilge',
                  colSpan: 2,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'header',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'header',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Miscellaneous',
                  colSpan: 2,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'header',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'header',
                },
              ],
              [
                //Row 1
                {
                  text: '',
                  border: [false, false, false, true],
                },
                {
                  text: 'Completed',
                  border: [false, false, false, true],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: '',
                  border: [false, false, false, true],
                },
                {
                  text: 'Completed',
                  border: [false, false, false, true],
                  style: 'subHeader',
                },
              ],

              [
                //Row 2
                {
                  text: 'Forward Pump(s)',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Thrusters',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 3
                {
                  text: 'Mid Pump(s)',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Horn',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 4
                {
                  text: 'Aft Pump(s)',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Nav Lights',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 5
                {
                  text: 'Lights',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Anchor Light',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 6
                {
                  text: 'Shower Sump',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'VHF',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 7
                {
                  text: 'Blowers',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Spot Light',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 8
                {
                  text: 'Cleanliness',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Strainers',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 9
                {
                  text: 'Converters',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Water',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              [
                //Row 10
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
                {
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  text: 'Water Tanks',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: '√',
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  text: 'Report Comments',
                  style: 'header',
                  colSpan: 1,
                  border: [false, false, false, false],
                },
              ],
              [
                {
                  //Engines Table
                  //Column 1
                  text: this.engineComments,
                  colSpan: 1,
                  border: [false, false, false, false],
                },
              ],
            ],
          },
        },
        '\n\n\n',
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  image: this.enginePort[0].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  image: this.engineStar[0].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  image: this.genPics[0].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Bilge',
                  image: this.bilgePics[0].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },

                {
                  //Engines Table
                  //Column 1
                  //text: 'MISC 1',
                  image: this.miscPics[0].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Misc 2',
                  image: this.miscPics[1].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            widths: ['*', '*'],

            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Strainer Dirty',
                  image: this.strainerDirty[0].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Strainer Clean',
                  image: this.strainerClean[0].data,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],

                  width: 150,
                },
              ],
            ],
          },
        },
      ],

      styles: {
        header: {
          fontSize: 12,
          bold: true,
          color: '#fff',
          fillColor: '#009ca6',
          border: [false, false, false, false],
        },
        subHeader: {
          fontSize: 11,
          alignment: 'right',
        },
        row: {
          fontSize: 12,
          alignment: 'left',
        },
      },
    };
    this.pdfObj = pdfMake.createPdf(docDefinition);
    
    //console.log(docDefinition);
    this.downloadPdf();
  }
}

