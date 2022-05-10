import { Component, OnInit } from '@angular/core';
import { DbDataService, Client } from 'src/app/services/db-data.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  constructor(private clientService: DbDataService,) { }

  ngOnInit() {
  }

  // async addClient() {

  //           this.clientService.addClient({   
  //             fullName: this.full,
  //             fName: res.fName,
  //             lName: res.lName,
  //             address: res.address,
  //             city: res.city,
  //             state: res.state,
  //             zipCode: res.zipCode,
  //             vesselName: res.vesselName,
  //             vesselPhoto: res.vesselPhoto,
  //             lastInspec: res.lastInspec,
  //             email: res.email });
  //         } 
  //       }
  //     ]
  //   });
 

  // }
}
