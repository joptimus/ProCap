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
  selectedOption = true;
  custVessel = [];
  dateText = [];
  clientId = [];
  clientLast = [];

  constructor(
    private route: Router,
    private data: DataService,
    private clientService: DbDataService
  ) {
    this.clientService.getClients().subscribe((res) => {
      console.log('thisone?', res);
      this.clients = res;
    });
  }

  ngOnInit() {
    this.client = this.data.clients;
    this.custVessel = this.data.customer;
    this.clientLast = this.data.clientLast;
    console.log('Address?', this.client);
  }

  selected(event) {
    console.log('selected event : ', event);
  }

  next() {
    this.route.navigate(['members', 'main']);
  }
  disable(event) {
    // this.selectedOption = false;
    this.clientLast = event.detail.value.lName;
    console.log('client L name : ', this.clientLast);

    console.log('this is selectedOption : ', this.selectedOption);
    console.log('logging this.clients ',this.clients);
    this.custVessel = event.detail.value;
    console.log('event :', event.detail);
    this.data.customer = event.detail.value;
    this.getClientById(event);
    console.log('cust vessel :', this.custVessel);
    console.log('event :', event);
    console.log('dataservice :', this.data.customer);

  }
  updateValues() {
    this.data.customer = this.custVessel;
  }

  async getClientById(client: Client) {
    (res) => {
    };
  }

  selectedVessel(value): void {
    console.log('is vesselSelected : ', value);
    const bools = value.target.value;
    this.data.vessel = value.target.value;
    console.log('data.vessel : ', value.target.value);
    if (bools == 'What the F?') {
      this.vesselSelected = true;
      this.skidSelected = false;
      this.crewSelected = false;
      this.baronSelected = false;
    }
    if (bools == 'Skid Marks') {
      this.skidSelected = true;
      this.vesselSelected = false;
      this.crewSelected = false;
      this.baronSelected = false;
    }
    if (bools == 'A Crewed Interest') {
      this.skidSelected = false;
      this.vesselSelected = false;
      this.crewSelected = true;
      this.baronSelected = false;
    }
    if (bools == 'Baron Trenck') {
      this.skidSelected = false;
      this.vesselSelected = false;
      this.crewSelected = false;
      this.baronSelected = true;
    }
  }
}
