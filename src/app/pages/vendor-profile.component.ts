import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  verified: boolean;
  date: string;
}

interface CurrencyItem { code: string; description: string; isDefault: boolean; }
interface ProductItem { code: string; description: string; brands: string; selectedBrands: string; }
interface MajorCustomer { name: string; contact: string; phone: string; city: string; country: string; dealsInYear: number; }
interface ContactPerson { name: string; department: string; designation: string; address: string; country: string; city: string; email: string; office: string; phone: string; fax: string; landline: string; extension: string; whatsapp: string; }

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  styles: [`
    .profile-section-head { background: #53789a; color: #fff; padding: 10px 14px; border-radius: 5px; display: flex; align-items: center; justify-content: space-between; }
    .profile-section-head h2 { color: #fff; margin: 0; font-size: 15px; }
    .profile-table thead th { background: #7693ad; color: #fff; }
    .profile-tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 16px; background: #f0f4f8; padding: 5px; }
    .profile-tabs button { flex: 1; min-width: 110px; border: 0; padding: 8px; background: transparent; color: #334155; cursor: pointer; border-radius: 4px; }
    .profile-tabs button.active { background: #145c9c; color: #fff; }
  `],
  template: `
    <app-page-heading eyebrow="Vendor onboarding" title="Company Profile" subtitle="Maintain commercial registration, corporate tax data, approved bidding categories and verified banking details.">
      <div class="heading-actions">
        <button class="btn" (click)="save()">Save Profile</button>
        <button class="btn secondary" (click)="resetChanges()">Restore Saved</button>
      </div>
    </app-page-heading>

    <section class="form-layout">
      <!-- Company Information Card -->
      <article class="panel span-2">
        <div class="panel-title">
          <div>
            <h2>Company Registration Information</h2>
            <p>Official legal identity and primary communications</p>
          </div>
          <app-status text="Self-Managed" [good]="true" />
        </div>

        <div class="form-grid">
          <label>Legal Company Name *<input [(ngModel)]="form.company" placeholder="Enter company legal name" /></label>
          <label>Vendor Code<input [(ngModel)]="form.code" placeholder="e.g. VEN-10024" /></label>
          <label>Tax / NTN Number *<input [(ngModel)]="form.tax" placeholder="e.g. NTN-7483921-8" /></label>
          <label>Sales Tax Registration (STRN)<input [(ngModel)]="form.strn" placeholder="e.g. STRN-32778761234" /></label>
          <label>Headquarters City *<input [(ngModel)]="form.city" placeholder="e.g. Karachi / Lahore / Islamabad" /></label>
          <label>Registered Street Address<input [(ngModel)]="form.address" placeholder="Enter registered street address" /></label>
          <label>Primary Contact Name *<input [(ngModel)]="form.contact" placeholder="Contact person name" /></label>
          <label>Official Email Address *<input [(ngModel)]="form.email" type="email" placeholder="official@company.com" /></label>
          <label>Phone Number<input [(ngModel)]="form.phone" placeholder="+92 21 3500 0000" /></label>
          <label>Fax Number<input [(ngModel)]="form.fax" placeholder="Fax Number" /></label>
          <label>Country<input [(ngModel)]="form.country" readonly /></label>
          <label>Zip Code<input [(ngModel)]="form.zipCode" placeholder="Enter Zip Code" /></label>
          <label>Company Website<input [(ngModel)]="form.website" placeholder="https://www.yourcompany.com" /></label>
          <label>Trade License Number *<input [(ngModel)]="form.tradeLicense" /></label>
          <label>Trade License Expiry *<input type="date" [(ngModel)]="form.tradeLicenseExpiry" /></label>
          <label>VAT (TRN Number) *<input [(ngModel)]="form.vatNumber" /></label>
          <label>Corporate Tax Number<input [(ngModel)]="form.corporateTax" /></label>
        </div>
        <div class="toolbar" style="margin-top: 16px;"><button class="btn" (click)="save()">Update</button></div>
      </article>

      <article class="panel span-2">
        <div class="profile-tabs">
          <button [class.active]="activeProfileTab === 'currency'" (click)="activeProfileTab = 'currency'">$ Currency</button>
          <button [class.active]="activeProfileTab === 'business'" (click)="activeProfileTab = 'business'">Business</button>
          <button [class.active]="activeProfileTab === 'product'" (click)="activeProfileTab = 'product'">Products</button>
          <button [class.active]="activeProfileTab === 'customers'" (click)="activeProfileTab = 'customers'">Major Customer</button>
          <button [class.active]="activeProfileTab === 'contact'" (click)="activeProfileTab = 'contact'">Contact Person</button>
        </div>

        @if (activeProfileTab === 'currency') {
          <div class="profile-section-head"><h2>Currency</h2><button class="btn small" (click)="addCurrency()">+ Add Currency</button></div>
          <div class="table-scroll"><table class="profile-table"><thead><tr><th>Sr#</th><th>Currency Code</th><th>Currency Description</th><th>Default</th></tr></thead><tbody>
            @for (currency of currencies; track currency.code; let i = $index) { <tr><td>{{ i + 1 }}</td><td>{{ currency.code }}</td><td>{{ currency.description }}</td><td><input type="radio" name="defaultCurrency" [checked]="currency.isDefault" (change)="setDefaultCurrency(currency)" /></td></tr> }
          </tbody></table></div>
        }

        @if (activeProfileTab === 'business') {
          <div class="profile-section-head"><h2>Business Information</h2></div>
          <div class="form-grid" style="margin-top: 14px;"><label>Business Type<select [(ngModel)]="business.type"><option>Retail</option><option>Manufacturing</option><option>Services</option></select></label><label>Company Legal Status<select [(ngModel)]="business.status"><option>LLC</option><option>PLC</option><option>Sole Proprietorship</option><option>Other</option></select></label><label>Year In Business<input type="number" [(ngModel)]="business.years" /></label><label>Incorporated Place<input [(ngModel)]="business.place" /></label></div>
        }

        @if (activeProfileTab === 'product') {
          <div class="profile-section-head"><h2>Products</h2><button class="btn small" (click)="addProduct()">+ Add Product</button></div>
          <div class="table-scroll"><table class="profile-table"><thead><tr><th>Sr</th><th>Category Code</th><th>Category Description</th><th>Brands</th><th>Selected Brands</th></tr></thead><tbody>
            @for (product of products; track product.code; let i = $index) { <tr><td>{{ i + 1 }}</td><td>{{ product.code }}</td><td>{{ product.description }}</td><td>{{ product.brands }}</td><td>{{ product.selectedBrands }}</td></tr> }
          </tbody></table></div>
        }

        @if (activeProfileTab === 'customers') {
          <div class="profile-section-head"><h2>Major Customers</h2><button class="btn small" (click)="addCustomer()">+ Add Customer</button></div>
          <div class="table-scroll"><table class="profile-table"><thead><tr><th>SR</th><th>Customer Name</th><th>Contact Name</th><th>Contact Number</th><th>City</th><th>Country</th><th>Deals in Year</th></tr></thead><tbody>
            @for (customer of customers; track customer.name; let i = $index) { <tr><td>{{ i + 1 }}</td><td>{{ customer.name }}</td><td>{{ customer.contact }}</td><td>{{ customer.phone }}</td><td>{{ customer.city }}</td><td>{{ customer.country }}</td><td>{{ customer.dealsInYear }}</td></tr> }
          </tbody></table></div>
        }

        @if (activeProfileTab === 'contact') {
          <div class="profile-section-head"><h2>Contact Person</h2></div>
          <div class="form-grid" style="margin-top: 14px;"><label>Contact Person Name<input [(ngModel)]="contact.name" readonly /></label><label>Department<select [(ngModel)]="contact.department"><option>Procurement</option><option>Finance</option><option>Sales</option></select></label><label>Designation<input [(ngModel)]="contact.designation" readonly /></label><label>Contact Person Address<input [(ngModel)]="contact.address" readonly /></label><label>Country<input [(ngModel)]="contact.country" readonly /></label><label>City<input [(ngModel)]="contact.city" readonly /></label><label>Contact Person Email<input type="email" [(ngModel)]="contact.email" readonly /></label><label>Office Locations<select [(ngModel)]="contact.office"><option>Head Office</option><option>Branch Office</option><option>Site Office</option><option>Warehouse</option></select></label><label>Phone Number<input [(ngModel)]="contact.phone" readonly /></label><label>Fax No<input [(ngModel)]="contact.fax" readonly /></label><label>Land Line<input [(ngModel)]="contact.landline" readonly /></label><label>Extension<input [(ngModel)]="contact.extension" readonly /></label><label>Whatsapp Number<input [(ngModel)]="contact.whatsapp" readonly /></label></div>
        }
      </article>

      <!-- Approved Categories Card -->
      <article class="panel">
        <div class="panel-title">
          <div>
            <h2>Approved Sourcing Categories</h2>
            <p>Controls RFQ eligibility</p>
          </div>
        </div>

        <div class="tag-list" style="margin-bottom: 12px;">
          @if (categories.length === 0) {
            <span style="background: #f1f5f9; color: #64748b;">No categories added yet</span>
          }
          @for (cat of categories; track cat; let i = $index) {
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              {{ cat }}
              <button type="button" (click)="removeCategory(i)" style="background: none; border: none; color: #16855b; font-size: 13px; cursor: pointer; padding: 0 2px;">✕</button>
            </span>
          }
        </div>

        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <input [(ngModel)]="newCategoryInput" placeholder="Add category (e.g. Electrical)" style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px;" />
          <button class="btn small" (click)="addCategory()">+ Add</button>
        </div>
        <p class="helper" style="margin-top: 8px;">Only RFQs in approved categories appear in the vendor bidding area.</p>
      </article>

      <!-- Bank Information Card -->
      <article class="panel">
        <div class="panel-title">
          <div>
            <h2>Settlement Banking Details</h2>
            <p>Verified by Finance Team</p>
          </div>
        </div>

        <div class="form-stack">
          <label>Bank Name *<input [(ngModel)]="form.bank" placeholder="e.g. Habib Bank Limited" /></label>
          <label>IBAN Number *<input [(ngModel)]="form.iban" placeholder="PK00 HABB 0000 1234 5678 9012" /></label>
          <label>Account Title *<input [(ngModel)]="form.accountTitle" placeholder="Beneficiary account title" /></label>
          <label>Branch & City<input [(ngModel)]="form.branch" placeholder="Branch name / code" /></label>
        </div>
        <div class="callout warn" style="margin-top: 10px;">
          <b>Controlled field:</b> Any changes to approved banking triggers a mandatory Finance re-verification.
        </div>
      </article>

      <!-- Documents & Attachments Card -->
      <article class="panel span-2">
        <div class="panel-title">
          <div>
            <h2>Compliance Documents & Certifications</h2>
            <p>Upload registration, tax, bank and quality certification evidence</p>
          </div>
        </div>

        <!-- Add Document Form Inline -->
        <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <input [(ngModel)]="newDocName" placeholder="Document Name (e.g. Tax-Certificate.pdf)" style="flex: 1; min-width: 180px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px;" />
          <select [(ngModel)]="newDocType" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; background: #fff;">
            <option value="Tax Document">Tax Document</option>
            <option value="Bank Letter">Bank Letter</option>
            <option value="Quality Certificate">Quality Certificate</option>
            <option value="Legal Registration">Legal Registration</option>
          </select>
          <button class="btn small" (click)="addDocument()">+ Attach Document</button>
        </div>

        <div class="upload-zone" style="margin-bottom: 14px;">
          <input type="file" multiple (change)="filesSelected($event)" />
          <b>Drop documents here or browse</b>
          <span>PDF, JPG, PNG, XLSX (Max 15MB)</span>
        </div>

        <div class="document-list">
          @if (documents.length === 0) {
            <p style="text-align: center; color: #94a3b8; font-size: 11px; padding: 12px 0;">No documents attached yet. Upload or attach documents above.</p>
          }
          @for (doc of documents; track doc.id; let idx = $index) {
            <div>
              <span>📄</span>
              <div>
                <input [(ngModel)]="doc.name" style="font-weight: 600; min-width: 180px;" />
                <small>{{ doc.type }} · Uploaded {{ doc.date }}</small>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <app-status [text]="doc.status" [good]="doc.verified" [warn]="!doc.verified" />
                <button class="btn small ghost" (click)="downloadDoc(doc)">Download</button>
                <button class="btn small danger-btn" (click)="removeDocument(doc.id)">✕</button>
              </div>
            </div>
          }
        </div>
      </article>
    </section>
  `
})
export class VendorProfileComponent {
  private readonly state = inject(PortalStateService);

  form = {
    company: 'ABC Supplies Pvt. Ltd.',
    code: 'VEN-10024',
    tax: 'NTN-7483921-8',
    strn: 'STRN-32778761234',
    city: 'Karachi',
    address: 'Plot 14, Korangi Industrial Area, Karachi',
    contact: 'Ali Siddiqui',
    email: 'ali@abcsupplies.example',
    phone: '+92 21 3500 4412',
    website: 'https://www.abcsupplies.example',
    fax: '+92 21 3500 4413',
    country: 'United Arab Emirates',
    zipCode: '00000',
    tradeLicense: 'TL-458921',
    tradeLicenseExpiry: '2027-05-30',
    vatNumber: '100123456700003',
    corporateTax: 'CT-7843921',
    bank: 'Habib Bank Limited',
    iban: 'PK36 HABB 0000 1234 5678 9012',
    accountTitle: 'ABC Supplies Pvt. Ltd.',
    branch: 'Korangi Main Branch · 0892'
  };

  categories: string[] = ['Electrical', 'Safety Equipment', 'Mechanical'];
  activeProfileTab = 'currency';
  currencies: CurrencyItem[] = [
    { code: 'AED', description: 'United Arab Emirates Dirham', isDefault: true },
    { code: 'USD', description: 'United States Dollar', isDefault: false }
  ];
  business = { type: 'Manufacturing', status: 'LLC', years: 18, place: 'Dubai, UAE' };
  products: ProductItem[] = [
    { code: 'ELEC', description: 'Electrical Equipment', brands: 'Schneider, ABB', selectedBrands: 'Schneider' },
    { code: 'SAFE', description: 'Safety Equipment', brands: '3M, Honeywell', selectedBrands: '3M' }
  ];
  customers: MajorCustomer[] = [
    { name: 'TAMCO Middle East Ltd.', contact: 'Ahmed Khan', phone: '+971 50 123 4567', city: 'Dubai', country: 'UAE', dealsInYear: 2025 },
    { name: 'Gulf Industrial Services', contact: 'Sara Ali', phone: '+971 55 321 7788', city: 'Abu Dhabi', country: 'UAE', dealsInYear: 2024 }
  ];
  contact: ContactPerson = {
    name: 'Ali Siddiqui', department: 'Procurement', designation: 'Commercial Manager', address: 'Plot 14, Industrial Area', country: 'United Arab Emirates', city: 'Dubai', email: 'ali@abcsupplies.example', office: 'Head Office', phone: '+971 50 123 9989', fax: '+971 4 350 4413', landline: '+971 4 350 4412', extension: '104', whatsapp: '+971 50 123 9989'
  };
  newCategoryInput = 'IT & Hardware';

  newDocName = 'NTN-Certificate-2026.pdf';
  newDocType = 'Tax Document';

  documents: DocumentItem[] = [
    { id: 'DOC-001', name: 'SECP-Incorporation.pdf', type: 'Legal Registration', status: 'Verified', verified: true, date: '12 May 2026' },
    { id: 'DOC-002', name: 'NTN-Certificate-2026.pdf', type: 'Tax Document', status: 'Verified', verified: true, date: '14 May 2026' },
    { id: 'DOC-003', name: 'HBL-Bank-Letter.pdf', type: 'Bank Letter', status: 'Verified', verified: true, date: '16 May 2026' },
    { id: 'DOC-004', name: 'ISO-9001-Certificate.pdf', type: 'Quality Certificate', status: 'Pending Verification', verified: false, date: '20 May 2026' }
  ];

  addCategory(): void {
    if (this.newCategoryInput.trim()) {
      this.categories.push(this.newCategoryInput.trim());
      this.state.notify(`Category "${this.newCategoryInput}" added.`);
      this.newCategoryInput = '';
    }
  }

  addCurrency(): void {
    const code = this.currencies.some(currency => currency.code === 'EUR') ? 'GBP' : 'EUR';
    this.currencies = [...this.currencies, { code, description: code === 'EUR' ? 'Euro' : 'British Pound', isDefault: false }];
    this.state.notify(`${code} currency added.`);
  }

  setDefaultCurrency(currency: CurrencyItem): void {
    this.currencies = this.currencies.map(item => ({ ...item, isDefault: item.code === currency.code }));
    this.state.notify(`${currency.code} selected as default currency.`);
  }

  addProduct(): void {
    this.products = [...this.products, { code: 'MECH', description: 'Mechanical Parts', brands: 'SKF, Siemens', selectedBrands: 'SKF' }];
    this.state.notify('Product category added.');
  }

  addCustomer(): void {
    this.customers = [...this.customers, { name: 'New Customer', contact: 'Contact Name', phone: '+971 00 000 0000', city: 'Dubai', country: 'UAE', dealsInYear: new Date().getFullYear() }];
    this.state.notify('Major customer added.');
  }

  removeCategory(idx: number): void {
    const removed = this.categories.splice(idx, 1);
    this.state.notify(`Category "${removed[0]}" removed.`);
  }

  addDocument(): void {
    if (!this.newDocName.trim()) {
      this.state.notify('Please provide a document filename.');
      return;
    }
    const doc: DocumentItem = {
      id: String(Date.now()),
      name: this.newDocName.trim(),
      type: this.newDocType,
      status: 'Pending Verification',
      verified: false,
      date: 'Just now'
    };
    this.documents = [doc, ...this.documents];
    this.state.notify(`Document "${doc.name}" attached successfully.`);
    this.newDocName = '';
  }

  removeDocument(id: string): void {
    this.documents = this.documents.filter(d => d.id !== id);
    this.state.notify('Document removed.');
  }

  downloadDoc(doc: DocumentItem): void {
    this.state.notify(`Downloading ${doc.name}...`);
  }

  filesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    files.forEach(f => {
      this.documents.push({
        id: String(Date.now() + Math.random()),
        name: f.name,
        type: 'Attachment',
        status: 'Pending Verification',
        verified: false,
        date: 'Today'
      });
    });
    if (files.length > 0) {
      this.state.notify(`${files.length} document(s) uploaded successfully.`);
    }
  }

  save(): void {
    this.state.notify('Vendor profile updated successfully. Saved to database.');
  }

  resetChanges(): void {
    this.form = {
      company: 'ABC Supplies Pvt. Ltd.',
      code: 'VEN-10024',
      tax: 'NTN-7483921-8',
      strn: 'STRN-32778761234',
      city: 'Karachi',
      address: 'Plot 14, Korangi Industrial Area, Karachi',
      contact: 'Ali Siddiqui',
      email: 'ali@abcsupplies.example',
      phone: '+92 21 3500 4412',
      website: 'https://www.abcsupplies.example',
      fax: '+92 21 3500 4413',
      country: 'United Arab Emirates',
      zipCode: '00000',
      tradeLicense: 'TL-458921',
      tradeLicenseExpiry: '2027-05-30',
      vatNumber: '100123456700003',
      corporateTax: 'CT-7843921',
      bank: 'Habib Bank Limited',
      iban: 'PK36 HABB 0000 1234 5678 9012',
      accountTitle: 'ABC Supplies Pvt. Ltd.',
      branch: 'Korangi Main Branch · 0892'
    };
    this.categories = ['Electrical', 'Safety Equipment', 'Mechanical'];
    this.documents = [
      { id: 'DOC-001', name: 'SECP-Incorporation.pdf', type: 'Legal Registration', status: 'Verified', verified: true, date: '12 May 2026' },
      { id: 'DOC-002', name: 'NTN-Certificate-2026.pdf', type: 'Tax Document', status: 'Verified', verified: true, date: '14 May 2026' },
      { id: 'DOC-003', name: 'HBL-Bank-Letter.pdf', type: 'Bank Letter', status: 'Verified', verified: true, date: '16 May 2026' },
      { id: 'DOC-004', name: 'ISO-9001-Certificate.pdf', type: 'Quality Certificate', status: 'Pending Verification', verified: false, date: '20 May 2026' }
    ];
    this.state.notify('Profile restored to saved company data.');
  }
}
