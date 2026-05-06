# ⚡ UBCMS – Angular Frontend

**Utility Billing & Customer Management System**  
Final Year Project | Angular 17 | Node.js + MongoDB

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                         # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts         # Route protection
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts   # JWT token injection
│   │   └── services/
│   │       ├── auth.service.ts       # Authentication & JWT
│   │       ├── customer.service.ts   # Customer CRUD API calls
│   │       ├── billing.service.ts    # Bill generation API calls
│   │       ├── payment.service.ts    # Payment processing API calls
│   │       ├── dashboard.service.ts  # Dashboard stats API calls
│   │       └── toast.service.ts      # Notification service
│   │
│   ├── shared/                       # Reusable across features
│   │   ├── components/
│   │   │   ├── badge/                # Status badge component
│   │   │   ├── confirm-modal/        # Delete confirmation modal
│   │   │   ├── empty-state/          # Empty table/list state
│   │   │   ├── loading-spinner/      # Loading indicator
│   │   │   ├── stat-card/            # Dashboard stat card
│   │   │   └── toast/                # Toast notification UI
│   │   ├── models/
│   │   │   ├── auth.model.ts
│   │   │   ├── bill.model.ts
│   │   │   ├── customer.model.ts
│   │   │   ├── dashboard.model.ts
│   │   │   └── payment.model.ts
│   │   ├── pipes/
│   │   │   └── inr.pipe.ts           # Indian Rupee formatter
│   │   └── shared.module.ts
│   │
│   ├── layout/                       # App shell (sidebar + topbar)
│   │   ├── layout.component.ts
│   │   ├── layout.module.ts
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   └── sidebar.component.scss
│   │   └── topbar/
│   │       └── topbar.component.ts
│   │
│   ├── features/                     # Lazy-loaded feature modules
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   └── components/login/     # Login page
│   │   ├── dashboard/
│   │   │   ├── dashboard.module.ts
│   │   │   └── components/dashboard/ # Dashboard page
│   │   ├── customers/
│   │   │   ├── customers.module.ts
│   │   │   └── components/
│   │   │       ├── customer-list/    # List + filter + delete
│   │   │       └── customer-form/    # Add/Edit modal form
│   │   ├── billing/
│   │   │   ├── billing.module.ts
│   │   │   └── components/
│   │   │       ├── bill-list/        # Bills table
│   │   │       ├── bill-form/        # Generate bill modal
│   │   │       ├── bill-detail/      # Invoice view modal
│   │   │       └── payment-modal/    # Process payment
│   │   ├── payments/
│   │   │   └── payments.module.ts    # Transaction history
│   │   ├── reports/
│   │   │   └── reports.module.ts     # Analytics & metrics
│   │   └── settings/
│   │       └── settings.module.ts    # Config & API test
│   │
│   ├── app-routing.module.ts         # Root routes (lazy loading)
│   ├── app.component.ts
│   └── app.module.ts
│
├── environments/
│   ├── environment.ts                # Dev config (localhost:5000)
│   └── environment.prod.ts           # Prod config
│
└── styles/
    ├── main.scss                     # Global styles + reset
    ├── _variables.scss               # SCSS variables + CSS custom props
    ├── _mixins.scss                  # Reusable mixins
    └── _components.scss              # Shared component styles
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- Angular CLI: `npm install -g @angular/cli`
- Backend running on `http://localhost:5000`

### Install & Start

```bash
npm install
ng serve --port 4200 --open
```

App will open at **http://localhost:4200**

### Build for Production

```bash
ng build --configuration production
# Output in: dist/ubcms-frontend/
```

---

## 🔐 Login

| Email | Password | Role |
|-------|----------|------|
| admin@ubcms.com | password | Admin |
| staff@ubcms.com | password | Staff |

---

## 🏗 Architecture Highlights

| Pattern | Usage |
|---------|-------|
| **Lazy Loading** | Each feature module loads on demand |
| **Route Guards** | `AuthGuard` protects all app routes |
| **HTTP Interceptor** | Auto-attaches JWT to all API calls |
| **Reactive Forms** | Full validation with `FormBuilder` |
| **Smart/Dumb Components** | List components hold state, form components are presentational |
| **SCSS BEM + Variables** | Consistent design tokens via CSS custom properties |
| **TypeScript Interfaces** | Strongly typed models for all entities |

---

## 🔗 Backend API

Make sure the backend (`../backend`) is running:
```bash
cd ../backend && npm install && node server.js
```

Change API URL in `src/environments/environment.ts` if needed.

---

*Final Year Project · Utility Billing & Customer Management System · 2024–25*
