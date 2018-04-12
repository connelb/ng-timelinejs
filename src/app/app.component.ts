//our root app component
import { Component, NgModule, VERSION, ViewChild, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core'
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser'
import { TimelineComponent } from './timeline.component';
import { PapaParseService } from 'ngx-papaparse';
import * as papa from 'papaparse';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { GetcsvService } from './getcsv.service';
import { FormControl, NgModel } from '@angular/forms';
import * as _ from 'lodash';
import { MatMenuTrigger, MatListOption } from '@angular/material';
//import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  myPath = './assets/data/sample1.csv';
  menuEvents: string[] = [];
  event: any;
  selected1: any;
  selected2: any;
  opened: any;
  actors: any = [];
  myEvents: any = [];

  myEvent: any = {};
  actor: any = {};

  results: any = {};
  loaded: boolean = false;
  selectedOptions: string[] = [];


  constructor(private getcsv: GetcsvService) { }

  ngOnInit() {
    setTimeout(() => {
      this.getcsv.getCSV(this.myPath).subscribe(data => {
        this.results = data;
        this.initiateMyEvents();
      })
      this.loaded = true;

    }, 200);

  }

  onNgModelChange(list) {
    this.selected2 = list;
  }

  someMethod() {
    this.trigger.openMenu();
  }

  selectEvent(myEvent) {
    myEvent.checked = !myEvent.checked;
  }

  setResult(event) {
  }

  initiateMyEvents() {
    //populates the events list
    let temp1 = [];
    temp1 = _.uniq(_.map(this.results, function (o) {
      if (o['Event']) { return o['Event']; }
    }
    ).filter(function (n) { return n != undefined }));

    for (let i = 0; i < temp1.length; i++) {
      this.myEvents.push({ name: temp1[i], checked: false })
    }
  }
}
