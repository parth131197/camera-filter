import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Video2Component } from './components/video2/video2.component';

const routes: Routes = [
  {
    path:'',
    pathMatch: 'full',
    redirectTo:'camera'
  },
  {
    path:'camera',
    component: Video2Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
