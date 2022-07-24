import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export class engineCheck {
  constructor(id: string, label: string) {  
    this.id = id,
    this.label = label
  }
  id: string;
  label: string;
  isChecked: boolean; 
  toDisplay?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  public getEnginePort(): engineCheck [] {
    return this.enginePort;
  }

  enginePort: engineCheck [] = [
    new engineCheck('', 'Oil') ,
    // { id: '', label: 'Oil', isChecked: false },
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

  public engineStarboard = [
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

  public engineMain = [
    { id: '', label: 'Oil', isChecked: false, toDisplay: '' },
    { id: '', label: 'Coolant', isChecked: false, toDisplay: '' },
    { id: '', label: 'Transmission Fluid', isChecked: false, toDisplay: '' },
    { id: '', label: 'Hoses', isChecked: false, toDisplay: '' },
    { id: '', label: 'Belts', isChecked: false, toDisplay: '' },
    { id: '', label: 'Batteries', isChecked: false,toDisplay: '' },
    { id: '', label: 'Seacocks', isChecked: false,toDisplay: '' },
    { id: '', label: 'Strainers', isChecked: false, toDisplay: '' },
    { id: '', label: 'Alternator', isChecked: false, toDisplay: '' },
    { id: '', label: 'Leaks', isChecked: false, toDisplay: '' },
    { id: '', label: 'Test Run', isChecked: false, toDisplay: '' },
    
  ];

  public bilgeData = [
    { id: '', label: 'Forward Pump(s)', isChecked: false },
    { id: '', label: 'Mid Pump(s)', isChecked: false },
    { id: '', label: 'Aft Pump(s)', isChecked: false },
    { id: '', label: 'Lights', isChecked: false },
    { id: '', label: 'Shower Sump', isChecked: false },
    { id: '', label: 'Blowers', isChecked: false },
    { id: '', label: 'Cleanliness', isChecked: false },
    { id: '', label: 'Converters', isChecked: false },
    
  ];

  public generatorData = [
    { id: '', label: 'Oil', isChecked: false },
    { id: '', label: 'Coolant', isChecked: false },
    { id: '', label: 'Hoses', isChecked: false },
    { id: '', label: 'Belts', isChecked: false },
    { id: '', label: 'Batteries', isChecked: false },
    { id: '', label: 'Seacocks', isChecked: false },
    { id: '', label: 'Strainers', isChecked: false },    
  ];

  public hvacData = [
    { id: '', label: 'Pumps', isChecked: false },
    { id: '', label: 'Seacock(s)', isChecked: false },
    { id: '', label: 'Strainer(s)', isChecked: false },
    { id: '', label: 'Return Filters', isChecked: false },
    
  ];

  public miscData = [
    { id: '', label: 'Thrusters', isChecked: false, notAvail: true, checked: false },
    { id: '', label: 'Horn', isChecked: false },
    { id: '', label: 'Nav Lights', isChecked: false },
    { id: '', label: 'Anchor Light', isChecked: false },
    { id: '', label: 'VHF', isChecked: false },
    { id: '', label: 'Spot Light', isChecked: false },
    { id: '', label: 'Strainers', isChecked: false },
    { id: '', label: 'Water Tank Filled', isChecked: false, notAvail: true, checked: false },
    
  ];

  public cloudFiles = [ ];
  public customer = [
    { value: '' },
  ];

  public clientLast = [
    { value: '' },
  ]

  public vessel = [
    { value: '' },
  ];

  public boatImg = [
    { value: '', isNull: true },
  ];

  public engineCount = [
    { value: '' },
  ];

  public dateText = [
    { value: '' },
  ];

  public engineComments = [
    { comments: ' ' },
  ];
  public engineHoursMain = [
    { hours: 0 },
  ];
  public engineHoursPort = [
     { hours: 0 },
  ];
  public engineHoursStarboard = [
    { hours: 0 },
  ];
  public genHours = [
    { hours: 0 },
  ];

  public tempBoatUpload = [
    { data: '' },
  ];

  public subFolderData = [
    { filePath: '' },
  ];

  public pdfReportData = [
    { filePath: '' },
  ];

  public isDataAlreadyThere = [
    { answer: false },
  ]
  public captainName = [
    { displayName: '' },
  ]

  public fromWhereIcame = [
    { from: '' },
  ]

  public userProfile = [
    { uid: '', displayName: '', email: '' },
  ]

  public detailClientId = [
    ,
  ]

  public clients = [
    { id: '', fName: 'Bob', lName: 'Files', fullName: 'Bob Files' },
    { id: '', fName: 'Shaquelle', lName: "O'Neil", fullName: "Shaquelle O'Neil" },
    { id: '', fName: 'Jeff', lName: 'Bezos', fullName: 'Jeff Bezos' },
    { id: '', fName: 'Robert', lName: 'Hanback', fullName: 'Robert Hanback' },
    { id: '', fName: 'James', lName: 'Lewandowski', fullName: 'James Lewandowski' },
    { id: '', fName: 'Courtney', lName: 'Files', fullName: 'Courtney Files' },
  ];
  
  public photos: string;
  
  
}


