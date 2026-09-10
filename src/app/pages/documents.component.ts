import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Document Management" title="Controlled Document Repository" subtitle="Maintain supplier certificates, tax registration, ISO compliance documents and contractual attachments.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddDoc = !showAddDoc">
          {{ showAddDoc ? '✕ Close Form' : '+ Upload Document' }}
        </button>
        <button class="btn secondary" (click)="exportIndex()">Export Document Index</button>
      </div>
    </app-page-heading>

    <!-- Upload Document Form -->
    @if (showAddDoc) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Attach New Controlled Certificate / Document</h2>
            <p>Upload stamped legal instrument, specify issuing authority and validity expiration.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Document Name *<input [(ngModel)]="newDoc.name" placeholder="e.g. SECP-Form-29-Annual-Filing.pdf" /></label>
          <label>Document Category *
            <select [(ngModel)]="newDoc.category" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Taxation">Taxation</option>
              <option value="Banking Evidence">Banking Evidence</option>
              <option value="Quality & ISO">Quality & ISO</option>
              <option value="Corporate Legal">Corporate Legal</option>
            </select>
          </label>
          <label>Issuing Authority / Agency *<input [(ngModel)]="newDoc.authority" placeholder="e.g. Federal Board of Revenue / SECP" /></label>
          <label>Certificate / Document #<input [(ngModel)]="newDoc.docNumber" placeholder="e.g. NTN-7483921" /></label>
          <label>Expiration Date *<input type="date" [(ngModel)]="newDoc.expiryDate" /></label>
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
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search documents by name, authority, or number..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="categoryFilter"
      >
        <option value="">All Categories</option>
        <option value="Taxation">Taxation</option>
        <option value="Banking Evidence">Banking Evidence</option>
        <option value="Quality & ISO">Quality & ISO</option>
        <option value="Corporate Legal">Corporate Legal</option>
      </select>
    </div>

    <!-- Live Documents Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Controlled Document Archive</h2>
          <p>Verified certificates with automated expiry tracking</p>
        </div>
      </div>

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
                <td><input type="date" [(ngModel)]="d.expiryDate" /></td>
                <td><small style="color: #64748b;">{{ d.fileSize }}</small></td>
                <td>
                  <app-status [text]="d.status" [good]="d.status==='Verified'" [warn]="d.status==='Expiring Soon'" [bad]="d.status==='Expired'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="download(d)">Download</button>
                    <button class="btn small ghost" (click)="saveDoc(d)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteDoc(d.id)">✕</button>
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

  filteredDocs = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const cf = this.categoryFilter;
    return this.documents.filter(d => {
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.authority.toLowerCase().includes(q) || d.docNumber.toLowerCase().includes(q);
      const matchC = !cf || d.category === cf;
      return matchQ && matchC;
    });
  });

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
