import { Component, Input, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/find';
import { PapaParseService } from 'ngx-papaparse';

import {TimelineModel} from './timeline.model';
import * as papa from 'papaparse';

declare var TL: any;
@Component({
  selector: 'timeline',
  template: `<div [id]="id" class="timeline"></div>`,
  styles: ['.timeline{height:100%;width:100%;padding: 0px;margin: 0px;}']
})
export class TimelineComponent {
  @Input() events:Array<any> = [];
  @Input() url:string = '';
  @Output() clicked = new EventEmitter();
  scale:string = 'human';
  timeline:any = null;
  id:string = null;
  viewInited = false;
  temp:any;
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
    scale_factor: 2000,                    // How many screen widths wide should the timeline be at first presentation
    zoom_sequence: [0.5, 1, 2, 5, 9, 15], 	//[0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], // Array of Fibonacci numbers for TimeNav zoom levels http://www.maths.surrey.ac.uk/hosted-sites/R.Knott/Fibonacci/fibtable.html
    layout: 'portrait',                // portrait or landscape
    timenav_position: 'top',         // timeline on top or bottom
    optimal_tick_width: 100000,            // optimal distance (in pixels) between ticks on axis
    //base_class: '',
    timenav_height: 250,
    timenav_height_percentage: 100,      // Overrides timenav height as a percentage of the screen
    timenav_height_min: 150,            // Minimum timenav height
    marker_height_min: 10,              // Minimum Marker Height
    marker_width_min: 50,              // Minimum Marker Width
    marker_padding: 5,                  // Top Bottom Marker Padding
    start_at_slide: 0,
    menubar_height: 60,
    skinny_size: 150,
    relative_date: true,               // Use momentjs to show a relative date from the slide.text.date.created_time field
    use_bc: false,                      // Use declared suffix on dates earlier than 0
    duration: 1000,                     // Slider animation duration
    ease: TL.Ease.easeInOutQuint,       // Slider animation type
    dragging: true,
    trackResize: true,
    map_type: 'stamen:toner-lite',
    slide_padding_lr: 100,              // padding on slide of slide
    slide_default_fade: '50%',          // landscape fade
    language: 'en',
    //debug: false,
    //height:this._el.container.offsetHeight,
    //width:this._el.container.offsetWidth,
    is_embed:false,
    hash_bookmark:false,
    //default_bg_color:F0000,
    //scale_factor:2,
    //initial_zoom:?,
    //zoom_sequence:[0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
    //timenav_position:"bottom",
    //optimal_tick_width:100,
    base_class:"tl-timeline",
    //timenav_height:150,
    //timenav_height_percentage:25,
    timenav_mobile_height_percentage:40,
    //timenav_height_min:150,
    //marker_height_min:30,
    //marker_width_min:100,
    //marker_padding:5,
    //start_at_slide:0,
    start_at_end:true,
    //menubar_height:0,
    //use_bc:false,
    //duration:1000,
    //ease: TL.Ease.easeInOutQuint,
    //dragging:true,
    //trackResize:true,
    //slide_padding_lr:100,
    //slide_default_fade:"0%",
    //language:"en",
    ga_property_id:null,
    track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
    //script_path: ""
  };
  
  constructor(
    private elementRef:ElementRef, 
    private http: Http,
    private renderer:Renderer2,
    private papa: PapaParseService
  ) { 
    this.id = 'timeline_'+Math.floor((Math.random() * 10000) + 1);
    this.listenTimeline();
    this.timelineModel = new TimelineModel();
    this.getCSV('./assets/data/sample.csv').subscribe(data=>this.temp=data);
  }

  public getCSV(url): Observable<any>{
    let results = new Array();
    return Observable.create((observer)=>{
      papa.parse(url,{
        download:true,
        header:true,
        complete: function (results, file){
          observer.next(results.date)
        }
      })
    })
  }
  
  private listenTimeline(){
    var self = this;
    this.listenerFn = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      let element = event.srcElement.className;
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
      var subscription:Subscription = this.getObject().subscribe((object:any)=>{
          try{
            if(typeof object !== 'string'){
              if (object.events.length == 0){return;}
            }
            self.timeline = new TL.Timeline(self.id, object,this.defaultOptions);
            self.currentEvents = object.events;
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
  
      private getObject(): Observable<any> {
        if (this.url !== '') {
          return this.http.get(this.url);
        }
        return new Observable((observer: Observer<any>) => {
          try {
            observer.next({
              scale: this.scale,
              events: this.events
            });
            observer.complete();
          } catch (e) {console.warn(e);}
        });
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