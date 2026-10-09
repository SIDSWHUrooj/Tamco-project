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

export interface VendorRegistrationReq {
  id: string;
  vendorName: string;
  email: string;
  phone: string;
  contactPerson: string;
  status: 'Draft' | 'Email Sent' | 'Profile Completed';
  createdAt: string;
  tempPassword?: string;
}

export interface RequisitionAssignedVendor {
  itemId: string;
  itemDesc: string;
  lineNum: number;
  vendorId: string;
  vendorName: string;
}

export interface RequisitionHeader {
  documentNumber: string;
  requiredFor: string;
  enteredBy: string;
  date: string;
  dateRequired: string;
  shipVia: string;
  location: string;
  requestDescription: string;
  comments?: string;
  status?: 'Draft' | 'Submitted' | 'Vendors Assigned' | 'Approved' | 'Rejected';
}

export interface RequisitionLineItem {
  sr: number;
  lineNum?: number;
  itemNo: string;
  itemDesc: string;
  uom: string;
  quantity: number;
  location: string;
  projectId: string;
  incoTerm: string;
  shipVia: string;
  brand: string;
  country: string;
  dateRequired: string;
  comments: string;
}

export interface Requisition {
  header: RequisitionHeader;
  items: RequisitionLineItem[];
  assignedVendors?: RequisitionAssignedVendor[];
}

export interface BankRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  bankName: string;
  iban: string;
  accountTitle: string;
  branchCode: string;
  verificationStatus: 'Approved' | 'Pending' | 'Rejected';
  verifiedDate: string;
  notes: string;
}

export interface MasterVendor {
  vendorId: string;
  vendorName: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  stateProvince: string;
  country: string;
  telephone: string;
  terms: string;
  website: string;
  contactName: string;
  bankCode: string;
  taxRegistrationCode: string;
  startDate: string;
  inactiveDate: string;
  status: 'Active' | 'Inactive' | 'Under Review' | 'Approved' | 'Pending';
  tradeLicenseNumber?: string;
  tradeLicenseExpiry?: string;
  vatTrn?: string;
  corporateTax?: string;
  contacts?: { id?: number; name: string; email: string; number: string; designation?: string }[];
  documents?: { id?: number; name: string; type: string; expiry?: string }[];
}

export interface LogisticCost {
  id: string;
  reqNo: string;
  itemNo: string;
  vendorName: string;
  type: 'Freight' | 'Insurance' | 'Other';
  currency: 'AED' | 'USD' | 'EUR';
  amount: number;
  remarks: string;
}

export interface VendorBidDetail {
  vendorId: string;
  vendorName: string;
  currency: string;
  price: number;
  exchangeRateToAed: number;
  validityDate: string;
  deliveryDate: string;
  insuranceCost: number;
  insuranceCurrency: string;
  freightCost: number;
  freightCurrency: string;
  otherCost: number;
  otherCurrency: string;
  remarks?: string;
  selected?: boolean;
}

export interface ItemBidComparison {
  reqNo: string;
  itemNo: string;
  itemDesc: string;
  qty: number;
  deliveryDate: string;
  winningVendorId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  bids: VendorBidDetail[];
}

export interface DocumentTypeItem {
  id: string;
  docId: string;
  docName: string;
  expirable: boolean;
  group: boolean;
  mandatory: boolean;
}

export interface BrandItem {
  id: string;
  brandId: string;
  brandName: string;
}

export interface ProductItem {
  id: string;
  productId: string;
  productName: string;
  category?: string;
}

export interface DesignationItem {
  id: string;
  desigId: string;
  desigName: string;
  deptId: string;
  deptName: string;
}

export interface DepartmentItem {
  id: string;
  deptId: string;
  deptName: string;
}

export interface LegacyUserItem {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  password?: string;
  country: string;
  city: string;
  phoneNo: string;
  cellNo: string;
  department: string;
  designation: string;
  email: string;
  securityGroup: string;
  status: 'Active' | 'Inactive';
}

export interface EmailSetupConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  fromAddress: string;
  ccAddress: string;
}

export interface AuthAccount {
  username: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  organization: string;
  initials: string;
  badge: string;
  vendorStatus?: number; // 0 = Incomplete Wizard, 1 = Review Mode, 2 = Pending Approval, 3+ = Approved Partner
}

export const PORTAL_ACCOUNTS: AuthAccount[] = [
  {
    username: 'admin',
    email: 'admin@tamco.ae',
    password: 'admin123',
    role: 'admin',
    name: 'Admin Lead',
    organization: 'TAMCO Administration',
    initials: 'AL',
    badge: 'Administration'
  },
  {
    username: 'procurement',
    email: 'procurement@tamco.ae',
    password: 'procurement123',
    role: 'procurement',
    name: 'Sarah Jenkins',
    organization: 'Procurement Department',
    initials: 'SJ',
    badge: 'Procurement'
  },
  {
    username: 'finance',
    email: 'finance@tamco.ae',
    password: 'finance123',
    role: 'finance',
    name: 'David Chen',
    organization: 'Finance Operations',
    initials: 'DC',
    badge: 'Finance & AP'
  },
  {
    username: 'vendor',
    email: 'vendor@abcsupplies.com',
    password: 'vendor123',
    role: 'vendor',
    name: 'ABC Supplies Pvt. Ltd.',
    organization: 'VEN-10024 · Dubai',
    initials: 'AS',
    badge: 'Partner (Approved ERP)',
    vendorStatus: 3
  },
  {
    username: 'vendor-pending',
    email: 'pending@gulftech.ae',
    password: 'vendor123',
    role: 'vendor',
    name: 'Gulf Tech Enterprises LLC',
    organization: 'REQ-2024-889 · In Audit',
    initials: 'GT',
    badge: 'Vendor (Pending Audit)',
    vendorStatus: 2
  },
  {
    username: 'vendor-review',
    email: 'review@arabianpipes.ae',
    password: 'vendor123',
    role: 'vendor',
    name: 'Arabian Pipes & Fittings',
    organization: 'REQ-2024-912 · Review',
    initials: 'AP',
    badge: 'Vendor (Review Mode)',
    vendorStatus: 1
  },
  {
    username: 'vendor-new',
    email: 'newvendor@oriental.ae',
    password: 'vendor123',
    role: 'vendor',
    name: 'Oriental Supplies Co.',
    organization: 'REQ-2024-940 · New Invite',
    initials: 'OS',
    badge: 'Vendor (New Wizard)',
    vendorStatus: 0
  }
];


