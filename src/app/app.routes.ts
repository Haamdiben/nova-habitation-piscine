import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminCategoryDetailComponent } from './pages/admin-dashboard/admin-category-detail.component';
import { AdminContactComponent } from './pages/admin-dashboard/admin-contact.component';
import { AdminAboutComponent } from './pages/admin-dashboard/admin-about.component';
import { AdminSlidesComponent } from './pages/admin-dashboard/admin-slides.component';
import { AdminServicesComponent } from './pages/admin-dashboard/admin-services.component';
import { AdminMessagesComponent } from './pages/admin-dashboard/admin-messages.component';
import { AdminLayoutComponent } from './pages/admin-dashboard/admin-layout.component';
import { ChantierDetailComponent } from './pages/chantier-detail/chantier-detail.component';
import { MentionsLegalesComponent } from './pages/mentions-legales/mentions-legales.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Nova Habitation et Piscine | Piscines et rénovation en Occitanie' },
  { path: 'accueil', redirectTo: '', pathMatch: 'full' },
  { path: 'apropos', component: AboutComponent, title: 'À propos | Nova Habitation et Piscine' },
  { path: 'realisations', component: ProjectsComponent, title: 'Nos réalisations | Nova Habitation et Piscine' },
  { path: 'chantier/:id', component: ChantierDetailComponent, title: 'Réalisation | Nova Habitation et Piscine' },
  { path: 'contact', component: ContactComponent, title: 'Contact | Nova Habitation et Piscine' },
  { path: 'mentions-legales', component: MentionsLegalesComponent, title: 'Mentions légales | Nova Habitation et Piscine' },
  { path: 'admin/login', component: AdminLoginComponent, title: 'Connexion — Administration' },
  {
    path: 'admin/dashboard',
    component: AdminLayoutComponent,
    title: 'Tableau de bord — Administration',
    children: [
      { path: '', redirectTo: 'realisations', pathMatch: 'full' },
      { path: 'realisations', component: AdminDashboardComponent },
      { path: 'realisations/:id', component: AdminCategoryDetailComponent },
      { path: 'contact', component: AdminContactComponent },
      { path: 'about', component: AdminAboutComponent },
      { path: 'slides', component: AdminSlidesComponent },
      { path: 'services', component: AdminServicesComponent },
      { path: 'messages', component: AdminMessagesComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
