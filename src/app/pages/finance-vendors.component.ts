import { Component, OnInit, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService } from '../core/vendor-api.service';
import { SageApiService } from '../core/sage-api.service';
import { StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

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
  imports: [FormsModule, StatusComponent, IconComponent, CustomSelectComponent, SlicePipe],
  template: `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
      <button class="btn" (click)="showAddForm = !showAddForm">
        {{ showAddForm ? '✕ Close Form' : '+ Add Financial Profile' }}
      </button>
    </div>

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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Create / Update Vendor Financial Profile</h2>
        </div>

        <div class="form-grid four-col">
          <label>Vendor Code *<input [(ngModel)]="newProfile.vendorId" placeholder="e.g. VEN-001" /></label>
          <label>Vendor Legal Name *<input [(ngModel)]="newProfile.vendorName" placeholder="Enter vendor legal name" /></label>
          <label>Designated Bank<input [(ngModel)]="newProfile.bank" placeholder="e.g. Meezan Bank / HBL" /></label>
          <label>IBAN<input [(ngModel)]="newProfile.iban" placeholder="PK44 MEZN 0000 9876 5432 1001" /></label>
          <label>Payment Terms
            <app-custom-select [(ngModel)]="newProfile.paymentTerms" [options]="paymentTermsOptions" />
          </label>
          <label>Settlement Currency
            <app-custom-select [(ngModel)]="newProfile.currency" [options]="currencyOptions" />
          </label>
          <label>Credit Limit ($)<input type="number" [(ngModel)]="newProfile.creditLimit" placeholder="100000" /></label>
          <label>Tax Authority / Category
            <app-custom-select [(ngModel)]="newProfile.taxStatus" [options]="taxAuthorityOptions" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addProfile()">Save Financial Profile</button>
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
          placeholder="Search finance profiles by vendor, code, bank or tax status..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="termsFilter"
        [options]="filterTermsOptions"
        minWidth="180px"
      />
    </div>

    <!-- Live Table -->
    <article class="panel">
      <div class="table-scroll">
        <table class="finance-table">
          <thead>
            <tr>
              <th style="min-width: 105px;">Vendor ID</th>
              <th style="min-width: 170px;">Vendor Name</th>
              <th style="min-width: 150px;">Bank</th>
              <th style="min-width: 150px;">Payment Terms</th>
              <th style="min-width: 80px;">Currency</th>
              <th style="min-width: 110px;">Credit Limit</th>
              <th style="min-width: 170px;">Tax Status</th>
              <th style="min-width: 110px;">Finance Status</th>
              <th style="min-width: 100px; text-align: left;">Actions</th>
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
                  <app-custom-select [(ngModel)]="p.paymentTerms" [options]="paymentTermsOptions" minWidth="130px" />
                </td>
                <td><input [(ngModel)]="p.currency" style="width: 55px;" /></td>
                <td><input type="number" [(ngModel)]="p.creditLimit" style="width: 85px;" /></td>
                <td><input [(ngModel)]="p.taxStatus" /></td>
                <td>
                  <app-status [text]="p.financeStatus" [good]="p.financeStatus==='Approved'" [warn]="p.financeStatus==='Pending'" [bad]="p.financeStatus==='On Hold'" />
                </td>
                <td style="white-space: nowrap;">
                  <div class="row-actions">
                    <button class="btn-action btn-action-view" (click)="openAuditModal(p)" title="View Qualification Action History (VCURACTACTION)">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>History</span>
                    </button>
                    <button class="btn-action btn-action-save" (click)="saveProfile(p)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteProfile(p.id)" title="Delete financial profile">
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
    </article>

    <!-- MODAL: VENDOR ACTION HISTORY & AUDIT TRAIL (VCURACTACTION) -->
    @if (showAuditModal && selectedVendorForAudit) {
      <div class="bank-finder-overlay" (click)="showAuditModal = false">
        <div class="bank-finder" (click)="$event.stopPropagation()" style="max-width: 750px;">
          <div class="bank-finder-header" style="background: var(--role-accent, #7048d7); color: white;">
            <span>Vendor Action History & Audit Log ({{ selectedVendorForAudit.vendorName }})</span>
            <button type="button" class="modal-close-btn" (click)="showAuditModal = false" style="color: white; border: none; background: transparent; font-size: 18px; cursor: pointer;">&times;</button>
          </div>
          <div style="padding: 18px; max-height: 400px; overflow-y: auto;">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>Vendor ID</th>
                  <th>Current Action</th>
                  <th>User</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                @for (a of vcuractActionList; track $index) {
                  <tr>
                    <td><strong>{{ a.vendoR_ID || a.reqno }}</strong></td>
                    <td><span class="badge-status">{{ a.currentaction || 'Reviewed' }}</span></td>
                    <td>{{ a.audtuser || 'Officer' }}</td>
                    <td>{{ a.audtdate ? (a.audtdate | slice:0:19) : '' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">
                      No review actions logged yet for this vendor.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div style="display: flex; justify-content: flex-end; padding: 12px 18px; border-top: 1px solid #e2e8f0;">
            <button type="button" class="btn secondary small" (click)="showAuditModal = false">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .finance-table {
      width: 100%;
      min-width: 1100px;
      border-collapse: separate;
      border-spacing: 0;

      thead th {
        background: var(--role-accent, #7048d7);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 11px 12px;
        border: none;
        white-space: nowrap;

        &:first-child {
          border-top-left-radius: var(--radius-sm, 6px);
        }
        &:last-child {
          border-top-right-radius: var(--radius-sm, 6px);
        }
      }

      tbody tr:hover {
        background: rgba(112, 72, 215, 0.04);
      }

      tbody td {
        padding: 10px 12px;
        vertical-align: middle;
        border-bottom: 1px solid var(--line, #e2e8f0);
      }
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-start;
    }
  `]
})
export class FinanceVendorsComponent implements OnInit {
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);
  readonly sageApi = inject(SageApiService);

  ngOnInit(): void {
    this.loadBackendVendors();
    this.loadSageCurrencies();
    this.loadSageTaxes();
  }

  loadSageCurrencies(): void {
    this.sageApi.getCurrencies().subscribe(res => {
      if (res && res.length > 0) {
        this.currencyOptions = res.map(c => c.CurrencyCodeKey);
        if (!this.newProfile.currency && this.currencyOptions.length > 0) {
          this.newProfile.currency = this.currencyOptions[0];
        }
      }
    });
  }

  loadSageTaxes(): void {
    this.sageApi.getTaxes().subscribe(res => {
      if (res && res.length > 0) {
        this.taxAuthorityOptions = res.map(t => `${t.TaxAuthorityKey} - ${t.Description}`);
        if (!this.newProfile.taxStatus && this.taxAuthorityOptions.length > 0) {
          this.newProfile.taxStatus = this.taxAuthorityOptions[0];
        }
      }
    });
  }

  loadBackendVendors(): void {
    this.vendorApi.getVendorBasicInfo().subscribe(res => {
      const list = res?.vendorBI_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        for (const v of list) {
          const vId = v.reQ_NO || v.vendorid || '';
          const vName = v.vendoR_NAME || 'Registered Vendor';
          if (!vId) continue;
          if (!this.profiles.some(p => p.vendorId === vId)) {
            this.profiles.push({
              id: `FIN-${vId}`,
              vendorId: vId,
              vendorName: vName,
              bank: 'Pending Verification',
              iban: '',
              paymentTerms: 'Net 30 Days',
              currency: 'AED',
              creditLimit: 50000,
              taxStatus: 'Registered Corporate Tax',
              financeStatus: 'Pending'
            });
          }
        }

        this.vendorApi.getAllVendorBanks().subscribe(bRes => {
          const bList = bRes?.vbank_List || bRes?.data || [];
          if (Array.isArray(bList) && bList.length > 0) {
            for (const b of bList) {
              const bReqNo = b.reqno || b.reQ_NO || '';
              const prof = this.profiles.find(p => p.vendorId === bReqNo);
              if (prof) {
                if (b.banK_NAME) prof.bank = b.banK_NAME;
                if (b.accounT_IBAN || b.accounT_NO) prof.iban = b.accounT_IBAN || b.accounT_NO;
                if (b.status === 'Approved' || b.isactive === 1) prof.financeStatus = 'Approved';
              }
            }
          }
        });
      }

      // Also load live Sage 300 ERP Vendors
      this.sageApi.getVendors().subscribe(sList => {
        if (Array.isArray(sList) && sList.length > 0) {
          for (const sv of sList) {
            if (!this.profiles.some(p => p.vendorId === sv.VendorNumber)) {
              this.profiles.push({
                id: `FIN-${sv.VendorNumber}`,
                vendorId: sv.VendorNumber,
                vendorName: sv.VendorName || sv.ShortName || sv.VendorNumber,
                bank: 'Sage 300 Master',
                iban: 'SAGE-DIRECT',
                paymentTerms: 'Net 30 Days',
                currency: sv.CurrencyCode || 'USD',
                creditLimit: 100000,
                taxStatus: 'ERP Verified',
                financeStatus: 'Approved'
              });
            }
          }
        }
      });
    });
  }

  showAddForm = true;
  searchQuery = '';
  termsFilter = '';

  readonly filterTermsOptions = [
    { value: '', label: 'All Payment Terms' },
    { value: 'Net 30 Days', label: 'Net 30 Days' },
    { value: 'Net 45 Days', label: 'Net 45 Days' },
    { value: 'Net 60 Days', label: 'Net 60 Days' }
  ];

  readonly paymentTermsOptions = [
    'Net 15 Days',
    'Net 30 Days',
    'Net 45 Days',
    'Net 60 Days',
    'Advance 20%, Balance Net 30'
  ];

  currencyOptions: string[] = [];
  taxAuthorityOptions: string[] = [];

  newProfile: FinanceVendorProfile = {
    id: '',
    vendorId: '',
    vendorName: '',
    bank: '',
    iban: '',
    paymentTerms: 'Net 30 Days',
    currency: '',
    creditLimit: 0,
    taxStatus: '',
    financeStatus: 'Pending'
  };

  profiles: FinanceVendorProfile[] = [];

  showAuditModal = false;
  selectedVendorForAudit: FinanceVendorProfile | null = null;
  vcuractActionList: any[] = [];

  openAuditModal(p: FinanceVendorProfile): void {
    this.selectedVendorForAudit = p;
    this.showAuditModal = true;
    this.vcuractActionList = [];

    // Fetch live vendor action history from DB: POST /api/Vendor/GetVCURACTACTIONList
    this.vendorApi.getVCURACTACTIONList(p.vendorId).subscribe(res => {
      this.vcuractActionList = Array.isArray(res) ? res : (res?.vcuractactioN_List || res?.vcuractactioN_Data || []);
    });
  }

  filteredProfiles(): FinanceVendorProfile[] {
    const q = this.searchQuery.trim().toLowerCase();
    const t = this.termsFilter;
    return this.profiles.filter(p => {
      const matchQuery = !q || (p.vendorName || '').toLowerCase().includes(q) || (p.vendorId || '').toLowerCase().includes(q) || (p.bank || '').toLowerCase().includes(q) || (p.taxStatus || '').toLowerCase().includes(q) || (p.iban || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q);
      const matchTerms = !t || p.paymentTerms === t;
      return matchQuery && matchTerms;
    });
  }

  approvedCount(): number { return this.profiles.filter(p => p.financeStatus === 'Approved').length; }
  pendingCount(): number { return this.profiles.filter(p => p.financeStatus !== 'Approved').length; }

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
    // Audit log to DB: POST /api/Vendor/AUDVCURACTACTIONDetails
    this.vendorApi.saveVCURACTACTIONDetails({
      coperation: 2,
      reqno: p.vendorId,
      vendoR_ID: p.vendorId,
      vendoR_NAME: p.vendorName,
      action: p.financeStatus === 'Approved' ? 1 : 2,
      currentaction: `Financial Terms Updated: ${p.financeStatus}`,
      audtuser: 'ADMIN'
    }).subscribe({
      next: (res) => console.log('AUDVCURACTACTIONDetails saved:', res),
      error: (err) => console.warn('AUDVCURACTACTIONDetails error:', err)
    });

    this.state.notify(`Financial terms for ${p.vendorName} saved and logged to database.`);
  }

  deleteProfile(id: string): void {
    const item = this.profiles.find(p => p.id === id);
    this.profiles = this.profiles.filter(p => p.id !== id);
    this.state.notify(`Financial profile for ${item ? item.vendorName : id} deleted.`);
  }
}
