export type Role = 'vendor' | 'procurement' | 'finance' | 'admin';

export interface Vendor {
  id: string;
  name: string;
  location: string;
  categories: string[];
  procurementStatus: 'Pending' | 'Approved' | 'Rejected';
  financeStatus: 'Pending' | 'Approved' | 'Rejected';
  bank: string;
  rating: number;
  onTime: number;
  qcPass: number;
}

export interface Rfq {
  id: string;
  title: string;
  category: string;
  requiredDate: string;
  closeDate: string;
  status: 'Open' | 'Closed' | 'Evaluating';
  bids: Bid[];
}

export interface Bid {
  vendorId: string;
  vendor: string;
  price: number;
  location: string;
  deliveryDays: number;
  historyScore: number;
  submitted: boolean;
}

export interface PurchaseOrder {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  requiredDate: string;
  arrivalDate: string;
  approval: 'Pending' | 'Approved';
  grn: 'Pending' | 'Passed';
  qc: 'Pending' | 'Passed' | 'Rejected';
}

export interface Invoice {
  id: string;
  poId: string;
  vendor: string;
  amount: number;
  status: 'Not submitted' | 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  match: 'Pending' | 'Matched' | 'Mismatch';
}

export interface InvoiceLine {
  itemDescription: string;
  quantityReceived: number;
  unitOfMeasure: string;
  currency: string;
  unitCost: number;
  vat: number;
  total: number;
}
