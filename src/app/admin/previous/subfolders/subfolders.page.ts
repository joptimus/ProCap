import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DbDataService } from 'src/app/services/db-data.service';

@Component({
  selector: 'app-subfolders',
  templateUrl: './subfolders.page.html',
  styleUrls: ['./subfolders.page.scss'],
})
export class SubfoldersPage implements OnInit {

  subfolders = [];

  constructor(
    private dbData: DbDataService,
    private localData: DataService
  ) { }

  ngOnInit() {
    this.getSubFolders();
  }

  getSubFolders() {
    let id = this.localData.subFolderData[0].filePath;
    this.subfolders = this.dbData.getSubFolders(id);

    console.log('what was the id passed :', id);
    console.log('this.subfolders ', this.subfolders);
  } 
  


}
