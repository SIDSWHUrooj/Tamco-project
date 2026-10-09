import { Routes } from '@angular/router';
import { PortalShellComponent } from './layout/portal-shell.component';
import { DashboardComponent } from './pages/dashboard.component';
import { VendorProfileComponent } from './pages/vendor-profile.component';
import { VendorsComponent } from './pages/vendors.component';
import { BankVerificationComponent } from './pages/bank-verification.component';
import { FinanceVendorsComponent } from './pages/finance-vendors.component';
import { BidComparisonComponent } from './pages/bid-comparison.component';
import { LogisticCostComponent } from './pages/logistic-cost.component';
import { OrdersPageComponent } from './pages/orders-page.component';
import { InvoicePageComponent } from './pages/invoice-page.component';
import { ReportsComponent } from './pages/reports.component';
import { UsersComponent } from './pages/users.component';
import { RolesComponent } from './pages/roles.component';
import { WorkflowsComponent } from './pages/workflows.component';
import { DocumentsComponent } from './pages/documents.component';
import { AttachmentsComponent } from './pages/attachments.component';
import { BanksComponent } from './pages/banks.component';
import { LoginPageComponent } from './pages/login-page.component';
import { RequisitionComponent } from './pages/requisition.component';
import { ManagementComponent } from './pages/management.component';
import { BiddingComponent } from './pages/bidding.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'vendor',
    component: PortalShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'orders', component: OrdersPageComponent },
      { path: 'bidding', component: BiddingComponent },
      { path: 'invoices', component: InvoicePageComponent },
      { path: 'profile', component: VendorProfileComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  {
    path: ':role',
    component: PortalShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vendors', component: VendorsComponent },
      { path: 'vendor-registration-req', component: VendorsComponent },
      { path: 'requisition', component: RequisitionComponent },
      { path: 'logistic-cost', component: LogisticCostComponent },
      { path: 'logistic-costs', component: LogisticCostComponent },
      { path: 'bid-comparison', component: BidComparisonComponent },
      { path: 'comparison', component: BidComparisonComponent },
      { path: 'orders', component: OrdersPageComponent },
      { path: 'invoices', component: InvoicePageComponent },
      { path: 'three-way-match', component: InvoicePageComponent },
      { path: 'bank-verification', component: BankVerificationComponent },
      { path: 'finance-vendors', component: FinanceVendorsComponent },
      { path: 'management', component: ManagementComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'workflows', component: WorkflowsComponent },
      { path: 'banks', component: BanksComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'attachments', component: AttachmentsComponent },
      { path: 'bidding', component: BiddingComponent },
      { path: 'profile', component: VendorProfileComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
