import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-hvac',
  templateUrl: './hvac.page.html',
  styleUrls: ['./hvac.page.scss'],
})
export class HvacPage implements OnInit {

  hvacData = [];
  constructor(private data: DataService) { }

  ngOnInit() {
    this.hvacData = this.data.hvacData;
  }

  log(){
    this.data.hvacData = this.hvacData;
    console.log(this.data.hvacData)
  }

  // public hvacData = [
  //   { id: '', label: 'Pumps', isChecked: false },
  //   { id: '', label: 'Seacock(s)', isChecked: false },
  //   { id: '', label: 'Strainer(s)', isChecked: false },
  //   { id: '', label: 'Return Filters', isChecked: false },
    
  // ];

}
