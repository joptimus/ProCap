import { Component, OnInit } from '@angular/core';
import { DbDataService } from 'src/app/services/db-data.service';

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
    private dbService: DbDataService
  ) { }

  ngOnInit() {
    // this.getInspect();
    // this.getFolders();
  }

  getInspect() {
    this.dbService.getInspectionFiles();
    this.files = this.dbService.getInspectionFiles();
    console.log('this.files, ', this.files);
  }

  getFolders() {
    // this.dbService.getFolders();
     this.folders = this.dbService.getFolders();
    console.log('this.folders , ', this.folders);
  }

  getSubFolders(id) {
    this.subfolders = this.dbService.getSubFolders(id);
    console.log('what was the id passed :', id);
    console.log('this.subfolders ', this.subfolders);
  } 
  

}
