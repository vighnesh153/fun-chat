import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './components/auth/auth.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './route-guards/auth-guard';


const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
