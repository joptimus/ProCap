import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.page.html',
  styleUrls: ['./generator.page.scss'],
})
export class GeneratorPage implements OnInit {

  generatorData = [];

  constructor(private data: DataService) { }

  ngOnInit() {
    this.generatorData = this.data.generatorData;
  }

  log(){
    console.log(this.generatorData)
    this.data.generatorData = this.generatorData;
  }

  // public generatorData = [
  //   { id: '', label: 'Oil', isChecked: false },
  //   { id: '', label: 'Coolant', isChecked: false },
  //   { id: '', label: 'Hoses', isChecked: false },
  //   { id: '', label: 'Belts', isChecked: false },
  //   { id: '', label: 'Batteries', isChecked: false },
  //   { id: '', label: 'Seacocks', isChecked: false },
  //   { id: '', label: 'Strainers', isChecked: false },
  //   { id: '', label: 'Hours', isChecked: false },
    
  // ];

}
