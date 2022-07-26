import { NgxLoggerLevel } from "ngx-logger";

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    projectId: 'procapdb',
    appId: '1:206498918561:web:a3450c8d869c8f1eed40e0',
    storageBucket: 'procapdb.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyCSZ1vsEiU-QdTPpu2xML5wX3gZ4a8MXw8',
    authDomain: 'procapdb.firebaseapp.com',
    messagingSenderId: '206498918561',
  },
  appVersion: require('../../package.json').version + ' - DEV',
  production: false,
  logging: {
    serverLoggingUrl: 'https://procaptainstaffing.free.beeceptor.com/logs',
    level: NgxLoggerLevel.DEBUG,
    serverLogLevel: NgxLoggerLevel.ERROR
  }
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
