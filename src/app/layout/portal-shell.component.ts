import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ROLE_MENUS } from '../core/menu';
import { Role } from '../core/models';
import { PortalStateService } from '../core/portal-state.service';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, IconComponent, CustomSelectComponent],
  template: `
    <div class="app-shell" [attr.data-role]="role()">
      <!-- SIDEBAR -->
      <aside class="sidebar" [class.open]="mobileOpen">
        <div class="brand">
          <div class="brand-logo-wrap">
            <img src="/tamco-logo.png" alt="TAMCO" class="brand-logo-img" />
          </div>
          <div class="brand-info">
            <strong>TAMCO</strong>
            <span>Vendor Portal</span>
          </div>
        </div>

        <nav>
          @for (item of menu(); track item.route) {
            <a
              [routerLink]="['/', role(), item.route]"
              routerLinkActive="active"
              (click)="mobileOpen = false"
              [title]="item.label"
            >
              <span class="nav-icon">
                <app-icon [name]="item.route" [size]="16" />
              </span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <a
            class="support-link"
            [routerLink]="['/', role(), role() === 'admin' ? 'settings' : 'reports']"
            (click)="mobileOpen = false"
          >
            <span class="support-icon">
              <app-icon name="help" [size]="15" />
            </span>
            <span>Help & Support</span>
          </a>
        </div>
      </aside>

      <!-- MAIN WORKSPACE -->
      <section class="workspace">
        <header class="topbar">
          <button class="menu-btn" (click)="mobileOpen = !mobileOpen" title="Toggle Navigation">
            <app-icon name="menu" [size]="20" />
          </button>

          <!-- Contextual Role Pill -->
          <div class="role-pill">
            <span class="role-dot"></span>
            <b>{{ roleBadgeTitle() }}</b>
          </div>

          <!-- Topbar Actions -->
          <div class="top-actions">
            <!-- Role Switcher -->
            <div class="role-switch" title="Switch Demo Role Perspective">
              <app-custom-select
                [ngModel]="role()"
                (ngModelChange)="switchRole($event)"
                [options]="roleOptions"
                minWidth="140px"
              />
            </div>

            <!-- Notifications -->
            <button
              class="icon-btn"
              [routerLink]="['/', role(), 'notifications']"
              title="Notifications"
            >
              <app-icon name="bell" [size]="18" />
              <span class="badge">3</span>
            </button>

            <!-- User Info & Avatar -->
            <div class="user-profile">
              <div class="avatar">{{ roleInitial() }}</div>
              <div class="user-details">
                <strong>{{ userName() }}</strong>
                <small>{{ userOrganization() }}</small>
              </div>
            </div>

            <!-- Sign Out -->
            <button class="logout-link" type="button" (click)="logout()" title="Sign out of portal">
              <app-icon name="logout" [size]="14" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </section>

      @if (state.toast()) {
        <div class="toast">{{ state.toast() }}</div>
      }
      @if (mobileOpen) {
        <div class="backdrop" (click)="mobileOpen = false"></div>
      }
    </div>
  `,
  styles: [`
    /* BRAND */
    .brand-logo-wrap {
      width: 38px;
      height: 38px;
      border-radius: 7px;
      background: #ffffff;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .brand-logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .brand-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .brand-info strong {
      font-size: 14px;
      letter-spacing: 0.05em;
      color: #ffffff;
      line-height: 1.1;
    }
    .brand-info span {
      font-size: 10.5px;
      color: #94a3b8;
      letter-spacing: 0.02em;
    }

    /* NAV */
    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .support-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
    }

    /* ROLE PILL */
    .role-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--role-soft);
      border: 1px solid var(--role-border);
      border-radius: 20px;
      padding: 5px 14px 5px 10px;
    }
    .role-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--role-accent);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
    }
    .role-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .role-meta b {
      font-size: 11.5px;
      color: var(--role-accent);
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .role-meta small {
      font-size: 10px;
      color: var(--text-muted, #64748b);
    }

    /* USER PROFILE */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 9px;
      padding-left: 4px;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .user-details strong {
      font-size: 12px;
      color: var(--text);
      font-weight: 600;
      white-space: nowrap;
    }
    .user-details small {
      font-size: 10.5px;
      color: #64748b;
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      .user-details {
        display: none;
      }
    }
    @media (max-width: 600px) {
      .role-meta small {
        display: none;
      }
    }
  `]
})
export class PortalShellComponent {
  readonly state = inject(PortalStateService);
  private readonly router = inject(Router);
  mobileOpen = false;

  readonly roleOptions = [
    { value: 'vendor', label: 'Vendor View' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'finance', label: 'Finance' },
    { value: 'admin', label: 'Admin' },
  ];

  readonly role = computed(() => this.state.role());
  readonly menu = computed(() => ROLE_MENUS[this.role()]);

  readonly roleBadgeTitle = computed(() => {
    switch (this.role()) {
      case 'vendor': return 'Vendor Portal';
      case 'procurement': return 'Procurement Portal';
      case 'finance': return 'Finance & AP';
      case 'admin': return 'Administration';
    }
  });

  readonly roleSubtitle = computed(() => {
    switch (this.role()) {
      case 'vendor': return 'Supplier Collaboration Hub';
      case 'procurement': return 'Strategic Sourcing & POs';
      case 'finance': return 'Invoice 3-Way Match & Payments';
      case 'admin': return 'System Controls & Governance';
    }
  });

  readonly userName = computed(() => {
    switch (this.role()) {
      case 'vendor': return 'ABC Supplies';
      case 'procurement': return 'Sarah Jenkins';
      case 'finance': return 'David Chen';
      case 'admin': return 'Admin Lead';
    }
  });

  readonly userOrganization = computed(() => {
    switch (this.role()) {
      case 'vendor': return 'VEN-10024 · Karachi';
      case 'procurement': return 'Procurement Team';
      case 'finance': return 'Finance Operations';
      case 'admin': return 'TAMCO System Admin';
    }
  });

  readonly roleInitial = computed(() => {
    switch (this.role()) {
      case 'vendor': return 'AS';
      case 'procurement': return 'SJ';
      case 'finance': return 'DC';
      case 'admin': return 'AL';
    }
  });

  constructor() {
    const sync = () => {
      const segment = this.router.url.split('/').filter(Boolean)[0] as Role | undefined;
      if (segment && ['vendor', 'procurement', 'finance', 'admin'].includes(segment)) {
        this.state.setRole(segment);
      }
    };
    sync();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(sync);
    effect(() => this.state.role());
  }

  switchRole(newRole: Role): void {
    this.state.setRole(newRole);
    this.mobileOpen = false;
    this.router.navigate(['/', newRole, 'dashboard']);
  }

  logout(): void {
    this.state.signOut();
    this.mobileOpen = false;
    this.router.navigate(['/login']);
  }
}
