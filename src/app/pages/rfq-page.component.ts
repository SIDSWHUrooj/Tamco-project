import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

@Component({
  selector: 'app-rfq-page',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading
      eyebrow="Sourcing & e-Bidding"
      [title]="role()==='vendor' ? 'Open Quotations & RFQ Bidding' : 'RFQ Sourcing & Event Management'"
      [subtitle]="role()==='vendor' ? 'View and bid on qualified RFQs matching your approved categories. Submit prices and lead times.' : 'Publish tenders, invite verified suppliers, review competitive quotations and award contracts.'">
      <div class="heading-actions">
        @if (role() !== 'vendor') {
          <button class="btn" (click)="showNewRfqForm = !showNewRfqForm">
            {{ showNewRfqForm ? '✕ Close Form' : '+ Publish New RFQ' }}
          </button>
        }
        <button class="btn secondary" (click)="exportRfqs()">Export RFQ Log</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total RFQs</span>
        <strong>{{ rfqsList.length }}</strong>
        <small>Total sourcing events</small>
      </div>
      <div class="stat-card">
        <span>Active / Open</span>
        <strong style="color: #16855b;">{{ activeCount() }}</strong>
        <small>Accepting supplier bids</small>
      </div>
      <div class="stat-card">
        <span>Pending Evaluation</span>
        <strong style="color: #b56b05;">{{ evaluatingCount() }}</strong>
        <small>Under commercial review</small>
      </div>
    </section>

    <!-- Publish New RFQ Panel (Procurement / Admin) -->
    @if (showNewRfqForm && role() !== 'vendor') {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Publish New Request for Quotation (RFQ)</h2>
            <p>Define tender details, category scope, estimated budget and closing deadline.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>RFQ Reference # *<input [(ngModel)]="newRfq.id" placeholder="e.g. RFQ-2026-089" /></label>
          <label>RFQ Title / Description *<input [(ngModel)]="newRfq.title" placeholder="e.g. 11kV Gas-Insulated Switchgear Supply" /></label>
          <label>Purchasing Category *
            <select [(ngModel)]="newRfq.category" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="IT & Hardware">IT & Hardware</option>
            </select>
          </label>
          <label>Estimated Budget ($) *<input type="number" [(ngModel)]="newRfq.budget" placeholder="50000" /></label>
          <label>Required Delivery / Days *<input type="number" [(ngModel)]="newRfq.deliveryDays" placeholder="7" /></label>
          <label>Submission Deadline *<input type="date" [(ngModel)]="newRfq.deadline" /></label>
          <label class="span-2">Technical Specification Details<input [(ngModel)]="newRfq.specs" placeholder="Detailed engineering requirements..." /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetRfqForm()">Reset</button>
          <button class="btn" (click)="createRfq()">Publish Tender</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search RFQs by title, code or category..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="categoryFilter"
      >
        <option value="">All Categories</option>
        <option value="Electrical">Electrical</option>
        <option value="Mechanical">Mechanical</option>
        <option value="Safety Equipment">Safety Equipment</option>
        <option value="Raw Materials">Raw Materials</option>
      </select>
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
        <article class="panel rfq-card">
          <div class="panel-title">
            <div>
              <span class="mono">{{ rfq.id }}</span>
              <app-status [text]="rfq.status" [good]="rfq.status==='Open'" [warn]="rfq.status==='Under Evaluation'" [bad]="rfq.status==='Closed'" />
            </div>
          </div>

          <div class="form-grid" style="margin-top: 8px;">
            <label>RFQ Title<input [(ngModel)]="rfq.title" /></label>
            <label>Category<input [(ngModel)]="rfq.category" /></label>
            <label>Budget ($)<input type="number" [(ngModel)]="rfq.budget" /></label>
            <label>Deadline<input type="date" [(ngModel)]="rfq.deadline" /></label>
            <label>Delivery (Days)<input type="number" [(ngModel)]="rfq.deliveryDays" /></label>
            <label>Bids Submitted<input type="number" [(ngModel)]="rfq.bidsCount" /></label>
          </div>

          @if (role() === 'vendor') {
            <!-- Vendor Quotation Submission Box -->
            <div class="vendor-bid-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 10px;">
              <h4 style="margin: 0 0 8px; font-size: 11px; color: #17263c;">Submit Your Commercial Bid</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <label style="font-size: 10.5px; font-weight: 600;">Quoted Price ($) *
                  <input type="number" [(ngModel)]="rfq.myBidPrice" placeholder="Enter quote ($)" style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 5px; font-size: 11px;" />
                </label>
                <label style="font-size: 10.5px; font-weight: 600;">Committed Lead Time (Days) *
                  <input type="number" [(ngModel)]="rfq.myBidDays" placeholder="Days" style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 5px; font-size: 11px;" />
                </label>
              </div>
              <div class="toolbar" style="margin-top: 8px;">
                <button class="btn small" (click)="submitBid(rfq)">Submit Official Quotation</button>
              </div>
            </div>
          } @else {
            <!-- Procurement Controls -->
            <div class="toolbar" style="margin-top: 10px; justify-content: space-between;">
              <div style="display: flex; gap: 6px;">
                <button class="btn small" (click)="evaluateRfq(rfq)">Evaluate Bids</button>
                <button class="btn small ghost" (click)="saveRfq(rfq)">Save</button>
              </div>
              <button class="btn small danger-btn" (click)="deleteRfq(rfq.id)">Delete</button>
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

  filteredRfqs = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = this.categoryFilter;
    return this.rfqsList.filter(r => {
      const matchQuery = !q || r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      const matchCat = !cat || r.category === cat;
      return matchQuery && matchCat;
    });
  });

  activeCount = computed(() => this.rfqsList.filter(r => r.status === 'Open').length);
  evaluatingCount = computed(() => this.rfqsList.filter(r => r.status === 'Under Evaluation').length);

  createRfq(): void {
    if (!this.newRfq.id || !this.newRfq.title) {
      this.state.notify('Error: RFQ reference number and title are required.');
      return;
    }
    const created = { ...this.newRfq, status: 'Open', bidsCount: 0 };
    this.rfqsList = [created, ...this.rfqsList];
    this.state.notify(`RFQ "${created.id} - ${created.title}" published.`);
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
