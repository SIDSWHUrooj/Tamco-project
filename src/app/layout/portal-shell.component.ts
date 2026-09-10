import { Component, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ROLE_MENUS } from '../core/menu';
import { Role } from '../core/models';
import { PortalStateService } from '../core/portal-state.service';

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell" [attr.data-role]="role()">
      <aside class="sidebar" [class.open]="mobileOpen">
        <div class="brand">
          <div class="brand-mark">◇</div>
          <div><strong>VENDOR PORTAL</strong></div>
        </div>
        <nav>
          @for (item of menu(); track item.route) {
            <a [routerLink]="['/', role(), item.route]" routerLinkActive="active" (click)="mobileOpen=false">
              <span class="nav-icon">{{ item.icon }}</span><span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="sidebar-footer">
          <a class="support-link" [routerLink]="['/', role(), role() === 'admin' ? 'settings' : 'reports']"><span>?</span> Support</a>
        </div>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <button class="menu-btn" (click)="mobileOpen=!mobileOpen">☰</button>
          <div class="role-badge"><span>{{ roleNumber() }}</span><b>{{ roleLabel().toUpperCase() }}</b></div>
          <div class="top-actions">
            <button class="icon-btn" title="Notifications"><span class="bell">♧</span><span class="badge">3</span></button>
            <div class="avatar big">{{ roleInitial() }}</div>
            <button class="logout-link" type="button" (click)="logout()"><span>↪</span> Logout</button>
          </div>
        </header>
        <main class="content"><router-outlet /></main>
      </section>

      @if (state.toast()) { <div class="toast">{{ state.toast() }}</div> }
      @if (mobileOpen) { <div class="backdrop" (click)="mobileOpen=false"></div> }
    </div>
  `
})
export class PortalShellComponent {
  readonly state = inject(PortalStateService);
  private readonly router = inject(Router);
  mobileOpen = false;

  readonly role = computed(() => this.state.role());
  readonly menu = computed(() => ROLE_MENUS[this.role()]);
  readonly roleLabel = computed(() => this.role()[0].toUpperCase() + this.role().slice(1));
  readonly roleInitial = computed(() => ({ vendor: 'AS', procurement: 'PT', finance: 'FT', admin: 'AD' }[this.role()]));
  readonly roleNumber = computed(() => ({ vendor: '1', procurement: '2', finance: '3', admin: '4' }[this.role()]));

  constructor() {
    const sync = () => {
      const segment = this.router.url.split('/').filter(Boolean)[0] as Role | undefined;
      if (segment && ['vendor', 'procurement', 'finance', 'admin'].includes(segment)) this.state.setRole(segment);
    };
    sync();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(sync);
    effect(() => this.state.role());
  }

  logout(): void {
    this.state.signOut();
    this.mobileOpen = false;
    this.router.navigate(['/login']);
  }
}
