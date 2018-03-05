import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http';
import { TimelineComponent } from './timeline.component';
import { PapaParseService } from 'ngx-papaparse';


@NgModule({
  declarations: [
    AppComponent, TimelineComponent
  ],
  imports: [
    BrowserModule, HttpModule
  ],
  providers: [PapaParseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
