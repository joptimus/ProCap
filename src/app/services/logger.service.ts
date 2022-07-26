import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NGXLogger } from 'ngx-logger';
/**
 * The possible log levels.
 */
export enum LogLevel {
  Error,
  Warning,
  Info,
  Debug,
}

@Injectable()
export class Logger {

  constructor(private ngx: NGXLogger) {}

  /**
   * Logs messages or objects  with the debug level.
   * Works the same as console.log().
   */
  public debug(...objects: any[]) {
    this.log(console.log, LogLevel.Debug, objects);
  }

  /**
   * Logs messages or objects  with the info level.
   * Works the same as console.info().
   */
  public info(...objects: any[]) {
    this.log(console.info, LogLevel.Info, objects);
  }

  /**
   * Logs messages or objects  with the warning level.
   * Works the same as console.warn().
   */
  public warn(...objects: any[]) {
    this.log(console.warn, LogLevel.Warning, objects);
  }

  /**
   * Logs messages or objects  with the error level.
   * Works the same as console.error().
   */
  public error(...objects: any[]) {
    this.log(console.error, LogLevel.Error, objects);
  }

  private log(func: Function, level: LogLevel, objects: any[]) {
    const env = environment.production || 'development';
    if (env !== true || (env === true && level === LogLevel.Error)) {
      func.apply(console, objects);
      this.ngx.error(objects);
    }
  }

}