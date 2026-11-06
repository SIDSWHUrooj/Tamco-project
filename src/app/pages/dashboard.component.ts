import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { IconComponent } from '../shared/icon.component';
import { BarDatum, BarListComponent, ColumnsComponent, Datum, DonutComponent, KpiComponent } from '../shared/dash-widgets.component';

type Sev = 'critical' | 'warning' | 'info';
interface Kpi {
  label: string; value: number | string; prefix?: string; suffix?: string; note: string; icon: string;
  tone?: 'brand' | 'good' | 'warn' | 'bad' | 'info' | 'violet'; route?: string; cta?: string; pct?: number | null; barLabel?: string;
}
interface Attn { sev: Sev; count: number; title: string; detail: string; route: string; cta: string; }
interface Action { label: string; desc: string; icon: string; route: string; }

const SEV_RANK: Record<Sev, number> = { critical: 0, warning: 1, info: 2 };
const SEV_LABEL: Record<Sev, string> = { critical: 'Critical', warning: 'Warning', info: 'Info' };
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const sumBy = <T,>(rows: T[], key: (r: T) => string, val: (r: T) => number) => {
  const m = new Map<string, number>();
  rows.forEach(r => m.set(key(r), (m.get(key(r)) ?? 0) + val(r)));
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};
const countBy = <T,>(rows: T[], key: (r: T) => string) => sumBy(rows, key, () => 1);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, IconComponent, KpiComponent, DonutComponent, BarListComponent, ColumnsComponent],
  template: `
    <div class="role-dashboard vf" [attr.data-role]="role()">
      <!-- HERO -->
      <header class="hero">
        <div class="hero-text">
          <p class="hero-date">{{ today }}</p>
          <h1>{{ greeting() }}, <span>{{ displayName() }}</span></h1>
          <p class="hero-sub">{{ subtitle() }}</p>
        </div>
        <div class="hero-stats" aria-label="At a glance">
          <div><b>{{ attentionTotal() }}</b><small>need attention</small></div>
          <div><b>{{ kpis().length }}</b><small>live metrics</small></div>
        </div>
      </header>

      <!-- KPIs -->
      <section class="kpi-grid" aria-label="Key metrics">
        @for (k of kpis(); track k.label) {
          <app-kpi [label]="k.label" [value]="k.value" [prefix]="k.prefix ?? ''" [suffix]="k.suffix ?? ''" [note]="k.note" [icon]="k.icon"
                   [tone]="k.tone ?? 'brand'" [link]="k.route ? link(k.route) : null" [linkText]="k.cta ?? 'Open'"
                   [pct]="k.pct ?? null" [barLabel]="k.barLabel ?? ''" />
        }
      </section>

      <!-- CHARTS -->
      <section class="chart-grid" aria-label="Analytics">
        @switch (role()) {
          @case ('procurement') {
            <article class="vf-card"><header><h3>Purchase orders by approval</h3><span>All POs</span></header>
              <app-donut [data]="poApproval()" centerLabel="Total POs" ariaLabel="Purchase orders by approval status" /></article>
            <article class="vf-card wide"><header><h3>PO value by category</h3><span>USD</span></header>
              <app-columns [data]="poByCategory()" prefix="$" ariaLabel="Purchase order value by category" /></article>
            <article class="vf-card"><header><h3>Vendor verification</h3><span>Procurement &amp; Finance sign-off</span></header>
              <app-donut [data]="vendorVerification()" centerLabel="Vendors" ariaLabel="Vendor verification status" /></article>
            <article class="vf-card"><header><h3>Top vendors by PO value</h3><span>USD</span></header>
              <app-bar-list [data]="topVendorsByPo()" prefix="$" ariaLabel="Top vendors by purchase order value" /></article>
            <article class="vf-card"><header><h3>Bid comparisons</h3><span>Award pipeline</span></header>
              <app-donut [data]="bidStatus()" centerLabel="Items" ariaLabel="Bid comparison status" /></article>
            <article class="vf-card full"><header><h3>Logistics cost by type</h3><span>AED</span></header>
              <app-bar-list [data]="logisticByType()" suffix=" AED" ariaLabel="Logistics cost by type" /></article>
          }
          @case ('finance') {
            <article class="vf-card"><header><h3>Invoice status</h3><span>All invoices</span></header>
              <app-donut [data]="invoiceStatus()" centerLabel="Invoices" ariaLabel="Invoices by status" /></article>
            <article class="vf-card wide"><header><h3>Invoice value by vendor</h3><span>USD</span></header>
              <app-columns [data]="invoiceByVendor()" prefix="$" ariaLabel="Invoice value by vendor" /></article>
            <article class="vf-card"><header><h3>Bank verification</h3><span>Vendor IBAN checks</span></header>
              <app-donut [data]="bankStatus()" centerLabel="Accounts" ariaLabel="Bank verification status" /></article>
            <article class="vf-card"><header><h3>3-way match result</h3><span>PO · GRN/QC · Invoice</span></header>
              <app-donut [data]="matchStatus()" centerLabel="Checked" ariaLabel="Three-way match results" /></article>
            <article class="vf-card"><header><h3>Payables by status</h3><span>USD</span></header>
              <app-bar-list [data]="invoiceValueByStatus()" prefix="$" ariaLabel="Invoice value by status" /></article>
          }
          @case ('admin') {
            <article class="vf-card"><header><h3>Users by status</h3><span>System accounts</span></header>
              <app-donut [data]="userStatus()" centerLabel="Users" ariaLabel="Users by status" /></article>
            <article class="vf-card"><header><h3>Users by department</h3><span>Headcount</span></header>
              <app-bar-list [data]="usersByDept()" ariaLabel="Users by department" /></article>
            <article class="vf-card"><header><h3>Vendor master status</h3><span>Registered vendors</span></header>
              <app-donut [data]="masterStatus()" centerLabel="Vendors" ariaLabel="Vendor master status" /></article>
            <article class="vf-card"><header><h3>Security group membership</h3><span>Users per group</span></header>
              <app-bar-list [data]="usersByGroup()" ariaLabel="Users per security group" /></article>
            <article class="vf-card"><header><h3>Vendor onboarding</h3><span>Invitations</span></header>
              <app-donut [data]="onboardStatus()" centerLabel="Invites" ariaLabel="Vendor onboarding status" /></article>
            <article class="vf-card"><header><h3>Vendors by city</h3><span>Master records</span></header>
              <app-bar-list [data]="vendorsByCity()" ariaLabel="Vendors by city" /></article>
          }
          @case ('vendor') {
            <article class="vf-card"><header><h3>My purchase orders</h3><span>By approval</span></header>
              <app-donut [data]="myPoApproval()" centerLabel="POs" ariaLabel="My purchase orders by approval" /></article>
            <article class="vf-card wide"><header><h3>PO value by category</h3><span>USD</span></header>
              <app-columns [data]="myPoByCategory()" prefix="$" ariaLabel="My purchase order value by category" /></article>
            <article class="vf-card"><header><h3>My invoices</h3><span>By status</span></header>
              <app-donut [data]="myInvoiceStatus()" centerLabel="Invoices" ariaLabel="My invoices by status" /></article>
            <article class="vf-card wide"><header><h3>Open RFQs for my categories</h3><span>Bid price vs. status</span></header>
              <app-bar-list [data]="myRfqs()" prefix="$" ariaLabel="Open RFQs matching my categories" /></article>
          }
        }
      </section>

      <!-- ATTENTION + ACTIONS -->
      <section class="split">
        <article class="vf-card attn">
          <header><h3>Needs your attention</h3><span>{{ attentionTotal() }} item{{ attentionTotal() === 1 ? '' : 's' }}</span></header>
          @for (a of attention(); track a.title) {
            <a class="attn-row" [attr.data-sev]="a.sev" [routerLink]="link(a.route)">
              <span class="attn-count">{{ a.count }}</span>
              <span class="attn-body"><b>{{ a.title }}</b><small>{{ a.detail }}</small></span>
              <span class="attn-sev">{{ sevLabel(a.sev) }}</span>
              <span class="attn-cta">{{ a.cta }} →</span>
            </a>
          } @empty {
            <div class="all-clear">
              <app-icon name="check" [size]="22" />
              <div><b>All clear</b><small>{{ emptyMessage() }}</small></div>
            </div>
          }
        </article>

        <article class="vf-card actions">
          <header><h3>Quick actions</h3><span>Jump straight in</span></header>
          <div class="tiles">
            @for (a of actions(); track a.label) {
              <a class="tile" [routerLink]="link(a.route)">
                <span class="tile-icon"><app-icon [name]="a.icon" [size]="18" /></span>
                <span><b>{{ a.label }}</b><small>{{ a.desc }}</small></span>
              </a>
            }
          </div>
        </article>
      </section>

      <!-- ROLE LISTS -->
      @if (role() === 'procurement') {
        <article class="vf-card list-card">
          <header><h3>Requisitions in progress</h3><a [routerLink]="link('requisition')">View all →</a></header>
          @for (r of openRequisitions(); track r.id) {
            <a class="list-row" [routerLink]="link('requisition')">
              <span><b>{{ r.id }}</b><small>{{ r.desc }}</small></span>
              <span class="pill" [attr.data-s]="r.status.toLowerCase()">{{ r.status }}</span>
            </a>
          } @empty { <p class="muted">No requisitions are waiting on you.</p> }
        </article>
      }
      @if (role() === 'finance') {
        <article class="vf-card list-card">
          <header><h3>Bank verification queue</h3><a [routerLink]="link('bank-verification')">Open queue →</a></header>
          @for (b of pendingBanks(); track b.id) {
            <a class="list-row" [routerLink]="link('bank-verification')">
              <span><b>{{ b.vendorName }}</b><small>{{ b.bankName }}</small></span>
              <span class="pill" data-s="pending">Review</span>
            </a>
          } @empty { <p class="muted">No vendor bank accounts are waiting for verification.</p> }
        </article>
      }
      @if (role() === 'admin') {
        <article class="vf-card list-card">
          <header><h3>Recent users</h3><a [routerLink]="link('users')">Manage users →</a></header>
          @for (u of recentUsers(); track u.id) {
            <a class="list-row" [routerLink]="link('users')">
              <span><b>{{ u.name }}</b><small>{{ u.dept }} · {{ u.group }}</small></span>
              <span class="pill" [attr.data-s]="u.status.toLowerCase()">{{ u.status }}</span>
            </a>
          } @empty { <p class="muted">No users have been added yet.</p> }
        </article>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .vf { display: grid; gap: 18px; }

    /* HERO */
    .hero { position: relative; overflow: hidden; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
      padding: 24px 26px; border-radius: 18px; color: #fff;
      background:
        radial-gradient(900px 260px at 100% 0%, color-mix(in srgb, var(--role-accent) 55%, transparent), transparent 70%),
        linear-gradient(120deg, var(--navy) 0%, color-mix(in srgb, var(--role-accent) 38%, var(--navy)) 100%);
      border: 1px solid color-mix(in srgb, var(--role-accent) 40%, transparent); box-shadow: var(--shadow-md); }
    .hero::before { content: ''; position: absolute; inset: 0; opacity: .5; pointer-events: none;
      background-image: radial-gradient(rgba(255,255,255,.14) 1px, transparent 1px); background-size: 18px 18px;
      -webkit-mask-image: linear-gradient(90deg, transparent 30%, #000); mask-image: linear-gradient(90deg, transparent 30%, #000); }
    .hero-text { position: relative; min-width: 0; }
    .hero-date { margin: 0 0 6px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.7); }
    .hero h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -.02em; color: #fff; line-height: 1.15; }
    .hero h1 span { color: color-mix(in srgb, var(--role-accent) 35%, #fff); }
    .hero-sub { margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,.82); max-width: 560px; }
    .hero-stats { position: relative; display: flex; gap: 12px; }
    .hero-stats div { min-width: 110px; padding: 12px 16px; border-radius: 14px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(6px); }
    .hero-stats b { display: block; font-size: 28px; font-weight: 800; line-height: 1; color: #fff; font-variant-numeric: tabular-nums; }
    .hero-stats small { font-size: 11.5px; color: rgba(255,255,255,.75); }

    /* GRIDS */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
    .chart-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .chart-grid .wide { grid-column: span 2; }
    .chart-grid .full { grid-column: 1 / -1; }
    @media (max-width: 1100px) { .chart-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 700px) { .chart-grid { grid-template-columns: minmax(0, 1fr); } .chart-grid .wide, .chart-grid .full { grid-column: auto; } }
    .split { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 14px; }

    /* CARD */
    .vf-card { min-width: 0; padding: 18px; border-radius: 16px; background: var(--panel); border: 1px solid var(--line); box-shadow: var(--shadow-xs);
      transition: box-shadow .18s var(--ease), border-color .18s var(--ease); animation: rise .45s var(--ease) backwards; }
    .vf-card:hover { box-shadow: var(--shadow-md); }
    .vf-card > header { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 14px; }
    .vf-card h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
    .vf-card > header span, .vf-card > header a { font-size: 11.5px; color: var(--muted); white-space: nowrap; }
    .vf-card > header a { color: var(--role-accent); font-weight: 700; }
    .chart-grid .vf-card:nth-child(2) { animation-delay: .05s; } .chart-grid .vf-card:nth-child(3) { animation-delay: .1s; }
    .chart-grid .vf-card:nth-child(4) { animation-delay: .15s; } .chart-grid .vf-card:nth-child(5) { animation-delay: .2s; } .chart-grid .vf-card:nth-child(6) { animation-delay: .25s; }
    @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

    /* ATTENTION */
    .attn-row { --s: var(--blue); display: grid; grid-template-columns: 40px minmax(0, 1fr) auto auto; align-items: center; gap: 12px;
      padding: 10px 12px; margin-bottom: 8px; border-radius: 12px; border: 1px solid var(--line); border-left: 4px solid var(--s); background: var(--surface-2);
      color: var(--text); min-height: 56px; transition: transform .15s var(--ease), background .15s; }
    .attn-row:hover { transform: translateX(3px); background: var(--surface-3); }
    .attn-row[data-sev="critical"] { --s: var(--red); } .attn-row[data-sev="warning"] { --s: var(--amber); } .attn-row[data-sev="info"] { --s: var(--blue); }
    .attn-count { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; font-weight: 800; color: var(--s);
      background: color-mix(in srgb, var(--s) 14%, transparent); }
    .attn-body { min-width: 0; display: flex; flex-direction: column; }
    .attn-body b { font-size: 13px; } .attn-body small { color: var(--muted); font-size: 11.5px; }
    .attn-sev { font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--s); padding: 3px 8px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--s) 45%, transparent); }
    .attn-cta { font-size: 12px; font-weight: 700; color: var(--role-accent); white-space: nowrap; }
    .all-clear { display: flex; align-items: center; gap: 12px; padding: 18px; border-radius: 12px; color: var(--green); background: var(--green-soft); border: 1px dashed var(--green-border); }
    .all-clear b { display: block; color: var(--text); } .all-clear small { color: var(--muted); }

    /* ACTIONS */
    .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; }
    .tile { display: flex; align-items: center; gap: 12px; padding: 12px; min-height: 56px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface-2); color: var(--text);
      transition: transform .15s var(--ease), border-color .15s, background .15s, box-shadow .15s; }
    .tile:hover { transform: translateY(-2px); border-color: var(--role-accent); background: var(--role-soft); box-shadow: var(--shadow-sm); }
    .tile-icon { width: 36px; height: 36px; flex: none; display: grid; place-items: center; border-radius: 10px; color: #fff; background: var(--role-accent); }
    .tile b { display: block; font-size: 13px; } .tile small { color: var(--muted); font-size: 11.5px; }

    /* LISTS */
    .list-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 8px; border-top: 1px solid var(--line); color: var(--text); min-height: 52px; border-radius: 8px; }
    .list-row:first-of-type { border-top: 0; } .list-row:hover { background: var(--surface-2); }
    .list-row b { display: block; font-size: 13px; } .list-row small { color: var(--muted); font-size: 11.5px; }
    .pill { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: var(--blue-soft); color: var(--blue); border: 1px solid var(--blue-border); white-space: nowrap; }
    .pill[data-s="pending"], .pill[data-s="draft"], .pill[data-s="inactive"] { background: var(--amber-soft); color: var(--amber); border-color: var(--amber-border); }
    .pill[data-s="approved"], .pill[data-s="active"] { background: var(--green-soft); color: var(--green); border-color: var(--green-border); }
    .muted { color: var(--muted); margin: 0; font-size: 12.5px; }

    @media (max-width: 900px) {
      .split { grid-template-columns: 1fr; }
      .hero { padding: 20px; } .hero h1 { font-size: 23px; }
    }
    @media (max-width: 560px) {
      .attn-row { grid-template-columns: 36px minmax(0, 1fr); }
      .attn-sev, .attn-cta { grid-column: 2; justify-self: start; }
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .hero-stats div { min-width: 0; flex: 1; }
      .hero-stats { width: 100%; }
    }
    @media (max-width: 400px) { .kpi-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent {
  readonly state = inject(PortalStateService);
  readonly role = computed(() => this.state.role());
  readonly today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    return this.role() === 'vendor' ? 'Welcome back' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  });
  readonly displayName = computed(() => this.state.currentUser()?.name || ({
    vendor: 'Vendor Partner', procurement: 'Procurement Team', finance: 'Finance & AP', admin: 'Administrator' }[this.role()]));
  readonly subtitle = computed(() => ({
    vendor: "Here's the latest activity related to your vendor account.",
    procurement: 'Here are the procurement activities requiring your attention.',
    finance: 'Review vendor banking, invoices and outstanding payables.',
    admin: "Here's an overview of your portal activity and system status." }[this.role()]));
  readonly emptyMessage = computed(() => ({
    vendor: 'Your account is in good standing — nothing needs action.',
    procurement: 'There are currently no procurement items requiring your action.',
    finance: 'There are currently no finance items awaiting your review.',
    admin: 'No users, vendors or workflows need administrator action.' }[this.role()]));

  link(route: string): string[] { return ['/', this.role(), route]; }
  sevLabel(s: Sev): string { return SEV_LABEL[s]; }

  private readonly C = {
    good: 'var(--green)', warn: 'var(--amber)', bad: 'var(--red)', info: 'var(--blue)', violet: 'var(--purple)',
    v1: 'var(--viz-1)', v2: 'var(--viz-2)', v3: 'var(--viz-3)', v4: 'var(--viz-4)', v5: 'var(--viz-5)'
  };
  private readonly cat = (rows: { label: string; value: number }[]): BarDatum[] =>
    rows.map((r, i) => ({ ...r, color: [this.C.v1, this.C.v2, this.C.v3, this.C.v4, this.C.v5][i % 5] }));
  private daysTo(d?: string): number | null { return d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000) : null; }

  /* ---------- shared slices of portal state ---------- */
  private readonly pos = computed(() => this.state.purchaseOrders());
  private readonly inv = computed(() => this.state.invoices());
  private readonly expiring = computed(() =>
    this.state.masterVendors().filter(v => { const d = this.daysTo(v.tradeLicenseExpiry); return d !== null && d <= 90; }));
  private readonly poValue = computed(() => this.pos().reduce((a, p) => a + p.amount, 0));

  /* ---------- procurement ---------- */
  readonly poApproval = computed<Datum[]>(() => [
    { label: 'Approved', value: this.pos().filter(p => p.approval === 'Approved').length, color: this.C.good },
    { label: 'Pending approval', value: this.pos().filter(p => p.approval === 'Pending').length, color: this.C.warn }]);
  readonly poByCategory = computed<BarDatum[]>(() => this.cat(sumBy(this.pos(), p => p.category, p => p.amount)).slice(0, 6));
  readonly topVendorsByPo = computed<BarDatum[]>(() => sumBy(this.pos(), p => p.vendor, p => p.amount).slice(0, 5).map(r => ({ ...r, color: this.C.v1 })));
  readonly vendorVerification = computed<Datum[]>(() => {
    const v = this.state.vendors();
    return [
      { label: 'Fully approved', value: v.filter(x => x.procurementStatus === 'Approved' && x.financeStatus === 'Approved').length, color: this.C.good },
      { label: 'Awaiting procurement', value: v.filter(x => x.procurementStatus === 'Pending').length, color: this.C.warn },
      { label: 'Awaiting finance', value: v.filter(x => x.procurementStatus !== 'Pending' && x.financeStatus === 'Pending').length, color: this.C.violet },
      { label: 'Rejected', value: v.filter(x => x.procurementStatus === 'Rejected' || x.financeStatus === 'Rejected').length, color: this.C.bad }];
  });
  readonly bidStatus = computed<Datum[]>(() => {
    const b = this.state.itemBidComparisons();
    return [
      { label: 'Approved', value: b.filter(x => x.status === 'Approved').length, color: this.C.good },
      { label: 'Pending', value: b.filter(x => x.status === 'Pending').length, color: this.C.warn },
      { label: 'Rejected', value: b.filter(x => x.status === 'Rejected').length, color: this.C.bad }];
  });
  readonly logisticByType = computed<BarDatum[]>(() =>
    this.cat(sumBy(this.state.logisticCosts().filter(l => l.currency === 'AED'), l => l.type, l => l.amount)));
  readonly openRequisitions = computed(() => this.state.requisitions()
    .filter(r => r.header.status !== 'Approved')
    .slice(0, 5).map(r => ({ id: r.header.documentNumber, desc: r.header.requestDescription, status: r.header.status || 'Draft' })));

  /* ---------- finance ---------- */
  private readonly invColors: Record<string, string> = { Approved: 'var(--green)', Paid: 'var(--blue)', Pending: 'var(--amber)', Rejected: 'var(--red)', 'Not submitted': 'var(--muted)' };
  readonly invoiceStatus = computed<Datum[]>(() => countBy(this.inv(), i => i.status).map(r => ({ ...r, color: this.invColors[r.label] })));
  readonly invoiceByVendor = computed<BarDatum[]>(() => this.cat(sumBy(this.inv(), i => i.vendor, i => i.amount)).slice(0, 6));
  readonly invoiceValueByStatus = computed<BarDatum[]>(() => sumBy(this.inv(), i => i.status, i => i.amount).map(r => ({ ...r, color: this.invColors[r.label] })));
  readonly bankStatus = computed<Datum[]>(() => {
    const b = this.state.bankRecords();
    return [
      { label: 'Verified', value: b.filter(x => x.verificationStatus === 'Approved').length, color: this.C.good },
      { label: 'Pending', value: b.filter(x => x.verificationStatus === 'Pending').length, color: this.C.warn },
      { label: 'Rejected', value: b.filter(x => x.verificationStatus === 'Rejected').length, color: this.C.bad }];
  });
  readonly matchStatus = computed<Datum[]>(() => [
    { label: 'Matched', value: this.inv().filter(i => i.match === 'Matched').length, color: this.C.good },
    { label: 'Mismatch', value: this.inv().filter(i => i.match === 'Mismatch').length, color: this.C.bad },
    { label: 'Pending', value: this.inv().filter(i => i.match === 'Pending').length, color: this.C.warn }]);
  readonly pendingBanks = computed(() => this.state.bankRecords().filter(b => b.verificationStatus === 'Pending').slice(0, 5));

  /* ---------- admin ---------- */
  readonly userStatus = computed<Datum[]>(() => [
    { label: 'Active', value: this.state.legacyUsers().filter(u => u.status === 'Active').length, color: this.C.good },
    { label: 'Inactive', value: this.state.legacyUsers().filter(u => u.status === 'Inactive').length, color: this.C.warn }]);
  readonly usersByDept = computed<BarDatum[]>(() => this.cat(countBy(this.state.legacyUsers(), u => u.department || 'Unassigned')));
  readonly usersByGroup = computed<BarDatum[]>(() => this.cat(countBy(this.state.legacyUsers(), u => u.securityGroup || 'None')));
  readonly masterStatus = computed<Datum[]>(() => {
    const colors: Record<string, string> = { Active: this.C.good, Approved: this.C.good, Pending: this.C.warn, 'Under Review': this.C.violet, Inactive: 'var(--muted)' };
    return countBy(this.state.masterVendors(), v => v.status).map(r => ({ ...r, color: colors[r.label] ?? this.C.info }));
  });
  readonly onboardStatus = computed<Datum[]>(() => {
    const colors: Record<string, string> = { Draft: 'var(--muted)', 'Email Sent': this.C.warn, 'Profile Completed': this.C.good };
    return countBy(this.state.vendorRegistrationRequests(), r => r.status).map(r => ({ ...r, color: colors[r.label] ?? this.C.info }));
  });
  readonly vendorsByCity = computed<BarDatum[]>(() => this.cat(countBy(this.state.masterVendors(), v => v.city || 'Unknown')).slice(0, 6));
  readonly recentUsers = computed(() => this.state.legacyUsers().slice(-4).reverse().map(u => ({
    id: u.id, name: `${u.firstName} ${u.lastName}`.trim(), dept: u.department, group: u.securityGroup, status: u.status })));

  /* ---------- vendor (own data only) ---------- */
  private readonly myName = computed(() => this.state.currentUser()?.name ?? '');
  private readonly myVendor = computed(() => this.state.vendors().find(v => v.name === this.myName()));
  private readonly myMaster = computed(() => this.state.masterVendors().find(v => v.vendorName === this.myName()));
  private readonly myPos = computed(() => this.pos().filter(p => p.vendor === this.myName()));
  private readonly myInv = computed(() => this.inv().filter(i => i.vendor === this.myName()));
  private readonly myOpenRfqs = computed(() => {
    const cats = this.myVendor()?.categories ?? [];
    return this.state.rfqs().filter(r => r.status === 'Open' && cats.includes(r.category));
  });
  readonly myPoApproval = computed<Datum[]>(() => [
    { label: 'Approved', value: this.myPos().filter(p => p.approval === 'Approved').length, color: this.C.good },
    { label: 'Pending approval', value: this.myPos().filter(p => p.approval === 'Pending').length, color: this.C.warn }]);
  readonly myInvoiceStatus = computed<Datum[]>(() => countBy(this.myInv(), i => i.status).map(r => ({ ...r, color: this.invColors[r.label] })));
  readonly myPoByCategory = computed<BarDatum[]>(() => this.cat(sumBy(this.myPos(), p => p.category, p => p.amount)).slice(0, 6));
  readonly myRfqs = computed<BarDatum[]>(() => this.myOpenRfqs().map(r => {
    const bid = r.bids.find(b => b.vendorId === this.myVendor()?.id && b.submitted);
    return { label: r.title, value: bid?.price ?? 0, sub: bid ? `Bid submitted · closes ${r.closeDate}` : `No bid yet · closes ${r.closeDate}`, color: bid ? this.C.good : this.C.warn };
  }));

  /* ---------- KPIs ---------- */
  readonly kpis = computed<Kpi[]>(() => {
    const vendors = this.state.vendors(), banks = this.state.bankRecords();
    switch (this.role()) {
      case 'procurement': {
        const ok = vendors.filter(v => v.procurementStatus === 'Approved' && v.financeStatus === 'Approved').length;
        const approved = this.pos().filter(p => p.approval === 'Approved').length;
        return [
          { label: 'Approved vendors', value: ok, note: `of ${vendors.length} vendors on record`, icon: 'vendors', tone: 'good', route: 'vendors', cta: 'Vendor master', pct: pct(ok, vendors.length), barLabel: `${pct(ok, vendors.length)}% fully approved` },
          { label: 'Requisitions', value: this.state.requisitions().length, note: `${this.openRequisitions().length} still in progress`, icon: 'requisition', route: 'requisition', cta: 'Requisitions' },
          { label: 'Purchase orders', value: this.pos().length, note: `${approved} approved`, icon: 'orders', tone: 'info', route: 'orders', cta: 'PO list', pct: pct(approved, this.pos().length), barLabel: `${pct(approved, this.pos().length)}% approved` },
          { label: 'PO value', value: this.poValue(), prefix: '$', note: 'Across all purchase orders', icon: 'analytics', tone: 'violet', route: 'orders', cta: 'POs' },
          { label: 'Open RFQs', value: this.state.rfqs().filter(r => r.status === 'Open').length, note: `${this.state.rfqs().reduce((a, r) => a + r.bids.length, 0)} bids received`, icon: 'bid-comparison', tone: 'warn', route: 'bid-comparison', cta: 'Compare bids' }];
      }
      case 'finance': {
        const pendBank = banks.filter(b => b.verificationStatus === 'Pending').length;
        const pendInv = this.inv().filter(i => i.status === 'Pending');
        const total = this.inv().reduce((a, i) => a + i.amount, 0);
        const verified = banks.filter(b => b.verificationStatus === 'Approved').length;
        return [
          { label: 'Banks awaiting review', value: pendBank, note: 'Vendor IBANs to verify', icon: 'bank-verification', tone: pendBank ? 'warn' : 'good', route: 'bank-verification', cta: 'Verify banks' },
          { label: 'Verified accounts', value: verified, note: `of ${banks.length} bank records`, icon: 'banks', tone: 'good', route: 'finance-vendors', cta: 'Vendor banks', pct: pct(verified, banks.length), barLabel: `${pct(verified, banks.length)}% verified` },
          { label: 'Pending invoices', value: pendInv.length, note: `$${pendInv.reduce((a, i) => a + i.amount, 0).toLocaleString('en-US')} awaiting approval`, icon: 'invoices', tone: 'warn', route: 'invoices', cta: 'Review invoices' },
          { label: 'Invoice value', value: total, prefix: '$', note: `${this.inv().length} invoices on record`, icon: 'payments', tone: 'violet', route: 'invoices', cta: 'All invoices' },
          { label: 'Licences expiring', value: this.expiring().length, note: 'Trade licence ≤ 90 days', icon: 'documents', tone: this.expiring().length ? 'bad' : 'good', route: 'finance-vendors', cta: 'Vendors' }];
      }
      case 'admin': {
        const users = this.state.legacyUsers(), mv = this.state.masterVendors();
        const active = users.filter(u => u.status === 'Active').length;
        const groups = new Set(users.map(u => u.securityGroup)).size;
        return [
          { label: 'System users', value: users.length, note: `${active} active`, icon: 'users', route: 'users', cta: 'User directory', pct: pct(active, users.length), barLabel: `${pct(active, users.length)}% active` },
          { label: 'Registered vendors', value: mv.length, note: `${mv.filter(v => v.status === 'Active').length} active`, icon: 'vendors', tone: 'good', route: 'vendors', cta: 'Vendor master' },
          { label: 'Pending approvals', value: this.state.pendingProcurement().length + this.state.pendingFinance().length, note: 'Vendor sign-offs outstanding', icon: 'approval-matrix', tone: 'warn', route: 'vendors', cta: 'Review' },
          { label: 'Security groups', value: groups, note: 'In use by accounts', icon: 'roles', tone: 'info', route: 'roles', cta: 'Security groups' },
          { label: 'Onboarding invites', value: this.state.vendorRegistrationRequests().length, note: `${this.state.vendorRegistrationRequests().filter(r => r.status === 'Profile Completed').length} completed`, icon: 'mail', tone: 'violet', route: 'vendors', cta: 'Invitations' }];
      }
      default: {
        const me = this.myVendor(), mm = this.myMaster();
        const days = this.daysTo(mm?.tradeLicenseExpiry);
        const bank = banks.find(b => b.vendorId === me?.id);
        const both = me?.procurementStatus === 'Approved' && me?.financeStatus === 'Approved';
        return [
          { label: 'Registration', value: me ? (both ? 'Approved' : 'In review') : '—', note: me ? `Vendor code ${me.id}` : 'No vendor record linked', icon: 'approval-matrix', tone: both ? 'good' : 'warn', route: 'profile', cta: 'View profile' },
          { label: 'Trade licence', value: days === null ? '—' : days < 0 ? 'Expired' : `${days} days`, note: mm?.tradeLicenseExpiry ? `Expires ${mm.tradeLicenseExpiry}` : 'No expiry on file', icon: 'documents', tone: days !== null && days <= 30 ? 'bad' : days !== null && days <= 90 ? 'warn' : 'good', route: 'profile', cta: 'Check status' },
          { label: 'My purchase orders', value: this.myPos().length, note: `$${this.myPos().reduce((a, p) => a + p.amount, 0).toLocaleString('en-US')} total value`, icon: 'orders', tone: 'info', route: 'profile', cta: 'My profile' },
          { label: 'Bank verification', value: bank ? bank.verificationStatus : '—', note: bank ? bank.bankName : 'No bank record on file', icon: 'banks', tone: bank?.verificationStatus === 'Approved' ? 'good' : 'warn', route: 'profile', cta: 'Bank details' },
          { label: 'Open RFQs for me', value: this.myOpenRfqs().length, note: 'Matching my approved categories', icon: 'rfqs', tone: 'violet', route: 'profile', cta: 'My profile' }];
      }
    }
  });

  /* ---------- ATTENTION ---------- */
  readonly attention = computed<Attn[]>(() => {
    const out: Attn[] = [];
    const add = (count: number, a: Omit<Attn, 'count'>) => { if (count > 0) out.push({ ...a, count }); };
    const exp = this.expiring();
    const exp30 = exp.filter(v => (this.daysTo(v.tradeLicenseExpiry) ?? 99) <= 30).length;
    switch (this.role()) {
      case 'procurement':
        add(this.state.overdueOrders().length, { sev: 'critical', title: 'Purchase orders arriving late', detail: 'Arrival date is after the required date', route: 'orders', cta: 'Review' });
        add(this.pos().filter(p => p.approval === 'Pending').length, { sev: 'warning', title: 'POs awaiting approval', detail: 'Must be approved before release', route: 'orders', cta: 'Approve' });
        add(this.state.pendingProcurement().length, { sev: 'warning', title: 'Vendors awaiting procurement verification', detail: 'Verification is required before bidding', route: 'vendors', cta: 'Verify' });
        add(this.state.itemBidComparisons().filter(b => b.status === 'Pending').length, { sev: 'info', title: 'Bid comparisons pending award', detail: 'Compare bids and select a winning vendor', route: 'bid-comparison', cta: 'Compare' });
        add(this.state.requisitions().filter(r => r.header.status === 'Draft').length, { sev: 'info', title: 'Draft requisitions', detail: 'Complete and submit for sourcing', route: 'requisition', cta: 'Open' });
        break;
      case 'finance':
        add(exp30, { sev: 'critical', title: 'Trade licences expiring within 30 days', detail: 'Vendor documents need renewal', route: 'finance-vendors', cta: 'View' });
        add(this.state.bankRecords().filter(b => b.verificationStatus === 'Pending').length, { sev: 'warning', title: 'Bank accounts awaiting verification', detail: 'Payments are blocked until verified', route: 'bank-verification', cta: 'Verify' });
        add(this.inv().filter(i => i.status === 'Pending').length, { sev: 'warning', title: 'Invoices awaiting approval', detail: 'Review and approve for payment', route: 'invoices', cta: 'Review' });
        add(exp.length - exp30, { sev: 'info', title: 'Licences expiring within 90 days', detail: 'Plan renewals with vendors', route: 'finance-vendors', cta: 'View' });
        add(this.state.pendingFinance().length, { sev: 'info', title: 'Vendors awaiting finance sign-off', detail: 'Finance verification outstanding', route: 'finance-vendors', cta: 'Open' });
        break;
      case 'admin':
        add(exp30, { sev: 'critical', title: 'Vendor licences expiring within 30 days', detail: 'Expired documents block onboarding', route: 'vendors', cta: 'Review' });
        add(this.state.pendingProcurement().length + this.state.pendingFinance().length, { sev: 'warning', title: 'Vendor approvals outstanding', detail: 'Procurement or Finance sign-off is pending', route: 'vendors', cta: 'Review' });
        add(this.state.legacyUsers().filter(u => u.status === 'Inactive').length, { sev: 'info', title: 'Inactive user accounts', detail: 'Confirm access is still required', route: 'users', cta: 'Manage' });
        add(this.state.vendorRegistrationRequests().filter(r => r.status === 'Email Sent').length, { sev: 'info', title: 'Onboarding invites not completed', detail: 'Vendors have not finished registration', route: 'vendors', cta: 'Follow up' });
        break;
      default: {
        const mm = this.myMaster(), d = this.daysTo(mm?.tradeLicenseExpiry);
        if (d !== null && d <= 90) add(1, { sev: d <= 30 ? 'critical' : 'warning', title: d < 0 ? 'Trade licence has expired' : `Trade licence expires in ${d} days`, detail: 'Upload a renewed licence in your profile', route: 'profile', cta: 'Update' });
        const bank = this.state.bankRecords().find(b => b.vendorId === this.myVendor()?.id);
        if (bank && bank.verificationStatus !== 'Approved') add(1, { sev: 'warning', title: `Bank details ${bank.verificationStatus.toLowerCase()}`, detail: 'Payments can only be made to verified accounts', route: 'profile', cta: 'Check' });
        add(this.myInv().filter(i => i.status === 'Rejected').length, { sev: 'warning', title: 'Invoices rejected', detail: 'Correct and resubmit', route: 'profile', cta: 'View' });
        add(this.myOpenRfqs().filter(r => !r.bids.some(b => b.vendorId === this.myVendor()?.id && b.submitted)).length, { sev: 'info', title: 'Open RFQs without your bid', detail: 'Submit a quote before the close date', route: 'profile', cta: 'View' });
      }
    }
    return out.sort((a, b) => SEV_RANK[a.sev] - SEV_RANK[b.sev]);
  });
  readonly attentionTotal = computed(() => this.attention().reduce((a, x) => a + x.count, 0));

  /* ---------- QUICK ACTIONS (only routes that exist for the role) ---------- */
  readonly actions = computed<Action[]>(() => {
    switch (this.role()) {
      case 'procurement': return [
        { label: 'New requisition', desc: 'Raise a purchase request', icon: 'requisition', route: 'requisition' },
        { label: 'Create PO', desc: 'Issue a purchase order', icon: 'orders', route: 'orders' },
        { label: 'Compare bids', desc: 'Evaluate vendor quotes', icon: 'bid-comparison', route: 'bid-comparison' },
        { label: 'Vendors', desc: 'Verify and manage vendors', icon: 'vendors', route: 'vendors' },
        { label: 'Logistics costs', desc: 'Freight & insurance', icon: 'logistic-cost', route: 'logistic-cost' }];
      case 'finance': return [
        { label: 'Verify banks', desc: 'Review vendor IBANs', icon: 'bank-verification', route: 'bank-verification' },
        { label: 'Review invoices', desc: 'Approve for payment', icon: 'invoices', route: 'invoices' },
        { label: 'Vendor banks', desc: 'Finance vendor list', icon: 'finance-vendors', route: 'finance-vendors' }];
      case 'admin': return [
        { label: 'Manage users', desc: 'Accounts and access', icon: 'users', route: 'users' },
        { label: 'Security groups', desc: 'Roles & permissions', icon: 'roles', route: 'roles' },
        { label: 'Work flows', desc: 'Approval routing', icon: 'workflows', route: 'workflows' },
        { label: 'Vendors', desc: 'Vendor control hub', icon: 'vendors', route: 'vendors' },
        { label: 'UAE banks', desc: 'Bank master data', icon: 'banks', route: 'banks' }];
      default: return [
        { label: 'Company profile', desc: 'Update your 8-step profile', icon: 'profile', route: 'profile' }];
    }
  });
}
