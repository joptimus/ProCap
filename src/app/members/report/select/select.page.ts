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
    console.log('Address?', this.clients);
  }

  next() {
    this.route.navigate(['members', 'main']);
  }
  disable(event) {
    // this.selectedOption = false;
    this.clientService.getClientById(event).subscribe((res) => {
      console.log('2tiems', res, event);
    });

    console.log('csSer', this.clientService.getClientById(event));
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
      console.log('i am here', client);
      console.log('i am here', res);
    };
  }

  selectedVessel(value): void {
    console.log('is vesselSelected : ', value);
    const bools = value.target.value;
    this.data.vessel = value.target.value;
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
