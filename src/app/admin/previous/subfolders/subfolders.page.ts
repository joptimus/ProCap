import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';

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
    private route: Router
  ) { }

  ngOnInit() {
    this.getSubFolders();
  }

  getSubFolders() {

    if(this.localData.isDataAlreadyThere[0].answer === true) {
      console.log('Data present do not run');
      this.subfolders;
    } else {
console.log('is there data already?', this.subfolders);
      let id = this.localData.subFolderData[0].filePath;
      this.dataPresent = true;
      this.localData.isDataAlreadyThere[0].answer = this.dataPresent;
      this.subfolders = this.dbData.getSubFolders(id);
  
      console.log('what was the id passed :', id);
      console.log('this.subfolders ', this.subfolders);
      
    }
         
      

}
  getPdfReports(path) {
    this.localData.pdfReportData[0].filePath = path;
    console.log('id / path: ', path);
    this.route.navigate(['pcsreport']);
  }

  resetArray() {
   // this.subfolders = [''];
    console.log('resetArray ', this.subfolders);
  }

}
