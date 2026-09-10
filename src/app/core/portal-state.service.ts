import { Injectable, computed, signal } from '@angular/core';
import { Bid, Invoice, PurchaseOrder, Rfq, Role, Vendor } from './models';

@Injectable({ providedIn: 'root' })
export class PortalStateService {
  readonly role = signal<Role>('procurement');
  readonly authenticated = signal(false);
  readonly toast = signal<string>('');

  readonly vendors = signal<Vendor[]>([
    { id: 'VEN-10024', name: 'ABC Supplies Pvt. Ltd.', location: 'Karachi', categories: ['Electrical', 'Safety Equipment'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'HBL', rating: 4.8, onTime: 94, qcPass: 98 },
    { id: 'VEN-10031', name: 'Global Traders', location: 'Lahore', categories: ['Mechanical'], procurementStatus: 'Pending', financeStatus: 'Approved', bank: 'UBL', rating: 4.2, onTime: 88, qcPass: 92 },
    { id: 'VEN-10039', name: 'Tech Solutions', location: 'Islamabad', categories: ['IT & Hardware'], procurementStatus: 'Approved', financeStatus: 'Pending', bank: 'Meezan Bank', rating: 4.6, onTime: 96, qcPass: 99 },
    { id: 'VEN-10044', name: 'Perfect Industrial', location: 'Karachi', categories: ['Mechanical', 'Raw Materials'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'Bank Alfalah', rating: 4.5, onTime: 90, qcPass: 95 }
  ]);

  readonly rfqs = signal<Rfq[]>([
    { id: 'RFQ-0061', title: 'Electrical Panels', category: 'Electrical', requiredDate: '2026-09-10', closeDate: '2026-08-26', status: 'Open', bids: [
      { vendorId: 'VEN-10024', vendor: 'ABC Supplies Pvt. Ltd.', price: 52000, location: 'Karachi', deliveryDays: 8, historyScore: 94, submitted: true },
      { vendorId: 'VEN-10044', vendor: 'Perfect Industrial', price: 54800, location: 'Karachi', deliveryDays: 6, historyScore: 91, submitted: true }
    ]},
    { id: 'RFQ-0060', title: 'Safety Equipment', category: 'Safety Equipment', requiredDate: '2026-09-02', closeDate: '2026-08-23', status: 'Open', bids: [
      { vendorId: 'VEN-10024', vendor: 'ABC Supplies Pvt. Ltd.', price: 18600, location: 'Karachi', deliveryDays: 5, historyScore: 96, submitted: true }
    ]},
    { id: 'RFQ-0059', title: 'Mechanical Parts', category: 'Mechanical', requiredDate: '2026-08-30', closeDate: '2026-08-15', status: 'Evaluating', bids: [
      { vendorId: 'VEN-10031', vendor: 'Global Traders', price: 41000, location: 'Lahore', deliveryDays: 9, historyScore: 83, submitted: true },
      { vendorId: 'VEN-10044', vendor: 'Perfect Industrial', price: 43800, location: 'Karachi', deliveryDays: 6, historyScore: 91, submitted: true }
    ]}
  ]);

  readonly purchaseOrders = signal<PurchaseOrder[]>([
    { id: 'PO-002345', vendor: 'ABC Supplies Pvt. Ltd.', category: 'Electrical', amount: 52000, requiredDate: '2026-08-25', arrivalDate: '2026-08-27', approval: 'Pending', grn: 'Pending', qc: 'Pending' },
    { id: 'PO-002334', vendor: 'ABC Supplies Pvt. Ltd.', category: 'Safety Equipment', amount: 18600, requiredDate: '2026-08-22', arrivalDate: '2026-08-22', approval: 'Approved', grn: 'Passed', qc: 'Passed' },
    { id: 'PO-002321', vendor: 'Perfect Industrial', category: 'Mechanical', amount: 43800, requiredDate: '2026-08-19', arrivalDate: '2026-08-21', approval: 'Approved', grn: 'Passed', qc: 'Pending' }
  ]);

  readonly invoices = signal<Invoice[]>([
    { id: 'INV-00245', poId: 'PO-002334', vendor: 'ABC Supplies Pvt. Ltd.', amount: 18600, status: 'Pending', match: 'Matched' },
    { id: 'INV-00246', poId: 'PO-002301', vendor: 'Global Traders', amount: 8750, status: 'Approved', match: 'Matched' },
    { id: 'INV-00247', poId: 'PO-002299', vendor: 'Tech Solutions', amount: 12900, status: 'Rejected', match: 'Mismatch' }
  ]);

  readonly approvedVendors = computed(() => this.vendors().filter(v => v.procurementStatus === 'Approved' && v.financeStatus === 'Approved'));
  readonly pendingProcurement = computed(() => this.vendors().filter(v => v.procurementStatus === 'Pending'));
  readonly pendingFinance = computed(() => this.vendors().filter(v => v.financeStatus === 'Pending'));
  readonly overdueOrders = computed(() => this.purchaseOrders().filter(po => po.arrivalDate > po.requiredDate));

  setRole(role: Role): void { this.role.set(role); }

  signIn(role: Role): void {
    this.role.set(role);
    this.authenticated.set(true);
  }

  signOut(): void {
    this.authenticated.set(false);
  }

  notify(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2800);
  }

  approveVendor(id: string, side: 'procurement' | 'finance'): void {
    this.vendors.update(items => items.map(v => v.id === id ? {
      ...v,
      procurementStatus: side === 'procurement' ? 'Approved' : v.procurementStatus,
      financeStatus: side === 'finance' ? 'Approved' : v.financeStatus
    } : v));
    this.notify(`${side === 'procurement' ? 'Procurement' : 'Finance'} verification approved for ${id}`);
  }

  submitBid(rfqId: string, price: number, deliveryDays: number): void {
    this.rfqs.update(items => items.map(r => {
      if (r.id !== rfqId) return r;
      const existing = r.bids.some(b => b.vendorId === 'VEN-10024');
      const bid: Bid = { vendorId: 'VEN-10024', vendor: 'ABC Supplies Pvt. Ltd.', price, location: 'Karachi', deliveryDays, historyScore: 94, submitted: true };
      return { ...r, bids: existing ? r.bids.map(b => b.vendorId === 'VEN-10024' ? bid : b) : [...r.bids, bid] };
    }));
    this.notify(`Bid submitted for ${rfqId}`);
  }

  approvePo(id: string): void {
    this.purchaseOrders.update(items => items.map(po => po.id === id ? { ...po, approval: 'Approved' } : po));
    this.notify(`${id} approved and released to supplier`);
  }

  updateArrival(id: string, arrivalDate: string): void {
    let late = false;
    this.purchaseOrders.update(items => items.map(po => {
      if (po.id !== id) return po;
      late = arrivalDate > po.requiredDate;
      return { ...po, arrivalDate };
    }));
    this.notify(late ? `Arrival date updated. Internal delay alert triggered for ${id}.` : `Arrival date updated for ${id}`);
  }

  setQc(id: string, status: 'Passed' | 'Rejected'): void {
    this.purchaseOrders.update(items => items.map(po => po.id === id ? { ...po, grn: 'Passed', qc: status } : po));
    this.notify(`QC ${status.toLowerCase()} for ${id}`);
  }

  uploadInvoice(poId: string, amount: number): void {
    const po = this.purchaseOrders().find(x => x.id === poId);
    if (!po || po.qc !== 'Passed') {
      this.notify('Invoice blocked: GRN and QC must be passed first.');
      return;
    }
    const invoice: Invoice = { id: `INV-${Math.floor(30000 + Math.random() * 5000)}`, poId, vendor: po.vendor, amount, status: 'Pending', match: amount === po.amount ? 'Matched' : 'Mismatch' };
    this.invoices.update(items => [invoice, ...items.filter(x => x.poId !== poId)]);
    this.notify(`Invoice uploaded for ${poId}; 3-way match ${invoice.match.toLowerCase()}.`);
  }

  approveInvoice(id: string): void {
    this.invoices.update(items => items.map(inv => inv.id === id && inv.match === 'Matched' ? { ...inv, status: 'Approved' } : inv));
    this.notify(`Invoice ${id} approved`);
  }
}
