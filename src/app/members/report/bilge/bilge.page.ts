import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-bilge',
  templateUrl: './bilge.page.html',
  styleUrls: ['./bilge.page.scss'],
})
export class BilgePage implements OnInit {

  bilgeData = [];

  constructor(private data: DataService) { }

  ngOnInit() {
    this.bilgeData = this.data.bilgeData;
  }
  log(){
    this.data.bilgeData = this.bilgeData;
    console.log(this.bilgeData)
  }

  // public bilgeData = [
  //   { id: '', label: 'Forward Pump(s)', isChecked: false },
  //   { id: '', label: 'Mid Pump(s)', isChecked: false },
  //   { id: '', label: 'Aft Pump(s)', isChecked: false },
  //   { id: '', label: 'Lights', isChecked: false },
  //   { id: '', label: 'Shower Sump', isChecked: false },
  //   { id: '', label: 'Blowers', isChecked: false },
  //   { id: '', label: 'Cleanliness', isChecked: false },
  //   { id: '', label: 'Converters', isChecked: false },
    
  // ];
}
