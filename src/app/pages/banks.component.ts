import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';
import { IconComponent } from '../shared/icon.component';

interface BankRecord {
  id: string;
  bankName: string;
  bankCode: string;
  beneficiaryBank: string;
  bankAddress: string;
  accountTitle: string;
  currency: string;
  country: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  routingNumber: string;
  sortCode: string;
  certificateName: string;
  issueDate: string;
}

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, CustomSelectComponent, CustomDatePickerComponent, IconComponent],
  styles: [`
    .bank-picker-input-wrap {
      display: flex;
      align-items: stretch;
      width: 100%;

      input {
        flex: 1;
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-right: none !important;
      }

      .bank-finder-inline-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        min-width: 44px;
        padding: 0;
        background: var(--role-accent, #50ae9b);
        color: #ffffff;
        border: 1px solid var(--role-accent, #50ae9b);
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
        border-top-right-radius: var(--radius-sm, 6px) !important;
        border-bottom-right-radius: var(--radius-sm, 6px) !important;
        cursor: pointer;
        transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          background: var(--role-accent-hover, #3d8e7e);
          border-color: var(--role-accent-hover, #3d8e7e);
          color: #ffffff;
        }

        &:active {
          transform: scale(0.96);
        }
      }
    }

    .readonly-input {
      background-color: #f8fafc !important;
      color: var(--text, #0f172a) !important;
      font-weight: 600;
      border-color: var(--line, #e2e8f0) !important;

      &.clickable {
        cursor: pointer;
        &:hover {
          border-color: var(--role-accent, #50ae9b) !important;
        }
      }
    }

    .bank-finder-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(2px);
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .bank-finder {
      width: min(920px, 100%);
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: var(--radius-md, 10px);
      overflow: hidden;
      box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.35);
      border: 1px solid var(--line, #e2e8f0);
    }

    .bank-finder-header {
      background: var(--navy, #0b1f3a);
      color: #ffffff;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font-size: 15px;
      font-weight: 700;

      .modal-close-btn {
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.75);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s ease, background 0.15s ease;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }
      }
    }

    .bank-finder-body {
      padding: 20px;
      overflow-y: auto;
    }

    .bank-finder-search-wrap {
      position: relative;
      margin-bottom: 14px;
      display: flex;
      align-items: center;

      .finder-search-icon {
        position: absolute;
        left: 12px;
        color: var(--muted, #64748b);
        display: inline-flex;
        pointer-events: none;
      }

      input {
        padding-left: 36px !important;
        height: 38px;
        border-radius: var(--radius-sm, 6px);
      }
    }

    .bank-finder-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: var(--radius-sm, 6px);
      overflow: hidden;

      thead th {
        background: var(--role-accent, #50ae9b);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 10px 14px;
        white-space: nowrap;
        border-bottom: 2px solid var(--role-accent-hover, #3d8e7e);
      }

      tbody tr {
        cursor: pointer;
        transition: background-color 0.15s ease;

        &:hover {
          background: var(--role-soft, #edf8f5);
        }

        &.selected {
          background: var(--role-soft, #edf8f5);
          font-weight: 600;
        }

        td {
          padding: 10px 14px;
          border-bottom: 1px solid var(--line, #e2e8f0);
          font-size: 12.5px;
          color: var(--text, #0f172a);
          vertical-align: middle;
        }

        &:last-child td {
          border-bottom: none;
        }
      }
    }

    .bank-finder-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid var(--line, #e2e8f0);
      background: #f8fafc;
    }
  `],
  template: `
    <app-page-heading eyebrow="Administration" title="Banks" subtitle="Manage vendor bank information, account details, currencies and bank certificates.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Close Form' : '+ Add Bank' }}
        </button>
        <button class="btn secondary" (click)="exportBanks()">Export Banks</button>
      </div>
    </app-page-heading>

    @if (showAddForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Register New Bank Account</h2>
        </div>
        <div class="form-grid four-col">
          <label>Currency *
            <app-custom-select [(ngModel)]="newBank.currency" [options]="currencyOptions" />
          </label>
          <label>Country *
            <app-custom-select [(ngModel)]="newBank.country" [options]="countryOptions" />
          </label>
          <label>Bank Name *<input [(ngModel)]="newBank.bankName" placeholder="Enter Bank Name" /></label>
          <label>Bank Code<input [(ngModel)]="newBank.bankCode" placeholder="Enter Bank Code" /></label>
          <label>Beneficiary Bank *<input [(ngModel)]="newBank.beneficiaryBank" /></label>
          <label>Bank Address *<input [(ngModel)]="newBank.bankAddress" /></label>
          <label>Title of Account (Legal Name) *<input [(ngModel)]="newBank.accountTitle" /></label>
          <label>Account No *<input [(ngModel)]="newBank.accountNumber" /></label>
          <label>Account IBAN *<input [(ngModel)]="newBank.iban" (blur)="validateIban()" /></label>
          <label>Swift Code *<input [(ngModel)]="newBank.swiftCode" /></label>
          <label>Routing Number<input [(ngModel)]="newBank.routingNumber" /></label>
          <label>Sort Code<input [(ngModel)]="newBank.sortCode" /></label>
          <label>Bank Certificate<input type="file" accept="application/pdf,image/*" (change)="onCertificateSelected($event)" /></label>
          <label>Bank Issue Date *
            <app-custom-date-picker [(ngModel)]="newBank.issueDate" />
          </label>
        </div>
        @if (ibanError) { <p style="color: #c90000; margin: 8px 0 0;">{{ ibanError }}</p> }
        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addBank()">Add Bank</button>
        </div>
      </article>
    }

    <article class="panel">
      <div class="form-grid four-col">
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--text);">Bank Name</label>
          <div class="bank-picker-input-wrap">
            <input [value]="selectedBank.bankName" readonly class="readonly-input clickable" (click)="openFinder($event)" placeholder="Search & select bank..." />
            <button type="button" class="bank-finder-inline-btn" (click)="openFinder($event)" title="Search & select bank">
              <app-icon name="search" [size]="16" [stroke]="2.2" />
            </button>
          </div>
        </div>
        <label>Bank Code<input [value]="selectedBank.bankCode" readonly class="readonly-input" /></label>
        <label>Beneficiary Bank<input [value]="selectedBank.beneficiaryBank" readonly class="readonly-input" /></label>
        <label>Bank Address<input [value]="selectedBank.bankAddress" readonly class="readonly-input" /></label>
        <label>Title of Account<input [value]="selectedBank.accountTitle" readonly class="readonly-input" /></label>
        <label>Currency<input [value]="selectedBank.currency" readonly class="readonly-input" /></label>
        <label>Country<input [value]="selectedBank.country" readonly class="readonly-input" /></label>
        <label>Account No<input [value]="selectedBank.accountNumber" readonly class="readonly-input" /></label>
        <label>Account IBAN<input [value]="selectedBank.iban" readonly class="readonly-input mono" /></label>
        <label>Swift Code<input [value]="selectedBank.swiftCode" readonly class="readonly-input" /></label>
        <label>Routing Number<input [value]="selectedBank.routingNumber" readonly class="readonly-input" /></label>
        <label>Sort Code<input [value]="selectedBank.sortCode" readonly class="readonly-input" /></label>
        <label>Bank Certificate<input [value]="selectedBank.certificateName" readonly class="readonly-input" /></label>
        <label>Bank Issue Date
          <app-custom-date-picker [ngModel]="selectedBank.issueDate" [readonly]="true" />
        </label>
      </div>
    </article>

    @if (showFinder) {
      <div class="bank-finder-overlay" (click)="closeFinder()">
        <div class="bank-finder" (click)="$event.stopPropagation()">
          <div class="bank-finder-header">
            <span>Bank Directory & Lookup</span>
            <button type="button" class="modal-close-btn" (click)="closeFinder()" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="bank-finder-body">
            <div class="bank-finder-search-wrap">
              <span class="finder-search-icon"><app-icon name="search" [size]="15" /></span>
              <input [(ngModel)]="finderQuery" placeholder="Search by bank name, code, title of account, currency or country..." autofocus />
            </div>
            <div class="table-scroll">
              <table class="bank-finder-table">
                <thead>
                  <tr>
                    <th>Bank Name</th>
                    <th>Bank Code</th>
                    <th>Title of Account</th>
                    <th>Currency</th>
                    <th>Country</th>
                    <th>IBAN</th>
                  </tr>
                </thead>
                <tbody>
                  @for (bank of filteredBanks(); track bank.id) {
                    <tr [class.selected]="bank.id === pendingBankId" (click)="pendingBankId = bank.id" (dblclick)="selectBank(bank.id)">
                      <td style="font-weight: 700; color: var(--role-accent, #50ae9b);">{{ bank.bankName }}</td>
                      <td><span class="mono">{{ bank.bankCode }}</span></td>
                      <td>{{ bank.accountTitle }}</td>
                      <td><span class="mono" style="font-weight: 700; color: var(--role-accent, #50ae9b);">{{ bank.currency }}</span></td>
                      <td>{{ bank.country }}</td>
                      <td><span class="mono" style="font-size: 11.5px;">{{ bank.iban }}</span></td>
                    </tr>
                  }
                  @if (filteredBanks().length === 0) {
                    <tr>
                      <td colspan="6" style="text-align: center; padding: 24px; color: var(--muted, #64748b);">
                        No banks found matching "{{ finderQuery }}".
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div class="bank-finder-footer">
            <button type="button" class="btn secondary" (click)="closeFinder()">Cancel</button>
            <button type="button" class="btn" (click)="selectBank()">Select Bank</button>
          </div>
        </div>
      </div>
    }
  `
})
export class BanksComponent {
  private readonly state = inject(PortalStateService);
  showAddForm = false;
  showFinder = false;
  finderQuery = '';
  pendingBankId = 'BNK-001';
  ibanError = '';

  readonly currencyOptions = ['USD', 'AED', 'EUR', 'GBP', 'PKR'];
  readonly countryOptions = ['United Arab Emirates', 'Pakistan', 'United Kingdom', 'United States', 'Other'];

  newBank: BankRecord = this.emptyBank();
  banks: BankRecord[] = [
    { id: 'BNK-001', bankName: 'Habib Bank Limited', bankCode: '0892', beneficiaryBank: 'HBL Corporate Banking', bankAddress: 'Korangi Main Branch, Karachi', accountTitle: 'ABC Supplies Pvt. Ltd.', currency: 'USD', country: 'Pakistan', accountNumber: '0123456789', iban: 'PK36HABB0000123456789012', swiftCode: 'HABBPKKA', routingNumber: '110000', sortCode: '0892', certificateName: 'HBL-Bank-Letter.pdf', issueDate: '2026-05-16' },
    { id: 'BNK-002', bankName: 'Emirates NBD', bankCode: '002', beneficiaryBank: 'Emirates NBD Business Banking', bankAddress: 'Deira Branch, Dubai', accountTitle: 'ABC Supplies Pvt. Ltd.', currency: 'AED', country: 'United Arab Emirates', accountNumber: '987654321', iban: 'AE070331234567890123456', swiftCode: 'EBILAEAD', routingNumber: '033', sortCode: '002', certificateName: 'ENBD-Certificate.pdf', issueDate: '2026-06-10' },
    { id: 'BNK-003', bankName: 'Meezan Bank', bankCode: '0044', beneficiaryBank: 'Meezan Corporate Banking', bankAddress: 'F-10 Markaz Branch, Islamabad', accountTitle: 'Horizon Power Systems', currency: 'PKR', country: 'Pakistan', accountNumber: '00440102938475', iban: 'PK12MEZN0000445566778899', swiftCode: 'MEZNPKKA', routingNumber: '004401', sortCode: '0044', certificateName: 'MBL-Verification.pdf', issueDate: '2026-04-20' },
    { id: 'BNK-004', bankName: 'Standard Chartered Bank', bankCode: '0268', beneficiaryBank: 'SCB Commercial Banking', bankAddress: 'I.I. Chundrigar Road, Karachi', accountTitle: 'ABC Supplies Pvt. Ltd.', currency: 'USD', country: 'Pakistan', accountNumber: '02681122334455', iban: 'PK45SCBL0000998877665544', swiftCode: 'SCBLPKKA', routingNumber: '026800', sortCode: '0268', certificateName: 'SCB-Cert-2026.pdf', issueDate: '2026-03-12' },
    { id: 'BNK-005', bankName: 'First Abu Dhabi Bank (FAB)', bankCode: '0603', beneficiaryBank: 'FAB Corporate Banking', bankAddress: 'Al Maryah Island, Abu Dhabi', accountTitle: 'ABC Supplies LLC', currency: 'AED', country: 'United Arab Emirates', accountNumber: '06037788990011', iban: 'AE880330000011223344556', swiftCode: 'FABAAEAD', routingNumber: '060300', sortCode: '0603', certificateName: 'FAB-Letter-2026.pdf', issueDate: '2026-02-18' }
  ];

  get selectedBank(): BankRecord { return this.banks.find(bank => bank.id === this.pendingBankId) ?? this.banks[0]; }

  filteredBanks(): BankRecord[] {
    const query = this.finderQuery.trim().toLowerCase();
    return this.banks.filter(bank => !query || Object.values(bank).some(value => String(value || '').toLowerCase().includes(query)));
  }

  emptyBank(): BankRecord { return { id: '', bankName: '', bankCode: '', beneficiaryBank: '', bankAddress: '', accountTitle: '', currency: 'USD', country: 'United Arab Emirates', accountNumber: '', iban: '', swiftCode: '', routingNumber: '', sortCode: '', certificateName: '', issueDate: '' }; }

  addBank(): void {
    if (!this.newBank.bankName || !this.newBank.accountTitle || !this.newBank.iban || !this.newBank.issueDate) { this.state.notify('Bank name, account title, IBAN and issue date are required.'); return; }
    this.banks = [...this.banks, { ...this.newBank, id: `BNK-${Date.now()}` }];
    this.pendingBankId = this.banks[this.banks.length - 1].id;
    this.state.notify('Bank added successfully.');
    this.resetForm();
    this.showAddForm = false;
  }

  resetForm(): void { this.newBank = this.emptyBank(); this.ibanError = ''; }
  validateIban(): void { this.ibanError = this.newBank.iban && this.newBank.iban.replace(/\s/g, '').length < 15 ? 'Please enter a valid IBAN.' : ''; }
  onCertificateSelected(event: Event): void { const file = (event.target as HTMLInputElement).files?.[0]; if (file) this.newBank.certificateName = file.name; }
  
  openFinder(e?: Event): void {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.finderQuery = '';
    this.pendingBankId = this.selectedBank.id;
    this.showFinder = true;
  }

  closeFinder(): void {
    this.showFinder = false;
  }

  selectBank(bankId?: string): void {
    if (bankId) {
      this.pendingBankId = bankId;
    }
    this.closeFinder();
    this.state.notify(`Bank "${this.selectedBank.bankName}" selected.`);
  }

  exportBanks(): void {
    this.state.notify('Exporting bank register (Excel)...');
  }
}
