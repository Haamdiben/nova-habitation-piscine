import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AdminSidenavComponent } from './admin-sidenav.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidenavComponent],
  template: `
    <div class="flex">
      <app-admin-sidenav (onLogout)="logout()"></app-admin-sidenav>
      <div class="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen bg-gray-50">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
