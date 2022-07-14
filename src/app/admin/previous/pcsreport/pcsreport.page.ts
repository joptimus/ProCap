import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

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
    private iab: InAppBrowser
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

 //  console.log('what was the id passed :', id);
    console.log('what was the path passed :', path);
    console.log('this.subfolders ', this.pdfReports);
  } 

}
