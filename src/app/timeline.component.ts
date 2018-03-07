import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnInit } from '@angular/core';
import { Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/find';
import { PapaParseService } from 'ngx-papaparse';

import {TimelineModel} from './timeline.model';
import * as papa from 'papaparse';
import * as _ from 'lodash';
import { GetcsvService } from './getcsv.service';

declare var TL: any;
@Component({
  selector: 'timeline',
  template: `<div [id]="id" class="timeline"></div>`,
  styles: ['.timeline{height:100%;width:100%;padding: 0px;margin: 0px;}']
})
export class TimelineComponent {
  @Input() events:Array<any> = [];
  @Input() scale:string = '';
  @Input() title:Object = {};
  @Input() filepath:string= '';
  @Output() clicked = new EventEmitter();
  @Input() results:any = {};
  url:string = '';
  timeline:any = null;
  id:string = null;
  viewInited = false;
  temp:any;
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
    // height:this.elementRef.container.offsetHeight,
    // width:this.elementRef.container.offsetWidth,
    // width: will be 100%,
    // height: will be 100%,
    scale_factor: 10,                    // How many screen widths wide should the timeline be at first presentation
    zoom_sequence: [0.5, 1, 2, 5, 9, 15], 	//[0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], // Array of Fibonacci numbers for TimeNav zoom levels http://www.maths.surrey.ac.uk/hosted-sites/R.Knott/Fibonacci/fibtable.html
    layout: 'landscape',                // portrait or landscape
    timenav_position: 'bottom',         // timeline on top or bottom
    optimal_tick_width: 1000,            // optimal distance (in pixels) between ticks on axis
    //base_class: '',
    timenav_height: 250,
    timenav_height_percentage: 25,      // Overrides timenav height as a percentage of the screen
    timenav_height_min: 150,            // Minimum timenav height
    marker_height_min: 30,              // Minimum Marker Height
    marker_width_min: 50,              // Minimum Marker Width
    marker_padding: 5,                  // Top Bottom Marker Padding
    start_at_slide: 1,
    menubar_height: 100,
    skinny_size: 650,
    relative_date: false,               // Use momentjs to show a relative date from the slide.text.date.created_time field
    use_bc: false,                      // Use declared suffix on dates earlier than 0
    duration: 500,                     // Slider animation duration
    ease: TL.Ease.easeInOutQuint,       // Slider animation type
    dragging: true,
    trackResize: true,
    map_type: 'stamen:toner-lite',
    slide_padding_lr: 100,              // padding on slide of slide
    slide_default_fade: '50%',          // landscape fade
    language: 'en',
    is_embed:false,
    hash_bookmark:false,
    base_class:"tl-timeline",
    timenav_mobile_height_percentage:40,
    start_at_end:false,
    ga_property_id:null,
    track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
  };
  
  constructor(
    private elementRef:ElementRef, 
    private http: Http,
    private renderer:Renderer2,
    private papa: PapaParseService,
    private getcsv: GetcsvService
  ) {
    //this.getData();  
    this.id = 'timeline_'+Math.floor((Math.random() * 10000) + 1);
    this.listenTimeline();
    this.timelineModel = new TimelineModel();
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
  
  ngAfterViewInit(){
    this.viewInited = true;
    this.updateTimeline();
  }
  
  ngOnChanges(){
    this.updateTimeline();
  }
  
  private updateTimeline(){
    try{
      if(!this.viewInited){return;}
      var self = this;
      //var subscription:Subscription = this.getObject().subscribe((object:any)=>{
        console.log('this url in update trying to find m.url',this.filepath)
      var subscription:Subscription = this.getcsv.getCSV(this.filepath).subscribe(data=> {
          let results = {};
          let events = [];
          //console.log('what is data[key]?', this.url, data);
          for (let key in data){
            if(data[key]['Headline']){
            if(data[key]['Video Link']){
              events.push({
                "start_date": {
                  'hour':data[key]['Hour'],
                  'minute':data[key]['Minute'],
                  "format": data[key]['Display Date']
                },
                "end_date":{
                  'hour':data[key]['End Hour'],
                  'minute':data[key]['End Minute'],
                  "format": data[key]['Display Date']
                },
                'group':data[key]['Group'],
                "text": {
                  'headline': data[key]['Headline'],
                  'text': "<video width='200' height='200' controls>"+
                  "<source src="+data[key]['Video Link']+ " type='video/mp4'></video>"+ "<span style='background-color:"+data[key]['Background']+"'>"+data[key]['Text']+"</span>"+"<img style='max-height: 100px; max-width: 100px;' src='"+data[key]['Picture Link'] +"' class='media-image'>"
                },
                  "media": {
                    "url": '',
                    "caption": data[key]['Media Caption'],
                    "credit": data[key]['Media Credit'],
                    "thumbnail":data[key]['Media Thumbnail']
                  },
                'Type':data[key]['Type'],
                'Background':data[key]['Background']
              })
            }else{
              events.push({
                "start_date": {
                  'hour':data[key]['Hour'],
                  'minute':data[key]['Minute'],
                  "format": data[key]['Display Date']
                },
                "end_date":{
                  'hour':data[key]['End Hour'],
                  'minute':data[key]['End Minute'],
                  "format": data[key]['Display Date']
                },
                'group':data[key]['Group'],
                "text": {
                  'headline': data[key]['Headline'],
                  'text': "<p>"+data[key]['Text']+"</p>"+"<img style='max-height: 100px; max-width: 100px;' src='"+data[key]['Picture Link'] +"' class='media-image'>"
                },
                  "media": {
                    "url": '',
                    "caption": data[key]['Media Caption'],
                    "credit": data[key]['Media Credit'],
                    "thumbnail":data[key]['Media Thumbnail']
                  },
                'Type':data[key]['Type'],
                'Background':data[key]['Background']
              })

            }
          }
        }
            
      
          results = {
          "title": {
                    "media": {
                        "caption": "",
                        "credit": "",
                        "url": "http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
                        "thumb": 	""
                    },
                      "text": {
                          "headline": "Finding the Problem",
                          "text": "<p>Mapping the therapy to better understanding </p>"
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
            //self.currentEvents = object.events;
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

  /*
orginal
          try{
            if(typeof object !== 'string'){
              if (object.events.length == 0){return;}
            }
            self.timeline = new TL.Timeline(self.id, object,this.defaultOptions);
            //self.currentEvents = object.events;
            self.currentEvents = this.results.events;
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
  */
  
  // replace with
/*   private getObject(): Observable<any> {
        //if (this.url !== '') {
          //return this.http.get(this.url);
        //}
        return new Observable((observer: Observer<any>) => {
          try {
            observer.next({
              scale: this.results.scale,
              events: this.results.events
            });
            observer.complete();
          } catch (e) {console.warn(e);}
        });
      } */
      
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

/*   public getCSV(this.url).subscribe(data=> {
    let events = [];
    for (let key in data){
      events.push({
        "start_date": {
          //'year':data[key]['Year'],
          //'month':data[key]['Month'],
          //'day':data[key]['Day'],
          //'Time':data[key]['Time'],
          'hour':data[key]['Hour'],
          'minute':data[key]['Minute'],
          //"second": data[key]['Second'],
          //'millisecond':data[key]['Millisecond'],
          "format": data[key]['Display Date']
        },
        "end_date":{
          //'year':data[key]['End Year'],
          //'month':data[key]['End Month'],
          //'day':data[key]['End Day'],
          //'End Time':data[key]['End Time'],
          'hour':data[key]['End Hour'],
          'minute':data[key]['End Minute'],
          //"second": data[key]['End Second'],
          //'millisecond':data[key]['End Millisecond'],
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
              "url": data[key]['url'],
              "thumb": ""
          },
           "media": {
              //"caption": data[key]['Media Caption'],
              //"credit": data[key]['Media Credit'],
              //"url": data[key]['Media'],
              //"thumb": data[key]['Media Thumbnail']
          },  
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
 
  }); */