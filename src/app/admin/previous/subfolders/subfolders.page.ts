import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';
import { Logger } from 'src/app/services/logger.service';

@Component({
  selector: 'app-subfolders',
  templateUrl: './subfolders.page.html',
  styleUrls: ['./subfolders.page.scss'],
})
export class SubfoldersPage implements OnInit {

  subfolders = [];
  dataPresent = false;

  constructor(
    private dbData: DbDataService,
    private localData: DataService,
    private route: Router,
    private logger: Logger
  ) { }

  ngOnInit() {
    this.getSubFolders();
  }

  getSubFolders() {

      let id = this.localData.subFolderData[0].filePath;
      this.dataPresent = true;
      this.localData.isDataAlreadyThere[0].answer = this.dataPresent;
      this.subfolders = this.dbData.getSubFolders(id);
  
      this.logger.debug('what was the id passed :', id);
      this.logger.debug('this.subfolders ', this.subfolders);
      
    
      

}
  getPdfReports(path) {
    this.localData.pdfReportData[0].filePath = path;
    this.logger.debug('id / path: ', path);
    this.route.navigate(['pcsreport']);
  }

  resetArray() {
   // this.subfolders = [''];
    this.logger.debug('resetArray ', this.subfolders);
  }

}
