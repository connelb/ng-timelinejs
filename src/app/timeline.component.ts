import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnInit, SimpleChange } from '@angular/core';
import { Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/find';
import { PapaParseService } from 'ngx-papaparse';
import {FormControl} from '@angular/forms';

import {TimelineModel} from './timeline.model';
import * as papa from 'papaparse';
import * as _ from 'lodash';
import { GetcsvService } from './getcsv.service';
import * as moment from 'moment';

declare var TL: any;
@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  //@Input() myFilter:any;
  @Input() myEvent:any;
  @Input() events:Array<any>;
  @Input() scale:string = '';
  @Input() title:Object = {};
  @Input() filepath:string= '';
  @Output() clicked = new EventEmitter();
  //@Input() results:any = {};
  public filter:Array<any>;
  public filterEvent:Array<any>;
  url:string = '';
  timeline:any = null;
  id:string = null;
  viewInited = false;
  temp:any;
  public currentData:Array<any> =[];
  public currentData1:Array<any> = [];;
  
  
  //temp1:any;
  private timelineModel:TimelineModel = null;
  private selectedIndex:number = 0;
  private selected = {};
  private currentEvents:Array<any> = [];
  private readonly targets = [
    'tl-headline',
    'tl-timemarker-content', 
    'tl-slidenav-icon',
    'tl-slidenav-content-container',
    'tl-slidenav-description',
    'tl-slidenav-title',
    'tl-icon-goback',
    'tl-menubar-button'
  ];
  private listenerFn: () => void;

  private defaultOptions = {
    debug: false,                       // Can be set to debug timelinejs
    script_path: '',
    //width: this.elementRef.nativeElement.width,
    //height: this.elementRef.nativeElement.height,
    scale_factor: 0.5,                    // How many screen widths wide should the timeline be at first presentation
    zoom_sequence: [0.05, 0.5, 1,2,3,5,89], 	//[0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], // Array of Fibonacci numbers for TimeNav zoom levels http://www.maths.surrey.ac.uk/hosted-sites/R.Knott/Fibonacci/fibtable.html
    layout: 'landscape',                // portrait or landscape
    timenav_position: 'bottom',         // timeline on top or bottom
    optimal_tick_width: 50,            // optimal distance (in pixels) between ticks on axis
    base_class: "tl-timeline",
    timenav_height: 175,
    //timenav_height_percentage: 50,      // Overrides timenav height as a percentage of the screen
    timenav_height_min: 100,            // Minimum timenav height
    marker_height_min: 30,              // Minimum Marker Height
    marker_width_min: 50,              // Minimum Marker Width
    marker_padding: 5,                  // Top Bottom Marker Padding
    start_at_slide: 0,
    menubar_height: 50,
    skinny_size: 650,
    relative_date: false,               // Use momentjs to show a relative date from the slide.text.date.created_time field
    use_bc: false,                      // Use declared suffix on dates earlier than 0
    duration: 1000,                     // Slider animation duration
    ease: TL.Ease.easeInOutQuint,       // Slider animation type
    dragging: true,
    trackResize: true,
    map_type: 'stamen:toner-lite',
    slide_padding_lr: 10,              // padding on slide of slide
    slide_default_fade: '0%',          // landscape fade
    language: 'en',
    is_embed:false,
    hash_bookmark:false,
    timenav_mobile_height_percentage:40,
    start_at_end:false,
    ga_property_id:null,
    track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
  };
  
  changeLog: string[] = [];


  constructor(
    private elementRef:ElementRef, 
    private http: Http,
    private renderer:Renderer2,
    private papa: PapaParseService,
    private getcsv: GetcsvService
  ) {  
    this.id = 'timeline_'+Math.floor((Math.random() * 10000) + 1);
    
    this.timelineModel = new TimelineModel();

    this.listenTimeline();
  }

  private listenTimeline(){
    var self = this;
    this.listenerFn = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      //let element = event.srcElement.className;
      let element = event.className;
      if (self.targets.indexOf(element) === -1){return;}
      self.setSelected(self.timelineModel.getNewSelection(event.path, self.currentEvents, self.selectedIndex, event.srcElement.className));
      if(!self.selected){
        console.warn('element not found in currentEvents:', self.currentEvents, event);
        return;
      }
    });
  }

  ngOnInit(){
    setTimeout(() => {
    this.currentData1 = this.events;
    },200)
  }
  
  ngAfterViewInit(){
    this.viewInited = true;
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let filterEvent1 = [];
    this.currentData1 = this.events;
     for (let propName in changes) {
      if(propName == 'myEvent' && !changes[propName].firstChange){
        filterEvent1 = changes[propName].currentValue.map(d=>{
           return d
       });

       this.currentData1 = _.filter(this.events, function(p){
        return _.includes(filterEvent1, p['Event']);
    });
     }
     if(this.currentData1.length>0){
      this.updateTimeline(); 
     }
    } 
  }

  
  private updateTimeline(){
    try{
      if(!this.viewInited){return;}
      
      var self = this;

     let subscription =  Observable.create((observer)=>{
            observer.next(this.currentData1)
      })
      subscription.subscribe(data=> {

      let results = {};
          let events = [];
          let projectTitle = data[0]['Project Title'];
          let projectDescription = data[0]['Project Description'];
          let projectUrl = data[0]['Project Url'];
        
          for (let key in data){   
            if(data[key]['Event Step']){
              events.push({
                "start_date": {
                  'month':data[key]['Month'],
                  'day':data[key]['Day'],
                  'hour':data[key]['Hour'],
                  'minute':data[key]['Minute'],
                  "format": data[key]['Display Date']
                },
                "end_date":{
                  'month':data[key]['Month'],
                  'day':data[key]['Day'],
                  'hour':data[key]['End Hour'],
                  'minute':data[key]['End Minute'],
                  "format": data[key]['Display Date']
                },
                'group':data[key]['Group'],
                "text": {
                  'headline':data[key]['Event Step'],
                  'text': (data[key]['Video Link'])?"<table width='100%' class='ms-rteTable-default' cellspacing='0'><tbody><tr><td class='ms-rteTable-default' style='width: 10%;'>"+data[key]['Background']+"</td><td class='ms-rteTable-default' style='width: 50%;'>"​+"<video controls>"+
                  "<source src="+data[key]['Video Link']+ " type='video/mp4'></video>"+"</td><td class='ms-rteTable-default' style='width: 40%;'>​<p>"+data[key]['Event']+data[key]['Text']+"</P></td></tr></tbody></table>":"<span style='color:"
                  +data[key]['Background']+"'>"
                  +data[key]['Text']+"</span>"
                },
                'Type':data[key]['Type'],
                'Background':data[key]['Background'],
                "media":{
                  'url': (data[key]['Media']),
                  'credit':(data[key]['Media Credit']),
                  'caption':(data[key]['Media Caption']),
                  'thumb': (data[key]['Media Thumbnail'])
                }
              })
            }
        }
            
        results = {
          "title": {
                    "media": {
                        "caption": "",
                        "credit": "",
                        "url": projectUrl,
                        "thumb": 	""
                    },
                      "text": {
                          "headline": projectTitle,
                          "text": projectDescription
                      }
              },
            "events":events,
            //"eras":"",
            "scale": "human",
            }

          try{
            if(typeof results !== 'string'){
              if (results['events'].length == 0){return;}
            }
            self.timeline = new TL.Timeline(self.id, results,this.defaultOptions);
            self.currentEvents = results['events'];
            let temp = self.currentEvents[0]?self.currentEvents[0]:null;
            self.setSelected(temp);
          }catch(e){console.warn(e);}
        },
        (error:any)=>{console.warn(error);},
        () => {
          if(subscription){
            subscription.unsubscribe();
          }
        }
      );
    }catch(e){console.warn(e);}
  }
      
  private setSelected(selected:Array<any>){
    if(selected){
      this.selectedIndex = (selected[1])?selected[1]:0;
      this.selected = (selected[0])?selected[0]:this.currentEvents[this.selectedIndex];
    }else{
      this.selected = null;
      this.selectedIndex = 0;
    }
    this.clicked.emit(this.selected);
  }

  public ngOnDestroy() {
    try {
      if (this.listenerFn) {
        this.listenerFn();
      }
    } catch (e) {
      console.warn(e);
    }
  }

}