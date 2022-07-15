import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DbDataService, Client } from 'src/app/services/db-data.service';


@Component({
  selector: 'app-select',
  templateUrl: './select.page.html',
  styleUrls: ['./select.page.scss'],
})
export class SelectPage implements OnInit {
  clients = [];

  client = [];
  date = Date.now();
  crewSelected: boolean = false;
  skidSelected: boolean = false;
  vesselSelected: boolean = false;
  baronSelected: boolean = false;
  selectedOption;
  clientSelected = false;
  boatSelected = false;
  clientFullName = [];
  dateText = [];
  clientId = [];
  clientLast = [];
  engineCount = [];
  boatImg = [];

  constructor(
    private route: Router,
    private data: DataService,
    private clientService: DbDataService
  ) {
    this.clientService.getClients().subscribe((res) => {
      console.log('getClients Service :', res);
      this.clients = res;
    });
  }

  ngOnInit() {
    this.client = this.data.clients;
    this.clientFullName = this.data.customer;
    this.clientLast = this.data.clientLast;

    console.log('Address?', this.client);
  }

  next() {
    this.route.navigate(['members', 'main']);
  }

  boatSelect(event) {
    this.boatSelected = true;
    console.log('boatSelect event: ',event);
  }
  
  selected(event) {

    console.log('selected event 1st step: ', event);

    this.clientSelected = true;
    this.boatSelected = false;
    this.data.vessel = event.detail.value.vesselName;
    console.log('data.vessel : ', this.data.vessel);

    this.clientLast = event.detail.value.lName;
    this.data.clientLast = event.detail.value.lName;
    console.log('client Last name : ', this.clientLast);

    this.engineCount = event.detail.value.noEngines;
    this.data.engineCount = event.detail.value.noEngines;
    console.log('number of engines : ', this.engineCount);

    console.log('this is selectedOption : ', this.selectedOption);

    this.clientFullName = event.detail.value.fullName;
    this.data.customer = event.detail.value.fullName;
    console.log('clientFullName :', this.clientFullName);

    if(event.detail.value.vesselPhoto == '') { 
      this.data.boatImg[0].isNull = true;
      console.log('The Boat Img is Null value set to true');
    } else {   
      this.data.boatImg[0].value = event.detail.value.vesselPhoto;
      this.data.boatImg[0].isNull = false;
      //console.log('data service boatImg = ', this.data.boatImg);
      //console.log('event detail  = ', event.detail.value.vesselPhoto);
     };
  }

  boatPicked(event){
    this.boatSelected = true;
    console.log('the event : ', event);
    this.data.vessel = event.detail.value.vesselName;
    console.log('data.vessel : ', this.data.vessel);
  }

  updateValues() {
    this.data.customer = this.clientFullName;
  }

  selectedVessel(value): void {
    console.log('is vesselSelected : ', value);
    // const bools = value.target.value;
    this.data.vessel = value.target.value;
    console.log('data.vessel : ', value.target.value);
    // if (bools == 'What the F?') {
    //   this.vesselSelected = true;
    //   this.skidSelected = false;
    //   this.crewSelected = false;
    //   this.baronSelected = false;
    // }
    // if (bools == 'Skid Marks') {
    //   this.skidSelected = true;
    //   this.vesselSelected = false;
    //   this.crewSelected = false;
    //   this.baronSelected = false;
    // }
    // if (bools == 'A Crewed Interest') {
    //   this.skidSelected = false;
    //   this.vesselSelected = false;
    //   this.crewSelected = true;
    //   this.baronSelected = false;
    // }
    // if (bools == 'Baron Trenck') {
    //   this.skidSelected = false;
    //   this.vesselSelected = false;
    //   this.crewSelected = false;
    //   this.baronSelected = true;
    // }
  }
}
