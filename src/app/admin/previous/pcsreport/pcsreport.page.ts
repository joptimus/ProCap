import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Logger } from 'src/app/services/logger.service';

@Component({
  selector: 'app-pcsreport',
  templateUrl: './pcsreport.page.html',
  styleUrls: ['./pcsreport.page.scss'],
})
export class PcsreportPage implements OnInit {

  pdfReports = [];
  constructor(
    private dbData: DbDataService,
    private localData: DataService,
    private iab: InAppBrowser,
    private logger: Logger
  ) { }

  ngOnInit() {
    this.getReports();
  }

  openExternal(url) {
    this.iab.create(url, '_blank', {
      toolbarcolor: '#009ca6',
      toolbarposition: 'top',
      closebuttoncolor: '#fff'
    });
  }


  getReports() {
    //let id = this.localData.pdfReportData[0].fileId;
    let path = this.localData.pdfReportData[0].filePath
    this.pdfReports = this.dbData.getReportDetails(path);

 //  this.logger.debug('what was the id passed :', id);
    this.logger.debug('what was the path passed :', path);
    this.logger.debug('this.subfolders ', this.pdfReports);
  } 

}
