import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.page.html',
  styleUrls: ['./select.page.scss'],
})
export class SelectPage implements OnInit {

  client = [];
  date = Date.now();
  crewSelected: boolean = false;
  skidSelected: boolean = false;
  vesselSelected: boolean = false;
  baronSelected: boolean = false;
  selectedOption = true;
  custVessel = [];

  constructor(private route: Router, private data: DataService) { }

  ngOnInit() {
    this.client = this.data.clients;
    this.custVessel = this.data.customer;
  }

  next() {
    this.route.navigate(['members', 'main']);
  }
  disable(event) {
    this.selectedOption = false;
    this.custVessel = event.detail.value;
    this.data.customer = event.detail.value;
    console.log('cust vessel :', this.custVessel);
    console.log('event :', event);
    console.log('dataservice :', this.data.customer)
  }
  updateValues(){
    this.data.customer = this.custVessel;
  }

  selectedVessel(value): void {
    console.log("is vesselSelected : ", value);
    this.data.vessel = value;
    if (value == 'What the F?') {
      this.vesselSelected = true;
      this.skidSelected = false;
      this.crewSelected = false;
      this.baronSelected = false;
    } if (value == 'Skid Marks') {
      this.skidSelected = true;
      this.vesselSelected = false;
      this.crewSelected = false;
      this.baronSelected = false;
    } if (value == 'A Crewed Interest') {
      this.skidSelected = false;
      this.vesselSelected = false;
      this.crewSelected = true;
      this.baronSelected = false;
    }
    if (value == 'Baron Trenck') {
      this.skidSelected = false;
      this.vesselSelected = false;
      this.crewSelected = false;
      this.baronSelected = true;
    }
  }

}
