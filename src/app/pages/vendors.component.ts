import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { Vendor } from '../core/models';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Procurement control" title="Vendor Management & Verification" subtitle="Pre-qualify vendors, evaluate commercial capability, review documents and approve eligible categories.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Close Form' : '+ Add New Vendor' }}
        </button>
        <button class="btn secondary" (click)="exportList()">Export Excel</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Registered Vendors</span>
        <strong>{{ vendorsList.length }}</strong>
        <small>Active in master directory</small>
      </div>
      <div class="stat-card">
        <span>Pending Procurement</span>
        <strong style="color: #b56b05;">{{ pendingCount() }}</strong>
        <small>Requires capability audit</small>
      </div>
      <div class="stat-card">
        <span>Fully Approved</span>
        <strong style="color: #16855b;">{{ approvedCount() }}</strong>
        <small>Eligible for RFQs & Bidding</small>
      </div>
    </section>

    <!-- Add New Vendor Form Panel -->
    @if (showAddForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Register & Onboard New Vendor</h2>
        </div>

        <div class="form-grid">
          <label>Company Legal Name *<input [(ngModel)]="newVendor.name" placeholder="Enter company legal name" /></label>
          <label>Vendor Code *<input [(ngModel)]="newVendor.id" placeholder="e.g. VEN-10024" /></label>
          <label>Location / City *<input [(ngModel)]="newVendor.location" placeholder="e.g. Karachi / Lahore / Islamabad" /></label>
          <label>Primary Categories (comma separated) *<input [(ngModel)]="categoriesInput" placeholder="e.g. Electrical, Mechanical" /></label>
          <label>Assigned Bank<input [(ngModel)]="newVendor.bank" placeholder="e.g. HBL / Meezan Bank" /></label>
          <label>Initial Quality Pass %<input type="number" [(ngModel)]="newVendor.qcPass" placeholder="e.g. 95" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetNewVendorForm()">Reset</button>
          <button class="btn" (click)="addVendor()">Save & Add Vendor</button>
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
          placeholder="Search vendor by name, code, or location..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="categoryFilter"
        [options]="categoryFilterOptions"
        minWidth="170px"
      />
    </div>

    <!-- Live Vendor Table -->
    <article class="panel">
      <div class="table-scroll">
        <table class="vendor-table">
          <thead>
            <tr>
              <th style="width: 105px;">Vendor ID</th>
              <th style="min-width: 180px;">Company Name</th>
              <th style="min-width: 120px;">Location</th>
              <th style="min-width: 200px;">Approved Categories</th>
              <th style="min-width: 150px;">Bank</th>
              <th style="width: 115px;">Procurement</th>
              <th style="width: 115px;">Finance</th>
              <th style="width: 155px;">Score / QC</th>
              <th style="width: 205px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredVendors().length === 0) {
              <tr>
                <td colspan="9" style="text-align: center; color: #94a3b8; padding: 28px;">
                  No vendor records found. Click "<strong>+ Add New Vendor</strong>" above to add your first vendor.
                </td>
              </tr>
            }
            @for (v of filteredVendors(); track v.id; let idx = $index) {
              <tr>
                <td><span class="mono">{{ v.id }}</span></td>
                <td><input [(ngModel)]="v.name" class="table-cell-input" style="font-weight: 600;" /></td>
                <td><input [(ngModel)]="v.location" class="table-cell-input" /></td>
                <td><input [value]="v.categories.join(', ')" (input)="updateCategories(v, $any($event.target).value)" class="table-cell-input" /></td>
                <td><input [(ngModel)]="v.bank" class="table-cell-input" /></td>
                <td>
                  <app-status [text]="v.procurementStatus" [good]="v.procurementStatus==='Approved'" [warn]="v.procurementStatus==='Pending'" />
                </td>
                <td>
                  <app-status [text]="v.financeStatus" [good]="v.financeStatus==='Approved'" [warn]="v.financeStatus==='Pending'" />
                </td>
                <td style="white-space: nowrap;">
                  <div class="score-qc-group">
                    <div class="score-pill" title="Vendor Star Rating (1.0 - 5.0)">
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        [(ngModel)]="v.rating"
                        class="score-input"
                        aria-label="Vendor Star Rating"
                      />
                      <span class="star-icon">★</span>
                    </div>
                    <div class="score-pill" title="QC Pass Percentage (0% - 100%)">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        [(ngModel)]="v.qcPass"
                        class="score-input"
                        aria-label="QC Pass Percentage"
                      />
                      <span class="percent-icon">%</span>
                    </div>
                  </div>
                </td>
                <td style="white-space: nowrap;">
                  <div class="action-buttons-wrap">
                    @if (v.procurementStatus === 'Pending') {
                      <button
                        class="btn-action btn-action-approve"
                        (click)="toggleProcurementApproval(v.id)"
                        title="Click to Approve Procurement Verification"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Approve</span>
                      </button>
                    } @else {
                      <button
                        class="btn-action btn-action-approved"
                        (click)="toggleProcurementApproval(v.id)"
                        title="Approved (Click to Revoke Approval)"
                      >
                        <svg class="icon-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <svg class="icon-revoke" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        <span class="text-approved">Approved</span>
                        <span class="text-revoke">Revoke</span>
                      </button>
                    }

                    <button class="btn-action btn-action-save" (click)="saveVendor(v)" title="Save & Update Vendor Record">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      <span>Update</span>
                    </button>

                    <button class="btn-action btn-action-delete" (click)="deleteVendor(v.id)" title="Delete Vendor">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `,
  styles: [`
    .vendor-table {
      min-width: 1200px;
      width: 100%;
    }

    .table-cell-input {
      width: 100%;
      height: 32px;
      padding: 5px 10px;
      font-size: 12.5px;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      background: #ffffff;
      color: var(--text, #0f172a);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      box-sizing: border-box;

      &:focus {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 2px var(--role-soft, rgba(37, 99, 235, 0.14));
      }
    }

    .score-qc-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .score-pill {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      padding: 3px 6px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:focus-within {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 2px var(--role-soft, rgba(37, 99, 235, 0.14));
      }

      .score-input {
        width: 36px !important;
        height: 22px !important;
        padding: 0 !important;
        border: none !important;
        background: transparent !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        color: var(--text, #0f172a) !important;
        text-align: center !important;
        outline: none !important;
        box-shadow: none !important;
        -moz-appearance: textfield;

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }

      .star-icon {
        color: #f59e0b;
        font-size: 13px;
        line-height: 1;
        user-select: none;
      }

      .percent-icon {
        color: #64748b;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        user-select: none;
      }
    }

    .action-buttons-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-start;
    }
  `]
})
export class VendorsComponent {
  readonly state = inject(PortalStateService);

  showAddForm = true;
  searchQuery = '';
  categoryFilter = '';

  readonly categoryFilterOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Mechanical', label: 'Mechanical' },
    { value: 'Safety Equipment', label: 'Safety Equipment' },
    { value: 'IT & Hardware', label: 'IT & Hardware' },
    { value: 'Raw Materials', label: 'Raw Materials' }
  ];

  newVendor: Vendor = {
    id: 'VEN-10028',
    name: 'Horizon Power Systems',
    location: 'Islamabad',
    categories: ['Electrical', 'IT & Hardware'],
    procurementStatus: 'Pending',
    financeStatus: 'Pending',
    bank: 'Meezan Bank',
    rating: 4.6,
    onTime: 94,
    qcPass: 97
  };
  categoriesInput = 'Electrical, IT & Hardware';

  vendorsList: Vendor[] = [
    { id: 'VEN-10024', name: 'ABC Supplies Pvt. Ltd.', location: 'Karachi', categories: ['Electrical', 'Safety Equipment'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'Habib Bank Limited', rating: 4.8, onTime: 96, qcPass: 98 },
    { id: 'VEN-10025', name: 'Global Traders', location: 'Lahore', categories: ['Raw Materials', 'Mechanical'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'MCB Bank', rating: 4.4, onTime: 91, qcPass: 94 },
    { id: 'VEN-10026', name: 'Perfect Industrial', location: 'Karachi', categories: ['Mechanical'], procurementStatus: 'Approved', financeStatus: 'Pending', bank: 'Allied Bank', rating: 4.2, onTime: 88, qcPass: 92 },
    { id: 'VEN-10027', name: 'Tech Solutions', location: 'Islamabad', categories: ['IT & Hardware'], procurementStatus: 'Pending', financeStatus: 'Pending', bank: 'HBL', rating: 4.0, onTime: 85, qcPass: 90 }
  ];

  filteredVendors(): Vendor[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = this.categoryFilter;
    return this.vendorsList.filter(v => {
      const matchQuery = !q ||
        (v.name || '').toLowerCase().includes(q) ||
        (v.id || '').toLowerCase().includes(q) ||
        (v.location || '').toLowerCase().includes(q) ||
        (v.bank || '').toLowerCase().includes(q) ||
        (v.categories || []).some(c => (c || '').toLowerCase().includes(q));
      const matchCat = !cat || (v.categories || []).includes(cat);
      return matchQuery && matchCat;
    });
  }

  pendingCount(): number {
    return this.vendorsList.filter(v => v.procurementStatus === 'Pending').length;
  }

  approvedCount(): number {
    return this.vendorsList.filter(v => v.procurementStatus === 'Approved' && v.financeStatus === 'Approved').length;
  }

  addVendor(): void {
    if (!this.newVendor.name || !this.newVendor.id) {
      this.state.notify('Error: Company name and vendor code are required.');
      return;
    }
    const categories = this.categoriesInput.split(',').map(s => s.trim()).filter(Boolean);
    const added: Vendor = { ...this.newVendor, categories: categories.length ? categories : ['General'] };
    this.vendorsList = [added, ...this.vendorsList];
    this.state.notify(`Vendor "${added.name}" registered successfully.`);
    this.resetNewVendorForm();
  }

  resetNewVendorForm(): void {
    this.newVendor = {
      id: `VEN-100${Math.floor(29 + Math.random() * 20)}`,
      name: 'Horizon Power Systems',
      location: 'Islamabad',
      categories: ['Electrical', 'IT & Hardware'],
      procurementStatus: 'Pending',
      financeStatus: 'Pending',
      bank: 'Meezan Bank',
      rating: 4.6,
      onTime: 94,
      qcPass: 97
    };
    this.categoriesInput = 'Electrical, IT & Hardware';
  }

  updateCategories(v: Vendor, rawVal: string): void {
    v.categories = rawVal.split(',').map(s => s.trim()).filter(Boolean);
  }

  approveVendor(id: string): void {
    this.toggleProcurementApproval(id);
  }

  toggleProcurementApproval(id: string): void {
    const v = this.vendorsList.find(item => item.id === id);
    if (!v) return;
    const nextStatus = v.procurementStatus === 'Approved' ? 'Pending' : 'Approved';
    this.vendorsList = this.vendorsList.map(item =>
      item.id === id ? { ...item, procurementStatus: nextStatus } : item
    );
    if (nextStatus === 'Approved') {
      this.state.notify(`Procurement verification approved for vendor ${v.name} (${id}).`);
    } else {
      this.state.notify(`Procurement verification revoked (reverted to Pending) for vendor ${v.name} (${id}).`);
    }
  }

  saveVendor(v: Vendor): void {
    this.state.notify(`Vendor details for "${v.name}" updated successfully.`);
  }

  deleteVendor(id: string): void {
    const item = this.vendorsList.find(v => v.id === id);
    this.vendorsList = this.vendorsList.filter(v => v.id !== id);
    this.state.notify(`Vendor ${item ? item.name : id} removed.`);
  }

  exportList(): void {
    this.state.notify('Exporting vendor register (Excel format)...');
  }
}
