import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ROLE_MENUS, VENDOR_ACTIVE_MENU, VENDOR_DRAFT_MENU, VENDOR_REVIEW_MENU } from '../core/menu';
import { Role } from '../core/models';
import { PortalStateService } from '../core/portal-state.service';
import { ThemeService } from '../core/theme.service';
import { SageApiService, SageItem } from '../core/sage-api.service';
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
          <div class="brand-logo-wrap" (click)="toggleCollapsed()" style="cursor: pointer;" [title]="collapsed() ? 'Expand sidebar' : 'TAMCO'">
            <img src="/tamco-logo.png" alt="TAMCO" class="brand-logo-img" />
          </div>
          <div class="brand-info">
            <strong>TAMCO</strong>
            <span>Vendor Portal</span>
          </div>
          <button class="collapse-toggle-btn" type="button" (click)="onToggleSidebar()"
                  [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
                  [title]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
            <app-icon name="sidebar" [size]="16" />
          </button>
        </div>

        <nav aria-label="Main navigation">
          @for (group of groups(); track group.label) {
            @if (groups().length > 1) { <div class="nav-group-label">{{ group.label }}</div> }
            @for (item of group.items; track item.route) {
              <a [routerLink]="['/', role(), item.route]" routerLinkActive="active" (click)="mobileOpen.set(false)"
                 [attr.aria-label]="item.label">
                <span class="nav-icon"><app-icon [name]="item.route" [size]="17" /></span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          <a class="support-link" [routerLink]="['/', role(), 'dashboard']"
             (click)="mobileOpen.set(false)" [attr.aria-label]="'Help & Support'">
            <span class="support-icon"><app-icon name="help" [size]="16" /></span>
            <span class="nav-label">Help & Support</span>
          </a>
          <button class="collapse-btn" type="button" (click)="toggleCollapsed()"
                  [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'" [attr.aria-expanded]="!collapsed()">
            <app-icon name="sidebar" [size]="16" />
            <span class="nav-label">{{ collapsed() ? 'Expand' : 'Collapse' }}</span>
          </button>
        </div>
      </aside>

      <!-- MAIN WORKSPACE -->
      <section class="workspace">
        <header class="topbar">
          <button class="menu-btn mobile-only" type="button" (click)="mobileOpen.set(!mobileOpen())"
                  aria-controls="app-sidebar" [attr.aria-expanded]="mobileOpen()"
                  aria-label="Toggle navigation">
            <app-icon name="menu" [size]="20" />
          </button>

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
              <div class="vendor-lifecycle-badge"
                   style="display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 9999px; font-size: 11.5px; font-weight: 700; border: 1.5px solid; user-select: none;"
                   [style.background]="state.vendorStatusCode() >= 3 ? '#ecfdf5' : (state.vendorStatusCode() >= 1 ? '#fef3c7' : '#eff6ff')"
                   [style.border-color]="state.vendorStatusCode() >= 3 ? '#10b981' : (state.vendorStatusCode() >= 1 ? '#f59e0b' : '#3b82f6')"
                   [style.color]="state.vendorStatusCode() >= 3 ? '#065f46' : (state.vendorStatusCode() >= 1 ? '#92400e' : '#1e40af')">
                <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%;"
                      [style.background]="state.vendorStatusCode() >= 3 ? '#10b981' : (state.vendorStatusCode() >= 1 ? '#f59e0b' : '#3b82f6')"></span>
                <span>
                  @if (state.vendorStatusCode() === 0) { 1: Registration Draft }
                  @else if (state.vendorStatusCode() >= 1 && state.vendorStatusCode() < 3) { 2: Under Review }
                  @else { 3: Approved Partner (ERP Active) }
                </span>
              </div>
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

                  <!-- PORTAL SWITCHER / WORKSPACE SELECTION -->
                  <div class="ud-section" role="group" aria-label="Portal Selection">
                    <div class="ud-section-title">
                      <span>{{ isMasterUser() ? 'Switch Portal / Workspace' : 'Assigned Workspace' }}</span>
                      @if (isMasterUser()) {
                        <span class="portal-badge-count">4 Available</span>
                      }
                    </div>
                    <div class="portals-list">
                      @for (p of availablePortals(); track p.key) {
                        <button
                          type="button"
                          class="portal-switch-item"
                          [class.active]="role() === p.key"
                          [disabled]="!isMasterUser() && role() === p.key"
                          (click)="switchPortal(p.key)"
                        >
                          <span class="portal-icon-wrap" [class.active]="role() === p.key">
                            <app-icon [name]="p.icon" [size]="14" />
                          </span>
                          <div class="portal-info">
                            <div class="portal-name">
                              {{ p.label }}
                            </div>
                            <div class="portal-desc">{{ p.desc }}</div>
                          </div>
                          @if (role() === p.key) {
                            <span class="portal-check">
                              <app-icon name="check" [size]="14" />
                            </span>
                          }
                        </button>
                      }
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
                  <button class="ud-item" type="button" role="menuitem" (click)="userOpen.set(false); openSageModal()">
                    <app-icon name="database" [size]="15" /> Sage 300 ERP Test
                  </button>
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

      <!-- SAGE 300 ERP TEST MODAL -->
      @if (sageModalOpen()) {
        <div class="sage-modal-backdrop" (click)="sageModalOpen.set(false)">
          <div class="sage-modal-card" (click)="$event.stopPropagation()">
            <div class="sm-header">
              <div class="sm-title-group">
                <div class="sm-icon-wrap">
                  <app-icon name="database" [size]="20" />
                </div>
                <div>
                  <h3>Sage 300 ERP Integration</h3>
                  <p>Test live connection and fetch ICItems directly from Sage 300 Web API</p>
                </div>
              </div>
              <button type="button" class="sm-close-btn" (click)="sageModalOpen.set(false)" aria-label="Close modal">
                <app-icon name="x" [size]="16" />
              </button>
            </div>

            <div class="sm-body">
              <div class="sm-grid">
                <div class="sm-field sm-span-2">
                  <label>Sage Web API Base URL</label>
                  <input type="text" [value]="sageUrl()" (input)="sageUrl.set($any($event.target).value)" placeholder="/Sage300WebApi" />
                  <small>Proxied to http://localhost/Sage300WebApi</small>
                </div>
                <div class="sm-field">
                  <label>Company Code</label>
                  <input type="text" [value]="sageCompany()" (input)="sageCompany.set($any($event.target).value)" placeholder="SAMLTD" />
                </div>
                <div class="sm-field">
                  <label>Tenant</label>
                  <input type="text" [value]="sageTenant()" (input)="sageTenant.set($any($event.target).value)" placeholder="-" />
                </div>
                <div class="sm-field">
                  <label>Sage 300 Username</label>
                  <input type="text" [value]="sageUsername()" (input)="sageUsername.set($any($event.target).value)" placeholder="ADMIN" />
                </div>
                <div class="sm-field">
                  <label>Sage 300 Password</label>
                  <div class="sm-pass-input-wrap">
                    <input [type]="sageShowPassword() ? 'text' : 'password'"
                           [value]="sagePassword()"
                           (input)="sagePassword.set($any($event.target).value)"
                           (keydown.enter)="testSageConnection()"
                           placeholder="Enter your Sage password" />
                    <button type="button" class="sm-eye-btn" (click)="sageShowPassword.set(!sageShowPassword())" title="Toggle password visibility">
                      {{ sageShowPassword() ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>
              </div>

              @if (sageStatusMsg()) {
                <div class="sm-status-banner" [class.success]="sageStatusType() === 'success'" [class.error]="sageStatusType() === 'error'">
                  <div class="sm-status-icon">
                    @if (sageStatusType() === 'success') { ✔ }
                    @else { ⚠ }
                  </div>
                  <div class="sm-status-text">
                    <strong>{{ sageStatusType() === 'success' ? 'Connected Successfully!' : 'Authentication Failed' }}</strong>
                    <p>{{ sageStatusMsg() }}</p>
                  </div>
                </div>
              }

              @if (sageSampleItems().length > 0) {
                <div class="sm-preview-section">
                  <div class="sm-preview-header">
                    <h4>Live Items from Sage 300 Database (Sample {{ sageSampleItems().length }})</h4>
                    <span class="sm-badge-pill">Total in DB: {{ sageTotalItems() }}</span>
                  </div>
                  <div class="sm-preview-table-wrap">
                    <table class="sm-table">
                      <thead>
                        <tr>
                          <th>Item Number</th>
                          <th>Description</th>
                          <th>UOM</th>
                          <th>Category</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (it of sageSampleItems(); track it.ItemNumber) {
                          <tr>
                            <td><strong style="color: var(--role-accent, #2563eb);">{{ it.ItemNumber }}</strong></td>
                            <td>{{ it.Description }}</td>
                            <td><span class="sm-tag">{{ it.StockingUnitOfMeasure || '-' }}</span></td>
                            <td>{{ it.Category || '-' }}</td>
                            <td><span class="sm-status-badge">Active</span></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>

            <div class="sm-footer">
              <button type="button" class="sm-btn-secondary" (click)="sageModalOpen.set(false)">Cancel</button>
              <button type="button" class="sm-btn-primary" (click)="testSageConnection()" [disabled]="sageTesting()">
                @if (sageTesting()) {
                  <span>Connecting to Sage...</span>
                } @else {
                  <span>⚡ Test & Pull Live Items</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      @if (mobileOpen()) { <div class="backdrop" (click)="mobileOpen.set(false)"></div> }
    </div>
  `,
  styles: [`
    .skip-link {
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      z-index: 9999;
      background: var(--role-accent, #2563eb);
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      &:focus {
        top: 10px;
        left: 10px;
        width: auto;
        height: auto;
        overflow: visible;
      }
    }

    .brand {
      height: 54px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px;
      border-bottom: 1px solid var(--navy-border, rgba(255, 255, 255, 0.08));
    }
    .brand-logo-wrap {
      width: 34px;
      height: 34px;
      flex: none;
      border-radius: 8px;
      background: #fff;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease;
      &:hover {
        transform: scale(1.05);
      }
    }
    .brand-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .brand-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .brand-info strong { font-size: 13.5px; letter-spacing: .05em; color: #fff; line-height: 1.1; }
    .brand-info span { font-size: 10px; color: #94a3b8; }
    .nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .collapse-toggle-btn {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      cursor: pointer;
      flex: none;
      transition: all 0.18s ease;
      &:hover {
        background: rgba(255, 255, 255, 0.18);
        border-color: rgba(255, 255, 255, 0.35);
        color: #ffffff;
      }
    }
    .app-shell.collapsed .brand-info,
    .app-shell.collapsed .collapse-toggle-btn {
      display: none;
    }
    .app-shell.collapsed .brand {
      justify-content: center;
      padding: 0 8px;
    }

    /* Topbar & Search Layout */
    .topbar {
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 0 20px;
      background: var(--panel, #ffffff);
      border-bottom: 1px solid var(--line, #e2e8f0);
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 8px;
      background: var(--surface-2, #f8fafc);
      color: var(--text, #0f172a);
      cursor: pointer;
      margin-right: 4px;
      flex: none;
      transition: all 0.15s ease;
      @media (max-width: 780px) {
        display: inline-flex !important;
      }
      &:hover {
        background: var(--surface-3, #f1f5f9);
        border-color: var(--line-strong, #cbd5e1);
      }
    }
    .page-context {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      line-height: 1.2;
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: var(--muted, #64748b);
      white-space: nowrap;
      margin: 0;
      padding: 0;
      line-height: 1.2;
      a { color: var(--muted, #64748b); text-decoration: none; &:hover { color: var(--role-accent, #2563eb); } }
      [aria-current] { color: var(--text-2, #475569); }
    }
    .page-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
      line-height: 1.2;
    }

    .content {
      padding: 8px 20px 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .global-search {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 1 420px;
      margin-left: 0;
      height: 38px;
      padding: 0 12px;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 10px;
      background: var(--surface-2, #f8fafc);
      color: var(--muted, #64748b);
      transition: border-color 0.18s, box-shadow 0.18s;
      &:focus-within {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 3px var(--role-soft, rgba(37, 99, 235, 0.12));
      }
      app-icon {
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--muted, #64748b);
      }
      input {
        flex: 1;
        min-width: 0;
        width: 100% !important;
        border: none !important;
        background: transparent !important;
        outline: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        height: 100% !important;
        padding: 0 4px !important;
        color: var(--text, #0f172a);
        font-size: 13px;
        line-height: normal;
        &::placeholder { color: var(--muted, #64748b); }
      }
      .clear {
        flex: none;
        border: 0;
        background: none;
        color: var(--muted, #64748b);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        padding: 0;
        &:hover { background: var(--surface-3, #f1f5f9); color: var(--text, #0f172a); }
      }
    }
    .search-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      max-height: 360px;
      overflow-y: auto;
      z-index: 100;
      background: var(--panel, #ffffff);
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 12px;
      box-shadow: 0 10px 25px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.05);
      padding: 6px;
      button {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        min-height: 44px;
        padding: 6px 10px;
        border: 0;
        background: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        color: var(--text, #0f172a);
        &:hover, &:focus-visible { background: var(--surface-3, #f1f5f9); }
        b { font-size: 12.5px; }
        small { color: var(--muted, #64748b); font-size: 11px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      }
    }
    .search-group {
      padding: 8px 10px 2px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--muted, #64748b);
    }
    .search-empty {
      padding: 16px 12px;
      color: var(--muted, #64748b);
      font-size: 12.5px;
    }

    /* Top Actions & User Trigger */
    .top-actions {
      gap: 8px;
      margin-left: auto;
      display: flex;
      align-items: center;
      .icon-btn {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        color: var(--muted, #64748b);
        position: relative;
        transition: background 0.18s, border-color 0.18s, color 0.18s;
        &:hover { background: var(--surface-3, #f1f5f9); border-color: var(--line, #e2e8f0); color: var(--text, #0f172a); }
        .badge {
          position: absolute;
          right: 2px;
          top: 2px;
          background: var(--red, #dc2626);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 10px;
          padding: 1px 5px;
          min-width: 14px;
          text-align: center;
        }
      }
    }

    .user-menu {
      position: relative;
      display: inline-block;
    }
    .user-trigger {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      min-height: 38px;
      padding: 3px 10px 3px 5px;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 20px;
      background: var(--panel, #ffffff);
      color: var(--text, #0f172a);
      cursor: pointer;
      transition: all 0.18s cubic-bezier(.2, .7, .2, 1);
      &:hover, &[aria-expanded="true"] {
        background: var(--surface-2, #f8fafc);
        border-color: var(--line-strong, #cbd5e1);
        box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
      }
      .user-details {
        display: flex;
        flex-direction: column;
        text-align: left;
        line-height: 1.2;
        strong {
          font-size: 12.5px;
          font-weight: 600;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text, #0f172a);
        }
        small {
          font-size: 10.5px;
          color: var(--role-accent, #2563eb);
          font-weight: 600;
        }
      }
      app-icon { flex: none; color: var(--muted, #64748b); }
    }
    .avatar {
      background: var(--role-soft, #eff6ff);
      color: var(--role-accent, #2563eb);
      border: 1.5px solid var(--role-border, #bfdbfe);
      width: 32px;
      height: 32px;
      flex: none;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 11.5px;
      &.lg {
        width: 42px;
        height: 42px;
        font-size: 14px;
        flex: none;
      }
    }

    /* User Dropdown */
    .user-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 300px;
      z-index: 1000;
      background: var(--panel, #ffffff);
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 14px;
      box-shadow: 0 10px 25px -4px rgba(15, 23, 42, 0.15), 0 4px 10px -2px rgba(15, 23, 42, 0.08);
      padding: 10px;
      transform-origin: top right;
      animation: pop 0.18s cubic-bezier(.2, .7, .2, 1);
      .ud-head {
        display: flex;
        gap: 12px;
        padding: 6px 6px 12px;
        align-items: center;
        > div {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        strong {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text, #0f172a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        small {
          display: block;
          color: var(--muted, #64748b);
          font-size: 11.5px;
          word-break: break-all;
          margin-bottom: 2px;
        }
      }
      .role-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 10.5px;
        font-weight: 700;
        color: var(--role-accent, #2563eb);
        background: var(--role-soft, #eff6ff);
        border: 1px solid var(--role-border, #bfdbfe);
        align-self: flex-start;
      }
      .ud-section {
        padding: 10px 6px;
        border-top: 1px solid var(--line, #e2e8f0);
        margin: 6px 0;
        > small {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--muted, #64748b);
          margin-bottom: 8px;
        }
      }
      .ud-section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: var(--muted, #64748b);
        margin-bottom: 6px;
        padding: 0 2px;
      }
      .portal-badge-count {
        font-size: 9.5px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--surface-3, #f1f5f9);
        color: var(--text-2, #475569);
      }
      .portals-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-bottom: 2px;
      }
      .portal-switch-item {
        display: flex;
        align-items: center;
        gap: 9px;
        width: 100%;
        padding: 6px 8px;
        border: 1px solid transparent;
        background: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
        &:hover:not(:disabled) {
          background: var(--surface-2, #f8fafc);
          border-color: var(--line, #e2e8f0);
        }
        &.active {
          background: var(--role-soft, #eff6ff);
          border-color: var(--role-border, #bfdbfe);
        }
        &:disabled {
          cursor: default;
        }
        .portal-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          flex: none;
          background: var(--surface-3, #f1f5f9);
          color: var(--text-2, #475569);
          transition: all 0.15s ease;
          &.active {
            background: var(--role-accent, #2563eb);
            color: #ffffff;
          }
        }
        .portal-info {
          flex: 1;
          min-width: 0;
          .portal-name {
            font-size: 12px;
            font-weight: 600;
            color: var(--text, #0f172a);
          }
          .portal-desc {
            font-size: 10px;
            color: var(--muted, #64748b);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .portal-check {
          color: var(--role-accent, #2563eb);
          display: flex;
          align-items: center;
          flex: none;
        }
      }
      .ud-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-height: 38px;
        padding: 8px 10px;
        border: 0;
        background: none;
        border-radius: 8px;
        color: var(--text, #0f172a);
        cursor: pointer;
        font-size: 12.5px;
        font-weight: 600;
        transition: background 0.15s;
        &:hover { background: var(--surface-3, #f1f5f9); }
        &.danger {
          color: var(--red, #dc2626);
          &:hover { background: var(--red-soft, #fef2f2); }
        }
      }
    }
    .theme-seg {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 3px;
      background: var(--surface-3, #f1f5f9);
      border-radius: 8px;
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        min-height: 32px;
        border: 0;
        background: none;
        border-radius: 6px;
        color: var(--text-2, #475569);
        cursor: pointer;
        font-size: 11.5px;
        font-weight: 600;
        transition: all 0.15s ease;
        &:hover { color: var(--text, #0f172a); }
        &.on {
          background: var(--panel, #ffffff);
          color: var(--role-accent, #2563eb);
          box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
        }
      }
    }
    @keyframes pop {
      from { opacity: 0; transform: scale(.97) translateY(-4px); }
      to { opacity: 1; transform: none; }
    }

    .sage-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid var(--line, #e2e8f0);
      background: var(--surface-2, #f8fafc);
      color: var(--text, #0f172a);
      transition: all 0.15s ease;
      &:hover {
        background: var(--surface-3, #f1f5f9);
        border-color: var(--line-strong, #cbd5e1);
      }
      .sage-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #f59e0b;
        transition: background 0.2s;
        &.connected {
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
        }
      }
      .sage-pill-text {
        white-space: nowrap;
      }
    }

    /* SAGE MODAL */
    .sage-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2500;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: pop 0.15s ease-out;
    }
    .sage-modal-card {
      width: 100%;
      max-width: 680px;
      background: var(--panel, #ffffff);
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 16px;
      box-shadow: 0 20px 35px -8px rgba(15, 23, 42, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: 90vh;
    }
    .sm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      border-bottom: 1px solid var(--line, #e2e8f0);
      .sm-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sm-icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: var(--role-soft, #eff6ff);
        color: var(--role-accent, #2563eb);
        display: grid;
        place-items: center;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--text, #0f172a);
      }
      p {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--muted, #64748b);
      }
      .sm-close-btn {
        border: 0;
        background: transparent;
        cursor: pointer;
        color: var(--muted, #64748b);
        padding: 6px;
        border-radius: 8px;
        &:hover { background: var(--surface-3, #f1f5f9); color: var(--text, #0f172a); }
      }
    }
    .sm-body {
      padding: 20px 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .sm-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      .sm-span-2 { grid-column: span 2; }
    }
    .sm-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text, #0f172a);
      }
      input {
        height: 38px;
        padding: 0 12px;
        border-radius: 8px;
        border: 1px solid var(--line, #e2e8f0);
        background: var(--surface-2, #f8fafc);
        font-size: 13px;
        color: var(--text, #0f172a);
        outline: none;
        &:focus {
          border-color: var(--role-accent, #2563eb);
          box-shadow: 0 0 0 2px var(--role-soft, rgba(37, 99, 235, 0.15));
        }
      }
      small {
        font-size: 11px;
        color: var(--muted, #64748b);
      }
    }
    .sm-pass-input-wrap {
      display: flex;
      position: relative;
      input { width: 100%; padding-right: 50px; }
      .sm-eye-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        border: 0;
        background: none;
        color: var(--muted, #64748b);
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 6px;
        border-radius: 4px;
        &:hover { color: var(--text, #0f172a); }
      }
    }
    .sm-status-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 12.5px;
      &.success {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        .sm-status-icon { background: #10b981; color: #fff; }
      }
      &.error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        .sm-status-icon { background: #ef4444; color: #fff; }
      }
      .sm-status-icon {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 12px;
        flex: none;
      }
      .sm-status-text {
        strong { display: block; font-size: 13px; margin-bottom: 2px; }
        p { margin: 0; font-size: 12px; }
      }
    }
    .sm-preview-section {
      background: var(--surface-2, #f8fafc);
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 10px;
      padding: 14px;
      .sm-preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        h4 { margin: 0; font-size: 13px; font-weight: 700; color: var(--text, #0f172a); }
        .sm-badge-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: var(--role-soft, #eff6ff);
          color: var(--role-accent, #2563eb);
        }
      }
      .sm-preview-table-wrap {
        max-height: 180px;
        overflow-y: auto;
        border-radius: 8px;
        border: 1px solid var(--line, #e2e8f0);
        background: var(--panel, #ffffff);
      }
      .sm-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        th {
          position: sticky;
          top: 0;
          background: var(--surface-3, #f1f5f9);
          padding: 7px 10px;
          text-align: left;
          font-weight: 600;
          color: var(--text-2, #475569);
          border-bottom: 1px solid var(--line, #e2e8f0);
        }
        td {
          padding: 7px 10px;
          border-bottom: 1px solid var(--line, #e2e8f0);
          color: var(--text, #0f172a);
        }
        .sm-tag {
          display: inline-block;
          padding: 1px 6px;
          border-radius: 4px;
          background: var(--surface-3, #f1f5f9);
          font-size: 11px;
        }
        .sm-status-badge {
          display: inline-block;
          padding: 1px 6px;
          border-radius: 4px;
          background: #ecfdf5;
          color: #065f46;
          font-size: 10.5px;
          font-weight: 600;
        }
      }
    }
    .sm-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 24px;
      border-top: 1px solid var(--line, #e2e8f0);
      background: var(--surface-2, #f8fafc);
      .sm-btn-secondary {
        height: 38px;
        padding: 0 16px;
        border-radius: 8px;
        border: 1px solid var(--line, #e2e8f0);
        background: var(--panel, #ffffff);
        color: var(--text, #0f172a);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        &:hover { background: var(--surface-3, #f1f5f9); }
      }
      .sm-btn-primary {
        height: 38px;
        padding: 0 20px;
        border-radius: 8px;
        border: 0;
        background: var(--role-accent, #2563eb);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        &:hover { opacity: 0.9; }
        &:disabled { opacity: 0.6; cursor: not-allowed; }
      }
    }
  `]
})
export class PortalShellComponent {
  readonly state = inject(PortalStateService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly sageApi = inject(SageApiService);
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  // Sage 300 ERP Modal State
  readonly sageModalOpen = signal(false);
  readonly sageIsConnected = signal(false);
  readonly sageTesting = signal(false);
  readonly sageUrl = signal('/Sage300WebApi');
  readonly sageCompany = signal('SAMDAT');
  readonly sageTenant = signal('-');
  readonly sageUsername = signal('ADMIN');
  readonly sagePassword = signal('');
  readonly sageShowPassword = signal(false);
  readonly sageStatusMsg = signal('');
  readonly sageStatusType = signal<'success' | 'error' | ''>('');
  readonly sageTotalItems = signal(0);
  readonly sageSampleItems = signal<SageItem[]>([]);

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
      if (code === 0) return 'Vendor (Registration Draft)';
      if (code >= 1 && code < 3) return 'Vendor (Application Under Review)';
      return 'Vendor Partner (Sage 300 ERP)';
    }
    return ROLE_LABEL[this.role()];
  });
  readonly menu = computed(() => {
    if (this.role() === 'vendor') {
      const code = this.state.vendorStatusCode();
      if (code >= 3) return VENDOR_ACTIVE_MENU;
      if (code >= 1) return VENDOR_REVIEW_MENU;
      return VENDOR_DRAFT_MENU;
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

  readonly userSecurityGroup = computed(() => {
    return this.state.currentUser()?.securityGroup || '';
  });

  readonly isMasterUser = computed(() => {
    const sg = this.userSecurityGroup().trim();
    // If assigned to Viewer (3 = Finance) or Editor (2 = Procurement), strictly restrict them
    if (sg === '2' || sg === '3') return false;
    if (sg === '1' || sg === '4') return true;
    const currRole = this.state.currentUser()?.role;
    if (currRole === 'finance' || currRole === 'procurement' || currRole === 'vendor') return false;
    return currRole === 'admin';
  });

  readonly availablePortals = computed(() => {
    if (this.isMasterUser()) {
      return [
        { key: 'admin' as Role, label: 'Administration', icon: 'management', desc: 'Users & security governance' },
        { key: 'procurement' as Role, label: 'Procurement', icon: 'requisition', desc: 'Requisitions, RFQs & purchase orders' },
        { key: 'finance' as Role, label: 'Finance & AP', icon: 'invoices', desc: 'Vendor invoices & 3-way matching' },
        { key: 'vendor' as Role, label: 'Vendor Portal', icon: 'vendors', desc: 'Supplier partner self-service' }
      ];
    }
    const sg = this.userSecurityGroup();
    const currRole = this.state.currentUser()?.role;
    if (sg === '2' || currRole === 'procurement') {
      return [
        { key: 'procurement' as Role, label: 'Procurement Portal', icon: 'requisition', desc: 'Authorized Department Portal' }
      ];
    }
    if (sg === '3' || currRole === 'finance') {
      return [
        { key: 'finance' as Role, label: 'Finance Portal', icon: 'invoices', desc: 'Authorized Department Portal' }
      ];
    }
    return [
      { key: 'vendor' as Role, label: 'Vendor Portal', icon: 'vendors', desc: 'Authorized Supplier Portal' }
    ];
  });

  switchPortal(targetRole: Role): void {
    if (!this.isMasterUser() && targetRole !== this.role()) return;
    this.state.setRole(targetRole);
    this.userOpen.set(false);
    const dest = targetRole === 'vendor'
      ? (this.state.vendorStatusCode() >= 3 ? '/vendor/dashboard' : '/vendor/profile')
      : `/${targetRole}/dashboard`;
    this.router.navigate([dest]);
  }

  toggleTheme(): void { this.theme.toggle(); }

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
    try { localStorage.setItem('vp.sidebar', this.collapsed() ? '1' : '0'); } catch {}
  }
  onToggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 780) {
      this.mobileOpen.set(false);
    } else {
      this.toggleCollapsed();
    }
  }
  onMenuBtnClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 780) {
      this.mobileOpen.update(v => !v);
    } else {
      this.toggleCollapsed();
    }
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

  openSageModal(): void {
    const cfg = this.sageApi.getConfig();
    this.sageUrl.set(cfg.baseUrl || '/Sage300WebApi');
    this.sageCompany.set(cfg.company || 'SAMDAT');
    this.sageTenant.set(cfg.tenant || '-');
    this.sageUsername.set(cfg.username || 'ADMIN');
    this.sagePassword.set(cfg.password || '');
    this.sageStatusMsg.set('');
    this.sageStatusType.set('');
    this.sageModalOpen.set(true);
  }

  testSageConnection(): void {
    this.sageTesting.set(true);
    this.sageStatusMsg.set('Contacting Sage 300 Web API...');
    this.sageStatusType.set('');

    this.sageApi.setConfig({
      baseUrl: this.sageUrl(),
      company: this.sageCompany(),
      tenant: this.sageTenant(),
      username: this.sageUsername(),
      password: this.sagePassword()
    });

    this.sageApi.testConnection().subscribe(res => {
      this.sageTesting.set(false);
      if (res.success) {
        this.sageIsConnected.set(true);
        this.sageStatusType.set('success');
        this.sageStatusMsg.set(res.message);
        if (res.sampleItem) {
          this.sageSampleItems.set([res.sampleItem]);
        }
      } else {
        this.sageIsConnected.set(false);
        this.sageStatusType.set('error');
        this.sageStatusMsg.set(res.message);
      }
    });
  }

  logout(): void {
    this.state.signOut();
    this.mobileOpen.set(false);
    this.router.navigate(['/login']);
  }
}
