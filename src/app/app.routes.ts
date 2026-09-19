import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminContactComponent } from './pages/admin-dashboard/admin-contact.component';
import { AdminAboutComponent } from './pages/admin-dashboard/admin-about.component';
import { AdminSlidesComponent } from './pages/admin-dashboard/admin-slides.component';
import { AdminServicesComponent } from './pages/admin-dashboard/admin-services.component';
import { ChantierDetailComponent } from './pages/chantier-detail/chantier-detail.component';
import { MentionsLegalesComponent } from './pages/mentions-legales/mentions-legales.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'accueil', component: HomeComponent },
  { path: 'apropos', component: AboutComponent },
  { path: 'realisations', component: ProjectsComponent },
  { path: 'chantier/:id', component: ChantierDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'mentions-legales', component: MentionsLegalesComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin/dashboard',
    children: [
      { path: '', redirectTo: 'realisations', pathMatch: 'full' },
      { path: 'realisations', component: AdminDashboardComponent },
      { path: 'contact', component: AdminContactComponent },
      { path: 'about', component: AdminAboutComponent },
      { path: 'slides', component: AdminSlidesComponent },
      { path: 'services', component: AdminServicesComponent },
    ],
  },
];
