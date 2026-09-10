import { Role } from './models';

export interface MenuItem { label: string; icon: string; route: string; }

export const ROLE_MENUS: Record<Role, MenuItem[]> = {
  vendor: [
    { label: 'Dashboard', icon: '⌂', route: 'dashboard' },
    { label: 'My Profile', icon: '♙', route: 'profile' },
    { label: 'RFQ / Bids', icon: '▧', route: 'rfqs' },
    { label: 'Orders', icon: '▣', route: 'orders' },
    { label: 'Deliveries', icon: '▱', route: 'deliveries' },
    { label: 'Invoices', icon: '▤', route: 'invoices' },
    { label: 'Payments', icon: '$', route: 'payments' },
    { label: 'Performance', icon: '⌁', route: 'performance' },
    { label: 'Documents', icon: '□', route: 'documents' },
    { label: 'Notifications', icon: '♢', route: 'notifications' }
  ],
  procurement: [
    { label: 'Dashboard', icon: '⌂', route: 'dashboard' },
    { label: 'Vendors', icon: '♙', route: 'vendors' },
    { label: 'RFQ Management', icon: '▧', route: 'rfqs' },
    { label: 'PO Management', icon: '▣', route: 'orders' },
    { label: 'Bid Comparison', icon: '≋', route: 'bid-comparison' },
    { label: 'Deliveries', icon: '▱', route: 'deliveries' },
    { label: 'Reports', icon: '▥', route: 'reports' },
    { label: 'Analytics', icon: '⌁', route: 'analytics' },
    { label: 'Contract Management', icon: '□', route: 'contracts' },
    { label: 'Notifications', icon: '♢', route: 'notifications' },
    { label: 'Settings', icon: '⚙', route: 'settings' }
  ],
  finance: [
    { label: 'Dashboard', icon: '⌂', route: 'dashboard' },
    { label: 'Vendors (Finance)', icon: '♙', route: 'finance-vendors' },
    { label: 'Bank Verification', icon: '▦', route: 'bank-verification' },
    { label: 'Invoices', icon: '▤', route: 'invoices' },
    { label: 'Payments', icon: '$', route: 'payments' },
    { label: '3-Way Match', icon: '≋', route: 'three-way-match' },
    { label: 'Reports', icon: '▥', route: 'reports' },
    { label: 'Analytics', icon: '⌁', route: 'analytics' },
    { label: 'Notifications', icon: '♢', route: 'notifications' },
    { label: 'Settings', icon: '⚙', route: 'settings' }
  ],
  admin: [
    { label: 'Dashboard', icon: '⌂', route: 'dashboard' },
    { label: 'Bidding', icon: '▧', route: 'bidding' },
    { label: 'User Management', icon: '♙', route: 'users' },
    { label: 'Role Management', icon: '♧', route: 'roles' },
    { label: 'Workflow Setup', icon: '⇄', route: 'workflows' },
    { label: 'Approval Matrix', icon: '✓', route: 'approval-matrix' },
    { label: 'System Settings', icon: '⚙', route: 'settings' },
    { label: 'Master Data', icon: '▦', route: 'master-data' },
    { label: 'Banks', icon: '$', route: 'banks' },
    { label: 'Attachments', icon: '□', route: 'attachments' },
    { label: 'Audit Logs', icon: '▤', route: 'audit' },
    { label: 'Integrations', icon: '⌁', route: 'integrations' },
    { label: 'Reports', icon: '▥', route: 'reports' },
    { label: 'Security', icon: '◇', route: 'security' },
    { label: 'Notifications', icon: '♢', route: 'notifications' }
  ]
};
