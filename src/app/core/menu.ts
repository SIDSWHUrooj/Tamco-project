import { Role } from './models';

export interface MenuItem { label: string; icon: string; route: string; }

export const VENDOR_ACTIVE_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
  { label: 'Purchase Orders', icon: 'orders', route: 'orders' },
  { label: 'Tenders & Bidding', icon: 'bidding', route: 'bidding' },
  { label: 'Invoice Submission', icon: 'invoices', route: 'invoices' },
  { label: 'Company Profile', icon: 'profile', route: 'profile' }
];

export const VENDOR_ONBOARDING_MENU: MenuItem[] = [
  { label: 'Registration Profile', icon: 'profile', route: 'profile' }
];

export const ROLE_MENUS: Record<Role, MenuItem[]> = {
  vendor: VENDOR_ACTIVE_MENU,

  procurement: [
    { label: 'Dashboard', icon: '⌂', route: 'dashboard' },
    { label: 'Vendors Control', icon: '♙', route: 'vendors' },
    { label: 'Requisition', icon: '▧', route: 'requisition' },
    { label: 'Logistic Cost', icon: 'logistic-cost', route: 'logistic-cost' },
    { label: 'Bid Comparison', icon: '≋', route: 'bid-comparison' },
    { label: 'Purchase Orders', icon: '▣', route: 'orders' },
    { label: 'Reports', icon: '▥', route: 'reports' }
  ],
  finance: [
    { label: 'Dashboard', icon: '⌂', route: 'dashboard' },
    { label: 'Vendors (Finance)', icon: '♙', route: 'finance-vendors' },
    { label: 'Bank Verification', icon: '▦', route: 'bank-verification' },
    { label: 'Reports', icon: '▥', route: 'reports' }
  ],
  admin: [
    { label: 'Dashboard', icon: '⌂', route: 'dashboard' },
    { label: 'Vendors Control', icon: '♙', route: 'vendors' },
    { label: 'Requisition', icon: '▧', route: 'requisition' },
    { label: 'Management', icon: '▦', route: 'management' },
    { label: 'User Management', icon: '♙', route: 'users' },
    { label: 'Security Groups', icon: '♧', route: 'roles' },
    { label: 'Work Flow Setup', icon: '⇄', route: 'workflows' },
    { label: 'UAE Banks', icon: '$', route: 'banks' },
    { label: 'Reports', icon: '▥', route: 'reports' }
  ]
};

// Hidden pages preserved for direct access or future roadmap activation
export const HIDDEN_PAGES = [
  'three-way-match',
  'performance',
  'analytics',
  'contracts',
  'deliveries',
  'bidding',
  'payments',
  'invoices',
  'rfqs',
  'audit',
  'integrations',
  'security',
  'approval-matrix',
  'notifications'
];
