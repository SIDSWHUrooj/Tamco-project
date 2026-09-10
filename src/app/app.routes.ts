import { Routes } from '@angular/router';
import { PortalShellComponent } from './layout/portal-shell.component';
import { DashboardComponent } from './pages/dashboard.component';
import { VendorProfileComponent } from './pages/vendor-profile.component';
import { VendorsComponent } from './pages/vendors.component';
import { BankVerificationComponent } from './pages/bank-verification.component';
import { FinanceVendorsComponent } from './pages/finance-vendors.component';
import { RfqPageComponent } from './pages/rfq-page.component';
import { BidComparisonComponent } from './pages/bid-comparison.component';
import { OrdersPageComponent } from './pages/orders-page.component';
import { DeliveryPageComponent } from './pages/delivery-page.component';
import { InvoicePageComponent } from './pages/invoice-page.component';
import { ThreeWayMatchComponent } from './pages/three-way-match.component';
import { PaymentsComponent } from './pages/payments.component';
import { PerformanceComponent } from './pages/performance.component';
import { ReportsComponent } from './pages/reports.component';
import { UsersComponent } from './pages/users.component';
import { RolesComponent } from './pages/roles.component';
import { WorkflowsComponent } from './pages/workflows.component';
import { ApprovalMatrixComponent } from './pages/approval-matrix.component';
import { IntegrationsComponent } from './pages/integrations.component';
import { AuditLogsComponent } from './pages/audit.component';
import { SettingsComponent } from './pages/settings.component';
import { DocumentsComponent } from './pages/documents.component';
import { NotificationsComponent } from './pages/notifications.component';
import { AnalyticsComponent } from './pages/analytics.component';
import { ContractsComponent } from './pages/contracts.component';
import { MasterDataComponent } from './pages/master-data.component';
import { SecurityComponent } from './pages/security.component';
import { BiddingComponent } from './pages/bidding.component';
import { AttachmentsComponent } from './pages/attachments.component';
import { BanksComponent } from './pages/banks.component';
import { LoginPageComponent } from './pages/login-page.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  {
    path: ':role', component: PortalShellComponent, canActivate: [authGuard], children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'bidding', component: BiddingComponent },
      { path: 'profile', component: VendorProfileComponent },
      { path: 'vendors', component: VendorsComponent },
      { path: 'bank-verification', component: BankVerificationComponent },
      { path: 'finance-vendors', component: FinanceVendorsComponent },
      { path: 'rfqs', component: RfqPageComponent },
      { path: 'bid-comparison', component: BidComparisonComponent },
      { path: 'orders', component: OrdersPageComponent },
      { path: 'deliveries', component: DeliveryPageComponent },
      { path: 'invoices', component: InvoicePageComponent },
      { path: 'three-way-match', component: ThreeWayMatchComponent },
      { path: 'performance', component: PerformanceComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'workflows', component: WorkflowsComponent },
      { path: 'approval-matrix', component: ApprovalMatrixComponent },
      { path: 'integrations', component: IntegrationsComponent },
      { path: 'audit', component: AuditLogsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'attachments', component: AttachmentsComponent },
      { path: 'banks', component: BanksComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'contracts', component: ContractsComponent },
      { path: 'master-data', component: MasterDataComponent },
      { path: 'security', component: SecurityComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
