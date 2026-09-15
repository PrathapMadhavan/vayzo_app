# Vayzo Admin

Vayzo Admin is the administrative dashboard for the Vayzo platform.

The dashboard provides a centralized interface for managing users, orders, delivery partners, transactions, notifications, and other administrative operations.

---

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React
- JavaScript (ES6+)

---

## Features

- Responsive admin dashboard
- Desktop and mobile layouts
- Collapsible sidebar navigation
- Mobile sidebar with smooth transitions
- Active navigation states
- Responsive navigation scrolling
- Vayzo design system and theme variables
- Reusable layout components
- Route-based page navigation
- Accessible navigation controls

---

## Project Structure

```text
Vayzo-admin/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │   └── logo/
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── AdminLayout.jsx
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   │
│   ├── constants/
│   │   └── navigation.js
│   │
│   ├── pages/
│   │
│   ├── App.jsx
│   ├── index.css
│   ├── variables.css
│   └── main.jsx
│
├── index.html
├── eslint.config.js
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

Getting Started

1. Clone the repository

```md
git clone <repository-url> 2. Navigate to the project
cd Vayzo-admin 3. Install dependencies
npm install 4. Start the development server
npm run dev

The application will be available at the local development URL shown by Vite.

Available Scripts
Development
npm run dev

Starts the Vite development server with Hot Module Replacement.

Build
npm run build

Creates an optimized production build.

Preview
npm run preview

Serves the production build locally for preview.

Lint
npm run lint

Runs the project's linting configuration.

Application Layout

The main administrative layout consists of:

Sidebar

The sidebar provides navigation between administrative sections.

It supports:

Expanded desktop mode
Collapsed desktop mode
Independent navigation scrolling
Responsive mobile drawer
Mobile overlay
Active route highlighting
Responsive behavior when switching between desktop and mobile
Header

The header contains:

Mobile navigation trigger
Welcome message
Notifications
Administrator profile information
Main Content

The main content area renders pages through React Router's route outlet.

Design System

The Vayzo Admin interface uses centralized CSS variables for colors, borders, typography, and other design tokens.

Example:

:root {
--vayzo-primary: #3d14b8;
--vayzo-primary-hover: #4a14d1;

--vayzo-background: #f8f8fb;
--vayzo-surface: #ffffff;

--vayzo-text-primary: #140f33;
--vayzo-text-secondary: #5c5773;
--vayzo-text-muted: #8b879d;

--vayzo-border: #e5e3eb;
}

These variables are mapped into the Tailwind theme and should be reused instead of introducing arbitrary colors throughout the application.

Navigation

Navigation items are maintained centrally in:

src/constants/navigation.js

Each navigation item can define its:

Label
Route
Icon

This keeps the sidebar reusable and makes adding or removing navigation items straightforward.

Responsive Behavior

The application is designed for both desktop and mobile screens.

Desktop
Full sidebar
Collapsible sidebar
Fixed navigation area
Independent sidebar scrolling
Mobile
Sidebar hidden by default
Menu button in the header
Sidebar slides in from the left
Close button inside the sidebar
Background overlay
Navigation remains scrollable
Sidebar automatically returns to expanded mode
Development Guidelines
Components

Create reusable components whenever UI behavior is shared across multiple pages.

Styling

Prefer Tailwind utility classes and the existing Vayzo design tokens.

Avoid introducing unnecessary global styles.

Colors

Use the existing Vayzo theme variables instead of hardcoding colors repeatedly.

Navigation

Use NavLink for application navigation so active routes can be styled automatically.

Responsive Design

Build responsive behavior using Tailwind breakpoints rather than maintaining separate desktop and mobile components whenever possible.

Code Quality

Before committing changes, make sure the project:

Builds successfully
Has no unnecessary console errors
Has no broken routes
Maintains responsive behavior
Preserves existing components and design tokens
Passes the project's lint checks
Development Workflow

A typical development workflow:

Create / Update Component
↓
Run Development Server
↓
Test Desktop
↓
Test Mobile
↓
Check Routes
↓
Run Lint
↓
Build Project
↓
Commit Changes
Environment Variables

Environment-specific configuration should be stored in environment files rather than hardcoded in source code.

Example:

VITE_API_BASE_URL=

Do not commit secrets or private API keys to the repository.

Git Workflow

Create a feature branch before making significant changes:

git checkout -b feature/<feature-name>

After completing the work:

git add .
git commit -m "Add <feature>"
git push origin feature/<feature-name>
Project Status

The project is currently under active development.

The interface and component architecture are being built incrementally, with responsive behavior and reusable components prioritized throughout development.

License

This project is private and intended for Vayzo development purposes.
```
