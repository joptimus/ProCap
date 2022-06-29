import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataService } from 'src/app/services/data.service';
import { PhotosService } from 'src/app/services/photos.service';
import { resourceLimits } from 'worker_threads';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';

import pdfMake from 'pdfmake/build/pdfMake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

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
    private data: DataService
  ) {
    this.photoService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
    this.genRandom();
    this.reportId();
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
    console.log('vessel = ' + this.vessel);
    this.loadFiles();
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
    console.log(this.data.engineMain);
    console.log(this.data.enginePort);
    console.log(this.data.bilgeData);
    console.log(this.data.customer);
    console.log(this.data.engineComments);
    console.log(this.data.clients);
    console.log(this.data.photos);
    console.log(this.reportFinal);
    const loading = await this.loadingController.create();
    await loading.present();
    await this.createPdf();
    await loading.dismiss();
  }
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
    }
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
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
    console.log('saved: ', savedFile);
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
    this.loadFiles();
  }

  refreshPics() {
    this.loadFiles();
  }
  goToMain() {
    this.route.navigate(['members', 'main']);
  }
  downloadPdf() {
    if (this.platform.is('cordova')) {
      this.pdfObj.getBase64(async (data) => {
        try {
          let path = `pdf/myletter_${Date.now()}.pdf`;
  
          const result = await Filesystem.writeFile({
            path,
            data: data,
            directory: Directory.Documents,
            recursive: true
            // encoding: Encoding.UTF8
          });
          this.fileOpener.open(`${result.uri}`, 'application/pdf');
  
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
    const engineComms = this.data.engineComments[0].comments;
    const logo = this.data.proCapLogo;
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

    let path = this.bilgePics;
    //  for (var j = 0; j < this.bilgePics.length; j++) {
    //    this.bilgePics.push({image: this.bilgePics[j].data, width: 300})
    //  }
    console.log();
    console.log(path);
    console.log(portHours);

    console.log(this.bilgePics);

    const docDefinition = {
      content: [{
        columns: [{
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAPCCAIAAAAWH1LlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAP+lSURBVHhe7N0HfNv1nf9xa0u2LEveM3ZiO3GGE2cnJJCww2qhpYW2tIUCV7jr4lqug1Kg0HW0V3ptD+7f9qAttFBWKCuBQEL2cBLHiRMndrzjvS1vSf7/Yn2tiDhDlvTTsF/P+uF+Pz8J25H003j/vr/PVzEyMhIBAAAAAAAAAIC/KcX/AwAAAAAAAADgVwTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAAAABAFgTQAAAAAAAAAABZEEADAAAAAAAAAGRBAA0AAAAAAAAAkAUBNAAAAAAA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ATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFAEATQAAAAAAAAAQBEE0AAAAAAAAAAARRBAAwAAAAAAAAAUQQANAAAAAAAAAFDAsGH/H+Wil9Aw9D9SAAAAAElFTkSuQmCC',
            width: 250,
            margin: [0, -30, 0, 0],
          },
  
          [{
              text: 'Monthly Inspection',
              color: '#333333',
              width: '*',
              fontSize: 20,
              bold: true,
              alignment: 'right',
              margin: [0, 0, 0, 15],
            },
            {
              stack: [{
                  columns: [{
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
                  columns: [{
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
                  columns: [{
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
        columns: [{
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
        columns: [{
            image: 'data:image/png;base64,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',
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
        columns: [{
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
            [{
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
  
              }
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
            [{
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
      }
    }
  
  };
    this.pdfObj = pdfMake.createPdf(docDefinition);
    
    console.log(docDefinition);
    this.downloadPdf();
  }
}

