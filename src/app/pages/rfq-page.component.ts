import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';

@Component({
  selector: 'app-rfq-page',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent, CustomDatePickerComponent],
  styles: [`
    .rfq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .rfq-card {
      position: relative;
      display: flex;
      flex-direction: column;
      border-left: 4px solid var(--green, #16a34a);
      padding: 14px 16px;
      background: #ffffff;
      border-radius: var(--radius-md, 10px);
      transition: transform 0.18s ease, box-shadow 0.18s ease;

      &.status-evaluation {
        border-left-color: var(--amber, #d97706);
      }

      &.status-closed {
        border-left-color: #94a3b8;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .rfq-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }

    .rfq-head-left {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .rfq-code-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--role-accent, #2563eb);
      background: var(--role-soft, #eff6ff);
      border: 1px solid var(--role-border, #bfdbfe);
      padding: 2px 7px;
      border-radius: 5px;
    }

    .category-pill {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .rfq-card-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text, #0f172a);
      margin: 0 0 10px;
      line-height: 1.3;
    }

    .rfq-specs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: #f8fafc;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 8px;
      padding: 8px 10px;
    }

    .spec-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .spec-lbl {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted, #64748b);
    }

    .spec-val {
      font-size: 12px;
      font-weight: 600;
      color: var(--text, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 480px) {
      .rfq-specs-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
    }

    /* COMMERCIAL BID BOX (Matching User Specification) */
    .vendor-bid-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 10px 12px;
      margin-top: 10px;
      box-shadow: 0 1px 2px rgba(22, 163, 74, 0.04);
    }

    .bid-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .bid-title-group {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1e293b;
    }

    .bid-header-icon {
      color: #15803d;
      flex-shrink: 0;
    }

    .commercial-bid-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .bid-submitted-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      letter-spacing: -0.01em;
    }

    .bid-fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .bid-field-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .bid-field-label {
      font-size: 10.5px;
      font-weight: 600;
      color: #475569;
    }

    .bid-input-container {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      height: 32px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:focus-within {
        border-color: #16a34a;
        box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
      }
    }

    .bid-affix {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      user-select: none;
      pointer-events: none;

      &.prefix {
        padding-left: 9px;
        padding-right: 2px;
      }

      &.suffix {
        padding-right: 9px;
        padding-left: 2px;
        font-size: 11px;
      }
    }

    .bid-input {
      flex: 1;
      width: 100%;
      height: 100%;
      border: none !important;
      outline: none !important;
      background: transparent !important;
      padding: 0 6px;
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
      box-shadow: none !important;

      &::placeholder {
        color: #94a3b8;
        font-weight: 400;
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      appearance: textfield;
      -moz-appearance: textfield;
    }

    .bid-submit-btn {
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #16a34a;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(22, 163, 74, 0.2);
      transition: all 0.15s ease;

      &:hover {
        background: #15803d;
        box-shadow: 0 3px 8px rgba(22, 163, 74, 0.25);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }

      svg {
        flex-shrink: 0;
      }
    }

    .procurement-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--line, #e2e8f0);
    }
  `],
  template: `
    <app-page-heading
      eyebrow="Sourcing & e-Bidding"
      [title]="role()==='vendor' ? 'Open Quotations & RFQ Bidding' : 'RFQ Sourcing & Event Management'"
      [subtitle]="role()==='vendor' ? 'View and bid on qualified RFQs matching your approved categories. Submit prices and lead times.' : 'Publish tenders, invite verified suppliers, review competitive quotations and award contracts.'">
      <div class="heading-actions">
        @if (role() !== 'vendor') {
          <button class="btn" (click)="showNewRfqForm = !showNewRfqForm" style="display: inline-flex; align-items: center; gap: 6px;">
            @if (showNewRfqForm) {
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span>Close Form</span>
            } @else {
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Publish New RFQ</span>
            }
          </button>
        }
        <button class="btn secondary" (click)="exportRfqs()" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Export RFQ Log</span>
        </button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="dash-kpis three">
      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Total RFQs</span>
          <span class="kpi-icon-badge blue">
            <app-icon name="rfqs" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value">{{ rfqsList.length }}</strong>
        <small>Total published tender events</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Active / Open</span>
          <span class="kpi-icon-badge emerald">
            <app-icon name="bidding" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #059669;">{{ activeCount() }}</strong>
        <small>Accepting competitive supplier bids</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Pending Evaluation</span>
          <span class="kpi-icon-badge amber">
            <app-icon name="bid-comparison" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #d97706;">{{ evaluatingCount() }}</strong>
        <small>Under commercial & technical audit</small>
      </article>
    </section>

    <!-- Publish New RFQ Panel (Procurement / Admin) -->
    @if (showNewRfqForm && role() !== 'vendor') {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Publish New Request for Quotation (RFQ)</h2>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <app-icon name="rfqs" [size]="15" />
            <span style="font-size: 12.5px; color: var(--text);">
              <strong>Sourcing Eligibility Policy:</strong> Invitations will only be dispatched to active vendors verified by both Procurement & Finance.
            </span>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: var(--green); background: var(--green-soft); border: 1px solid var(--green-border); padding: 3px 9px; border-radius: 9999px;">
            {{ state.approvedVendors().length }} Qualified Vendors
          </span>
        </div>

        <div class="form-grid">
          <label>RFQ Reference # *<input [(ngModel)]="newRfq.id" placeholder="e.g. RFQ-2026-089" /></label>
          <label>RFQ Title / Description *<input [(ngModel)]="newRfq.title" placeholder="e.g. 11kV Gas-Insulated Switchgear Supply" /></label>
          <label>Purchasing Category *
            <app-custom-select [(ngModel)]="newRfq.category" [options]="categoryOptions" />
          </label>
          <label>Estimated Budget ($) *<input type="number" [(ngModel)]="newRfq.budget" placeholder="50000" /></label>
          <label>Required Delivery / Days *<input type="number" [(ngModel)]="newRfq.deliveryDays" placeholder="7" /></label>
          <label>Submission Deadline *
            <app-custom-date-picker [(ngModel)]="newRfq.deadline" />
          </label>
          <label class="span-2">Technical Specification Details<input [(ngModel)]="newRfq.specs" placeholder="Detailed engineering requirements..." /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetRfqForm()">Reset</button>
          <button class="btn" (click)="createRfq()">Publish Tender</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div class="search-filter-bar">
      <div class="search-input-wrap">
        <span class="search-icon">
          <app-icon name="search" [size]="15" />
        </span>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search RFQs by title, code or category..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="categoryFilter"
        [options]="filterCategoryOptions"
        minWidth="180px"
      />
    </div>

    <!-- RFQs List -->
    <section class="rfq-grid">
      @if (filteredRfqs().length === 0) {
        <article class="panel" style="grid-column: 1 / -1; text-align: center; padding: 36px;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 10px;">No RFQs published yet.</p>
          @if (role() !== 'vendor') {
            <button class="btn small" (click)="showNewRfqForm = true">+ Publish First RFQ</button>
          }
        </article>
      }
      @for (rfq of filteredRfqs(); track rfq.id) {
        <article class="panel rfq-card" [class.status-evaluation]="rfq.status === 'Under Evaluation'" [class.status-closed]="rfq.status === 'Closed'">
          <!-- Top Row: RFQ ID + Category on left, Status badge on top right -->
          <div class="rfq-card-head">
            <div class="rfq-head-left">
              <span class="rfq-code-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {{ rfq.id }}
              </span>
              <span class="category-pill">{{ rfq.category }}</span>
            </div>
            <app-status [text]="rfq.status" [good]="rfq.status==='Open'" [warn]="rfq.status==='Under Evaluation'" [bad]="rfq.status==='Closed'" />
          </div>

          <!-- Clean RFQ Title -->
          <h3 class="rfq-card-title">{{ rfq.title }}</h3>

          <!-- Compact 4-cell Specs Grid (Minimal vertical footprint) -->
          <div class="rfq-specs-grid">
            <div class="spec-cell">
              <span class="spec-lbl">Budget</span>
              <span class="spec-val" style="color: #059669; font-weight: 700;">&#36;{{ rfq.budget }}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-lbl">Deadline</span>
              <span class="spec-val">{{ rfq.deadline }}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-lbl">Lead Time</span>
              <span class="spec-val">{{ rfq.deliveryDays }} Days</span>
            </div>
            <div class="spec-cell">
              <span class="spec-lbl">Bids</span>
              <span class="spec-val">{{ rfq.bidsCount }} Submitted</span>
            </div>
          </div>

          @if (role() === 'vendor') {
            <!-- Vendor Commercial Bid Box (Matching User Specification) -->
            <div class="vendor-bid-box">
              <div class="bid-box-header">
                <div class="bid-title-group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="bid-header-icon">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  <span class="commercial-bid-title">COMMERCIAL BID</span>
                </div>
                <span class="bid-submitted-badge">✓ Bid Submitted</span>
              </div>

              <div class="bid-fields-grid">
                <div class="bid-field-group">
                  <label class="bid-field-label">Quoted Price ($) *</label>
                  <div class="bid-input-container">
                    <span class="bid-affix prefix">$</span>
                    <input
                      type="number"
                      [(ngModel)]="rfq.myBidPrice"
                      placeholder="0"
                      class="bid-input"
                    />
                  </div>
                </div>

                <div class="bid-field-group">
                  <label class="bid-field-label">Committed Lead Time *</label>
                  <div class="bid-input-container">
                    <input
                      type="number"
                      [(ngModel)]="rfq.myBidDays"
                      placeholder="0"
                      class="bid-input"
                      style="padding-left: 12px;"
                    />
                    <span class="bid-affix suffix">Days</span>
                  </div>
                </div>
              </div>

              <button class="bid-submit-btn" (click)="submitBid(rfq)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                <span>Update Quotation</span>
              </button>
            </div>
          } @else {
            <!-- Procurement Controls -->
            <div class="procurement-actions">
              <div style="display: flex; gap: 6px;">
                @if (rfq.status === 'Open') {
                  <button class="btn-action btn-action-execute" (click)="evaluateRfq(rfq)" title="Evaluate Bids">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <span>Evaluate Bids</span>
                  </button>
                }
                <button class="btn-action btn-action-save" (click)="saveRfq(rfq)" title="Save changes">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  <span>Save</span>
                </button>
              </div>
              <button class="btn-action btn-action-delete" (click)="deleteRfq(rfq.id)" title="Delete RFQ">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          }
        </article>
      }
    </section>
  `
})
export class RfqPageComponent {
  readonly state = inject(PortalStateService);
  readonly role = computed(() => this.state.role());

  showNewRfqForm = false;
  searchQuery = '';
  categoryFilter = '';

  readonly filterCategoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Mechanical', label: 'Mechanical' },
    { value: 'Safety Equipment', label: 'Safety Equipment' },
    { value: 'Raw Materials', label: 'Raw Materials' }
  ];

  readonly categoryOptions = [
    'Electrical',
    'Mechanical',
    'Safety Equipment',
    'Raw Materials',
    'IT & Hardware'
  ];

  newRfq: any = {
    id: 'RFQ-2026-062',
    title: '11kV Gas-Insulated Switchgear Supply',
    category: 'Electrical',
    budget: 85000,
    deliveryDays: 21,
    deadline: '2026-09-18',
    specs: 'GIS panels, SF6-free preference, IEC 62271 compliance, FAT at OEM works.',
    status: 'Open',
    bidsCount: 0
  };

  rfqsList: any[] = [
    { id: 'RFQ-2026-061', title: 'Electrical Items — LV Switchgear', category: 'Electrical', budget: 52000, deliveryDays: 14, deadline: '2026-09-05', specs: 'MCCBs, busbar trunking and panel accessories.', status: 'Open', bidsCount: 4, myBidPrice: 49800, myBidDays: 12 },
    { id: 'RFQ-2026-060', title: 'Safety Equipment — PPE Lot', category: 'Safety Equipment', budget: 18600, deliveryDays: 10, deadline: '2026-08-30', specs: 'Helmets, FR coveralls, insulated gloves Class 2.', status: 'Open', bidsCount: 3, myBidPrice: 17250, myBidDays: 8 },
    { id: 'RFQ-2026-059', title: 'Mechanical Parts — Pump Spares', category: 'Mechanical', budget: 43800, deliveryDays: 18, deadline: '2026-08-22', specs: 'Mechanical seals, impellers and coupling kits.', status: 'Under Evaluation', bidsCount: 5, myBidPrice: 42100, myBidDays: 16 },
    { id: 'RFQ-2026-058', title: 'Raw Materials — Copper Cable', category: 'Raw Materials', budget: 31500, deliveryDays: 12, deadline: '2026-08-15', specs: 'XLPE 4-core 120mm² copper, 2 km drums.', status: 'Closed', bidsCount: 6, myBidPrice: 30800, myBidDays: 11 }
  ];

  filteredRfqs(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = this.categoryFilter;
    return this.rfqsList.filter(r => {
      const matchQuery = !q ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q);
      const matchCat = !cat || r.category === cat;
      return matchQuery && matchCat;
    });
  }

  activeCount(): number {
    return this.rfqsList.filter(r => r.status === 'Open').length;
  }

  evaluatingCount(): number {
    return this.rfqsList.filter(r => r.status === 'Under Evaluation').length;
  }

  createRfq(): void {
    if (!this.newRfq.id || !this.newRfq.title) {
      this.state.notify('Error: RFQ reference number and title are required.');
      return;
    }
    const approvedCount = this.state.approvedVendors().length;
    const created = { ...this.newRfq, status: 'Open', bidsCount: approvedCount };
    this.rfqsList = [created, ...this.rfqsList];
    this.state.notify(`RFQ "${created.id} - ${created.title}" published. Dispatched to ${approvedCount} approved vendor(s).`);
    this.resetRfqForm();
  }

  resetRfqForm(): void {
    this.newRfq = {
      id: `RFQ-2026-0${Math.floor(63 + Math.random() * 20)}`,
      title: '11kV Gas-Insulated Switchgear Supply',
      category: 'Electrical',
      budget: 85000,
      deliveryDays: 21,
      deadline: '2026-09-18',
      specs: 'GIS panels, SF6-free preference, IEC 62271 compliance, FAT at OEM works.',
      status: 'Open',
      bidsCount: 0
    };
  }

  submitBid(rfq: any): void {
    if (!rfq.myBidPrice || !rfq.myBidDays) {
      this.state.notify('Error: Price and delivery days are required.');
      return;
    }
    rfq.bidsCount = (rfq.bidsCount || 0) + 1;
    this.state.notify(`Quotation for ${rfq.id} submitted successfully.`);
  }

  evaluateRfq(rfq: any): void {
    rfq.status = 'Under Evaluation';
    this.state.notify(`RFQ ${rfq.id} moved to Evaluation & Scoring.`);
  }

  saveRfq(rfq: any): void {
    this.state.notify(`RFQ ${rfq.id} updated.`);
  }

  deleteRfq(id: string): void {
    this.rfqsList = this.rfqsList.filter(r => r.id !== id);
    this.state.notify(`RFQ ${id} deleted.`);
  }

  exportRfqs(): void {
    this.state.notify('Exporting RFQ summary log (Excel format)...');
  }
}
