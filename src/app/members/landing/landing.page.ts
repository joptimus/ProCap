import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  currentApplicationVersion;
  constructor(private route: Router) { }

  ngOnInit() {
    this.currentApplicationVersion = environment.appVersion;
  }
  startReport() {
    this.route.navigate(['members','select']);
  }
  admin() {
    this.route.navigate(['options']);
  }

}
