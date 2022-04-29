import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-misc',
  templateUrl: './misc.page.html',
  styleUrls: ['./misc.page.scss'],
})
export class MiscPage implements OnInit {

  miscData = [];
  constructor(private data: DataService) { }

  ngOnInit() {
    this.miscData = this.data.miscData;
  }
  log(){
    this.data.miscData = this.miscData;
    console.log('Updated miscData')
  }

  // public miscData = [
  //   { id: '', label: 'Thrusters', isChecked: false },
  //   { id: '', label: 'Horn', isChecked: false },
  //   { id: '', label: 'Nav Lights', isChecked: false },
  //   { id: '', label: 'Anchor Light', isChecked: false },
  //   { id: '', label: 'VHF', isChecked: false },
  //   { id: '', label: 'Spot Light', isChecked: false },
  //   { id: '', label: 'Strainers', isChecked: false },
  //   { id: '', label: 'Water', isChecked: false },
  //   { id: '', label: 'Water Tank', isChecked: false },
    
  // ];
}
