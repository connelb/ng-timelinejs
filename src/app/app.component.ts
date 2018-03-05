//our root app component
import {Component, NgModule, VERSION} from '@angular/core'
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser'
//import {cosmological} from './cosmological';
import {cosmological} from './cosmological.1';
import {TimelineComponent} from './timeline.component';
import { PapaParseService } from 'ngx-papaparse';
import * as papa from 'papaparse';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  name:string;
  event:any = {};
  data:any = {};
  data1:any = {};
  result:any;
  results:any = {};

/*
    "events": [
        {
            "start_date": {
                "year":			"1851",
                "month":		"",
                "day": 			"",
                "hour": 		"",
                "minute": 		"",
                "second": 		"",
                "millisecond": 	"",
                "format": 		""
            },
			"group": "Hello",
            "media": {
                "caption": "Screenshot from TimelineJS Embed Generator tool (see below)",
                "credit": "",
                "url": "http://timeline.knightlab.com/static/welcome/step3.png",
                "thumb": 	""
            },
            "text": {
                "headline": "It's Easy to Make Your Own Timeline",
                "text": "The TimelineJS Embed Generator makes it easy to add a timeline to your own site. Just copy our Google Spreadsheet template, add your events as rows in the spreadsheet, and use our <a href='#make'>generator tool</a> to generate the HTML you need to add to your site."
            }
        },
*/


  constructor() {
    this.data = cosmological;
    this.getCSV('./assets/data/sample.csv').subscribe(data=> {
      let events = [];
      for (let key in data){
        events.push({
          "start_date": {
            'year':data[key]['Year'],
            'month':data[key]['Month'],
            'day':data[key]['Day'],
            'Time':data[key]['Time'],
            'hour':data[key]['Hour'],
            'minute':data[key]['Minute'],
            'millisecond':"",//data[key]['millisecond'],
            "format": data[key]['Display Date']
          },
          "end_date":{
            'year':data[key]['End Year'],
            'month':data[key]['End Month'],
            'day':data[key]['End Day'],
            'End Time':data[key]['End Time'],
            'hour':data[key]['End Hour'],
            'minute':data[key]['End Minute'],
            "second": 		"",
            "millisecond": 	"",
            "format": data[key]['Display Date']
          },
          'group':data[key]['Group'],
          "text": {
            'headline': data[key]['Headline'],
            'text':data[key]['Text']
          },
           "media": {
                "caption": data[key]['Media Caption'],
                "credit": data[key]['Media Credit'],
                "url": "",
                "thumb": ""
            },
/*            "media": {
                //"caption": data[key]['Media Caption'],
                //"credit": data[key]['Media Credit'],
                //"url": data[key]['Media'],
                //"thumb": data[key]['Media Thumbnail']
            }, */ 
          'Type':data[key]['Type'],
          'Background':data[key]['Background']
        })
      }

      this.results = {
      "title": {
                "media": {
                    "caption": "",
                    "credit": "",
                    "url": "http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
                    "thumb": 	""
                },
                  "text": {
                      "headline": "Welcome to TimelineJS",
                      "text": "<p>TimelineJS is an open-source tool that enables you to build visually-rich interactive timelines and is available in 40 languages.</p><p>You're looking at an example of one right now.</p><p>Click on the arrow to the right to learn more.</p>"
                  }
          },
        "events":events,
        //"eras":"",
        "scale": "human",

        }
   
    });
  }

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
  
  setResult(event){
    this.result = event;
  }
}
