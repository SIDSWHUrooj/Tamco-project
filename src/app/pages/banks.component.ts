import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent],
  styles: [`
    .bank-head { background: #028bcf; color: #fff; padding: 10px 14px; border-radius: 5px; font-size: 15px; font-weight: 600; }
    .bank-table thead th { background: #028bcf; color: #fff; }
    .bank-table input { min-width: 110px; }
    .bank-finder-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(7, 18, 40, .45); display: grid; place-items: center; padding: 20px; }
    .bank-finder { width: min(1000px, 100%); max-height: 90vh; overflow: auto; background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 18px 50px rgba(7, 22, 43, .28); }
    .bank-finder tbody tr { cursor: pointer; }
    .bank-finder tbody tr:hover, .bank-finder tbody tr.selected { background: #eef5ff; }
  `],
  template: `
    <app-page-heading eyebrow="Administration" title="Banks" subtitle="Manage vendor bank information, account details, currencies and bank certificates.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddForm = !showAddForm">{{ showAddForm ? '✕ Close Form' : '+ Add Bank' }}</button>
        <button class="btn secondary" (click)="exportBanks()">Export Banks</button>
      </div>
    </app-page-heading>

    @if (showAddForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #028bcf;">
        <div class="bank-head">Bank</div>
        <hr style="margin: 5px 0 16px; border: 0; border-top: 1px solid forestgreen;" />
        <div class="form-grid">
          <label>Currency *<select [(ngModel)]="newBank.currency"><option>USD</option><option>AED</option><option>EUR</option><option>GBP</option><option>PKR</option></select></label>
          <label>Country *<select [(ngModel)]="newBank.country"><option>United Arab Emirates</option><option>Pakistan</option><option>United Kingdom</option><option>United States</option><option>Other</option></select></label>
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
          <label>Bank Issue Date *<input type="date" [(ngModel)]="newBank.issueDate" /></label>
        </div>
        @if (ibanError) { <p style="color: #c90000; margin: 8px 0 0;">{{ ibanError }}</p> }
        <div class="toolbar" style="margin-top: 16px;"><button class="btn secondary" (click)="resetForm()">Reset</button><button class="btn" (click)="addBank()">Add Bank</button></div>
      </article>
    }

    <article class="panel">
      <div class="bank-head">Bank</div>
      <hr style="margin: 5px 0 16px; border: 0; border-top: 1px solid forestgreen;" />
      <div class="form-grid">
        <label>Bank Name<input [value]="selectedBank.bankName" readonly /></label>
        <label>Bank Code<input [value]="selectedBank.bankCode" readonly /></label>
        <label>Beneficiary Bank<input [value]="selectedBank.beneficiaryBank" readonly /></label>
        <label>Bank Address<input [value]="selectedBank.bankAddress" readonly /></label>
        <label>Title of Account<input [value]="selectedBank.accountTitle" readonly /></label>
        <label>Currency<input [value]="selectedBank.currency" readonly /></label>
        <label>Country<input [value]="selectedBank.country" readonly /></label>
        <label>Account No<input [value]="selectedBank.accountNumber" readonly /></label>
        <label>Account IBAN<input [value]="selectedBank.iban" readonly /></label>
        <label>Swift Code<input [value]="selectedBank.swiftCode" readonly /></label>
        <label>Routing Number<input [value]="selectedBank.routingNumber" readonly /></label>
        <label>Sort Code<input [value]="selectedBank.sortCode" readonly /></label>
        <label>Bank Certificate<input [value]="selectedBank.certificateName" readonly /></label>
        <label>Bank Issue Date<input type="date" [value]="selectedBank.issueDate" readonly /></label>
      </div>
      <div class="toolbar" style="justify-content: flex-end; margin-top: 14px;"><button class="btn" (click)="openFinder()">⌕ Find Bank</button></div>
    </article>

    @if (showFinder) {
      <div class="bank-finder-overlay" (click)="closeFinder()">
        <div class="bank-finder" (click)="$event.stopPropagation()">
          <div class="panel-title"><div><h2>Banks</h2><p>Select a saved bank record.</p></div><button class="btn small" (click)="closeFinder()">✕</button></div>
          <input [(ngModel)]="finderQuery" placeholder="Search bank, account title, currency or country..." style="width: 100%; margin-bottom: 12px;" />
          <table><thead><tr><th>Bank Name</th><th>Bank Address</th><th>Title of Account</th><th>Currency</th><th>Country</th></tr></thead><tbody>
            @for (bank of filteredBanks(); track bank.id) { <tr [class.selected]="bank.id === pendingBankId" (click)="pendingBankId = bank.id"><td>{{ bank.bankName }}</td><td>{{ bank.bankAddress }}</td><td>{{ bank.accountTitle }}</td><td>{{ bank.currency }}</td><td>{{ bank.country }}</td></tr> }
          </tbody></table>
          <div class="toolbar" style="justify-content: flex-end; margin-top: 14px;"><button class="btn danger-btn" (click)="closeFinder()">Close</button><button class="btn" (click)="selectBank()">Select</button></div>
        </div>
      </div>
    }
  `
})
export class BanksComponent {
  private readonly state = inject(PortalStateService);
  showAddForm = true;
  showFinder = false;
  finderQuery = '';
  pendingBankId = 'BNK-001';
  ibanError = '';

  newBank: BankRecord = this.emptyBank();
  banks: BankRecord[] = [
    { id: 'BNK-001', bankName: 'Habib Bank Limited', bankCode: '0892', beneficiaryBank: 'HBL Corporate Banking', bankAddress: 'Korangi Main Branch, Karachi', accountTitle: 'ABC Supplies Pvt. Ltd.', currency: 'USD', country: 'Pakistan', accountNumber: '0123456789', iban: 'PK36HABB0000123456789012', swiftCode: 'HABBPKKA', routingNumber: '110000', sortCode: '0892', certificateName: 'HBL-Bank-Letter.pdf', issueDate: '2026-05-16' },
    { id: 'BNK-002', bankName: 'Emirates NBD', bankCode: '002', beneficiaryBank: 'Emirates NBD Business Banking', bankAddress: 'Deira Branch, Dubai', accountTitle: 'ABC Supplies Pvt. Ltd.', currency: 'AED', country: 'United Arab Emirates', accountNumber: '987654321', iban: 'AE070331234567890123456', swiftCode: 'EBILAEAD', routingNumber: '033', sortCode: '002', certificateName: 'ENBD-Certificate.pdf', issueDate: '2026-06-10' }
  ];

  get selectedBank(): BankRecord { return this.banks.find(bank => bank.id === this.pendingBankId) ?? this.banks[0]; }

  filteredBanks(): BankRecord[] {
    const query = this.finderQuery.trim().toLowerCase();
    return this.banks.filter(bank => !query || Object.values(bank).some(value => value.toLowerCase().includes(query)));
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
  openFinder(): void { this.finderQuery = ''; this.showFinder = true; }
  closeFinder(): void { this.showFinder = false; }
  selectBank(): void { this.closeFinder(); this.state.notify(`Bank ${this.selectedBank.bankName} selected.`); }
  exportBanks(): void { this.state.notify('Exporting bank register (Excel)...'); }
}
