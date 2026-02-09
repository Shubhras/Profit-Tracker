# HexaDash React Tailwind - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Key Features](#key-features)
6. [Installation & Setup](#installation--setup)
7. [Configuration](#configuration)
8. [Routing System](#routing-system)
9. [State Management](#state-management)
10. [Authentication & Authorization](#authentication--authorization)
11. [Subscription System](#subscription-system)
12. [API Integration](#api-integration)
13. [UI Components](#ui-components)
14. [Styling System](#styling-system)
15. [Main Modules](#main-modules)
16. [Development Guidelines](#development-guidelines)
17. [Build & Deployment](#build--deployment)

---

## Project Overview

**HexaDash React Tailwind** is a comprehensive admin dashboard and profit tracking application built with React 18 and Tailwind CSS. The application provides a full-featured admin panel with authentication, subscription management, profit tracking, reconciliation tools, and various business analytics features.

### Purpose
This application serves as a business management platform with focus on:
- Profit tracking and analysis
- Financial reconciliation
- E-commerce management
- User and subscription management
- Business analytics and reporting

### Key Characteristics
- **Modern Stack**: React 18, Tailwind CSS, Ant Design
- **State Management**: Redux with Redux Thunk
- **Routing**: React Router v6
- **Authentication**: Cookie-based with JWT tokens
- **API Communication**: Axios with interceptors
- **Responsive Design**: Mobile-first approach with Tailwind

---

## Technology Stack

### Core Technologies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.3.0",
  "redux": "^4.2.1",
  "react-redux": "^8.0.0",
  "redux-thunk": "^2.4.2"
}
```

### UI Framework & Styling
- **Ant Design** (v4.21.3) - Primary UI component library
- **Tailwind CSS** (v3.4.3) - Utility-first CSS framework
- **Styled Components** (v5.3.3) - CSS-in-JS styling
- **Framer Motion** (v12.30.1) - Animation library

### Data Visualization
- **ApexCharts** (v3.36.3) - Modern charting library
- **Chart.js** (v3.7.0) - Canvas-based charts
- **Recharts** (v2.1.8) - React charting components
- **React Google Charts** (v4.0.0) - Google Charts wrapper

### Additional Libraries
- **Axios** (v0.25.0) - HTTP client
- **js-cookie** (v2.2.1) - Cookie management
- **dayjs** (v1.11.2) - Date manipulation
- **react-beautiful-dnd** (v13.1.0) - Drag and drop
- **leaflet** (v1.9.2) - Interactive maps
- **xlsx** (v0.17.5) - Excel file handling

### Development Tools
- **CRACO** (v7.1.0) - Create React App Configuration Override
- **ESLint** (v8.38.0) - Code linting
- **Prettier** (v2.7.1) - Code formatting
- **Redux DevTools Extension** - State debugging

---

## Project Structure

```
hexadash-tailwind/
├── public/                          # Static assets
├── src/
│   ├── App.js                       # Root application component
│   ├── index.js                     # Application entry point
│   │
│   ├── assets/                      # Images, fonts, static files
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── alerts/
│   │   ├── buttons/
│   │   ├── cards/
│   │   ├── charts/
│   │   ├── header/
│   │   ├── modals/
│   │   ├── table/
│   │   ├── utilities/               # Utility components
│   │   │   ├── protectedRoute.js    # Route protection HOC
│   │   │   ├── SubscriptionGate.js  # Subscription access control
│   │   │   └── auth-info/           # Authentication info components
│   │   └── ...
│   │
│   ├── config/                      # Configuration files
│   │   ├── config.js                # App configuration
│   │   ├── auth0.js                 # Auth0 configuration
│   │   ├── dataService/
│   │   │   └── dataService.js       # API service layer
│   │   ├── theme/
│   │   │   ├── themeVariables.js    # Theme variables
│   │   │   └── themeConfigure.js    # Theme configuration
│   │   └── api/                     # API endpoints
│   │
│   ├── container/                   # Page-level components
│   │   ├── dashboard/               # Dashboard pages
│   │   ├── profit/                  # Profit tracking module
│   │   │   ├── Summary.js
│   │   │   ├── ProfitTableView.js
│   │   │   ├── ProfitMonthlyView.js
│   │   │   ├── SalesTrend.js
│   │   │   └── CanvasMYOR.js
│   │   ├── reconcile/               # Reconciliation module
│   │   │   ├── ReconcileSummary.js
│   │   │   ├── InvoiceReconciliation.js
│   │   │   ├── ReturnLedger.js
│   │   │   ├── ReturnSummary.js
│   │   │   ├── CustLedger.js
│   │   │   ├── OsPayment.js
│   │   │   ├── FeeLeaks.js
│   │   │   ├── MinSettLeaks.js
│   │   │   ├── QuickCom.js
│   │   │   ├── Avcp.js
│   │   │   ├── Others.js
│   │   │   ├── SettledOrder.js
│   │   │   └── UnsettledOrder.js
│   │   ├── ecommerce/               # E-commerce features
│   │   ├── profile/                 # User profile & authentication
│   │   ├── settings/                # Application settings
│   │   ├── project/                 # Project management
│   │   ├── calendar/                # Calendar features
│   │   ├── email/                   # Email management
│   │   ├── chat/                    # Chat functionality
│   │   ├── contact/                 # Contact management
│   │   ├── supportTicket/           # Support ticket system
│   │   ├── pages/                   # Static pages
│   │   └── ...
│   │
│   ├── layout/                      # Layout components
│   │   ├── MenueItems.js            # Sidebar menu configuration
│   │   ├── TopMenu.js               # Top navigation menu
│   │   ├── withAdminLayout.js       # Admin layout HOC
│   │   └── Style.js                 # Layout styled components
│   │
│   ├── redux/                       # State management
│   │   ├── store.js                 # Redux store configuration
│   │   ├── rootReducers.js          # Root reducer combiner
│   │   ├── authentication/          # Auth state
│   │   ├── subscription/            # Subscription state
│   │   ├── product/                 # Product state
│   │   ├── cart/                    # Shopping cart state
│   │   ├── themeLayout/             # Theme/layout state
│   │   └── ...                      # Other feature states
│   │
│   ├── routes/                      # Route definitions
│   │   ├── admin/
│   │   │   ├── index.js             # Admin routes
│   │   │   ├── dashboard.js         # Dashboard routes
│   │   │   ├── profit.js            # Profit routes
│   │   │   ├── settings.js          # Settings routes
│   │   │   └── ...
│   │   ├── auth.js                  # Authentication routes
│   │   └── public.js                # Public routes
│   │
│   ├── static/                      # Static resources
│   │   ├── css/
│   │   │   └── style.css            # Global styles
│   │   └── img/                     # Images
│   │
│   ├── utility/                     # Utility functions
│   │
│   └── demoData/                    # Demo/mock data
│
├── .env                             # Environment variables
├── package.json                     # Dependencies
├── tailwind.config.js               # Tailwind configuration
├── craco.config.js                  # CRACO configuration
└── README.md                        # Basic readme
```

---

## Architecture

### Application Flow

```
User Request
    ↓
App.js (Provider + Router)
    ↓
Route Matching
    ├── /auth/*          → Auth Routes (Login, Register, etc.)
    ├── /admin/*         → Protected Admin Routes
    └── /*               → Public Routes (Home, Pricing, etc.)
    ↓
Protected Route Check
    ├── Authenticated    → withAdminLayout → Admin Components
    └── Not Authenticated → Redirect to /auth/login
    ↓
Subscription Gate Check (for premium features)
    ├── Has Subscription → Render Component
    └── No Subscription  → Show Upgrade Prompt
    ↓
Component Renders
    ↓
Redux State Management
    ↓
API Calls (via DataService)
    ↓
Response Handling
```

### Component Hierarchy

```
App
├── ProviderConfig (Redux Provider + Theme Provider)
    ├── Router
        ├── ScrollToTop
        ├── Auth Routes (if not logged in)
        │   └── AuthLayout
        │       ├── Login
        │       ├── SignUp
        │       ├── ForgotPassword
        │       └── ResetPassword
        │
        ├── Admin Routes (if logged in)
        │   └── ProtectedRoute
        │       └── withAdminLayout
        │           ├── Header
        │           ├── Sidebar (MenuItems)
        │           └── Content
        │               └── SubscriptionGate (for premium features)
        │                   └── Feature Components
        │
        └── Public Routes
            ├── Home
            ├── Pricing
            ├── Contact
            ├── About
            └── ...
```

---

## Key Features

### 1. **Authentication System**
- Cookie-based authentication with JWT tokens
- Login, Register, Forgot Password, Reset Password flows
- Protected routes with automatic redirection
- Persistent login state across page refreshes
- Auth state managed in Redux

### 2. **Subscription Management**
- Multi-tier subscription system (Free/Premium)
- Subscription gate component for feature access control
- Visual upgrade prompts for premium features
- Subscription status stored in cookies and Redux

### 3. **Profit Tracking Module**
- Comprehensive profit analysis dashboard
- Monthly profit views
- Sales trend visualization
- Profit table views
- Canvas-based year-over-year reports
- Summary statistics and KPIs

### 4. **Reconciliation System**
Complete financial reconciliation toolkit:
- **Invoice Reconciliation**: Match invoices with payments
- **Return Ledger**: Track product returns
- **Return Summary**: Aggregate return data
- **Customer Ledger**: Customer account tracking
- **Outstanding Payments**: Unpaid invoice tracking
- **Fee Leaks**: Identify missing fees
- **Minimum Settlement Leaks**: Track settlement discrepancies
- **Quick Commerce**: Fast reconciliation tools
- **AVCP (Average Cost Price)**: Cost analysis
- **Others**: Additional reconciliation features
- **Settled/Unsettled Orders**: Order settlement tracking

### 5. **Dashboard System**
- Multiple dashboard variants (DemoOne through DemoTen)
- Customizable dashboard layouts
- Real-time data visualization
- Widget-based architecture
- Responsive grid system

### 6. **E-commerce Features**
- Product management
- Shopping cart
- Order management
- Seller management
- Inventory tracking

### 7. **Project Management**
- Project creation and tracking
- Task management
- Kanban boards
- Team collaboration tools

### 8. **Communication Tools**
- Email management system
- Chat functionality
- Support ticket system
- Contact management

### 9. **Calendar & Scheduling**
- Event calendar
- Appointment scheduling
- Reminder system

### 10. **File Management**
- File upload and storage
- Document organization
- Gallery management

---

## Installation & Setup

### Prerequisites
```bash
Node.js: v22.x
npm or yarn
```

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/sovware/hexadash-tailwind.git
cd hexadash-tailwind
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# API Configuration
REACT_APP_API_ENDPOINT=http://192.168.1.9:8000
REACT_APP_BASE_URL=https://api.masudr.com/api/data
REACT_APP_PROFILE_IMAGE_ENDPOINT=https://api.masudr.com

# External Services
REACT_APP_PIXABAY_API_KEY=your_pixabay_key
REACT_APP_GOOGLE_MAP_KEY=your_google_maps_key

# Auth0 (if using)
REACT_APP_AUTH0_DOMAIN=your_auth0_domain
REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id

# Development Server Port
PORT=8000
```

4. **Start development server**
```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:8000`

5. **Build for production**
```bash
npm run build
# or
yarn build
```

---

## Configuration

### Theme Configuration

**File**: `src/config/config.js`
```javascript
const config = {
  topMenu: false,        // Enable top menu layout
  rtl: false,           // Right-to-left layout
  mainTemplate: 'lightMode', // 'lightMode' or 'darkMode'
  theme,                // Theme variables
};
```

### Tailwind Configuration

**File**: `tailwind.config.js`

Key customizations:
- **Dark Mode**: Class-based (`darkMode: 'class'`)
- **Primary Color**: Green (#22C55E)
- **Custom Colors**: Extended color palette for business needs
- **Responsive Breakpoints**: Custom breakpoints from xxs to 4xl
- **Custom Fonts**: Figtree, Poppins
- **Custom Shadows**: Various shadow utilities
- **Animations**: Marquee and custom keyframes

### API Configuration

**File**: `src/config/dataService/dataService.js`

The DataService class provides a centralized API client:

```javascript
class DataService {
  static get(path = '') { ... }
  static post(path = '', data = {}) { ... }
  static patch(path = '', data = {}) { ... }
  static put(path = '', data = {}) { ... }
}
```

Features:
- Automatic token injection via Axios interceptors
- Cookie-based authentication
- Centralized error handling
- Base URL configuration from environment variables

---

## Routing System

### Route Structure

The application uses React Router v6 with three main route groups:

#### 1. Authentication Routes (`/auth/*`)
**File**: `src/routes/auth.js`

```javascript
/auth/login          → Login page
/auth/register       → Registration page
/auth/forgotPassword → Password recovery
/auth/resetPassword  → Password reset
```

Only accessible when user is **not logged in**.

#### 2. Admin Routes (`/admin/*`)
**File**: `src/routes/admin/index.js`

Protected routes requiring authentication:

```javascript
/admin/              → Dashboard (default)
/admin/profit/*      → Profit tracking module
/admin/reconcile/*   → Reconciliation module
/admin/ecommerce/*   → E-commerce features
/admin/project/*     → Project management
/admin/profile/*     → User profile
/admin/settings/*    → Application settings
/admin/calendar/*    → Calendar
/admin/email/*       → Email management
/admin/chat/*        → Chat system
/admin/contact/*     → Contact management
/admin/support/*     → Support tickets
/admin/tables/*      → Data tables
/admin/forms/*       → Form components
/admin/charts/*      → Chart examples
/admin/widgets/*     → Widget library
```

#### 3. Public Routes (`/*`)
**File**: `src/routes/public.js`

Accessible to all users:

```javascript
/                    → Home page
/pricing             → Pricing plans
/integrations        → Integration information
/contact             → Contact form
/about               → About page
/testimonials        → Customer testimonials
/privacy             → Privacy policy
/terms               → Terms and conditions
/checkout            → Checkout page
```

### Route Protection

**Protected Route Component**: `src/components/utilities/protectedRoute.js`

```javascript
function ProtectedRoute({ Component }) {
  const isLoggedIn = useSelector((state) => state.auth.login);
  
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <Component />;
}
```

### Subscription Gate

**Subscription Gate Component**: `src/components/utilities/SubscriptionGate.js`

```javascript
function SubscriptionGate({ children, allowFree = false }) {
  const hasSubscription = useSelector((state) => state.auth.hasSubscription);
  
  if (hasSubscription || allowFree) {
    return children;
  }
  
  return <UpgradePrompt />;
}
```

Usage in routes:
```javascript
<Route
  path="profit/*"
  element={
    <SubscriptionGate>
      <Profit />
    </SubscriptionGate>
  }
/>

<Route
  path="/*"
  element={
    <SubscriptionGate allowFree>
      <Dashboard />
    </SubscriptionGate>
  }
/>
```

---

## State Management

### Redux Store Structure

**File**: `src/redux/store.js`

```javascript
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk.withExtraArgument()))
);
```

### Root Reducer

**File**: `src/redux/rootReducers.js`

Combined reducers:

```javascript
{
  auth: authReducer,                    // Authentication state
  subscription: subscriptionReducer,    // Subscription status
  ChangeLayoutMode,                     // Theme/layout preferences
  
  // E-commerce
  products: productReducer,
  product: SingleProductReducer,
  cart: cartData,
  orders: orderReducer,
  sellers: sellersReducer,
  
  // Communication
  email: emailReducer,
  emailSingle: SingleEmailReducer,
  chat: chatReducer,
  chatSingle: SingleChatReducer,
  groupChat: groupChatReducer,
  message: readMessageReducer,
  notification: readNotificationReducer,
  
  // Management
  projects: projectReducer,
  project: SingleProjectReducer,
  users: userReducer,
  userGroup: userGroupReducer,
  team: teamReducer,
  Contact,
  Profile,
  
  // Features
  Todo,
  Note,
  Task,
  KanbanBoard: kanbanBoardReducer,
  Calender,
  FileManager,
  tickets,
  jobs,
  
  // Data
  dataTable,
  AxiosCrud: axiosCrudReducer,
  SingleAxiosCrud: axiosSingleCrudReducer,
  gallery: galleryReducer,
  
  // UI
  themeUsers: themeUsersReducer,
  headerSearchData: headerSearchReducer,
}
```

### Key State Slices

#### Authentication State
```javascript
{
  login: boolean,           // Login status
  loading: boolean,         // Loading state
  error: string | null,     // Error message
  hasSubscription: boolean, // Subscription status
  user: object | null,      // User data
}
```

#### Theme Layout State
```javascript
{
  rtlData: boolean,         // RTL mode
  topMenu: boolean,         // Top menu enabled
  mode: string,             // 'lightMode' or 'darkMode'
  mainContent: string,      // Content layout mode
}
```

---

## Authentication & Authorization

### Authentication Flow

1. **Login Process**:
   ```
   User submits credentials
   → API call to /api/auth/login
   → Receive JWT token + user data
   → Store token in cookie
   → Store hasSubscription in cookie
   → Update Redux state
   → Redirect to /admin
   ```

2. **Token Management**:
   - Tokens stored in HTTP-only cookies (via `js-cookie`)
   - Automatic token injection in API requests via Axios interceptor
   - Token validation on protected routes

3. **Logout Process**:
   ```
   User clicks logout
   → Clear cookies (access_token, hasSubscription)
   → Clear Redux state
   → Redirect to /auth/login
   ```

### Authorization Levels

1. **Public Access**: No authentication required
   - Home, Pricing, Contact, About pages

2. **Authenticated Access**: Login required
   - All `/admin/*` routes
   - Protected by `ProtectedRoute` component

3. **Premium Access**: Subscription required
   - Profit tracking module
   - Reconciliation module
   - Advanced analytics
   - Protected by `SubscriptionGate` component

### Cookie Structure

```javascript
// Set during login
Cookies.set('access_token', token);
Cookies.set('hasSubscription', hasSubscription);

// Retrieved in components
const token = Cookies.get('access_token');
const hasSubscription = Cookies.get('hasSubscription') === 'true';
```

---

## Subscription System

### Subscription Tiers

1. **Free Tier**:
   - Basic dashboard access
   - Limited features
   - Read-only access to some modules

2. **Premium Tier**:
   - Full dashboard access
   - Profit tracking
   - Reconciliation tools
   - Advanced analytics
   - Priority support

### Implementation

**Subscription Gate Component**:
```javascript
<SubscriptionGate allowFree={false}>
  <PremiumFeature />
</SubscriptionGate>
```

**Upgrade Prompt**:
- Blurred content preview
- Clear upgrade messaging
- Direct link to pricing page
- Animated UI with gradient buttons

### Subscription Check Logic

```javascript
// Check from multiple sources
const reduxHasSubscription = useSelector(state => state.auth.hasSubscription);
const cookieHasSubscription = Cookies.get('hasSubscription') === 'true';
const hasSubscription = reduxHasSubscription || cookieHasSubscription;
```

---

## API Integration

### Base Configuration

**Endpoint**: Configured in `.env`
```env
REACT_APP_API_ENDPOINT=http://192.168.1.9:8000
```

**Base URL**: `${REACT_APP_API_ENDPOINT}/api`

### DataService Class

**File**: `src/config/dataService/dataService.js`

```javascript
import axios from 'axios';
import Cookies from 'js-cookie';

const API_ENDPOINT = `${process.env.REACT_APP_API_ENDPOINT}/api`;

const client = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic token injection
client.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class DataService {
  static get(path = '') {
    return client.get(path);
  }

  static post(path = '', data = {}) {
    return client.post(path, data);
  }

  static patch(path = '', data = {}) {
    return client.patch(path, data);
  }

  static put(path = '', data = {}) {
    return client.put(path, data);
  }
}

export { DataService };
```

### Usage Example

```javascript
import { DataService } from '../config/dataService/dataService';

// GET request
const fetchData = async () => {
  try {
    const response = await DataService.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// POST request
const createUser = async (userData) => {
  try {
    const response = await DataService.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### API Endpoints (Common)

```
Authentication:
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/profile

Users:
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

Products:
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

Orders:
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id

Profit:
GET    /api/profit/summary
GET    /api/profit/monthly
GET    /api/profit/trends

Reconciliation:
GET    /api/reconcile/summary
GET    /api/reconcile/invoices
GET    /api/reconcile/returns
```

---

## UI Components

### Component Library

The application uses **Ant Design** as the primary component library with custom styling via Tailwind CSS.

### Custom Components

#### 1. **Cards** (`src/components/cards/`)
- FrameCard
- SampleCard
- BannerCard
- ProfileCard
- ProductCard
- And 13+ more variants

#### 2. **Buttons** (`src/components/buttons/`)
- Primary, Secondary, Success, Danger variants
- Icon buttons
- Button groups
- Loading states

#### 3. **Charts** (`src/components/charts/`)
- LineChart
- BarChart
- PieChart
- AreaChart
- Mixed charts

#### 4. **Modals** (`src/components/modals/`)
- Confirmation modals
- Form modals
- Info modals
- Custom modals

#### 5. **Tables** (`src/components/table/`)
- DataTable with sorting, filtering, pagination
- Editable tables
- Expandable rows
- Custom cell renderers

#### 6. **Forms** (`src/container/forms/`)
- Input fields
- Select dropdowns
- Date pickers
- File uploads
- Form validation

### Utility Components

#### ProtectedRoute
```javascript
<ProtectedRoute Component={AdminDashboard} />
```

#### SubscriptionGate
```javascript
<SubscriptionGate allowFree={false}>
  <PremiumContent />
</SubscriptionGate>
```

#### ScrollToTop
Automatically scrolls to top on route change.

#### AuthInfo
Displays user authentication information in header.

---

## Styling System

### Tailwind CSS

**Configuration**: `tailwind.config.js`

#### Custom Theme Extensions

**Colors**:
```javascript
primary: '#22C55E'           // Green
secondary: '#5840FF'         // Purple
success: '#01B81A'           // Green
warning: '#FA8B0C'           // Orange
danger: '#ff4d4f'            // Red
info: '#00AAFF'              // Blue
dark: '#0A0A0A'              // Almost black
```

**Responsive Breakpoints**:
```javascript
xxs: '320px'
xs: '380px'
ssm: '480px'
sm: '575px'
md: '768px'
lg: '991px'
xl: '1199px'
2xl: '1299px'
3xl: '1599px'
4xl: '1699px'
```

**Custom Fonts**:
```javascript
Figtree (default)
Poppins
FontAwesome (icons)
```

### Global Styles

**File**: `src/static/css/style.css`

Contains:
- Ant Design overrides
- Custom utility classes
- Dark mode styles
- Component-specific styles
- Animation definitions

Example customizations:
```css
/* Menu styling */
.ant-menu-item .ant-menu-title-content {
  @apply font-medium text-[15px] !important;
}

/* Button styling */
.ant-btn-primary {
  @apply bg-primary border-primary !important;
}

/* Custom utilities */
.fade-mask-x {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

### Styled Components

**File**: `src/container/styled.js` (158KB)

Contains styled-components for:
- Layout wrappers
- Card containers
- Form elements
- Dashboard widgets
- Custom UI elements

### Dark Mode

Implemented via Tailwind's class-based dark mode:

```javascript
// Toggle dark mode
<div className="bg-white dark:bg-dark">
  <p className="text-gray-900 dark:text-white87">Content</p>
</div>
```

Dark mode state managed in Redux (`ChangeLayoutMode` reducer).

---

## Main Modules

### 1. Profit Tracking Module

**Location**: `src/container/profit/`

**Components**:
- `Summary.js` - Overview of profit metrics
- `ProfitTableView.js` - Tabular profit data
- `ProfitMonthlyView.js` - Monthly breakdown
- `SalesTrend.js` - Sales trend analysis
- `CanvasMYOR.js` - Year-over-year canvas visualization

**Features**:
- Real-time profit calculations
- Monthly/yearly comparisons
- Sales trend visualization
- Export to Excel
- Filterable date ranges

**Route**: `/admin/profit/*`

**Access**: Premium subscription required

---

### 2. Reconciliation Module

**Location**: `src/container/reconcile/`

**Components**:

1. **ReconcileSummary.js**
   - Overall reconciliation dashboard
   - Key metrics and KPIs
   - Quick access to sub-modules

2. **InvoiceReconciliation.js**
   - Match invoices with payments
   - Identify discrepancies
   - Auto-reconciliation features

3. **ReturnLedger.js**
   - Track product returns
   - Return reasons analysis
   - Refund processing

4. **ReturnSummary.js**
   - Aggregate return statistics
   - Return rate analysis
   - Financial impact

5. **CustLedger.js**
   - Customer account balances
   - Transaction history
   - Credit/debit tracking

6. **OsPayment.js**
   - Outstanding payment tracking
   - Aging analysis
   - Payment reminders

7. **FeeLeaks.js**
   - Identify missing fees
   - Fee reconciliation
   - Revenue recovery

8. **MinSettLeaks.js**
   - Minimum settlement tracking
   - Settlement discrepancies
   - Leak identification

9. **QuickCom.js**
   - Quick commerce reconciliation
   - Fast-moving inventory
   - Real-time updates

10. **Avcp.js**
    - Average cost price analysis
    - Cost tracking
    - Margin calculations

11. **Others.js**
    - Miscellaneous reconciliation
    - Custom reconciliation rules

12. **SettledOrder.js**
    - Completed order tracking
    - Settlement confirmation

13. **UnsettledOrder.js**
    - Pending order tracking
    - Settlement follow-up

**Route**: `/admin/reconcile/*`

**Access**: Premium subscription required

---

### 3. Dashboard Module

**Location**: `src/container/dashboard/`

**Main Files**:
- `Dashboard.js` - Main dashboard router
- `DashboardBase.js` - Base dashboard with all widgets (51KB)
- `DemoOne.js` through `DemoTen.js` - Dashboard variants

**Features**:
- Multiple dashboard layouts
- Customizable widgets
- Real-time data updates
- Drag-and-drop widget arrangement
- Responsive grid system

**Widgets Include**:
- Sales overview
- Revenue charts
- Recent orders
- Top products
- User statistics
- Activity timeline
- Quick actions

**Route**: `/admin/` (default)

**Access**: Free tier (basic), Premium (full features)

---

### 4. E-commerce Module

**Location**: `src/container/ecommerce/`

**Features**:
- Product catalog management
- Inventory tracking
- Order processing
- Customer management
- Shopping cart
- Checkout process
- Payment integration

**Route**: `/admin/ecommerce/*`

---

### 5. Project Management

**Location**: `src/container/project/`

**Features**:
- Project creation and tracking
- Task management
- Team assignment
- Progress tracking
- Kanban boards
- Gantt charts
- Time tracking

**Route**: `/admin/project/*`

---

### 6. Communication Suite

#### Email Management
**Location**: `src/container/email/`
- Inbox, Sent, Drafts
- Email composition
- Attachments
- Filters and labels

**Route**: `/admin/email/*`

#### Chat System
**Location**: `src/container/chat/`
- Real-time messaging
- Group chats
- File sharing
- Emoji support

**Route**: `/admin/chat/*`

#### Support Tickets
**Location**: `src/container/supportTicket/`
- Ticket creation
- Ticket tracking
- Priority management
- Status updates

**Route**: `/admin/support/*`

---

### 7. User Management

**Location**: `src/container/users/`

**Features**:
- User CRUD operations
- Role management
- Permission control
- User groups
- Activity logs

**Route**: `/admin/users/*`

---

### 8. Profile & Settings

#### Profile
**Location**: `src/container/profile/`
- User profile editing
- Avatar upload
- Password change
- Preferences

**Route**: `/admin/profile/*`

#### Settings
**Location**: `src/container/settings/`
- Application settings
- Theme preferences
- Notification settings
- Integration settings

**Route**: `/admin/settings/*`

---

## Development Guidelines

### Code Style

#### JavaScript/React
- Use functional components with hooks
- Follow ESLint configuration
- Use Prettier for formatting
- PropTypes for type checking

```javascript
import propTypes from 'prop-types';

function MyComponent({ title, onClick }) {
  // Component logic
  return <div onClick={onClick}>{title}</div>;
}

MyComponent.propTypes = {
  title: propTypes.string.isRequired,
  onClick: propTypes.func,
};

export default MyComponent;
```

#### CSS/Tailwind
- Prefer Tailwind utilities over custom CSS
- Use `@apply` for repeated patterns
- Follow mobile-first approach
- Use semantic class names

```css
/* Good */
.custom-button {
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover;
}

/* Avoid */
.custom-button {
  padding: 0.5rem 1rem;
  background-color: #22C55E;
  /* ... */
}
```

### Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import propTypes from 'prop-types';

// 2. Component definition
function MyComponent({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState(null);
  const reduxData = useSelector(state => state.data);
  const dispatch = useDispatch();
  
  // 4. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 5. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 7. PropTypes
MyComponent.propTypes = {
  prop1: propTypes.string.isRequired,
  prop2: propTypes.number,
};

// 8. Export
export default MyComponent;
```

### State Management Best Practices

1. **Use Redux for global state**:
   - Authentication
   - User data
   - Theme preferences
   - Shared data across routes

2. **Use local state for component-specific data**:
   - Form inputs
   - UI toggles
   - Temporary data

3. **Use Redux Thunk for async actions**:
```javascript
export const fetchData = () => async (dispatch) => {
  dispatch({ type: 'FETCH_START' });
  try {
    const response = await DataService.get('/endpoint');
    dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_ERROR', error: error.message });
  }
};
```

### API Integration Best Practices

1. **Always use DataService**:
```javascript
import { DataService } from '../config/dataService/dataService';

const fetchUsers = async () => {
  const response = await DataService.get('/users');
  return response.data;
};
```

2. **Handle errors gracefully**:
```javascript
try {
  const data = await DataService.get('/endpoint');
  // Success handling
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

3. **Use loading states**:
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await DataService.get('/endpoint');
    // Handle data
  } finally {
    setLoading(false);
  }
};
```

### Routing Best Practices

1. **Use lazy loading for routes**:
```javascript
const Dashboard = lazy(() => import('../container/dashboard'));
```

2. **Wrap routes with Suspense**:
```javascript
<Suspense fallback={<Spin />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</Suspense>
```

3. **Protect sensitive routes**:
```javascript
<Route
  path="/admin/*"
  element={<ProtectedRoute Component={Admin} />}
/>
```

### Performance Optimization

1. **Memoize expensive computations**:
```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

2. **Memoize components**:
```javascript
const MemoizedComponent = React.memo(MyComponent);
```

3. **Use callback memoization**:
```javascript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

4. **Code splitting**:
```javascript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Testing Guidelines

1. **Component testing**:
```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

2. **Redux testing**:
```javascript
import { createStore } from 'redux';
import rootReducer from './rootReducers';

test('reducer updates state', () => {
  const store = createStore(rootReducer);
  store.dispatch({ type: 'ACTION_TYPE', payload: data });
  expect(store.getState().slice).toEqual(expectedState);
});
```

---

## Build & Deployment

### Development Build

```bash
npm start
# or
yarn start
```

Runs on `http://localhost:8000` (configured in `.env`)

### Production Build

```bash
npm run build
# or
yarn build
```

Creates optimized production build in `build/` directory.

**Build Configuration**:
```json
{
  "scripts": {
    "build": "set \"GENERATE_SOURCEMAP=false\" && craco --max-old-space-size=4096 build"
  }
}
```

Features:
- Source maps disabled for security
- Increased memory limit (4GB)
- Minified and optimized code
- Tree-shaking for smaller bundle size

### Deployment Checklist

1. **Environment Variables**:
   - Update `.env` with production API endpoints
   - Set production Auth0 credentials
   - Configure production Google Maps key

2. **Build Optimization**:
   - Run production build
   - Verify bundle size
   - Test in production mode locally

3. **Testing**:
   - Run all tests
   - Manual testing of critical flows
   - Cross-browser testing
   - Mobile responsiveness testing

4. **Security**:
   - Ensure API keys are not exposed
   - Verify HTTPS is enforced
   - Check CORS configuration
   - Validate authentication flows

5. **Performance**:
   - Run Lighthouse audit
   - Optimize images
   - Enable gzip compression
   - Configure CDN if applicable

### Deployment Platforms

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
# Drag and drop build/ folder to Netlify
```

#### Traditional Hosting
```bash
npm run build
# Upload build/ folder to server
# Configure web server (nginx/apache) to serve SPA
```

**Nginx Configuration Example**:
```nginx
server {
  listen 80;
  server_name yourdomain.com;
  root /path/to/build;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Environment-Specific Configuration

**Development** (`.env.development`):
```env
REACT_APP_API_ENDPOINT=http://localhost:8000
```

**Production** (`.env.production`):
```env
REACT_APP_API_ENDPOINT=https://api.production.com
```

### Monitoring & Analytics

Consider integrating:
- Google Analytics
- Sentry for error tracking
- LogRocket for session replay
- Performance monitoring tools

---

## Additional Resources

### Project Dependencies

**Full dependency list**: See `package.json`

**Key dependencies**:
- React ecosystem: react, react-dom, react-router-dom
- State management: redux, react-redux, redux-thunk
- UI framework: antd, styled-components
- Styling: tailwindcss
- Charts: apexcharts, chart.js, recharts
- HTTP client: axios
- Utilities: dayjs, js-cookie, file-saver

### Browser Support

Based on `browserslist` configuration:

**Production**:
- \>0.2% market share
- Not dead browsers
- Not Opera Mini

**Development**:
- Last Chrome version
- Last Firefox version
- Last Safari version

### File Size Considerations

Large files in the project:
- `src/container/styled.js` - 158KB (styled-components)
- `src/layout/MenueItems.js` - 51KB (menu configuration)
- `src/container/dashboard/DashboardBase.js` - 51KB (dashboard widgets)

Consider code splitting for these if bundle size becomes an issue.

### Known Issues & Limitations

1. **Node Version**: Requires Node 22.x (specified in package.json)
2. **Source Maps**: Disabled in production build
3. **Memory**: Build requires increased memory allocation (4GB)

### Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow code style guidelines
4. Write tests for new features
5. Submit pull request with clear description

### Support & Documentation

- **GitHub**: https://github.com/sovware/hexadash-tailwind
- **Issues**: https://github.com/sovware/hexadash-tailwind/issues

---

## Conclusion

This documentation provides a comprehensive overview of the HexaDash React Tailwind application. The project is a full-featured admin dashboard with:

- Modern React architecture
- Comprehensive state management
- Robust authentication and authorization
- Subscription-based access control
- Extensive business modules (Profit, Reconciliation, E-commerce)
- Rich UI component library
- Responsive design with Tailwind CSS
- Production-ready build configuration

For specific implementation details, refer to the source code and inline comments throughout the project.

---

**Last Updated**: February 9, 2026  
**Version**: 0.1.0  
**Maintained by**: Development Team
