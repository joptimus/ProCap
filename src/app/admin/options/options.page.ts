import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage implements OnInit {

  constructor(private route: Router) { }

  ngOnInit() {
  }

  goToClients() {
    this.route.navigate(['clients']);
  }

  goToUsers() {
    this.route.navigate(['users']);
  }



}
