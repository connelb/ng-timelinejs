import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import { HttpClient } from '@angular/common/http';
//import {Subscription} from 'rxjs/Subscription';
//import 'rxjs/add/operator/find';
import { PapaParseService } from 'ngx-papaparse';
import * as papa from 'papaparse';
import * as _ from 'lodash';

@Injectable()
export class GetcsvService {

  constructor(private papa: PapaParseService, private http:HttpClient) { }

  public getCSV(url): Observable<any>{   
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
  }

  public getFilteredCSV(url:string,filter:string): Observable<any>{   
    let results = new Array();
    return Observable.create((observer)=>{
      papa.parse(url,{
        download:true,
        header:true,
        complete: function (results, file){
          //console.log('what', results.data, filter, url);
          results.data = _.filter(results.data, function(o) { return o['Group'] == filter; });
          observer.next(results.data)
        }
      })
    })
  }


}
