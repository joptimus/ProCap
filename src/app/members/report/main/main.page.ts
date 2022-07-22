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
import { DbDataService } from 'src/app/services/db-data.service';
import { DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';

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

  // #region Final Pics Variables for Report
  reportPortOil;
  reportPortHour;
  reportStarOil;
  reportStarHour;
  reportMainOil;
  reportMainHour;
  reportGenOil;
  reportGenHours;
  reportGalleyFaucet;
  reportHeadFaucet;
  reportHeadToliet;
  reportStrainerDirty;
  reportStrainerClean;
  reportBilge;
  reportMiscOne;
  reportMiscTwo;
  reportMiscThree;

  textThrusters;
  textWaterFilled;

  clientBoatImg;

  // #endregion End of Report Variables

  image: any;
  image2: SafeResourceUrl;
  profile = null;
  customer: any;
  vessel: any;

  //#region Pic Arrays
  bilgePics = [];
  portOilPic = [];
  portHourPic = [];
  starOilPic = [];
  starHoursPic = [];
  engineMain = [];
  mainHourPic = [];
  mainOilPic = [];
  genOil = [];
  genHoursPic = [];
  miscPicOne = [];
  miscPicTwo = [];
  miscPicThree = [];
  strainerDirty = [];
  strainerClean = [];
  galleyFaucet = [];
  headFaucet = [];
  headToliet = [];
  engineComments;
  pdfObj = null;
  //#endregion

  // Local Asset Pics
  logoData = null;
  comingSoon = null;
  placeholderData = null;

  submitBtnDisable = false;
  pics = null;
  clientLastName = [];
  emailResponse = [];

  hasAccount = false;
  currentImage = null;
  pdfData = null;

  type: string;
  resetValue = [''];
  resetNull;
  currentMonth: any;
  pdfBlob: any;
  pdfDocGenerator: any;

  //#region Variables for calculating Image Size
  base64Str: any;
  kbytes: number;
  bytesBefore: number;
  bytesAfter: number;
  difference: number;
  percentage: number;
  imgResultBeforeCompress: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  imgResultAfterResize: DataUrl = '';
  imgResultUpload: DataUrl = '';
  imgResultAfterResizeMax: DataUrl = '';
  imgResultMultiple: UploadResponse[] = [];
  // #endregion

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
    private data: DataService,
    private dbData: DbDataService,
    private imageCompress: NgxImageCompressService
  ) {
    this.photoService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
    this.dbData.getSettingsValues().subscribe((response) => {
      console.log(response);
      this.emailResponse = response;
    });
    this.generateReportId();
  }

  ngOnInit() {
    this.engineComments = this.data.engineComments[0].comments;
    this.customer = this.data.customer;
    this.vessel = this.data.vessel;
    this.image = this.data.photos;
    this.clientLastName = this.data.clientLast;
    console.log('vessel = ' + this.vessel);

    this.loadFiles();
    this.loadPlaceHolder();
    this.loadLogo();
    this.loadComingSoon();
    this.disableCheck();
    this.checkAccount();
    console.log(this.clientLastName);
  }

  async presentAlert(header, sub, message) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: sub,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  getCurrentMonth() {
    var d = new Date();
    var curr_month = d.getMonth();
    console.log(curr_month);
    var months = new Array(
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    );

    var today = months[curr_month];
    console.log('month is : ', today);
  }

  async checkAccount() {
    this.hasAccount = await this.emailComposer.hasAccount();
    console.log('Does this have an account? : ', this.hasAccount);
  }
  async openEmail() {
    const email: EmailComposerOptions = {
      to: this.emailResponse[0].value,
      cc: '',
      bcc: 'jlewan27@gmail.com',
      attachments: [`${this.pdfData}`, 'application/pdf'],
      subject: 'Report # ' + this.reportFinal,
      body: 'This insepection report has been completed.',
    };

    await this.emailComposer.open(email);
  }

  async uploadFile(pdf) {
    console.log('Upload File Started');
    // Calculate Month for File Path
    var d = new Date();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    console.log(curr_month);
    var months = new Array(
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    );
    console.log('What year did we get?', curr_year);
    var today = months[curr_month];
    //console.log('did we get the base64 in function?: ', pdf);
    this.dbData.addBlobPdfToStorage({
      fileName: pdf,
      reportId: this.reportFinal,
      clientName: this.clientLastName,
      boatId: this.vessel,
      month: today + ' ' + curr_year,
    });
    console.log('this.pdfblob', pdf);
    console.log('Upload File was a success');
    return true;
  }
  catch(e) {
    console.log('Upload file errored out: ', e);
    return null;
  }

  generateReportId() {
    this.reportNumber = Math.floor(Math.random() * 10000000);
    var string1 = new String('PCS');
    var string2 = new String(this.reportNumber);
    var string3 = string1.concat(string2.toString());
    this.reportFinal = string3;
    console.log(string1, string2, string3);
  }

  loadPlaceHolder() {
    this.http
      .get('./assets/img/placeholder.jpg', { responseType: 'blob' })
      .subscribe((res) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.placeholderData = reader.result;
        };
        reader.readAsDataURL(res);
      });
  }

  loadLogo() {
    this.http
      .get('./assets/img/proCapLogo-min.png', { responseType: 'blob' })
      .subscribe((res) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.logoData = reader.result;
        };
        reader.readAsDataURL(res);
      });
  }

  loadComingSoon() {
    this.http
      .get('./assets/img/coming-soon.png', { responseType: 'blob' })
      .subscribe((res) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.comingSoon = reader.result;
        };
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
  async submitReport() {
    const loading = await this.loadingController.create();
    await loading.present();
    if (this.data.engineHoursPort[0].hours == 0) {
      await loading.dismiss();
      this.showPortAlert();
    } else if (this.data.engineHoursStarboard[0].hours == 0) {
      await loading.dismiss();
      this.showStarAlert();
    } else if (this.data.genHours[0].hours == 0) {
      await loading.dismiss();
      this.showGenAlert();
    } else {

      this.createPdf();
      this.deleteAllPictures();
      this.engineComments = [''];
      await loading.dismiss();
      this.showSuccess();
    }

  }

  deleteAllPictures() {
    this.images.forEach((file) => {
      this.deleteImage(file);
    });
  }

  // #region Navigation buttons
  engine(): void {
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
  safety() {
    this.route.navigate(['members', 'misc']);
  }
  redirectHome() {
    this.route.navigate(['members', 'landing']);
  }
  goToMain() {
    this.route.navigate(['members', 'main']);
  }
  // #endregion

  // #region Images Code

  buttonId(event) {
    console.log(event);
    console.log('target id is: ', event.target.id);
    if (this.type == '') {
      console.warn('TARGET ID IS EMPTY');
    } else {
      this.type = event.target.id;
    }
    console.log('this.type = ', this.type);
  }

  async selectImage(value) {
    this.buttonId(value);

    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    const loading = await this.loadingController.create({
      message: 'Sending photo for compression...',
     });
     await loading.present();
    if (image) {
      loading.dismiss();
      this.compressFile(image.dataUrl);
      loading.dismiss();
    }
  }

  async compressFile(image) {
    const loading = await this.loadingController.create({
      message: 'Start of compression...',
      duration: 2000
     });
     await loading.present();


    this.bytesBefore = this.imageCompress.byteCount(image);
    // console.log('Before compression:', this.bytesBefore + ' bytes');
    // console.log('Before compression:', this.bytesBefore / 1000 + ' KB');
    // console.log('Before compression:', this.bytesBefore / 1000000 + ' MB');
    this.imageCompress.compressFile(image, 2, 50, 50).then(
      (result: DataUrl) => {
        this.imgResultAfterCompress = result;
        this.saveImage(this.imgResultAfterCompress);
        this.bytesAfter = this.imageCompress.byteCount(result);
        this.difference = this.bytesBefore - this.bytesAfter;
        this.percentage = ((this.bytesBefore - this.bytesAfter) / this.bytesBefore) * 100;
        let percent = this.percentage.toFixed(2);
        // console.log('Size in bytes after compression is now:', this.bytesAfter + ' bytes');
        // console.log('After compression:', this.bytesAfter / 1000 + ' KB');
        // console.log('After compression:', this.bytesAfter / 1000000 + ' MB');
        
        console.log('Original Size: ', this.bytesBefore / 1000000 + ' MB');
        console.log('After compression:', this.bytesAfter / 1000000 + ' MB');
        console.log('File reduced by (MB):', this.difference / 1000000 + ' MB or ', percent,  '%');
      },
      (error: any) => {
        loading.dismiss();
        console.error(error);
        this.presentAlert('Compression Error', 'Error compressing Image', error);
        
      }
    );
    loading.dismiss();
  }



  async saveImage(photoBase64: string) {
    //const base64Data = await this.readAsBase64(photo);
    //console.log(base64Data);
    // console.log('compressed Image : ', photoBase64);

    const loading = await this.loadingController.create({
      message: 'Saving image to filesystem...',
     });
     await loading.present();

    const fileName = this.type + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: photoBase64,
      directory: Directory.Data,
    });
    console.log('saved: ', savedFile);
    loading.dismiss();
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
          console.log('error in load images: ', err);
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

  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path,
    });
    this.refreshPics();
  }

  // #endregion

  refreshPics() {
    this.loadFiles();
    this.disableCheck();
  }

  disableCheck() {
    this.bilgePics = this.images.filter((file) =>
      file.name.startsWith('BILGE')
    );
    this.portOilPic = this.images.filter((file) =>
      file.name.startsWith('PortOil')
    );
    this.portHourPic = this.images.filter((file) =>
      file.name.startsWith('PortHours')
    );
    this.starOilPic = this.images.filter((file) =>
      file.name.startsWith('Starboard')
    );
    this.starHoursPic = this.images.filter((file) =>
      file.name.startsWith('StarHours')
    );
    this.engineMain = this.images.filter((file) =>
      file.name.startsWith('Main')
    );
    this.genOil = this.images.filter((file) => file.name.startsWith('GenOil'));
    this.genHoursPic = this.images.filter((file) =>
      file.name.startsWith('GenHours')
    );
    this.galleyFaucet = this.images.filter((file) =>
      file.name.startsWith('GalFaucet')
    );
    this.headFaucet = this.images.filter((file) =>
      file.name.startsWith('HeadFaucet')
    );
    this.headToliet = this.images.filter((file) =>
      file.name.startsWith('HeadToliet')
    );
    this.strainerDirty = this.images.filter((file) =>
      file.name.startsWith('HVAC-Dirty')
    );
    this.strainerClean = this.images.filter((file) =>
      file.name.startsWith('HVAC-Clean')
    );
    this.miscPicOne = this.images.filter((file) =>
      file.name.startsWith('MiscOne')
    );
    this.miscPicTwo = this.images.filter((file) =>
      file.name.startsWith('MiscTwo')
    );
    this.miscPicThree = this.images.filter((file) =>
      file.name.startsWith('MiscThree')
    );

    // if (
    //   this.bilgePics.length == 1 &&
    //   this.portOilPic.length == 1 &&
    //   this.starOilPic.length == 1 &&
    //   this.genOil.length == 1 &&
    //   this.strainerClean.length == 1 &&
    //   this.strainerDirty.length == 1 &&
    //   this.miscPicOne.length == 1 &&
    //   this.miscPicTwo.length == 1
    // ) {
    //   this.submitBtnDisable = false;
    // } else {
    //   this.submitBtnDisable = true;
    // }
    console.log('disable check value : ', this.submitBtnDisable);
  }

  async engineHoursCheck() {
   
  }

  resetAllValues() {
    this.getCurrentMonth();
    console.log('this.current', this.currentMonth);
    console.log(this.getCurrentMonth());
    console.log('data value customer before', this.clientLastName);
    console.log('data value vessel before', this.vessel);
    this.clientLastName = this.resetNull;
    this.vessel = this.resetNull;
    console.log('data value customer after', this.clientLastName);
    console.log('data value after before', this.vessel);
  }

  async showPortAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Port Engine Missing Data',
      message:
        'There are no hours entered for the Port Engine.  Please enter hours then resubmit',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.route.navigate(['members', 'engines']);
          },
        },
      ],
    });

    await alert.present();
  }

  async showStarAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Starboard Engine Missing Data',
      message:
        'There are no hours entered for the Starboard Engine.  Please enter hours then resubmit',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.route.navigate(['members', 'engines']);
          },
        },
      ],
    });

    await alert.present();
  }

  async showGenAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Generator Engine Missing Data',
      message:
        'There are no hours entered for the Generator Engine.  Please enter hours then resubmit',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.route.navigate(['members', 'generator']);
          },
        },
      ],
    });

    await alert.present();
  }

  async showSuccess() {
    const alert = await this.alertController.create({
      header: 'Success',
      subHeader: 'Inspection Report Filed',
      message:
        'Your inspection report has been submitted and uploaded successfully',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.redirectHome();
          },
        },
      ],
    });

    await alert.present();
  }

  async downloadPdfError(error) {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'There was an error downloading the PDF',
      message: error,
      buttons: [
        {
          text: 'OK',
          handler: () => {
          
          },
        },
      ],
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
            recursive: true,
            // encoding: Encoding.UTF8
          });
          this.pdfData = result.uri;

          if (this.hasAccount == true) {
            this.openEmail();
          } else {
            this.fileOpener.open(`${result.uri}`, 'application/pdf');
          }
        } catch (e) {
          this.downloadPdfError(e);
          console.error('Unable to write file', e);
        }
      });
    } else {
      // On a browser simply use download!
      this.pdfObj.download();
       //this.uploadFile();
    }
  }

  validatePicturesForReport() {
    // Filter Images to display in different sections of report
    this.bilgePics = this.images.filter((file) =>
      file.name.startsWith('BILGE')
    );
    this.portOilPic = this.images.filter((file) =>
      file.name.startsWith('PortOil')
    );
    this.portHourPic = this.images.filter((file) =>
      file.name.startsWith('PortHours')
    );
    this.starOilPic = this.images.filter((file) =>
      file.name.startsWith('Starboard')
    );
    this.starHoursPic = this.images.filter((file) =>
      file.name.startsWith('StarHours')
    );
    this.engineMain = this.images.filter((file) =>
      file.name.startsWith('Main')
    );
    this.genOil = this.images.filter((file) => file.name.startsWith('GenOil'));
    this.genHoursPic = this.images.filter((file) =>
      file.name.startsWith('GenHours')
    );
    this.galleyFaucet = this.images.filter((file) =>
      file.name.startsWith('GalFaucet')
    );
    this.headFaucet = this.images.filter((file) =>
      file.name.startsWith('HeadFaucet')
    );
    this.headToliet = this.images.filter((file) =>
      file.name.startsWith('HeadToliet')
    );
    this.strainerDirty = this.images.filter((file) =>
      file.name.startsWith('HVAC-Dirty')
    );
    this.strainerClean = this.images.filter((file) =>
      file.name.startsWith('HVAC-Clean')
    );
    this.miscPicOne = this.images.filter((file) =>
      file.name.startsWith('MiscOne')
    );
    this.miscPicTwo = this.images.filter((file) =>
      file.name.startsWith('MiscTwo')
    );
    this.miscPicThree = this.images.filter((file) =>
      file.name.startsWith('MiscThree')
    );

    if (this.bilgePics.length == 0) {
      this.reportBilge = this.logoData;
    } else {
      this.reportBilge = this.bilgePics[0].data;
    }
    if (this.portHourPic.length == 0) {
      this.reportPortHour = this.logoData;
    } else {
      this.reportPortHour = this.portHourPic[0].data;
    }
    if (this.portOilPic.length == 0) {
      this.reportPortOil = this.logoData;
    } else {
      this.reportPortOil = this.portOilPic[0].data;
    }
    if (this.starOilPic.length == 0) {
      this.reportStarOil = this.logoData;
    } else {
      this.reportStarOil = this.starOilPic[0].data;
    }
    if (this.starHoursPic.length == 0) {
      this.reportStarHour = this.logoData;
    } else {
      this.reportStarHour = this.starHoursPic[0].data;
    }
    if (this.mainHourPic.length == 0) {
      this.reportMainHour = this.logoData;
    } else {
      this.reportMainHour = this.mainHourPic[0].data;
    }
    if (this.mainOilPic.length == 0) {
      this.reportMainOil = this.logoData;
    } else {
      this.reportMainOil = this.mainOilPic[0].data;
    }
    if (this.genOil.length == 0) {
      this.reportGenOil = this.logoData;
    } else {
      this.reportGenOil = this.genOil[0].data;
    }
    if (this.genHoursPic.length == 0) {
      this.reportGenHours = this.logoData;
    } else {
      this.reportGenHours = this.genHoursPic[0].data;
    }
    if (this.galleyFaucet.length == 0) {
      this.reportGalleyFaucet = this.logoData;
    } else {
      this.reportGalleyFaucet = this.galleyFaucet[0].data;
    }
    if (this.headFaucet.length == 0) {
      this.reportHeadFaucet = this.logoData;
    } else {
      this.reportHeadFaucet = this.headFaucet[0].data;
    }
    if (this.headToliet.length == 0) {
      this.reportHeadToliet = this.logoData;
    } else {
      this.reportHeadToliet = this.headToliet[0].data;
    }
    if (this.strainerDirty.length == 0) {
      this.reportStrainerDirty = this.logoData;
    } else {
      this.reportStrainerDirty = this.strainerDirty[0].data;
    }
    if (this.strainerClean.length == 0) {
      this.reportStrainerClean = this.logoData;
    } else {
      this.reportStrainerClean = this.strainerClean[0].data;
    }
    if (this.miscPicOne.length == 0) {
      this.reportMiscOne = this.logoData;
    } else {
      this.reportMiscOne = this.miscPicOne[0].data;
    }
    if (this.miscPicTwo.length == 0) {
      this.reportMiscTwo = this.logoData;
    } else {
      this.reportMiscTwo = this.miscPicTwo[0].data;
    }
    if (this.miscPicThree.length == 0) {
      this.reportMiscThree = this.logoData;
    } else {
      this.reportMiscThree = this.miscPicThree[0].data;
    }
  }

  validateTextFields() {
    const data = this.data.miscData;

    // Find the Index number of the array to check
    let thrusters = data.findIndex((x) => x.label === 'Thrusters');
    let water = data.findIndex((x) => x.label === 'Water Tank Filled');
    console.log('index - thrusters', thrusters);
    console.log('index - water', water);

    if (this.data.miscData[thrusters].checked == true) {
      this.textThrusters = 'N/A';
    } else {
      this.textThrusters = '√';
    }
    if (this.data.miscData[water].checked == true) {
      this.textWaterFilled = 'N/A';
    } else {
      this.textWaterFilled = '√';
    }
    console.log('textThrusters = ', this.textThrusters);
    console.log('textWaterFilled = ', this.textWaterFilled);
  }

  validateBoatImg() {
    if (this.data.boatImg[0].isNull == false) {
      this.clientBoatImg = this.data.boatImg[0].value;
      console.log('clientBoatImg = ', this.clientBoatImg);
    } else {
      this.clientBoatImg = this.comingSoon;
      console.log('Boat Image is null', this.data.boatImg);
    }
  }

  // #region ------- All code for Generating the PDF Template --------
  createPdf() {
    this.validatePicturesForReport();
    this.validateBoatImg();
    this.validateTextFields();
    this.authService.getCurrentUser();

    const reportId = this.reportFinal;

    const data = this.data.engineMain;
    const portHours = this.data.engineHoursPort[0].hours;
    const starHours = this.data.engineHoursStarboard[0].hours;
    const genHours = this.data.genHours[0].hours;
    const capt = this.data.captainName[0].displayName;

    var date = new Date();
    let dateText = date.toLocaleDateString();

    // Debug Logs
    // console.log();
    // console.log(path);
    // console.log(portHours);
    // console.log(this.strainerDirty);

    const docDefinition = {
      compress: true,
      content: [
        // #region ////////// PDF Header //////////
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
                margin: [0, 0, 0, 10],
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'Client',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 10,
                        alignment: 'right',
                      },

                      {
                        text: this.customer,
                        bold: true,
                        color: '#333333',
                        fontSize: 10,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Inspection No.',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 10,
                        alignment: 'right',
                      },

                      {
                        text: reportId,
                        bold: true,
                        color: '#333333',
                        fontSize: 10,
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
                        fontSize: 10,
                        alignment: 'right',
                      },

                      {
                        text: 'Capt. ' + capt,
                        bold: true,
                        color: '#333333',
                        fontSize: 10,
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
                        fontSize: 10,
                        alignment: 'right',
                      },
                      {
                        text: dateText,
                        bold: true,
                        color: '#333333',
                        fontSize: 10,
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
                        fontSize: 10,
                        alignment: 'right',
                        width: '*',
                      },
                      {
                        text: 'COMPLETE',
                        bold: true,
                        fontSize: 10,
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
              text: 'Captain Comments',
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
              image: this.clientBoatImg,
              width: 200,
              height: 100,
            },
            {
              text: this.engineComments,
              fontSize: 8,
              bold: true,
              color: '#333333',
              alignment: 'right',
              height: 300,
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
         // #endregion ////////// PDF Header //////////
        
        // #region ////////// Data Table //////////
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
                  style: 'row',
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
                  text: 'Safety',
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
                  text: this.textThrusters,
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
                  text: 'Water Tanks Filled',
                  border: [false, false, false, false],
                  style: 'row',
                },
                {
                  text: this.textWaterFilled,
                  border: [false, false, false, false],
                  style: 'subHeader',
                },
              ],
              // [
              //   //Row 10
              //   {
              //     text: '',
              //     border: [false, false, false, false],
              //     style: 'row',
              //   },
              //   {
              //     text: '',
              //     border: [false, false, false, false],
              //     style: 'subHeader',
              //   },
              //   {
              //     text: '',
              //     border: [false, false, false, false],
              //   },
              //   {
              //     text: 'Water Tanks',
              //     border: [false, false, false, false],
              //     style: 'row',
              //   },
              //   {
              //     text: '√',
              //     border: [false, false, false, false],
              //     style: 'subHeader',
              //   },
              // ],
            ],
          },
        },
        '\n\n\n\n',
        // #endregion ////////// Data Table //////////

        '\n\n\n',
            // #region ///////// Report Images Section /////////
        {
          table: {
            widths: ['*', 10, 160, 10, '*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  image: this.reportPortOil,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  image: this.reportPortHour,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  image: this.reportStarOil,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
              ],
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  text: 'Port Engine Oil',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  text: 'Port Engine Hours',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  text: 'Starboard Engine Oil',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            widths: ['*', 10, 160, 10, '*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  image: this.reportStarHour,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  image: this.reportGenOil,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  image: this.reportGenHours,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
              ],
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  text: 'Starboard Engine Hours',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  text: 'Generator Engine Oil',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  text: 'Generator Engine Hours',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            widths: ['*', 10, 160, 10, '*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  image: this.reportStrainerDirty,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  image: this.reportStrainerClean,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  image: this.reportBilge,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
              ],
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  text: 'Dirty AC Strainer',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  text: 'Cleaned AC Strainer',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  text: 'Bilge Photo',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
              ],
            ],
          },
        },
        {text: '\n', pageBreak: 'before'},
        {
          table: {
            widths: ['*', 10, 160, 10, '*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  image: this.reportGalleyFaucet,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  image: this.reportHeadFaucet,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  image: this.reportHeadToliet,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
              ],
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  text: 'Galley Faucet',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  text: 'Head Faucet',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  text: 'Head Toliet',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
              ],
            ],
          },
        },
        '\n',
        '\n', 
        {
          table: {
            widths: ['*', 10, 160, 10, '*'],
            body: [
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  image: this.reportMiscOne,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  image: this.reportMiscTwo,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  image: this.reportMiscThree,
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  width: 150,
                },
              ],
              [
                {
                  //Engines Table
                  //Column 1
                  //text: 'Port',
                  text: 'Miscellaneous',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Starboard',
                  text: 'Miscellaneous',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
                {
                  // Spacer
                  text: '',
                  border: [false, false, false, false],
                },
                {
                  //Engines Table
                  //Column 1
                  //text: 'Generator',
                  text: 'Miscellaneous',
                  colSpan: 1,
                  alignment: 'center',
                  border: [false, false, false, false],
                  style: 'picTitle',
                },
              ],
            ],
          },
        },
      ],
      // #endregion ///////// Report Images Section /////////

      // #region //////// PageBreak Function ///////////
      pageBreakBefore: function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
      },
      // #endregion //////// PageBreak Function /////////

      // #region //////// Styles ///////////
      styles: {
        header: {
          fontSize: 12,
          bold: true,
          color: '#fff',
          fillColor: '#009ca6',
          border: [false, false, false, false],
        },
        subHeader: {
          fontSize: 10,
          alignment: 'right',
        },
        row: {
          fontSize: 10,
          alignment: 'left',
        },
        picTitle: {
          fontSize: 12,
          color: '#fff',
          fillColor: '#009ca6',
          alignment: 'center',
        },
      }
      // #endregion //////// Styles ///////////
    };
    
    this.pdfObj = pdfMake.createPdf(docDefinition);

    //console.log(docDefinition);
    //let pdf64data: string;
    let pdfDocGenerator = pdfMake.createPdf(docDefinition);
    let pdfBlob = pdfDocGenerator.getBlob((blob) => {
      //alert(base64data);
      pdfBlob = blob;
      //  pdf64data = 'data:application/pdf;base64,' + base64data;
      this.uploadFile(pdfBlob);
      this.pdfBlob = pdfBlob;
        console.log('pdfblob ', this.pdfBlob);
    });

    this.downloadPdf();
  }
}

// #endregion