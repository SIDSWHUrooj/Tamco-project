import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent, CustomDatePickerComponent],
  styles: [`
    /* HERO BANNER */
    .profile-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid var(--line);
      border-left: 4px solid var(--role-accent);
      padding: 18px 24px;
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .company-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--role-soft);
      color: var(--role-accent);
      display: grid;
      place-items: center;
      font-size: 16px;
      font-weight: 800;
      border: 1px solid var(--role-border);
    }
    .hero-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .hero-title-row h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: var(--text);
    }
    .mono-badge {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      font-weight: 700;
      background: #f1f5f9;
      color: var(--muted);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--line);
    }
    .hero-location {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hero-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .verif-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: var(--radius-full);
      background: var(--green-soft);
      color: var(--green);
      border: 1px solid var(--green-border);
    }
    .verif-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
    }

    /* TABS - OPTION 6 PILL CAPSULE DESIGN */
    .profile-tabs {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 20px;
      background: #f8fafc;
      padding: 5px;
      border-radius: 9999px;
      border: 1px solid var(--line, #e2e8f0);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
      max-width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }
    .profile-tabs button {
      border: 0;
      padding: 8px 22px;
      background: transparent;
      color: var(--muted, #64748b);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border-radius: 9999px;
      white-space: nowrap;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;
      line-height: 1.4;
    }
    .profile-tabs button:hover:not(.active) {
      color: var(--text, #0f172a);
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .profile-tabs button.active {
      background: var(--role-accent, #2563eb);
      color: #ffffff;
      font-weight: 700;
      box-shadow: 0 4px 14px -1px var(--role-glow, rgba(37, 99, 235, 0.38));
      transform: translateY(-1px);
    }
    .profile-tabs button:active {
      transform: translateY(0);
    }

    /* MODERN RADIO PILL FOR SETTLEMENT CURRENCIES */
    .modern-radio-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 5px 14px;
      border-radius: 9999px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid transparent;
      background: transparent;
      color: var(--muted, #64748b);
    }
    .modern-radio-pill input[type="radio"] {
      margin: 0;
    }
    .modern-radio-pill .radio-text-label {
      font-size: 11.5px;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    .modern-radio-pill:hover {
      background: #f8fafc;
      border-color: var(--line, #e2e8f0);
      color: var(--text, #0f172a);
    }
    .modern-radio-pill.active {
      background: var(--role-soft, #eff6ff);
      border-color: var(--role-border, #bfdbfe);
      color: var(--role-accent, #2563eb);
    }
    .modern-radio-pill.active .radio-text-label {
      font-weight: 700;
      color: var(--role-accent, #2563eb);
    }
    tr.default-row td {
      background-color: rgba(37, 99, 235, 0.02);
    }

    .profile-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--line);
    }
    .profile-section-head h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
    }

    .four-col {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }

    @media (max-width: 1000px) {
      .four-col {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .profile-hero {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    @media (max-width: 600px) {
      .four-col {
        grid-template-columns: 1fr !important;
      }
    }

    /* COMPLIANCE DOCUMENTS & CERTIFICATIONS SECTION */
    .compliance-panel {
      position: relative;
    }
    .count-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
      background: var(--role-soft, #eff6ff);
      color: var(--role-accent, #2563eb);
      border: 1px solid var(--role-border, #bfdbfe);
    }
    .upload-container {
      background: #f8fafc;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      padding: 14px;
      margin-bottom: 20px;
    }
    .upload-toolbar {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .upload-field-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      &.flex-1 {
        flex: 1;
        min-width: 220px;
      }
    }
    .field-mini-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .upload-title-input {
      height: 38px;
      padding: 8px 12px;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      background: #ffffff;
      font-size: 13px;
      color: var(--text, #0f172a);
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      &:focus {
        border-color: var(--role-accent);
        box-shadow: 0 0 0 3px var(--role-soft);
      }
    }
    .upload-btn {
      height: 38px;
      padding: 0 16px;
      white-space: nowrap;
      margin-bottom: 0;
    }
    .upload-dropzone {
      position: relative;
      border: 1.5px dashed var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 8px);
      background: #ffffff;
      padding: 22px 20px;
      text-align: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      &:hover {
        border-color: var(--role-accent, #2563eb);
        background: var(--role-soft, #eff6ff);
        .dropzone-icon-circle {
          transform: translateY(-2px) scale(1.06);
          background: var(--role-accent, #2563eb);
          color: #ffffff;
        }
        .browse-link {
          text-decoration: underline;
        }
      }
    }
    .file-drop-input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }
    .dropzone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }
    .dropzone-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--role-soft, #eff6ff);
      color: var(--role-accent, #2563eb);
      display: grid;
      place-items: center;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }
    .dropzone-text-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }
    .dropzone-headline {
      font-size: 13.5px;
      color: var(--text, #0f172a);
      font-weight: 600;
    }
    .browse-link {
      color: var(--role-accent, #2563eb);
      font-weight: 700;
    }
    .dropzone-subtext {
      font-size: 11.5px;
      color: var(--muted, #64748b);
    }

    /* DOCUMENT CARDS - 100% PERFECT ROW-BY-ROW ALIGNMENT */
    .compliance-doc-cards {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .doc-card {
      display: grid;
      grid-template-columns: 42px 1fr 160px 140px;
      align-items: center;
      gap: 16px;
      background: #ffffff;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      padding: 13px 18px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      &:hover {
        border-color: var(--line-strong, #cbd5e1);
        box-shadow: 0 6px 16px -3px rgba(15, 23, 42, 0.08);
        transform: translateY(-1px);
      }
      &.is-verified {
        border-left: 3.5px solid var(--green, #16a34a);
      }
      &:not(.is-verified) {
        border-left: 3.5px solid var(--amber, #d97706);
      }
    }
    .doc-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 9px;
      background: #f1f5f9;
      color: #64748b;
      display: grid;
      place-items: center;
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
      transition: transform 0.2s ease;
      &.verified-badge {
        background: #ecfdf5;
        color: #059669;
        border-color: #a7f3d0;
      }
    }
    .doc-details {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .doc-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .doc-filename {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }
    .doc-format-badge {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.04em;
      padding: 1.5px 6px;
      border-radius: 4px;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      flex-shrink: 0;
    }
    .doc-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: var(--muted, #64748b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .doc-type-tag {
      font-weight: 600;
      color: #475569;
    }
    .meta-separator {
      color: #cbd5e1;
    }
    .doc-date {
      color: var(--muted, #64748b);
    }
    .doc-status-col {
      width: 160px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .doc-actions-col {
      width: 140px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .doc-action-btn {
      font-size: 12px;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 6px;
    }
    .doc-delete-btn {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.15s ease;
      &:hover {
        background: #fef2f2;
        color: #dc2626;
        border-color: #fecaca;
        transform: scale(1.05);
      }
    }
    .empty-docs-state {
      padding: 36px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--muted, #64748b);
      background: #f8fafc;
      border-radius: var(--radius-md);
      border: 1px dashed var(--line);
      p {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--text);
      }
      span {
        font-size: 12px;
      }
    }
    @media (max-width: 900px) {
      .doc-card {
        grid-template-columns: 42px 1fr auto;
        gap: 12px;
        .doc-status-col {
          width: auto;
        }
      }
    }
    @media (max-width: 650px) {
      .doc-card {
        grid-template-columns: 1fr;
        gap: 12px;
        .doc-actions-col {
          width: 100%;
          justify-content: flex-start;
        }
      }
    }
  `],
  template: `
    <app-page-heading
      eyebrow="Supplier Onboarding & Compliance"
      title="Company Profile Management"
      subtitle="Maintain verified commercial registration, corporate tax certifications, approved supply categories, and settlement banking data."
    >
      <div class="heading-actions">
        <button class="btn" (click)="save()">Save Profile</button>
        <button class="btn secondary" (click)="resetChanges()">Restore Defaults</button>
      </div>
    </app-page-heading>

    <section class="form-layout">
      <!-- HERO BANNER -->
      <article class="panel span-2 profile-hero">
        <div class="hero-main">
          <div class="company-avatar">
            <span>AS</span>
          </div>
          <div class="hero-details">
            <div class="hero-title-row">
              <h2>{{ form.company }}</h2>
              <span class="mono-badge">{{ form.code }}</span>
            </div>
            <p class="hero-location">
              <app-icon name="profile" [size]="14" />
              <span>{{ form.city }}, {{ form.country }} · {{ business.status }} · Commercial Partner</span>
            </p>
          </div>
        </div>

        <div class="hero-badges">
          <div class="verif-chip">
            <span class="dot"></span>
            <span>Procurement Approved</span>
          </div>
          <div class="verif-chip">
            <span class="dot"></span>
            <span>Finance Verified</span>
          </div>
        </div>
      </article>

      <!-- 1. LEGAL ENTITY & ADDRESS CARD -->
      <article class="panel">
        <div class="panel-title">
          <h2>Legal Entity & Headquarters</h2>
        </div>

        <div class="form-stack">
          <label>
            Legal Company Name *
            <input [(ngModel)]="form.company" placeholder="Enter company legal name" />
          </label>
          <label>
            Company Website
            <input [(ngModel)]="form.website" placeholder="https://www.yourcompany.com" />
          </label>
          <label>
            Registered Street Address
            <input [(ngModel)]="form.address" placeholder="Enter registered street address" />
          </label>
          <div class="form-grid">
            <label>
              Headquarters City *
              <input [(ngModel)]="form.city" placeholder="City" />
            </label>
            <label>
              Postal / Zip Code
              <input [(ngModel)]="form.zipCode" placeholder="Postal Code" />
            </label>
          </div>
          <label>
            Country of Jurisdiction
            <input [(ngModel)]="form.country" readonly />
          </label>
        </div>
      </article>

      <!-- 2. TAX & REGULATORY COMPLIANCE CARD -->
      <article class="panel">
        <div class="panel-title">
          <h2>Tax & Regulatory Compliance</h2>
        </div>

        <div class="form-stack">
          <div class="form-grid">
            <label>
              Tax / NTN Number *
              <input [(ngModel)]="form.tax" placeholder="e.g. NTN-7483921-8" />
            </label>
            <label>
              Sales Tax (STRN)
              <input [(ngModel)]="form.strn" placeholder="e.g. STRN-32778761234" />
            </label>
          </div>
          <div class="form-grid">
            <label>
              Trade License Number *
              <input [(ngModel)]="form.tradeLicense" placeholder="Trade license number" />
            </label>
            <label>
              Trade License Expiry *
              <app-custom-date-picker [(ngModel)]="form.tradeLicenseExpiry" />
            </label>
          </div>
          <div class="form-grid">
            <label>
              VAT (TRN Number) *
              <input [(ngModel)]="form.vatNumber" placeholder="VAT registration number" />
            </label>
            <label>
              Corporate Tax ID
              <input [(ngModel)]="form.corporateTax" placeholder="Corporate tax ID" />
            </label>
          </div>
          <p class="helper">Government certificates matching these IDs must be attached in the compliance section below.</p>
        </div>
      </article>

      <!-- 3. PRIMARY COMMUNICATIONS & CONTACT PERSONS -->
      <article class="panel span-2">
        <div class="panel-title">
          <h2>Primary Authorized Representative</h2>
        </div>

        <div class="form-grid four-col">
          <label>
            Primary Contact Name *
            <input [(ngModel)]="form.contact" placeholder="Authorized representative name" />
          </label>
          <label>
            Official Business Email *
            <input [(ngModel)]="form.email" type="email" placeholder="official@company.com" />
          </label>
          <label>
            Direct Mobile / Phone *
            <input [(ngModel)]="form.phone" placeholder="+971 50 000 0000" />
          </label>
          <label>
            Office Landline / Fax
            <input [(ngModel)]="form.fax" placeholder="Landline or fax number" />
          </label>
        </div>
      </article>

      <!-- 4. COMMERCIAL CAPABILITIES (TABS) -->
      <article class="panel span-2">
        <div class="profile-tabs">
          <button [class.active]="activeProfileTab === 'currency'" (click)="activeProfileTab = 'currency'">
            Settlement Currencies
          </button>
          <button [class.active]="activeProfileTab === 'business'" (click)="activeProfileTab = 'business'">
            Business Profile
          </button>
          <button [class.active]="activeProfileTab === 'product'" (click)="activeProfileTab = 'product'">
            Product Lines
          </button>
          <button [class.active]="activeProfileTab === 'customers'" (click)="activeProfileTab = 'customers'">
            Major Clients
          </button>
          <button [class.active]="activeProfileTab === 'contact'" (click)="activeProfileTab = 'contact'">
            Key Contacts
          </button>
        </div>

        @if (activeProfileTab === 'currency') {
          <div class="profile-section-head">
            <h2>Transacting Currencies</h2>
            <button class="btn small" (click)="addCurrency()">+ Add Currency</button>
          </div>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style="width: 60px;">Sr #</th>
                  <th>Currency Code</th>
                  <th>Currency Description</th>
                  <th style="width: 140px; text-align: center;">Default</th>
                </tr>
              </thead>
              <tbody>
                @for (currency of currencies; track currency.code; let i = $index) {
                  <tr [class.default-row]="currency.isDefault">
                    <td>{{ i + 1 }}</td>
                    <td><span class="mono">{{ currency.code }}</span></td>
                    <td>{{ currency.description }}</td>
                    <td style="text-align: center;">
                      <label
                        class="modern-radio-pill"
                        [class.active]="currency.isDefault"
                        title="{{ currency.isDefault ? 'Primary settlement currency' : 'Click to set ' + currency.code + ' as default currency' }}"
                      >
                        <input
                          type="radio"
                          name="defaultCurrency"
                          [checked]="currency.isDefault"
                          (change)="setDefaultCurrency(currency)"
                        />
                        <span class="radio-text-label">
                          {{ currency.isDefault ? 'Default' : 'Set Default' }}
                        </span>
                      </label>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeProfileTab === 'business') {
          <div class="profile-section-head">
            <h2>Corporate Structure & Operations</h2>
          </div>
          <div class="form-grid">
            <label>
              Primary Business Type
              <app-custom-select [(ngModel)]="business.type" [options]="businessTypeOptions" />
            </label>
            <label>
              Company Legal Structure
              <app-custom-select [(ngModel)]="business.status" [options]="legalStructureOptions" />
            </label>
            <label>
              Years In Operation
              <input type="number" [(ngModel)]="business.years" />
            </label>
            <label>
              Place of Incorporation
              <input [(ngModel)]="business.place" />
            </label>
          </div>
        }

        @if (activeProfileTab === 'product') {
          <div class="profile-section-head">
            <h2>Supplied Product Categories & Brands</h2>
            <button class="btn small" (click)="addProduct()">+ Add Product Line</button>
          </div>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style="width: 60px;">Sr</th>
                  <th>Category Code</th>
                  <th>Category Description</th>
                  <th>Represented Brands</th>
                  <th>Key Certified Brands</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products; track product.code; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td><span class="mono">{{ product.code }}</span></td>
                    <td>{{ product.description }}</td>
                    <td>{{ product.brands }}</td>
                    <td><b>{{ product.selectedBrands }}</b></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeProfileTab === 'customers') {
          <div class="profile-section-head">
            <h2>Key Commercial References</h2>
            <button class="btn small" (click)="addCustomer()">+ Add Customer Reference</button>
          </div>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style="width: 60px;">Sr</th>
                  <th>Client Name</th>
                  <th>Contact Person</th>
                  <th>Contact Phone</th>
                  <th>Location</th>
                  <th>Fiscal Year</th>
                </tr>
              </thead>
              <tbody>
                @for (customer of customers; track customer.name; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td><b>{{ customer.name }}</b></td>
                    <td>{{ customer.contact }}</td>
                    <td>{{ customer.phone }}</td>
                    <td>{{ customer.city }}, {{ customer.country }}</td>
                    <td>{{ customer.dealsInYear }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeProfileTab === 'contact') {
          <div class="profile-section-head">
            <h2>Authorized Departmental Contact</h2>
          </div>
          <div class="form-grid">
            <label>Contact Person Name<input [(ngModel)]="contact.name" readonly /></label>
            <label>Department
              <app-custom-select [(ngModel)]="contact.department" [options]="departmentOptions" />
            </label>
            <label>Official Designation<input [(ngModel)]="contact.designation" readonly /></label>
            <label>Facility Location
              <app-custom-select [(ngModel)]="contact.office" [options]="officeOptions" />
            </label>
            <label>Official Email Address<input type="email" [(ngModel)]="contact.email" readonly /></label>
            <label>Mobile Number<input [(ngModel)]="contact.phone" readonly /></label>
            <label>Landline / Extension<input [(ngModel)]="contact.landline" readonly /></label>
            <label>WhatsApp Business<input [(ngModel)]="contact.whatsapp" readonly /></label>
          </div>
        }
      </article>

      <!-- 5. APPROVED SOURCING CATEGORIES -->
      <article class="panel">
        <div class="panel-title">
          <h2>Approved Supply Categories</h2>
        </div>

        <div class="tag-list" style="margin-bottom: 14px;">
          @if (categories.length === 0) {
            <span style="background: #f1f5f9; color: var(--muted);">No supply categories registered</span>
          }
          @for (cat of categories; track cat; let i = $index) {
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              {{ cat }}
              <button
                type="button"
                (click)="removeCategory(i)"
                style="background: none; border: none; color: var(--green); font-size: 13px; cursor: pointer; padding: 0 2px;"
                title="Remove category"
              >✕</button>
            </span>
          }
        </div>

        <div style="display: flex; gap: 8px;">
          <input
            [(ngModel)]="newCategoryInput"
            placeholder="Add category (e.g. IT & Hardware)"
            (keyup.enter)="addCategory()"
          />
          <button class="btn small" (click)="addCategory()">+ Add</button>
        </div>
        <p class="helper" style="margin-top: 10px;">
          Only RFQs in your approved categories will be displayed in your supplier bidding portal.
        </p>
      </article>

      <!-- 6. SETTLEMENT BANKING CARD -->
      <article class="panel">
        <div class="panel-title">
          <h2>Settlement Banking Details</h2>
        </div>

        <div class="form-stack">
          <label>Bank Name *<input [(ngModel)]="form.bank" placeholder="e.g. Habib Bank Limited" /></label>
          <label>IBAN / Account Number *<input [(ngModel)]="form.iban" placeholder="PK00 HABB 0000 1234 5678 9012" /></label>
          <label>Beneficiary Account Title *<input [(ngModel)]="form.accountTitle" placeholder="Beneficiary legal entity title" /></label>
          <label>Branch & City<input [(ngModel)]="form.branch" placeholder="Branch identifier / City" /></label>
        </div>

        <div class="callout warn" style="margin-top: 14px;">
          <b>Audit Control:</b> Any modification to verified banking credentials triggers a mandatory security hold and requires Finance re-verification.
        </div>
      </article>

      <!-- 7. COMPLIANCE DOCUMENTS CARD -->
      <article class="panel span-2 compliance-panel">
        <div class="panel-title">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2>Compliance Documents & Certifications</h2>
            <span class="count-pill">{{ documents.length }} Documents</span>
          </div>
        </div>

        <!-- Unified Modern Upload Section -->
        <div class="upload-container">
          <div class="upload-toolbar">
            <div class="upload-field-group">
              <label class="field-mini-label">Document Category</label>
              <app-custom-select [(ngModel)]="newDocType" [options]="docTypeOptions" minWidth="200px" />
            </div>
            <div class="upload-field-group flex-1">
              <label class="field-mini-label">Document Title (Optional)</label>
              <input
                [(ngModel)]="newDocName"
                placeholder="e.g. NTN-Certificate-2026.pdf"
                class="upload-title-input"
              />
            </div>
            <button class="btn upload-btn" (click)="addDocument()">
              <app-icon name="attachments" [size]="14" />
              <span>Attach File</span>
            </button>
          </div>

          <!-- Dropzone Area -->
          <div class="upload-dropzone">
            <input type="file" multiple (change)="filesSelected($event)" class="file-drop-input" title="Click or drop compliance documents" />
            <div class="dropzone-content">
              <div class="dropzone-icon-circle">
                <app-icon name="upload" [size]="20" />
              </div>
              <div class="dropzone-text-group">
                <b class="dropzone-headline">Drop compliance files here or <span class="browse-link">click to browse</span></b>
                <span class="dropzone-subtext">Supports PDF, JPG, PNG, XLSX (Up to 25MB per document)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Beautifully Aligned Document Cards (100% Precise Column Grid) -->
        <div class="compliance-doc-cards">
          @if (documents.length === 0) {
            <div class="empty-docs-state">
              <app-icon name="documents" [size]="32" />
              <p>No compliance documents attached yet.</p>
              <span>Upload required tax certificates, incorporation papers, or quality credentials above.</span>
            </div>
          }
          @for (doc of documents; track doc.id; let idx = $index) {
            <div class="doc-card" [class.is-verified]="doc.verified">
              <!-- Col 1: Icon Badge -->
              <div class="doc-icon-badge" [class.verified-badge]="doc.verified">
                <app-icon name="documents" [size]="18" />
              </div>

              <!-- Col 2: Details -->
              <div class="doc-details">
                <div class="doc-name-row">
                  <span class="doc-filename" [title]="doc.name">{{ doc.name }}</span>
                  <span class="doc-format-badge">{{ getFileExt(doc.name) }}</span>
                </div>
                <div class="doc-meta">
                  <span class="doc-type-tag">{{ doc.type }}</span>
                  <span class="meta-separator">·</span>
                  <span class="doc-date">Uploaded on {{ doc.date }}</span>
                </div>
              </div>

              <!-- Col 3: Status (Fixed-width 160px alignment column) -->
              <div class="doc-status-col">
                <app-status [text]="doc.status" [good]="doc.verified" [warn]="!doc.verified" />
              </div>

              <!-- Col 4: Actions (Fixed-width 140px alignment column) -->
              <div class="doc-actions-col">
                <button class="btn small ghost doc-action-btn" (click)="downloadDoc(doc)" title="Download {{ doc.name }}">
                  <app-icon name="download" [size]="13" />
                  <span>Download</span>
                </button>
                <button class="doc-delete-btn" (click)="removeDocument(doc.id)" title="Delete attachment">
                  <app-icon name="trash" [size]="14" />
                </button>
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
    zipCode: '75190',
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

  business = {
    type: 'Manufacturing',
    status: 'LLC',
    years: 18,
    place: 'Dubai, UAE'
  };

  products: ProductItem[] = [
    { code: 'ELEC', description: 'Electrical Equipment & Switchgear', brands: 'Schneider, ABB', selectedBrands: 'Schneider Electric' },
    { code: 'SAFE', description: 'Industrial Safety Equipment & PPE', brands: '3M, Honeywell', selectedBrands: '3M Certified' }
  ];

  customers: MajorCustomer[] = [
    { name: 'TAMCO Middle East Ltd.', contact: 'Ahmed Khan', phone: '+971 50 123 4567', city: 'Dubai', country: 'UAE', dealsInYear: 2025 },
    { name: 'Gulf Industrial Services', contact: 'Sara Ali', phone: '+971 55 321 7788', city: 'Abu Dhabi', country: 'UAE', dealsInYear: 2024 }
  ];

  contact: ContactPerson = {
    name: 'Ali Siddiqui',
    department: 'Procurement',
    designation: 'Commercial Director',
    address: 'Plot 14, Industrial Area',
    country: 'United Arab Emirates',
    city: 'Dubai',
    email: 'ali@abcsupplies.example',
    office: 'Head Office',
    phone: '+971 50 123 9989',
    fax: '+971 4 350 4413',
    landline: '+971 4 350 4412',
    extension: '104',
    whatsapp: '+971 50 123 9989'
  };

  newCategoryInput = 'IT & Hardware';
  newDocName = '';
  newDocType = 'Tax Document';

  readonly businessTypeOptions = ['Manufacturing', 'Distribution & Trading', 'Technical Services', 'Authorized Dealer'];
  readonly legalStructureOptions = ['LLC (Limited Liability Company)', 'PLC (Public Limited)', 'Sole Proprietorship', 'Free Zone Enterprise'];
  readonly departmentOptions = ['Procurement', 'Finance & Accounts', 'Commercial Sales', 'Quality Assurance'];
  readonly officeOptions = ['Head Office', 'Regional Branch', 'Manufacturing Plant', 'Central Warehouse'];
  readonly docTypeOptions = ['Tax Document', 'Bank Letter', 'Quality Certificate', 'Legal Registration'];

  documents: DocumentItem[] = [
    { id: 'DOC-001', name: 'SECP-Incorporation.pdf', type: 'Legal Registration', status: 'Verified', verified: true, date: '12 May 2026' },
    { id: 'DOC-002', name: 'NTN-Certificate-2026.pdf', type: 'Tax Document', status: 'Verified', verified: true, date: '14 May 2026' },
    { id: 'DOC-003', name: 'HBL-Bank-Letter.pdf', type: 'Bank Letter', status: 'Verified', verified: true, date: '16 May 2026' },
    { id: 'DOC-004', name: 'ISO-9001-Certificate.pdf', type: 'Quality Certificate', status: 'Pending Verification', verified: false, date: '20 May 2026' }
  ];

  getFileExt(name: string): string {
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'PDF';
  }

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
    this.customers = [...this.customers, { name: 'New Client Corporation', contact: 'Purchasing Manager', phone: '+971 4 000 0000', city: 'Dubai', country: 'UAE', dealsInYear: new Date().getFullYear() }];
    this.state.notify('Customer reference added.');
  }

  removeCategory(idx: number): void {
    const removed = this.categories.splice(idx, 1);
    this.state.notify(`Category "${removed[0]}" removed.`);
  }

  addDocument(): void {
    const name = this.newDocName.trim() || `${this.newDocType.replace(/\s+/g, '-')}-${new Date().getFullYear()}.pdf`;
    const doc: DocumentItem = {
      id: String(Date.now()),
      name,
      type: this.newDocType,
      status: 'Pending Verification',
      verified: false,
      date: 'Today'
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
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    files.forEach(f => {
      this.documents.unshift({
        id: String(Date.now() + Math.random()),
        name: f.name,
        type: this.newDocType || 'Legal Registration',
        status: 'Pending Verification',
        verified: false,
        date: 'Today'
      });
    });
    if (files.length > 0) {
      this.state.notify(`${files.length} document(s) uploaded successfully.`);
      input.value = '';
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
      zipCode: '75190',
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
