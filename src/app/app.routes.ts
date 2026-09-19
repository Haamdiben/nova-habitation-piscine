import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminContactComponent } from './pages/admin-dashboard/admin-contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'accueil', component: HomeComponent },
  { path: 'apropos', component: AboutComponent },
  { path: 'realisations', component: ProjectsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin/dashboard',
    children: [
      { path: '', redirectTo: 'realisations', pathMatch: 'full' },
      { path: 'realisations', component: AdminDashboardComponent },
      { path: 'contact', component: AdminContactComponent },
    ],
  },
];
