import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="role-dashboard" [attr.data-role]="role()">
      <header class="dashboard-heading">
        <div>
          <h1>{{ roleLabel() }} Dashboard</h1>
          <p><strong>{{ welcomeName() }}</strong></p>
        </div>
      </header>

      <!-- VENDOR DASHBOARD -->
      @if (role() === 'vendor') {
        <section class="dash-kpis five">
          <article class="dash-kpi approval-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Registration Status</span>
              <span class="kpi-icon-badge emerald">
                <app-icon name="approval-matrix" [size]="16" />
              </span>
            </div>
            <div class="approval-value">
              <i>✓</i>
              <strong>Approved</strong>
            </div>
            <small>Vendor Code · VEN-10024</small>
            <a routerLink="../profile" class="mini-link boxed">View Profile →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Active RFQs</span>
              <span class="kpi-icon-badge blue">
                <app-icon name="rfqs" [size]="16" />
              </span>
            </div>
            <strong class="kpi-value">8</strong>
            <small>3 closing this week</small>
            <a routerLink="../rfqs" class="mini-link">View RFQs →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Active POs</span>
              <span class="kpi-icon-badge purple">
                <app-icon name="orders" [size]="16" />
              </span>
            </div>
            <strong class="kpi-value">12</strong>
            <small>Across 3 departments</small>
            <a routerLink="../orders" class="mini-link">View Orders →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Pending Invoices</span>
              <span class="kpi-icon-badge amber">
                <app-icon name="invoices" [size]="16" />
              </span>
            </div>
            <strong class="kpi-value">4</strong>
            <small>Under 3-way matching</small>
            <a routerLink="../invoices" class="mini-link">View Invoices →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Overdue Deliveries</span>
              <span class="kpi-icon-badge rose">
                <app-icon name="deliveries" [size]="16" />
              </span>
            </div>
            <strong class="kpi-value danger">2</strong>
            <small>Requires revised ETA</small>
            <a routerLink="../deliveries" class="mini-link">Update Delivery →</a>
          </article>
        </section>

        <section class="dash-row two-equal">
          <article class="dash-card">
            <div class="dash-card-title">PO & Delivery Overview</div>
            <div class="donut-layout">
              <div class="metric-list">
                <div><span>Total POs</span><b>32</b></div>
                <div><span>Delivered</span><b>18</b></div>
                <div><span>In-Transit</span><b>6</b></div>
                <div><span>Pending Delivery</span><b>8</b></div>
              </div>
              <div class="donut-wrap">
                <div class="donut vendor-delivery">
                  <div><b>32</b><small>Total POs</small></div>
                </div>
                <div class="legend">
                  <span><i class="lg green"></i>Delivered</span>
                  <span><i class="lg blue"></i>In-Transit</span>
                  <span><i class="lg orange"></i>Pending Delivery</span>
                </div>
              </div>
            </div>
          </article>

          <article class="dash-card">
            <div class="dash-card-title">Invoice & Payment Overview</div>
            <div class="donut-layout">
              <div class="metric-list">
                <div><span>Invoices Submitted</span><b>16</b></div>
                <div><span>Invoices Approved</span><b>12</b></div>
                <div><span>Payment Received</span><b>10</b></div>
                <div><span>Payment Pending</span><b>6</b></div>
              </div>
              <div class="donut-wrap">
                <div class="donut vendor-invoice">
                  <div><b>16</b><small>Invoices</small></div>
                </div>
                <div class="legend">
                  <span><i class="lg green"></i>Approved</span>
                  <span><i class="lg purple"></i>Pending</span>
                  <span><i class="lg red"></i>Rejected</span>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="dash-row activity-row">
          <article class="dash-card activity-card">
            <div class="dash-card-title">Recent Supplier Activities</div>
            <div class="activity-list">
              <div>
                <i class="activity-dot green"></i>
                <span>
                  <b>PO #PO-002334 confirmed</b>
                  <small>20 May 2024</small>
                </span>
                <em class="status-chip success">Confirmed</em>
              </div>
              <div>
                <i class="activity-dot teal"></i>
                <span>
                  <b>Invoice #INV-00210 approved</b>
                  <small>18 May 2024</small>
                </span>
                <em class="status-chip success">Approved</em>
              </div>
              <div>
                <i class="activity-dot orange"></i>
                <span>
                  <b>Delivery date updated for PO #PO-002321</b>
                  <small>17 May 2024</small>
                </span>
                <em class="status-chip pending">Pending</em>
              </div>
              <div>
                <i class="activity-dot red"></i>
                <span>
                  <b>New RFQ #RFQ-0056 received</b>
                  <small>16 May 2024</small>
                </span>
                <em class="status-chip new">New</em>
              </div>
            </div>
          </article>

          <article class="dash-card quick-card">
            <div class="dash-card-title">Supplier Quick Actions</div>
            <div class="quick-actions six">
              <a routerLink="../rfqs">
                <span><app-icon name="rfqs" [size]="15" /></span>
                View RFQs
              </a>
              <a routerLink="../orders">
                <span><app-icon name="orders" [size]="15" /></span>
                View Orders
              </a>
              <a routerLink="../invoices">
                <span><app-icon name="invoices" [size]="15" /></span>
                Upload Invoice
              </a>
              <a routerLink="../deliveries">
                <span><app-icon name="deliveries" [size]="15" /></span>
                Update ETA
              </a>
              <a routerLink="../payments">
                <span><app-icon name="payments" [size]="15" /></span>
                Payments
              </a>
              <a routerLink="../profile">
                <span><app-icon name="help" [size]="15" /></span>
                Support
              </a>
            </div>
          </article>
        </section>
      }

      <!-- PROCUREMENT DASHBOARD -->
      @if (role() === 'procurement') {
        <section class="dash-kpis five">
          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Vendors</span>
              <span class="kpi-icon-badge blue"><app-icon name="vendors" [size]="16" /></span>
            </div>
            <strong class="kpi-value">245</strong>
            <small>Approved Active Vendors</small>
            <a routerLink="../vendors" class="mini-link">Directory →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Active RFQs</span>
              <span class="kpi-icon-badge emerald"><app-icon name="rfqs" [size]="16" /></span>
            </div>
            <strong class="kpi-value accent">15</strong>
            <small>Open for Bidding</small>
            <a routerLink="../rfqs" class="mini-link">Manage RFQs →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">POs in Process</span>
              <span class="kpi-icon-badge indigo"><app-icon name="orders" [size]="16" /></span>
            </div>
            <strong class="kpi-value">28</strong>
            <small>Under Approval / Release</small>
            <a routerLink="../orders" class="mini-link">View POs →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Overdue Deliveries</span>
              <span class="kpi-icon-badge rose"><app-icon name="deliveries" [size]="16" /></span>
            </div>
            <strong class="kpi-value danger">7</strong>
            <small>Requires Attention</small>
            <a routerLink="../deliveries" class="mini-link">Tracking →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Spend This Month</span>
              <span class="kpi-icon-badge teal"><app-icon name="payments" [size]="16" /></span>
            </div>
            <strong class="kpi-value">$2.45M</strong>
            <small>8.4% under budget target</small>
            <a routerLink="../reports" class="mini-link">Spend Report →</a>
          </article>
        </section>

        <section class="dash-row chart-and-donut">
          <article class="dash-card spend-card">
            <div class="dash-card-title">Spend Analysis (This Month)</div>
            <div class="line-chart-shell">
              <div class="y-labels">
                <span>2.5M</span><span>2M</span><span>1.5M</span><span>1M</span><span>500K</span><span>0</span>
              </div>
              <svg class="line-chart" viewBox="0 0 680 190" preserveAspectRatio="none" aria-label="Spend analysis line chart">
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2563eb" stop-opacity=".18"/><stop offset="100%" stop-color="#2563eb" stop-opacity="0"/></linearGradient>
                </defs>
                <g class="grid-lines">
                  <line x1="0" y1="20" x2="680" y2="20"/>
                  <line x1="0" y1="52" x2="680" y2="52"/>
                  <line x1="0" y1="84" x2="680" y2="84"/>
                  <line x1="0" y1="116" x2="680" y2="116"/>
                  <line x1="0" y1="148" x2="680" y2="148"/>
                  <line x1="0" y1="180" x2="680" y2="180"/>
                </g>
                <path class="area" d="M18 160 L110 108 L205 84 L300 52 L392 104 L492 78 L575 16 L662 0 L662 180 L18 180 Z"/>
                <polyline class="chart-line" points="18,160 110,108 205,84 300,52 392,104 492,78 575,16 662,0"/>
                <g class="points">
                  <circle cx="18" cy="160" r="4"/><circle cx="110" cy="108" r="4"/><circle cx="205" cy="84" r="4"/>
                  <circle cx="300" cy="52" r="4"/><circle cx="392" cy="104" r="4"/><circle cx="492" cy="78" r="4"/>
                  <circle cx="575" cy="16" r="4"/><circle cx="662" cy="0" r="4"/>
                </g>
              </svg>
              <div class="x-labels">
                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 5</span>
              </div>
            </div>
          </article>

          <article class="dash-card">
            <div class="dash-card-title">PO Status Distribution</div>
            <div class="donut-layout procurement-donut-layout">
              <div class="donut-wrap centered">
                <div class="donut po-status"><div><b>28</b><small>Total POs</small></div></div>
              </div>
              <div class="legend wide">
                <span><i class="lg blue"></i>Draft <b>5 (18%)</b></span>
                <span><i class="lg purple"></i>Pending Approval <b>7 (25%)</b></span>
                <span><i class="lg green"></i>Approved <b>10 (36%)</b></span>
                <span><i class="lg slate"></i>Partially Received <b>3 (11%)</b></span>
                <span><i class="lg dark"></i>Closed <b>3 (10%)</b></span>
              </div>
            </div>
          </article>
        </section>

        <section class="dash-row three-equal bottom-procurement">
          <article class="dash-card compact-card">
            <div class="dash-card-title">Top Categories by Spend</div>
            <div class="mini-table">
              <div class="head"><span>Category</span><span>Spend (USD)</span><span>Share</span></div>
              <div><span>Electrical</span><b>$850,000</b><span>34.7%</span></div>
              <div><span>Mechanical</span><b>$620,000</b><span>25.3%</span></div>
              <div><span>Raw Materials</span><b>$450,000</b><span>18.4%</span></div>
              <div><span>IT & Hardware</span><b>$290,000</b><span>11.8%</span></div>
              <div><span>Others</span><b>$250,000</b><span>10.2%</span></div>
            </div>
          </article>

          <article class="dash-card compact-card">
            <div class="dash-card-title">Pending Approvals</div>
            <div class="approval-list">
              <a routerLink="../orders">
                <span><b>PO #PO-002345</b><small>Vendor: ABC Supplies</small></span>
                <strong>$52,000<small>PO Approval</small></strong>
              </a>
              <a routerLink="../orders">
                <span><b>PO #PO-002346</b><small>Vendor: Global Traders</small></span>
                <strong>$18,600<small>PO Approval</small></strong>
              </a>
              <a routerLink="../vendors">
                <span><b>Change Request #CR-0012</b><small>Vendor: Tech Solutions</small></span>
                <strong>$9,750<small>Change Approval</small></strong>
              </a>
            </div>
            <a routerLink="../orders" class="view-all">View All Pending →</a>
          </article>

          <article class="dash-card compact-card">
            <div class="dash-card-title">Recent RFQs</div>
            <div class="rfq-mini-list">
              <a routerLink="../rfqs">
                <span><b>RFQ-0061</b><small>Electrical Panels & Switchgear</small></span>
                <em><i class="activity-dot green"></i>Open</em>
              </a>
              <a routerLink="../rfqs">
                <span><b>RFQ-0060</b><small>Industrial Safety Gear</small></span>
                <em><i class="activity-dot green"></i>Open</em>
              </a>
              <a routerLink="../rfqs">
                <span><b>RFQ-0059</b><small>Mechanical Assemblies</small></span>
                <em><i class="activity-dot slate"></i>Closed</em>
              </a>
            </div>
            <a routerLink="../rfqs" class="view-all">View All RFQs →</a>
          </article>
        </section>
      }

      <!-- FINANCE DASHBOARD -->
      @if (role() === 'finance') {
        <section class="dash-kpis five">
          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Invoices Pending</span>
              <span class="kpi-icon-badge amber"><app-icon name="invoices" [size]="16" /></span>
            </div>
            <strong class="kpi-value accent">18</strong>
            <small>Awaiting Verification</small>
            <a routerLink="../invoices" class="mini-link">Review Invoices →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Invoices Approved</span>
              <span class="kpi-icon-badge emerald"><app-icon name="three-way-match" [size]="16" /></span>
            </div>
            <strong class="kpi-value">25</strong>
            <small>Cleared for payment</small>
            <a routerLink="../invoices" class="mini-link">Cleared Queue →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Invoices Rejected</span>
              <span class="kpi-icon-badge rose"><app-icon name="invoices" [size]="16" /></span>
            </div>
            <strong class="kpi-value danger">3</strong>
            <small>3-way mismatch flags</small>
            <a routerLink="../three-way-match" class="mini-link">Exceptions →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Payments Pending</span>
              <span class="kpi-icon-badge blue"><app-icon name="payments" [size]="16" /></span>
            </div>
            <strong class="kpi-value">12</strong>
            <small>Awaiting EFT release</small>
            <a routerLink="../payments" class="mini-link">Release Batch →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Payments Made</span>
              <span class="kpi-icon-badge purple"><app-icon name="banks" [size]="16" /></span>
            </div>
            <strong class="kpi-value">$1.85M</strong>
            <small>Disbursed this month</small>
            <a routerLink="../payments" class="mini-link">Ledger →</a>
          </article>
        </section>

        <section class="dash-row three-equal finance-overview">
          <article class="dash-card">
            <div class="dash-card-title">Invoice Processing Status</div>
            <div class="donut-layout finance-donut">
              <div class="donut-wrap centered">
                <div class="donut invoice-status"><div><b>46</b><small>Total</small></div></div>
              </div>
              <div class="legend wide">
                <span><i class="lg purple"></i>Pending <b>18 (39%)</b></span>
                <span><i class="lg blue"></i>Approved <b>25 (54%)</b></span>
                <span><i class="lg red"></i>Rejected <b>3 (7%)</b></span>
              </div>
            </div>
          </article>

          <article class="dash-card">
            <div class="dash-card-title">Automated 3-Way Match</div>
            <div class="progress-summary">
              <div><span>Matched</span><i><b style="width:61%"></b></i><strong>28 (61%)</strong></div>
              <div><span>Mismatch</span><i><b class="orange" style="width:22%"></b></i><strong>10 (22%)</strong></div>
              <div><span>Pending</span><i><b class="red" style="width:17%"></b></i><strong>8 (17%)</strong></div>
            </div>
            <a routerLink="../three-way-match" class="view-all">Run Match Reconciliation →</a>
          </article>

          <article class="dash-card">
            <div class="dash-card-title">Disbursement Settlement</div>
            <div class="donut-layout finance-donut">
              <div class="donut-wrap centered">
                <div class="donut payment-status"><div><b>34</b><small>Payments</small></div></div>
              </div>
              <div class="legend wide">
                <span><i class="lg teal"></i>Paid <b>22 (65%)</b></span>
                <span><i class="lg blue"></i>Pending <b>12 (35%)</b></span>
              </div>
            </div>
          </article>
        </section>

        <section class="dash-row two-equal finance-tables">
          <article class="dash-card compact-card">
            <div class="dash-card-title">Invoices Pending Verification</div>
            <div class="mini-table finance-table">
              <div class="head">
                <span>Invoice #</span><span>Vendor</span><span>PO #</span><span>Amount</span><span>Submitted</span>
              </div>
              <div><b>INV-00245</b><span>ABC Supplies</span><span>PO-00234</span><b>$15,600</b><span>20 May 2024</span></div>
              <div><b>INV-00246</b><span>Global Traders</span><span>PO-00235</span><b>$8,750</b><span>19 May 2024</span></div>
              <div><b>INV-00247</b><span>Tech Solutions</span><span>PO-00236</span><b>$12,900</b><span>18 May 2024</span></div>
            </div>
            <a routerLink="../invoices" class="view-all">View All Invoices →</a>
          </article>

          <article class="dash-card compact-card">
            <div class="dash-card-title">Supplier Bank Verification Queue</div>
            <div class="mini-table bank-table">
              <div class="head">
                <span>Vendor Legal Name</span><span>Bank / Institution</span><span>Submitted On</span>
              </div>
              <div><span>XYZ Industries</span><span>Habib Bank Ltd</span><span>17 May 2024</span></div>
              <div><span>Sunrise Enterprises</span><span>Meezan Bank</span><span>16 May 2024</span></div>
              <div><span>Perfect Suppliers</span><span>Bank Alfalah</span><span>15 May 2024</span></div>
            </div>
            <a routerLink="../bank-verification" class="view-all">View Verification Queue →</a>
          </article>
        </section>
      }

      <!-- ADMIN DASHBOARD -->
      @if (role() === 'admin') {
        <section class="dash-kpis five">
          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Total Users</span>
              <span class="kpi-icon-badge indigo"><app-icon name="users" [size]="16" /></span>
            </div>
            <strong class="kpi-value">128</strong>
            <small>Internal & Supplier Accounts</small>
            <a routerLink="../users" class="mini-link">User Directory →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Vendors Registered</span>
              <span class="kpi-icon-badge emerald"><app-icon name="vendors" [size]="16" /></span>
            </div>
            <strong class="kpi-value">356</strong>
            <small>Active in Database</small>
            <a routerLink="../vendors" class="mini-link">Vendor Master →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Active Workflows</span>
              <span class="kpi-icon-badge purple"><app-icon name="workflows" [size]="16" /></span>
            </div>
            <strong class="kpi-value">24</strong>
            <small>Multi-tiered Routing Rules</small>
            <a routerLink="../workflows" class="mini-link">Configure →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">System Alerts</span>
              <span class="kpi-icon-badge rose"><app-icon name="notifications" [size]="16" /></span>
            </div>
            <strong class="kpi-value danger">5</strong>
            <small>Requires Administrator Review</small>
            <a routerLink="../audit" class="mini-link">View Alerts →</a>
          </article>

          <article class="dash-kpi">
            <div class="kpi-top-row">
              <span class="kpi-label">Storage Used</span>
              <span class="kpi-icon-badge teal"><app-icon name="master-data" [size]="16" /></span>
            </div>
            <strong class="kpi-value">68%</strong>
            <small>340 GB of 500 GB</small>
            <a routerLink="../settings" class="mini-link">Storage Settings →</a>
          </article>
        </section>

        <section class="dash-row chart-and-donut admin-overview">
          <article class="dash-card spend-card">
            <div class="dash-card-title">User Activity & Sessions (This Month)</div>
            <div class="line-chart-shell admin-chart">
              <div class="y-labels">
                <span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
              </div>
              <svg class="line-chart" viewBox="0 0 680 190" preserveAspectRatio="none" aria-label="User activity chart">
                <defs>
                  <linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#50ae9b" stop-opacity=".16"/><stop offset="100%" stop-color="#50ae9b" stop-opacity="0"/></linearGradient>
                </defs>
                <g class="grid-lines">
                  <line x1="0" y1="20" x2="680" y2="20"/>
                  <line x1="0" y1="60" x2="680" y2="60"/>
                  <line x1="0" y1="100" x2="680" y2="100"/>
                  <line x1="0" y1="140" x2="680" y2="140"/>
                  <line x1="0" y1="180" x2="680" y2="180"/>
                </g>
                <path class="area admin-area" d="M18 155 L112 72 L202 104 L297 68 L390 50 L485 88 L575 80 L662 72 L662 180 L18 180 Z"/>
                <polyline class="chart-line admin-line" points="18,155 112,72 202,104 297,68 390,50 485,88 575,80 662,72"/>
                <g class="points admin-points">
                  <circle cx="18" cy="155" r="4"/><circle cx="112" cy="72" r="4"/><circle cx="202" cy="104" r="4"/>
                  <circle cx="297" cy="68" r="4"/><circle cx="390" cy="50" r="4"/><circle cx="485" cy="88" r="4"/>
                  <circle cx="575" cy="80" r="4"/><circle cx="662" cy="72" r="4"/>
                </g>
              </svg>
              <div class="x-labels">
                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 5</span>
              </div>
            </div>
          </article>

          <article class="dash-card">
            <div class="dash-card-title">Workflow State Health</div>
            <div class="donut-layout procurement-donut-layout">
              <div class="donut-wrap centered">
                <div class="donut workflow-status"><div><b>24</b><small>Workflows</small></div></div>
              </div>
              <div class="legend wide">
                <span><i class="lg teal"></i>Active <b>16 (67%)</b></span>
                <span><i class="lg orange"></i>Inactive <b>5 (21%)</b></span>
                <span><i class="lg light-orange"></i>Draft <b>3 (12%)</b></span>
              </div>
            </div>
          </article>
        </section>

        <section class="dash-row two-equal admin-tables">
          <article class="dash-card compact-card">
            <div class="dash-card-title">Security & System Alerts</div>
            <div class="mini-table alert-table">
              <div class="head"><span>Alert</span><span>Module</span><span>Raised</span><span>Priority</span></div>
              <div><span>PO pending approval &gt; 48 hrs</span><span>PO Management</span><span>20 May 2024</span><em class="status-chip new">High</em></div>
              <div><span>Delivery date exceeded</span><span>Deliveries</span><span>19 May 2024</span><em class="status-chip new">High</em></div>
              <div><span>Invoice mismatch found</span><span>Finance</span><span>18 May 2024</span><em class="status-chip pending">Medium</em></div>
            </div>
            <a routerLink="../audit" class="view-all">System Audit Trail →</a>
          </article>

          <article class="dash-card compact-card">
            <div class="dash-card-title">Recent Immutable Audit Logs</div>
            <div class="mini-table audit-table">
              <div class="head"><span>Event</span><span>Actor</span><span>Timestamp</span></div>
              <div><span>User role elevated</span><span>admin&#64;company.com</span><span>20 May 10:30 AM</span></div>
              <div><span>Workflow threshold modified</span><span>admin&#64;company.com</span><span>20 May 09:15 AM</span></div>
              <div><span>Vendor compliance approved</span><span>admin&#64;company.com</span><span>19 May 04:45 PM</span></div>
            </div>
            <a routerLink="../audit" class="view-all">View All Logs →</a>
          </article>
        </section>
      }
    </div>
  `,
  styles: [`
    .kpi-top-row {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .kpi-icon-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .kpi-icon-badge:hover {
      transform: translateY(-1px);
    }
    .kpi-icon-badge.emerald {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .kpi-icon-badge.blue {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }
    .kpi-icon-badge.indigo {
      background: #eef2ff;
      color: #4f46e5;
      border: 1px solid #c7d2fe;
    }
    .kpi-icon-badge.purple {
      background: #f5f3ff;
      color: #7c3aed;
      border: 1px solid #ddd6fe;
    }
    .kpi-icon-badge.amber {
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fde68a;
    }
    .kpi-icon-badge.rose {
      background: #fff1f2;
      color: #e11d48;
      border: 1px solid #fecdd3;
    }
    .kpi-icon-badge.teal {
      background: #f0fdfa;
      color: #0d9488;
      border: 1px solid #99f6e4;
    }
  `]
})
export class DashboardComponent {
  readonly state = inject(PortalStateService);
  readonly role = computed(() => this.state.role());
  readonly roleLabel = computed(() => this.role()[0].toUpperCase() + this.role().slice(1));
  readonly welcomeName = computed(() => ({
    vendor: 'Welcome, ABC Supplies Pvt. Ltd.',
    procurement: 'Welcome, Procurement Team!',
    finance: 'Welcome, Finance Team!',
    admin: 'Welcome, System Administrator!'
  }[this.role()]));
  readonly subtitle = computed(() => ({
    vendor: '',
    procurement: 'Monitor supplier bidding cycles, requisitions, and purchase order fulfillment.',
    finance: 'Reconcile 3-way matching, audit invoices, and release batch supplier disbursements.',
    admin: 'Manage system security, user permissions, audit trails, and ERP integration gateways.'
  }[this.role()]));
}
