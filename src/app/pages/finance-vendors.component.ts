import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface FinanceVendorProfile {
  id: string;
  vendorId: string;
  vendorName: string;
  bank: string;
  iban: string;
  paymentTerms: string;
  currency: string;
  creditLimit: number;
  taxStatus: string;
  financeStatus: 'Approved' | 'Pending' | 'On Hold';
}

@Component({
  selector: 'app-finance-vendors',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Accounts Payable Master" title="Vendors (Finance Master)" subtitle="Maintain financial profiles, payment terms, tax exemptions and credit limits for authorized vendors.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Close Form' : '+ Add Financial Profile' }}
        </button>
        <button class="btn secondary" (click)="exportList()">Export Master</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Finance Profiles</span>
        <strong>{{ profiles.length }}</strong>
        <small>Master payable accounts</small>
      </div>
      <div class="stat-card">
        <span>Payment Approved</span>
        <strong style="color: #16855b;">{{ approvedCount() }}</strong>
        <small>Active for disbursements</small>
      </div>
      <div class="stat-card">
        <span>Pending / On Hold</span>
        <strong style="color: #b56b05;">{{ pendingCount() }}</strong>
        <small>Awaiting tax/banking sign-off</small>
      </div>
    </section>

    <!-- Add Financial Profile Form -->
    @if (showAddForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #16855b;">
        <div class="panel-title">
          <div>
            <h2>Create / Update Vendor Financial Profile</h2>
            <p>Define commercial payment terms, currency agreements and tax parameters.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Vendor Code *<input [(ngModel)]="newProfile.vendorId" placeholder="e.g. VEN-10024" /></label>
          <label>Vendor Legal Name *<input [(ngModel)]="newProfile.vendorName" placeholder="Enter vendor legal name" /></label>
          <label>Designated Bank<input [(ngModel)]="newProfile.bank" placeholder="e.g. Meezan Bank / HBL" /></label>
          <label>IBAN<input [(ngModel)]="newProfile.iban" placeholder="PK44 MEZN 0000 9876 5432 1001" /></label>
          <label>Payment Terms
            <select [(ngModel)]="newProfile.paymentTerms" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Net 30 Days">Net 30 Days</option>
              <option value="Net 45 Days">Net 45 Days</option>
              <option value="Net 60 Days">Net 60 Days</option>
              <option value="Advance 20%, Balance Net 30">Advance 20%, Balance Net 30</option>
            </select>
          </label>
          <label>Settlement Currency
            <select [(ngModel)]="newProfile.currency" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="USD">USD ($)</option>
              <option value="PKR">PKR (Rs.)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (AED)</option>
            </select>
          </label>
          <label>Credit Limit ($)<input type="number" [(ngModel)]="newProfile.creditLimit" placeholder="100000" /></label>
          <label>Tax Withholding Category<input [(ngModel)]="newProfile.taxStatus" placeholder="e.g. Active Filer (4.5% WHT)" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addProfile()">Save Financial Profile</button>
        </div>
      </article>
    }

    <!-- Search & Filter -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search finance profiles by vendor, code, bank or tax status..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="termsFilter"
      >
        <option value="">All Payment Terms</option>
        <option value="Net 30 Days">Net 30 Days</option>
        <option value="Net 45 Days">Net 45 Days</option>
        <option value="Net 60 Days">Net 60 Days</option>
      </select>
    </div>

    <!-- Live Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Financial Terms & Payables Register</h2>
          <p>Commercial profiles mapped to ERP accounts payable system.</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Vendor Name</th>
              <th>Bank</th>
              <th>Payment Terms</th>
              <th>Currency</th>
              <th>Credit Limit</th>
              <th>Tax Status</th>
              <th>Finance Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredProfiles().length === 0) {
              <tr>
                <td colspan="9" style="text-align: center; color: #94a3b8; padding: 28px;">
                  No financial profiles found. Click "<strong>+ Add Financial Profile</strong>" to register vendor terms.
                </td>
              </tr>
            }
            @for (p of filteredProfiles(); track p.id) {
              <tr>
                <td><span class="mono">{{ p.vendorId }}</span></td>
                <td><input [(ngModel)]="p.vendorName" style="font-weight: 600;" /></td>
                <td><input [(ngModel)]="p.bank" /></td>
                <td>
                  <select [(ngModel)]="p.paymentTerms" style="border: 1px solid #dbe3ed; border-radius: 6px; padding: 4px;">
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 45 Days">Net 45 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </select>
                </td>
                <td><input [(ngModel)]="p.currency" style="width: 55px;" /></td>
                <td><input type="number" [(ngModel)]="p.creditLimit" style="width: 85px;" /></td>
                <td><input [(ngModel)]="p.taxStatus" /></td>
                <td>
                  <app-status [text]="p.financeStatus" [good]="p.financeStatus==='Approved'" [warn]="p.financeStatus==='Pending'" [bad]="p.financeStatus==='On Hold'" />
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn small ghost" (click)="saveProfile(p)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteProfile(p.id)">✕</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `
})
export class FinanceVendorsComponent {
  readonly state = inject(PortalStateService);

  showAddForm = true;
  searchQuery = '';
  termsFilter = '';

  newProfile: FinanceVendorProfile = {
    id: 'FIN-105',
    vendorId: 'VEN-10028',
    vendorName: 'Horizon Power Systems',
    bank: 'Meezan Bank',
    iban: 'PK12 MEZN 0000 4455 6677 8899',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    creditLimit: 120000,
    taxStatus: 'Active Filer (4.5% WHT)',
    financeStatus: 'Pending'
  };

  profiles: FinanceVendorProfile[] = [
    { id: 'FIN-101', vendorId: 'VEN-10024', vendorName: 'ABC Supplies Pvt. Ltd.', bank: 'Habib Bank Limited', iban: 'PK36 HABB 0000 1234 5678 9012', paymentTerms: 'Net 30 Days', currency: 'USD', creditLimit: 250000, taxStatus: 'Active Filer (4.5% WHT)', financeStatus: 'Approved' },
    { id: 'FIN-102', vendorId: 'VEN-10025', vendorName: 'Global Traders', bank: 'MCB Bank', iban: 'PK55 MUCB 0000 9988 7766 5544', paymentTerms: 'Net 45 Days', currency: 'USD', creditLimit: 180000, taxStatus: 'Active Filer (4.5% WHT)', financeStatus: 'Approved' },
    { id: 'FIN-103', vendorId: 'VEN-10026', vendorName: 'Perfect Industrial', bank: 'Allied Bank', iban: 'PK77 ABPA 0000 1122 3344 5566', paymentTerms: 'Net 30 Days', currency: 'USD', creditLimit: 90000, taxStatus: 'Non-Filer (7% WHT)', financeStatus: 'Pending' },
    { id: 'FIN-104', vendorId: 'VEN-10027', vendorName: 'Tech Solutions', bank: 'HBL', iban: 'PK21 HABB 0000 6677 8899 0011', paymentTerms: 'Net 15 Days', currency: 'USD', creditLimit: 75000, taxStatus: 'Active Filer (4.5% WHT)', financeStatus: 'On Hold' }
  ];

  filteredProfiles = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const t = this.termsFilter;
    return this.profiles.filter(p => {
      const matchQuery = !q || p.vendorName.toLowerCase().includes(q) || p.vendorId.toLowerCase().includes(q) || p.bank.toLowerCase().includes(q) || p.taxStatus.toLowerCase().includes(q);
      const matchTerms = !t || p.paymentTerms === t;
      return matchQuery && matchTerms;
    });
  });

  approvedCount = computed(() => this.profiles.filter(p => p.financeStatus === 'Approved').length);
  pendingCount = computed(() => this.profiles.filter(p => p.financeStatus !== 'Approved').length);

  addProfile(): void {
    if (!this.newProfile.vendorId || !this.newProfile.vendorName) {
      this.state.notify('Error: Vendor Code and Name are required.');
      return;
    }
    const added: FinanceVendorProfile = { ...this.newProfile, id: `FIN-${Math.floor(100 + Math.random() * 900)}` };
    this.profiles = [added, ...this.profiles];
    this.state.notify(`Finance profile for "${added.vendorName}" registered.`);
    this.resetForm();
  }

  resetForm(): void {
    this.newProfile = {
      id: `FIN-${Math.floor(100 + Math.random() * 900)}`,
      vendorId: 'VEN-10028',
      vendorName: 'Horizon Power Systems',
      bank: 'Meezan Bank',
      iban: 'PK12 MEZN 0000 4455 6677 8899',
      paymentTerms: 'Net 30 Days',
      currency: 'USD',
      creditLimit: 120000,
      taxStatus: 'Active Filer (4.5% WHT)',
      financeStatus: 'Pending'
    };
  }

  saveProfile(p: FinanceVendorProfile): void {
    this.state.notify(`Financial terms for ${p.vendorName} saved successfully.`);
  }

  deleteProfile(id: string): void {
    const item = this.profiles.find(p => p.id === id);
    this.profiles = this.profiles.filter(p => p.id !== id);
    this.state.notify(`Financial profile for ${item ? item.vendorName : id} deleted.`);
  }

  exportList(): void {
    this.state.notify('Exporting vendor financial register (Excel)...');
  }
}
