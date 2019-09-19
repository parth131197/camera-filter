import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Video2Component } from './components/video2/video2.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Camera1Component } from './components/camera1/camera1.component';
import { Camera2Component } from './components/camera2/camera2.component';

@NgModule({
  declarations: [
    AppComponent,
    Video2Component,
    Camera1Component,
    Camera2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
