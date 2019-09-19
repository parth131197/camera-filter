import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Video2Component } from './components/video2/video2.component';
import { Camera1Component } from './components/camera1/camera1.component';
import { Camera2Component } from './components/camera2/camera2.component';

const routes: Routes = [
  {
    path:'',
    pathMatch: 'full',
    redirectTo:'camera'
  },
  {
    path:'camera',
    component: Video2Component
  },
  {
    path:'camera1',
    component: Camera1Component
  },
  {
    path:'camera2',
    component: Camera2Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
