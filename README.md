# VendorFlow — Angular Vendor Portal Prototype

A role-based, paperless vendor management and procure-to-pay frontend prototype covering Vendor, Procurement, Finance and Admin users.

## What is included

- **Vendor dashboard** — registration status, eligible RFQs, POs, delivery updates, QC visibility, invoice upload and performance.
- **Procurement dashboard** — vendor verification, RFQ management, bid comparison, PO approvals, delivery alerts and reports.
- **Finance dashboard** — bank verification, invoice queue, 3-way match and payment views.
- **Admin dashboard** — users, roles, workflows, approval matrix, integrations, audit logs and system settings.
- **Business rules demonstrated in the UI**
  - Vendor requires both Procurement and Finance verification.
  - Bidding is limited to approved vendor categories.
  - Bid comparison considers price, location, delivery and supplier history.
  - PO must be approved before release.
  - Supplier can update expected arrival date; late dates trigger an internal alert message.
  - GRN/QC is treated as ERP/QC status.
  - Invoice submission is blocked until GRN/QC passes.
  - Invoice upload performs a demo PO ↔ GRN/QC ↔ Invoice 3-way match.

## Technology

This prototype targets **Angular 21 LTS** with standalone components and Angular Router. Angular 21 was selected so the project remains compatible with the Node 22.16 runtime used while packaging this prototype. The source is framework-only and does not require a UI component library.

## Run locally

Prerequisites: Node.js 22.12+ (or another version compatible with Angular 21) and npm.

```bash
npm install
npm start
```

Then open the URL printed by Angular CLI (normally `http://localhost:4200`).

## Demo navigation

The header has a **View as** selector. Use it to switch between:

- Vendor
- Procurement
- Finance
- Admin

The app starts at `/procurement/dashboard`.

## Important implementation note

This is a **frontend prototype with in-memory mock data**. Actions update Angular state while the page is open; refreshing resets the demo data. Before production use, connect the service layer to your backend and ERP APIs.

Recommended production integration boundary:

`Vendor Portal ⇄ API / Integration Layer ⇄ ERP`

Keep ERP as the system of record for vendor master (where applicable), PO, GRN, inventory/accounting postings and payments. The portal should remain the collaboration, workflow and supplier-experience layer.

## Suggested backend/API modules

1. Authentication / SSO / MFA and role authorization
2. Vendor onboarding + document storage
3. Procurement and Finance verification workflows
4. Category/vendor eligibility master
5. RFQ and bid submission with bid sealing/closing controls
6. PO approval and ERP PO integration
7. Delivery commitment + email/notification service
8. GRN/QC inbound integration
9. Invoice storage and 3-way matching
10. Finance/AP and payment status integration
11. Audit trail and immutable event logging

## Project structure

```text
src/app/
  core/       models, menus and mock workflow state
  layout/     role-aware application shell
  pages/      dashboards and workflow screens
  shared/     reusable UI components
```

A UI reference image is included in `docs/dashboard-reference.png`.

## Reference dashboard redesign

The four role dashboards have been redesigned to closely follow `docs/dashboard-reference.png`:

- Navy fixed sidebar and compact enterprise header
- Role accents: Vendor (green), Procurement (blue), Finance (purple), Admin (orange)
- Five KPI cards across the top on desktop
- Vendor: PO/delivery and invoice/payment donut summaries, recent activity and quick actions
- Procurement: spend line chart, PO status donut, spend/category table, approval queue and recent RFQs
- Finance: invoice/payment donut charts, 3-way match progress, invoice and bank-verification queues
- Admin: user activity chart, workflow status donut, system alerts and audit logs
- Responsive stacking for tablet and mobile layouts

Use the **View as** selector in the top-right corner to compare all four role dashboards.
