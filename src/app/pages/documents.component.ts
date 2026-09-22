import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';

export interface ControlledDoc {
  id: string;
  name: string;
  category: string;
  authority: string;
  docNumber: string;
  expiryDate: string;
  status: 'Verified' | 'Expiring Soon' | 'Expired' | 'Pending Review';
  fileSize: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent, CustomDatePickerComponent],
  template: `
    <app-page-heading eyebrow="Document Management" title="Controlled Document Repository" subtitle="Maintain supplier certificates, tax registration, ISO compliance documents and contractual attachments.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddDoc = !showAddDoc" style="display: inline-flex; align-items: center; gap: 6px;">
          @if (showAddDoc) {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Close Form</span>
          } @else {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Upload Document</span>
          }
        </button>
        <button class="btn secondary" (click)="exportIndex()" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Export Document Index</span>
        </button>
      </div>
    </app-page-heading>

    <!-- Upload New Compliance Document Form -->
    @if (showAddDoc) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Attach New Controlled Certificate / Document</h2>
        </div>

        <div class="form-grid">
          <label>Document Name *<input [(ngModel)]="newDoc.name" placeholder="e.g. SECP-Form-29-Annual-Filing.pdf" /></label>
          <label>Document Category *
            <app-custom-select [(ngModel)]="newDoc.category" [options]="categoryOptions" />
          </label>
          <label>Issuing Authority / Agency *<input [(ngModel)]="newDoc.authority" placeholder="e.g. Federal Board of Revenue / SECP" /></label>
          <label>Certificate / Document #<input [(ngModel)]="newDoc.docNumber" placeholder="e.g. NTN-7483921" /></label>
          <label>Expiration Date *
            <app-custom-date-picker [(ngModel)]="newDoc.expiryDate" />
          </label>
          <label>Upload File (PDF/Image)
            <input type="file" (change)="onFileSelected($event)" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addDoc()">Save & Index Document</button>
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
          placeholder="Search documents by name, authority, or number..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="categoryFilter"
        [options]="filterCategoryOptions"
        minWidth="180px"
      />
    </div>

    <!-- Live Documents Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Document File</th>
              <th>Category</th>
              <th>Issuing Authority</th>
              <th>Document #</th>
              <th>Expiry Date</th>
              <th>Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (d of filteredDocs(); track d.id) {
              <tr>
                <td><input [(ngModel)]="d.name" style="font-weight: 600; min-width: 210px;" /></td>
                <td><input [(ngModel)]="d.category" style="width: 130px;" /></td>
                <td><input [(ngModel)]="d.authority" style="min-width: 170px;" /></td>
                <td><input [(ngModel)]="d.docNumber" style="font-family: monospace; font-size: 11px; width: 110px;" /></td>
                <td>
                  <app-custom-date-picker [(ngModel)]="d.expiryDate" [compact]="true" minWidth="135px" />
                </td>
                <td><small style="color: #64748b;">{{ d.fileSize }}</small></td>
                <td>
                  <app-status [text]="d.status" [good]="d.status==='Verified'" [warn]="d.status==='Expiring Soon'" [bad]="d.status==='Expired'" />
                </td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-download" (click)="download(d)" title="Download {{ d.name }}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <span>Download</span>
                    </button>
                    <button class="btn-action btn-action-save" (click)="saveDoc(d)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteDoc(d.id)" title="Delete document">
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
  `
})
export class DocumentsComponent {
  readonly state = inject(PortalStateService);

  showAddDoc = false;
  searchQuery = '';
  categoryFilter = '';

  readonly filterCategoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Taxation', label: 'Taxation' },
    { value: 'Banking Evidence', label: 'Banking Evidence' },
    { value: 'Quality & ISO', label: 'Quality & ISO' },
    { value: 'Corporate Legal', label: 'Corporate Legal' }
  ];

  readonly categoryOptions = [
    'Taxation',
    'Banking Evidence',
    'Quality & ISO',
    'Corporate Legal'
  ];

  newDoc: ControlledDoc = {
    id: 'DOC-005',
    name: 'SECP-Form-29-Directors.pdf',
    category: 'Corporate Legal',
    authority: 'Securities and Exchange Commission of Pakistan',
    docNumber: 'SECP-REG-44912',
    expiryDate: '2027-12-31',
    status: 'Verified',
    fileSize: '2.4 MB'
  };

  documents: ControlledDoc[] = [
    { id: 'DOC-001', name: 'NTN-Tax-Certificate-2026.pdf', category: 'Taxation', authority: 'Federal Board of Revenue', docNumber: 'NTN-7483921', expiryDate: '2027-06-30', status: 'Verified', fileSize: '1.2 MB' },
    { id: 'DOC-002', name: 'Official-Bank-Letter-HBL.pdf', category: 'Banking Evidence', authority: 'Habib Bank Limited', docNumber: 'HBL-AUTH-9012', expiryDate: '2027-12-31', status: 'Verified', fileSize: '850 KB' },
    { id: 'DOC-003', name: 'ISO-9001-Quality-Cert.pdf', category: 'Quality & ISO', authority: 'Bureau Veritas Quality', docNumber: 'ISO-PK-88210', expiryDate: '2026-11-15', status: 'Expiring Soon', fileSize: '3.1 MB' },
    { id: 'DOC-004', name: 'Commercial-Registration-SECP.pdf', category: 'Corporate Legal', authority: 'SECP Pakistan', docNumber: 'SECP-009941', expiryDate: '2028-01-01', status: 'Verified', fileSize: '1.9 MB' }
  ];

  filteredDocs(): ControlledDoc[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cf = this.categoryFilter;
    return this.documents.filter(d => {
      const matchQ = !q || (d.name || '').toLowerCase().includes(q) || (d.authority || '').toLowerCase().includes(q) || (d.docNumber || '').toLowerCase().includes(q) || (d.category || '').toLowerCase().includes(q) || (d.id || '').toLowerCase().includes(q);
      const matchC = !cf || d.category === cf;
      return matchQ && matchC;
    });
  }

  addDoc(): void {
    if (!this.newDoc.name || !this.newDoc.authority) {
      this.state.notify('Error: Document name and authority are required.');
      return;
    }
    const created: ControlledDoc = { ...this.newDoc, id: `DOC-${Math.floor(100 + Math.random() * 900)}` };
    this.documents = [created, ...this.documents];
    this.state.notify(`Document "${created.name}" indexed successfully.`);
    this.resetForm();
    this.showAddDoc = false;
  }

  resetForm(): void {
    this.newDoc = {
      id: '',
      name: '',
      category: 'Corporate Legal',
      authority: '',
      docNumber: '',
      expiryDate: '2027-06-30',
      status: 'Verified',
      fileSize: '1.5 MB'
    };
  }

  download(d: ControlledDoc): void {
    this.state.notify(`Downloading verified document "${d.name}"...`);
  }

  saveDoc(d: ControlledDoc): void {
    this.state.notify(`Document details for "${d.name}" saved.`);
  }

  deleteDoc(id: string): void {
    this.documents = this.documents.filter(d => d.id !== id);
    this.state.notify('Document deleted from archive.');
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      this.newDoc.name = file.name;
      this.newDoc.fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      this.state.notify(`File "${file.name}" selected.`);
    }
  }

  exportIndex(): void {
    this.state.notify('Exporting controlled document index (Excel)...');
  }
}
