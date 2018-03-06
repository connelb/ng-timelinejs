import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
//import {Subscription} from 'rxjs/Subscription';
//import 'rxjs/add/operator/find';
import { PapaParseService } from 'ngx-papaparse';
import * as papa from 'papaparse';

@Injectable()
export class GetcsvService {

  constructor(private papa: PapaParseService) { }

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

}
