import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

// Only the home page is in the main bundle; other pages (and the whole admin) load when visited
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Nova Habitation et Piscine | Piscines et rénovation en Occitanie',
    data: { description: 'Construction et rénovation de piscines en béton sur mesure, rénovation de bâtiments, peinture et finitions. Un seul artisan du devis à la livraison.' } },
  { path: 'accueil', redirectTo: '', pathMatch: 'full' },
  { path: 'apropos', loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent), title: 'À propos | Nova Habitation et Piscine',
    data: { description: 'Découvrez Nova Habitation et Piscine : notre savoir-faire, notre philosophie et nos domaines d\'expertise en piscine, rénovation et finitions.' } },
  { path: 'realisations', loadComponent: () => import('./pages/projects/projects.component').then((m) => m.ProjectsComponent), title: 'Nos réalisations | Nova Habitation et Piscine',
    data: { description: 'Piscines, rénovations et chantiers réalisés par Nova Habitation et Piscine : parcourez nos projets en photos, catégorie par catégorie.' } },
  { path: 'chantier/:id', loadComponent: () => import('./pages/chantier-detail/chantier-detail.component').then((m) => m.ChantierDetailComponent), title: 'Réalisation | Nova Habitation et Piscine',
    data: { description: 'Découvrez ce chantier réalisé par Nova Habitation et Piscine en photos.' } },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent), title: 'Contact | Nova Habitation et Piscine',
    data: { description: 'Contactez Nova Habitation et Piscine pour votre projet de piscine ou de rénovation : devis gratuit et réponse sous 48 heures.' } },
  { path: 'mentions-legales', loadComponent: () => import('./pages/mentions-legales/mentions-legales.component').then((m) => m.MentionsLegalesComponent), title: 'Mentions légales | Nova Habitation et Piscine',
    data: { description: 'Mentions légales et politique de confidentialité du site Nova Habitation et Piscine.' } },
  { path: 'admin/login', loadComponent: () => import('./pages/admin-login/admin-login.component').then((m) => m.AdminLoginComponent), title: 'Connexion — Administration' },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-layout.component').then((m) => m.AdminLayoutComponent),
    title: 'Tableau de bord — Administration',
    children: [
      { path: '', redirectTo: 'realisations', pathMatch: 'full' },
      { path: 'realisations', loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'realisations/:id', loadComponent: () => import('./pages/admin-dashboard/admin-category-detail.component').then((m) => m.AdminCategoryDetailComponent) },
      { path: 'contact', loadComponent: () => import('./pages/admin-dashboard/admin-contact.component').then((m) => m.AdminContactComponent) },
      { path: 'about', loadComponent: () => import('./pages/admin-dashboard/admin-about.component').then((m) => m.AdminAboutComponent) },
      { path: 'slides', loadComponent: () => import('./pages/admin-dashboard/admin-slides.component').then((m) => m.AdminSlidesComponent) },
      { path: 'services', loadComponent: () => import('./pages/admin-dashboard/admin-services.component').then((m) => m.AdminServicesComponent) },
      { path: 'messages', loadComponent: () => import('./pages/admin-dashboard/admin-messages.component').then((m) => m.AdminMessagesComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
