import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';

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
  imports: [FormsModule, PageHeadingComponent, CustomDatePickerComponent],
  styles: [`
    .attachment-table thead th { background: var(--role-accent, #50ae9b); color: #fff; border-bottom: 2px solid var(--role-accent-hover, #3d8e7e); transition: background-color 0.2s ease, border-color 0.2s ease; }
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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title"><h2>Add Attachment</h2></div>
        <div class="form-grid">
          <label>Document Description *<input [(ngModel)]="newAttachment.description" placeholder="e.g. Trade License" /></label>
          <label>Issue Date *
            <app-custom-date-picker [(ngModel)]="newAttachment.issueDate" />
          </label>
          <label>Doc Expiry Date *
            <app-custom-date-picker [(ngModel)]="newAttachment.expiryDate" />
          </label>
          <label>Attached File *<input type="file" (change)="onFileSelected($event)" /></label>
        </div>
        <div class="toolbar" style="margin-top: 16px;"><button class="btn secondary" (click)="resetForm()">Reset</button><button class="btn" (click)="addAttachment()">Save Attachment</button></div>
      </article>
    }

    <article class="panel">
      <div class="table-scroll">
        <table class="attachment-table">
          <thead><tr><th>SR</th><th>Document Description</th><th>Issue Date</th><th>Doc Expiry Date</th><th>Attached File</th><th>Action</th></tr></thead>
          <tbody>
            @for (attachment of attachments; track attachment.id; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td><input [(ngModel)]="attachment.description" [readonly]="!editing" /></td>
                <td>
                  <app-custom-date-picker [(ngModel)]="attachment.issueDate" [readonly]="!editing" [compact]="true" minWidth="135px" />
                </td>
                <td>
                  <app-custom-date-picker [(ngModel)]="attachment.expiryDate" [readonly]="!editing" [compact]="true" minWidth="135px" />
                </td>
                <td><span>{{ attachment.fileName || 'No File' }}</span></td>
                <td>
                  <div class="attachment-actions" style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-view" (click)="viewAttachment(attachment)" title="View Attachment">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <span>View</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteAttachment(attachment.id)" title="Delete attachment">
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
      <div class="toolbar" style="justify-content: flex-end; margin-top: 14px;"><button class="btn secondary" (click)="editing = !editing">{{ editing ? 'Lock Fields' : 'Edit' }}</button><button class="btn" (click)="saveAttachments()">Update</button></div>
    </article>

    @if (viewingAttachment) {
      <div class="attachment-modal-overlay" (click)="viewingAttachment = undefined">
        <div class="attachment-modal" (click)="$event.stopPropagation()">
          <div class="panel-title"><h2>View Attachment</h2><button class="btn small" (click)="viewingAttachment = undefined">✕</button></div>
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
