import { Component, OnInit } from '@angular/core';
import { engineCheck } from 'src/app/services/data.service';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss'],
})
export class ChecklistComponent implements OnInit {

  hero: engineCheck = {
    id: '1',
    label: 'Oil',
    isChecked: true
  }
  constructor() { }

  ngOnInit() {}
  public enginePort = [
    { id: '', label: 'Oil', isChecked: false },
    { id: '', label: 'Coolant', isChecked: false },
    { id: '', label: 'Transmission Fluid', isChecked: false },
    { id: '', label: 'Hoses', isChecked: false },
    { id: '', label: 'Belts', isChecked: false },
    { id: '', label: 'Batteries', isChecked: false },
    { id: '', label: 'Seacocks', isChecked: false },
    { id: '', label: 'Strainers', isChecked: false },
    { id: '', label: 'Alternator', isChecked: false },
    { id: '', label: 'Leaks', isChecked: false },
    { id: '', label: 'Test Run', isChecked: false },
    
  ];

}
