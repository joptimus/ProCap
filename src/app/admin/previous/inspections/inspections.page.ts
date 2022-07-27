import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';
import { Logger } from 'src/app/services/logger.service';

@Component({
  selector: 'app-inspections',
  templateUrl: './inspections.page.html',
  styleUrls: ['./inspections.page.scss'],
})
export class InspectionsPage implements OnInit {
  temp = [];
  files = [];
  folders = [];
  subfolders = [];
  constructor(
    private dbService: DbDataService,
    private localData: DataService,
    private route: Router,
    private logger: Logger
  ) { }

  ngOnInit() {
    // this.getInspect();
     this.getFolders();
  }

  getInspect() {
    this.dbService.getInspectionFiles();
    this.files = this.dbService.getInspectionFiles();
    this.logger.debug('this.files, ', this.files);
  }

  getFolders() {
    // this.dbService.getFolders();
     this.folders = this.dbService.getFolders();
    this.logger.debug('this.folders , ', this.folders);
  }

  getSubFolders(id) {
    //this.subfolders = this.dbService.getSubFolders(id);
    this.localData.subFolderData[0].filePath = id;
    this.logger.debug('what was the id passed :', id);
   // this.logger.debug('this.subfolders ', this.subfolders);
    this.route.navigate(['subfolders']);
  } 
  

}
