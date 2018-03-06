//our root app component
import {Component, NgModule, VERSION} from '@angular/core'
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser'
//import {cosmological} from './cosmological';
//import {cosmological} from './cosmological.1';
import {TimelineComponent} from './timeline.component';
import { PapaParseService } from 'ngx-papaparse';
import * as papa from 'papaparse';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

import { GetcsvService } from './getcsv.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent{
  //name:string;
  event:any;
  scale:any;
  title:any;
  filepath:any;
  //events:any;
  //data:any = {};
  //data1:any = {};
  result:any;
  results:any= {};
  //public url:string;

  constructor(
    private getcsv: GetcsvService
  ) {
    //this.data = cosmological;

  }

 
/*   public getCSV(url): Observable<any>{
    let results = new Array();
    return Observable.create((observer)=>{
      papa.parse(url,{
        download:true,
        header:true,
        complete: function (results, file){
          observer.next(results.data)
        }
      })
    })
  } */
  
  setResult(event){
    this.result = event;
  }
}
