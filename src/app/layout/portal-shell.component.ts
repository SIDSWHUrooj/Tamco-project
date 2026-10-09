import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ROLE_MENUS, VENDOR_ACTIVE_MENU, VENDOR_ONBOARDING_MENU } from '../core/menu';
import { Role } from '../core/models';
import { PortalStateService } from '../core/portal-state.service';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from '../shared/icon.component';

interface NavGroup { label: string; items: { label: string; route: string }[]; }
interface SearchHit { group: string; title: string; sub: string; route: string; }

const GROUP_OF: Record<string, string> = {
  dashboard: 'Overview',
  profile: 'Workspace',
  vendors: 'Operations', 'finance-vendors': 'Operations', requisition: 'Operations', 'logistic-cost': 'Operations',
  'bid-comparison': 'Operations', orders: 'Operations', 'bank-verification': 'Operations',
  reports: 'Insights',
  management: 'Administration', users: 'Administration', roles: 'Administration', workflows: 'Administration', banks: 'Administration'
};

const ROLE_LABEL: Record<Role, string> = {
  vendor: 'Vendor Partner', procurement: 'Procurement', finance: 'Finance & AP', admin: 'Administrator'
};

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <div class="app-shell" [attr.data-role]="role()" [class.collapsed]="collapsed()">
      <!-- SIDEBAR -->
      <aside class="sidebar" [class.open]="mobileOpen()" id="app-sidebar" aria-label="Primary">
        <div class="brand">
          <div class="brand-logo-wrap"><img src="/tamco-logo.png" alt="TAMCO" class="brand-logo-img" /></div>
          <div class="brand-info">
            <strong>TAMCO</strong>
            <span>Vendor Portal</span>
          </div>
          <button class="sb-close" type="button" (click)="mobileOpen.set(false)" aria-label="Close navigation">
            <app-icon name="x" [size]="18" />
          </button>
        </div>

        <nav aria-label="Main navigation">
          @for (group of groups(); track group.label) {
            @if (groups().length > 1) { <div class="nav-group-label">{{ group.label }}</div> }
            @for (item of group.items; track item.route) {
              <a [routerLink]="['/', role(), item.route]" routerLinkActive="active" (click)="mobileOpen.set(false)"
                 [attr.title]="collapsed() ? item.label : null" [attr.aria-label]="item.label">
                <span class="nav-icon"><app-icon [name]="item.route" [size]="17" /></span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          <a class="support-link" [routerLink]="['/', role(), role() === 'admin' ? 'settings' : 'reports']"
             (click)="mobileOpen.set(false)" [attr.title]="collapsed() ? 'Help & Support' : null">
            <span class="support-icon"><app-icon name="help" [size]="16" /></span>
            <span class="nav-label">Help & Support</span>
          </a>
          <button class="collapse-btn" type="button" (click)="toggleCollapsed()"
                  [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'" [attr.aria-expanded]="!collapsed()">
            <app-icon [name]="collapsed() ? 'chevron-right' : 'chevron-left'" [size]="16" />
            <span class="nav-label">Collapse</span>
          </button>
        </div>
      </aside>

      <!-- MAIN WORKSPACE -->
      <section class="workspace">
        <header class="topbar">
          <button class="menu-btn" type="button" (click)="mobileOpen.set(!mobileOpen())"
                  aria-controls="app-sidebar" [attr.aria-expanded]="mobileOpen()" aria-label="Toggle navigation">
            <app-icon name="menu" [size]="20" />
          </button>

          <div class="page-context">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <a [routerLink]="['/', role(), roleHome()]">{{ roleLabel() }}</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{{ pageTitle() }}</span>
            </nav>
            <strong class="page-title">{{ pageTitle() }}</strong>
          </div>

          @if (searchEnabled()) {
            <div class="global-search" role="search">
              <app-icon name="search" [size]="15" />
              <input #searchInput type="search" placeholder="Search vendors, requisitions…  (Ctrl K)"
                     aria-label="Global search" autocomplete="off"
                     [value]="query()" (input)="onSearch($any($event.target).value)"
                     (focus)="searchOpen.set(true)" (keydown.escape)="closeSearch()" />
              @if (query()) {
                <button type="button" class="clear" (click)="onSearch(''); searchInput.focus()" aria-label="Clear search">
                  <app-icon name="x" [size]="14" />
                </button>
              }
              @if (searchOpen() && query().trim().length > 0) {
                <div class="search-panel" role="listbox">
                  @for (g of hitGroups(); track g.name) {
                    <div class="search-group">{{ g.name }}</div>
                    @for (h of g.hits; track h.title + h.sub) {
                      <button type="button" role="option" (click)="openHit(h)">
                        <b>{{ h.title }}</b><small>{{ h.sub }}</small>
                      </button>
                    }
                  } @empty {
                    <div class="search-empty">No results for "{{ query() }}"</div>
                  }
                </div>
              }
            </div>
          }

          <div class="top-actions">
            @if (role() === 'vendor') {
              <button type="button" class="vendor-lifecycle-badge" (click)="cycleVendorStatus()"
                   style="display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 9999px; font-size: 11.5px; font-weight: 700; cursor: pointer; border: 1.5px solid; transition: transform 0.15s;"
                   [style.background]="state.vendorStatusCode() >= 3 ? '#ecfdf5' : (state.vendorStatusCode() === 2 ? '#fef3c7' : '#eff6ff')"
                   [style.border-color]="state.vendorStatusCode() >= 3 ? '#10b981' : (state.vendorStatusCode() === 2 ? '#f59e0b' : '#3b82f6')"
                   [style.color]="state.vendorStatusCode() >= 3 ? '#065f46' : (state.vendorStatusCode() === 2 ? '#92400e' : '#1e40af')"
                   title="Click to cycle vendor lifecycle status: [0: Incomplete] -> [1: Review] -> [2: Pending] -> [3: Approved ERP]">
                <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%;"
                      [style.background]="state.vendorStatusCode() >= 3 ? '#10b981' : (state.vendorStatusCode() === 2 ? '#f59e0b' : '#3b82f6')"></span>
                <span>
                  @if (state.vendorStatusCode() === 0) { 0: Registration (Wizard) }
                  @else if (state.vendorStatusCode() === 1) { 1: Review Mode }
                  @else if (state.vendorStatusCode() === 2) { 2: Pending Approval }
                  @else { 3: Approved Partner (ERP) }
                </span>
                <span style="opacity: 0.6; font-size: 11px;">⇄</span>
              </button>
            }

            <button class="icon-btn" type="button" (click)="toggleTheme()"
                    [attr.aria-label]="theme.effective() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                    [attr.title]="theme.effective() === 'dark' ? 'Light mode' : 'Dark mode'">
              <app-icon [name]="theme.effective() === 'dark' ? 'sun' : 'moon'" [size]="18" />
            </button>

            <button class="icon-btn" type="button" [routerLink]="['/', role(), 'notifications']"
                    [attr.aria-label]="pendingCount() ? 'Notifications, ' + pendingCount() + ' pending' : 'Notifications'">
              <app-icon name="bell" [size]="18" />
              @if (pendingCount() > 0) { <span class="badge">{{ pendingCount() }}</span> }
            </button>

            <div class="user-menu">
              <button class="user-trigger" type="button" (click)="userOpen.set(!userOpen())"
                      aria-haspopup="menu" [attr.aria-expanded]="userOpen()">
                <span class="avatar">{{ roleInitial() }}</span>
                <span class="user-details">
                  <strong>{{ userName() }}</strong>
                  <small>{{ roleLabel() }}</small>
                </span>
                <app-icon name="chevron-down" [size]="14" />
              </button>

              @if (userOpen()) {
                <div class="user-dropdown" role="menu">
                  <div class="ud-head">
                    <span class="avatar lg">{{ roleInitial() }}</span>
                    <div>
                      <strong>{{ userName() }}</strong>
                      <small>{{ userEmail() }}</small>
                      <span class="role-chip">{{ roleLabel() }}</span>
                    </div>
                  </div>
                  <div class="ud-section" role="group" aria-label="Theme">
                    <small>Appearance</small>
                    <div class="theme-seg">
                      @for (t of themes; track t.key) {
                        <button type="button" [class.on]="theme.preference() === t.key" (click)="theme.set(t.key)"
                                [attr.aria-pressed]="theme.preference() === t.key">
                          <app-icon [name]="t.icon" [size]="14" />{{ t.label }}
                        </button>
                      }
                    </div>
                  </div>
                  <button class="ud-item danger" type="button" role="menuitem" (click)="logout()">
                    <app-icon name="logout" [size]="15" /> Sign out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <main class="content" id="main-content" tabindex="-1">
          <router-outlet />
        </main>
      </section>

      @if (state.toast()) {
        <div class="toast" role="status" aria-live="polite">
          <span>{{ state.toast() }}</span>
          <button type="button" (click)="state.toast.set('')" aria-label="Dismiss notification"><app-icon name="x" [size]="14" /></button>
        </div>
      }
      @if (mobileOpen()) { <div class="backdrop" (click)="mobileOpen.set(false)"></div> }
    </div>
  `,
  styles: [`
    .brand-logo-wrap { width: 36px; height: 36px; flex: none; border-radius: 8px; background: #fff; padding: 4px; display: flex; align-items: center; justify-content: center; }
    .brand-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .brand-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .brand-info strong { font-size: 14px; letter-spacing: .05em; color: #fff; line-height: 1.1; }
    .brand-info span { font-size: 10.5px; color: #94a3b8; }
    .nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `]
})
export class PortalShellComponent {
  readonly state = inject(PortalStateService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly mobileOpen = signal(false);
  readonly collapsed = signal(this.readCollapsed());
  readonly userOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly query = signal('');
  private readonly url = signal(this.router.url);

  readonly themes = [
    { key: 'light' as const, label: 'Light', icon: 'sun' },
    { key: 'dark' as const, label: 'Dark', icon: 'moon' },
    { key: 'system' as const, label: 'Auto', icon: 'monitor' }
  ];

  readonly role = computed(() => this.state.role());
  readonly roleLabel = computed(() => {
    if (this.role() === 'vendor') {
      const code = this.state.vendorStatusCode();
      if (code === 0) return 'Vendor (Registration Wizard)';
      if (code === 1) return 'Vendor (Review Mode)';
      if (code === 2) return 'Vendor (Pending Approval)';
      return 'Vendor Partner (Sage 300 ERP)';
    }
    return ROLE_LABEL[this.role()];
  });
  readonly menu = computed(() => {
    if (this.role() === 'vendor') {
      return this.state.vendorStatusCode() >= 3 ? VENDOR_ACTIVE_MENU : VENDOR_ONBOARDING_MENU;
    }
    return ROLE_MENUS[this.role()];
  });
  readonly roleHome = computed(() => {
    if (this.role() === 'vendor') {
      return this.state.vendorStatusCode() >= 3 ? 'dashboard' : 'profile';
    }
    return this.menu()[0]?.route ?? 'dashboard';
  });

  cycleVendorStatus(): void {
    const cur = this.state.vendorStatusCode();
    const next = (cur + 1) % 4;
    this.state.setVendorStatusCode(next);
    if (next < 3) {
      this.router.navigate(['/vendor/profile']);
    } else {
      this.router.navigate(['/vendor/dashboard']);
    }
  }


  readonly groups = computed<NavGroup[]>(() => {
    const out: NavGroup[] = [];
    for (const m of this.menu()) {
      const label = GROUP_OF[m.route] ?? 'General';
      let g = out.find(x => x.label === label);
      if (!g) { g = { label, items: [] }; out.push(g); }
      g.items.push({ label: m.label, route: m.route });
    }
    return out;
  });

  readonly pageTitle = computed(() => {
    const seg = this.url().split('?')[0].split('/').filter(Boolean)[1];
    const hit = this.menu().find(m => m.route === seg);
    if (hit) return hit.label;
    return seg ? seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Dashboard';
  });

  /** Count of items genuinely awaiting this role (derived from portal state, not invented). */
  readonly pendingCount = computed(() => {
    switch (this.role()) {
      case 'procurement': return this.state.pendingProcurement().length;
      case 'finance': return this.state.pendingFinance().length;
      case 'admin': return this.state.pendingProcurement().length + this.state.pendingFinance().length;
      default: return 0;
    }
  });

  // Vendors may only see their own profile; do not offer cross-record search.
  readonly searchEnabled = computed(() => this.role() !== 'vendor');

  readonly hitGroups = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return [];
    const role = this.role();
    const hits: SearchHit[] = [];
    for (const v of this.state.masterVendors()) {
      if (`${v.vendorName} ${v.vendorId}`.toLowerCase().includes(q)) {
        hits.push({ group: 'Vendors', title: v.vendorName, sub: `${v.vendorId} · ${v.status}`, route: role === 'finance' ? 'finance-vendors' : 'vendors' });
      }
    }
    if (role !== 'finance') {
      for (const r of this.state.requisitions()) {
        const h = r.header;
        if (`${h.documentNumber} ${h.requestDescription}`.toLowerCase().includes(q)) {
          hits.push({ group: 'Requisitions', title: h.documentNumber, sub: h.requestDescription, route: 'requisition' });
        }
      }
    }
    if (role === 'finance') {
      for (const b of this.state.bankRecords()) {
        if (`${b.vendorName} ${b.bankName}`.toLowerCase().includes(q)) {
          hits.push({ group: 'Bank records', title: b.vendorName, sub: `${b.bankName} · ${b.verificationStatus}`, route: 'bank-verification' });
        }
      }
    }
    const names = [...new Set(hits.map(h => h.group))];
    return names.map(name => ({ name, hits: hits.filter(h => h.group === name).slice(0, 5) }));
  });

  constructor() {
    const sync = () => {
      this.url.set(this.router.url);
      const segment = this.router.url.split('/').filter(Boolean)[0] as Role | undefined;
      if (segment && ['vendor', 'procurement', 'finance', 'admin'].includes(segment)) this.state.setRole(segment);
    };
    sync();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      sync();
      this.mobileOpen.set(false);
      this.userOpen.set(false);
      this.closeSearch();
    });
  }

  readonly userName = computed(() => this.state.currentUser()?.name || this.roleLabel());
  readonly userEmail = computed(() => this.state.currentUser()?.email || '');
  readonly roleInitial = computed(() => this.state.currentUser()?.initials || this.roleLabel().slice(0, 2).toUpperCase());

  toggleTheme(): void { this.theme.toggle(); }

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
    try { localStorage.setItem('vp.sidebar', this.collapsed() ? '1' : '0'); } catch {}
  }
  private readCollapsed(): boolean {
    try { return localStorage.getItem('vp.sidebar') === '1'; } catch { return false; }
  }

  onSearch(v: string): void { this.query.set(v); this.searchOpen.set(true); }
  closeSearch(): void { this.searchOpen.set(false); }
  openHit(h: SearchHit): void {
    this.closeSearch(); this.query.set('');
    this.router.navigate(['/', this.role(), h.route]);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && this.searchEnabled()) {
      e.preventDefault(); this.searchInput?.nativeElement.focus();
    }
    if (e.key === 'Escape') { this.userOpen.set(false); this.mobileOpen.set(false); }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    if (!t.closest('.user-menu')) this.userOpen.set(false);
    if (!t.closest('.global-search')) this.searchOpen.set(false);
  }

  logout(): void {
    this.state.signOut();
    this.mobileOpen.set(false);
    this.router.navigate(['/login']);
  }
}
