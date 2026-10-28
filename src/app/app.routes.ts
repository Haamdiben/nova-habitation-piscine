import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { maintenanceGuard } from './guards/maintenance.guard';

// Only the home page is in the main bundle; other pages (and the whole admin) load when visited
export const routes: Routes = [
  // Maintenance mode (switched on from the back office): every public URL shows the maintenance page
  { path: '**', canMatch: [maintenanceGuard], loadComponent: () => import('./pages/maintenance/maintenance.component').then((m) => m.MaintenanceComponent),
    title: 'Site en maintenance | Nova Habitat - Piscine' },
  { path: '', component: HomeComponent, title: 'Nova Habitat - Piscine | Piscines et rénovation à Nice, Côte d\'Azur',
    data: { description: 'Construction et rénovation de piscines en béton sur mesure, rénovation de bâtiments, peinture et finitions. Un seul artisan du devis à la livraison.' } },
  { path: 'accueil', redirectTo: '', pathMatch: 'full' },
  { path: 'apropos', loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent), title: 'À propos | Nova Habitat - Piscine',
    data: { description: 'Découvrez Nova Habitat - Piscine : notre savoir-faire, notre philosophie et nos domaines d\'expertise en piscine, rénovation et finitions.' } },
  { path: 'realisations', loadComponent: () => import('./pages/projects/projects.component').then((m) => m.ProjectsComponent), title: 'Nos réalisations | Nova Habitat - Piscine',
    data: { description: 'Piscines, rénovations et chantiers réalisés par Nova Habitat - Piscine : parcourez nos projets en photos, catégorie par catégorie.' } },
  { path: 'chantier/:id', loadComponent: () => import('./pages/chantier-detail/chantier-detail.component').then((m) => m.ChantierDetailComponent), title: 'Réalisation | Nova Habitat - Piscine',
    data: { description: 'Découvrez ce chantier réalisé par Nova Habitat - Piscine en photos.' } },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent), title: 'Contact | Nova Habitat - Piscine',
    data: { description: 'Contactez Nova Habitat - Piscine pour votre projet de piscine ou de rénovation : devis gratuit et réponse sous 48 heures.' } },
  { path: 'mentions-legales', loadComponent: () => import('./pages/mentions-legales/mentions-legales.component').then((m) => m.MentionsLegalesComponent), title: 'Mentions légales | Nova Habitat - Piscine',
    data: { description: 'Mentions légales et politique de confidentialité du site Nova Habitat - Piscine.' } },
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
      { path: 'maintenance', loadComponent: () => import('./pages/admin-dashboard/admin-maintenance.component').then((m) => m.AdminMaintenanceComponent) },
      { path: 'messages', loadComponent: () => import('./pages/admin-dashboard/admin-messages.component').then((m) => m.AdminMessagesComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
