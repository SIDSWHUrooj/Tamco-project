import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';

interface AttachmentRecord {
  id: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  fileName: string;
}

@Component({
  selector: 'app-attachments',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent],
  styles: [`
    .attachment-head { background: #025c4d; color: #fff; padding: 10px 14px; border-radius: 5px; font-size: 15px; font-weight: 600; }
    .attachment-table thead th { background: #149982; color: #fff; }
    .attachment-table input { min-width: 120px; }
    .attachment-actions { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .attachment-modal-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(7, 18, 40, .45); display: grid; place-items: center; padding: 20px; }
    .attachment-modal { width: min(620px, 100%); background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 18px 50px rgba(7, 22, 43, .28); }
  `],
  template: `
    <app-page-heading eyebrow="Administration" title="Attachment" subtitle="Manage vendor document attachments, issue dates, expiry dates and uploaded files.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddForm = !showAddForm">{{ showAddForm ? '✕ Close Form' : '+ Add Attachment' }}</button>
        <button class="btn secondary" (click)="exportAttachments()">Export Attachments</button>
      </div>
    </app-page-heading>

    @if (showAddForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #025c4d;">
        <div class="panel-title"><div><h2>Add Attachment</h2><p>Add a document description, validity dates and attached file.</p></div></div>
        <div class="form-grid">
          <label>Document Description *<input [(ngModel)]="newAttachment.description" placeholder="e.g. Trade License" /></label>
          <label>Issue Date *<input type="date" [(ngModel)]="newAttachment.issueDate" /></label>
          <label>Doc Expiry Date *<input type="date" [(ngModel)]="newAttachment.expiryDate" /></label>
          <label>Attached File *<input type="file" (change)="onFileSelected($event)" /></label>
        </div>
        <div class="toolbar" style="margin-top: 16px;"><button class="btn secondary" (click)="resetForm()">Reset</button><button class="btn" (click)="addAttachment()">Save Attachment</button></div>
      </article>
    }

    <article class="panel">
      <div class="attachment-head">Attachment</div>
      <hr style="margin: 5px 0 16px; border: 0; border-top: 1px solid forestgreen;" />
      <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;"><button class="btn" (click)="showAddForm = true">+ Add Attachment</button></div>
      <div class="table-scroll">
        <table class="attachment-table">
          <thead><tr><th>SR</th><th>Document Description</th><th>Issue Date</th><th>Doc Expiry Date</th><th>Attached File</th><th>Action</th></tr></thead>
          <tbody>
            @for (attachment of attachments; track attachment.id; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td><input [(ngModel)]="attachment.description" [readonly]="!editing" /></td>
                <td><input type="date" [(ngModel)]="attachment.issueDate" [readonly]="!editing" /></td>
                <td><input type="date" [(ngModel)]="attachment.expiryDate" [readonly]="!editing" /></td>
                <td><span>{{ attachment.fileName || 'No File' }}</span></td>
                <td><div class="attachment-actions"><button class="btn small ghost" (click)="viewAttachment(attachment)">View</button><button class="btn small danger-btn" (click)="deleteAttachment(attachment.id)">✕</button></div></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="toolbar" style="justify-content: flex-end; margin-top: 14px;"><button class="btn secondary" (click)="editing = !editing">{{ editing ? 'Lock Fields' : 'Edit' }}</button><button class="btn" (click)="saveAttachments()">Update</button></div>
    </article>

    @if (viewingAttachment) {
      <div class="attachment-modal-overlay" (click)="viewingAttachment = undefined">
        <div class="attachment-modal" (click)="$event.stopPropagation()">
          <div class="panel-title"><div><h2>View Attachment</h2><p>{{ viewingAttachment.fileName || 'No file attached.' }}</p></div><button class="btn small" (click)="viewingAttachment = undefined">✕</button></div>
          @if (viewingAttachment.fileName) { <div class="callout info">Attached file: <b>{{ viewingAttachment.fileName }}</b></div> } @else { <div class="callout warn">No file attached.</div> }
        </div>
      </div>
    }
  `
})
export class AttachmentsComponent {
  private readonly state = inject(PortalStateService);
  showAddForm = false;
  editing = false;
  viewingAttachment?: AttachmentRecord;
  newAttachment: AttachmentRecord = this.emptyAttachment();
  attachments: AttachmentRecord[] = [
    { id: 'ATT-001', description: 'Trade License', issueDate: '2026-05-12', expiryDate: '2027-05-30', fileName: 'Trade-License-2026.pdf' },
    { id: 'ATT-002', description: 'VAT Registration Certificate', issueDate: '2026-05-14', expiryDate: '2027-06-30', fileName: 'VAT-Certificate.pdf' },
    { id: 'ATT-003', description: 'ISO 9001 Certificate', issueDate: '2026-05-20', expiryDate: '2026-11-15', fileName: 'ISO-9001-Certificate.pdf' }
  ];

  private emptyAttachment(): AttachmentRecord { return { id: '', description: '', issueDate: '', expiryDate: '', fileName: '' }; }

  addAttachment(): void {
    if (!this.newAttachment.description || !this.newAttachment.issueDate || !this.newAttachment.expiryDate || !this.newAttachment.fileName) {
      this.state.notify('Document description, dates and file are required.');
      return;
    }
    this.attachments = [...this.attachments, { ...this.newAttachment, id: `ATT-${Date.now()}` }];
    this.state.notify('Attachment added successfully.');
    this.resetForm();
    this.showAddForm = false;
  }

  resetForm(): void { this.newAttachment = this.emptyAttachment(); }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.newAttachment.fileName = file.name;
  }

  viewAttachment(attachment: AttachmentRecord): void { this.viewingAttachment = attachment; }

  deleteAttachment(id: string): void {
    this.attachments = this.attachments.filter(attachment => attachment.id !== id);
    this.state.notify('Attachment deleted.');
  }

  saveAttachments(): void { this.state.notify('Attachment details updated successfully.'); }

  exportAttachments(): void { this.state.notify('Exporting attachment register (Excel)...'); }
}
