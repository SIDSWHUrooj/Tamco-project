import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface BidderItem {
  id: string;
  vendor: string;
  price: number;
  location: string;
  deliveryDays: number;
  historyScore: number;
  technicalCompliant: boolean;
  warrantyMonths: number;
}

@Component({
  selector: 'app-bid-comparison',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Strategic sourcing" title="Commercial & Technical Bid Comparison" subtitle="Evaluate multiple supplier quotations using multi-criteria weighted scoring (Commercial, Delivery, Quality and Location).">
      <div class="heading-actions">
        <button class="btn" (click)="showAddBidder = !showAddBidder">
          {{ showAddBidder ? '✕ Close Form' : '+ Add Bidder Quote' }}
        </button>
        <button class="btn secondary" (click)="exportComparison()">Export Analysis</button>
      </div>
    </app-page-heading>

    <!-- RFQ Selection Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: center; background: #fff; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; flex-wrap: wrap;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">Select Active RFQ:</span>
      @for (rfq of state.rfqs(); track rfq.id) {
        <button
          type="button"
          class="btn small"
          [class.secondary]="selectedRfqId !== rfq.id"
          (click)="selectRfq(rfq.id)"
        >
          {{ rfq.id }} · {{ rfq.title }}
        </button>
      }
    </div>

    <!-- Add Bidder Form Panel -->
    @if (showAddBidder) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Add Supplier Commercial Offer</h2>
        </div>

        <div class="form-grid">
          <label>Supplier / Vendor Legal Name *<input [(ngModel)]="newBidder.vendor" placeholder="e.g. Siemens Pakistan" /></label>
          <label>Total Quoted Price ($) *<input type="number" [(ngModel)]="newBidder.price" placeholder="50000" /></label>
          <label>Supply / Delivery Days *<input type="number" [(ngModel)]="newBidder.deliveryDays" placeholder="7" /></label>
          <label>Factory / Dispatch City<input [(ngModel)]="newBidder.location" placeholder="e.g. Karachi / Lahore" /></label>
          <label>Historical Quality Score (0-100)<input type="number" [(ngModel)]="newBidder.historyScore" placeholder="92" /></label>
          <label>Warranty Period (Months)<input type="number" [(ngModel)]="newBidder.warrantyMonths" placeholder="12" /></label>
        </div>

        <div class="toolbar" style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 16px;">
          <button class="btn secondary" (click)="resetBidderForm()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span>Reset</span>
          </button>
          <button class="btn" (click)="addBidder()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Add to Comparison</span>
          </button>
        </div>
      </article>
    }

    <!-- Weight Factors Customizer -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; gap: 20px; align-items: center; font-size: 11px; flex-wrap: wrap;">
      <span style="font-weight: 700; color: #1e293b;">Scoring Weights:</span>
      <label style="display: flex; gap: 6px; align-items: center;">Price Weight: <input type="number" [(ngModel)]="priceWeight" style="width: 50px; padding: 3px 6px; border: 1px solid #cbd5e1; border-radius: 4px;" /> %</label>
      <label style="display: flex; gap: 6px; align-items: center;">Delivery Weight: <input type="number" [(ngModel)]="deliveryWeight" style="width: 50px; padding: 3px 6px; border: 1px solid #cbd5e1; border-radius: 4px;" /> %</label>
      <label style="display: flex; gap: 6px; align-items: center;">Quality Weight: <input type="number" [(ngModel)]="qualityWeight" style="width: 50px; padding: 3px 6px; border: 1px solid #cbd5e1; border-radius: 4px;" /> %</label>
      <button class="btn small ghost" style="margin-left: auto;" (click)="state.notify('Scoring weights re-calculated.')">Apply Weights</button>
    </div>

    <!-- Comparative Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Supplier Name</th>
              <th>Price (USD)</th>
              <th>Delivery Days</th>
              <th>Location</th>
              <th>History (QC)</th>
              <th>Warranty</th>
              <th>Weighted Score</th>
              <th>Recommendation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (b of sortedBidders(); track b.id; let idx = $index) {
              <tr [class.highlight]="idx === 0">
                <td><strong style="font-size: 13px;">#{{ idx + 1 }}</strong></td>
                <td><input [(ngModel)]="b.vendor" style="font-weight: 600;" /></td>
                <td><input type="number" [(ngModel)]="b.price" style="width: 85px;" /></td>
                <td><input type="number" [(ngModel)]="b.deliveryDays" style="width: 60px;" /> d</td>
                <td><input [(ngModel)]="b.location" style="width: 90px;" /></td>
                <td><input type="number" [(ngModel)]="b.historyScore" style="width: 60px;" /> %</td>
                <td><input type="number" [(ngModel)]="b.warrantyMonths" style="width: 55px;" /> mo</td>
                <td><strong style="color: var(--role-accent, #2563eb); font-size: 13px;">{{ score(b) }} / 100</strong></td>
                <td>
                  <app-status [text]="idx===0 ? '🏆 Recommended' : 'Review'" [good]="idx===0" [warn]="idx!==0" />
                </td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-save" (click)="saveBidder(b)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteBidder(b.id)" title="Delete bidder">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="toolbar" style="display: flex; justify-content: flex-end; margin-top: 14px;">
        <button class="btn" (click)="awardBid()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Award Purchase Order to #1 Ranked Supplier</span>
        </button>
      </div>
    </article>
  `
})
export class BidComparisonComponent {
  readonly state = inject(PortalStateService);

  showAddBidder = false;
  selectedRfqId = 'RFQ-0061';

  priceWeight = 55;
  deliveryWeight = 25;
  qualityWeight = 20;

  newBidder: BidderItem = {
    id: 'BID-004',
    vendor: 'ABB Switchgear Pakistan',
    price: 49500,
    location: 'Karachi',
    deliveryDays: 6,
    historyScore: 95,
    technicalCompliant: true,
    warrantyMonths: 24
  };

  biddersList: BidderItem[] = [
    { id: 'BID-001', vendor: 'ABC Supplies Pvt. Ltd.', price: 52000, location: 'Karachi', deliveryDays: 8, historyScore: 94, technicalCompliant: true, warrantyMonths: 18 },
    { id: 'BID-002', vendor: 'Perfect Industrial Corporation', price: 54800, location: 'Karachi', deliveryDays: 6, historyScore: 91, technicalCompliant: true, warrantyMonths: 12 },
    { id: 'BID-003', vendor: 'Global Traders Sourcing', price: 56500, location: 'Lahore', deliveryDays: 10, historyScore: 88, technicalCompliant: true, warrantyMonths: 12 }
  ];

  selectRfq(id: string): void {
    this.selectedRfqId = id;
    this.state.notify(`Switched comparison view to ${id}.`);
  }

  score(b: BidderItem): number {
    const minPrice = Math.min(...this.biddersList.map(x => x.price));
    const priceScore = (minPrice / (b.price || 1)) * this.priceWeight;
    const deliveryScore = Math.max(0, 20 - b.deliveryDays) * (this.deliveryWeight / 15);
    const qualityScore = (b.historyScore / 100) * this.qualityWeight;
    const locationBonus = b.location.toLowerCase().includes('karachi') ? 4 : 2;
    return Math.min(100, Math.round(priceScore + deliveryScore + qualityScore + locationBonus));
  }

  sortedBidders = computed(() => {
    return [...this.biddersList].sort((a, b) => this.score(b) - this.score(a));
  });

  addBidder(): void {
    if (!this.newBidder.vendor || !this.newBidder.price) {
      this.state.notify('Error: Supplier Name and Price are required.');
      return;
    }
    const added: BidderItem = { ...this.newBidder, id: `BID-${Math.floor(100 + Math.random() * 900)}` };
    this.biddersList = [added, ...this.biddersList];
    this.state.notify(`Quotation for "${added.vendor}" added to comparison.`);
    this.resetBidderForm();
    this.showAddBidder = false;
  }

  resetBidderForm(): void {
    this.newBidder = {
      id: '',
      vendor: '',
      price: 50000,
      location: 'Karachi',
      deliveryDays: 7,
      historyScore: 90,
      technicalCompliant: true,
      warrantyMonths: 12
    };
  }

  saveBidder(b: BidderItem): void {
    this.state.notify(`Bid terms for ${b.vendor} updated.`);
  }

  deleteBidder(id: string): void {
    const item = this.biddersList.find(b => b.id === id);
    this.biddersList = this.biddersList.filter(b => b.id !== id);
    this.state.notify(`Bid entry for ${item ? item.vendor : id} removed.`);
  }

  awardBid(): void {
    const winner = this.sortedBidders()[0];
    if (winner) {
      this.state.notify(`RFQ ${this.selectedRfqId} officially awarded to ${winner.vendor} ($${winner.price.toLocaleString()}). PO draft generated.`);
    }
  }

  exportComparison(): void {
    this.state.notify('Exporting weighted bid comparison analysis (Excel)...');
  }
}
