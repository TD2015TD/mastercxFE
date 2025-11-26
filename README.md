# CRM Frontend - JKDM Customer Relationship Management System

React + TypeScript + Vite frontend application for the JKDM CRM system with Tailwind CSS and modern UI components.

## Features

### Agent Portal
- **Agent Dashboard**: Real-time metrics, active tickets queue, performance tracking
- **Ticket Management**: Create, view, update, and resolve tickets with full workflow
- **Customer 360 Profile**: Complete customer view with interaction timeline and relationship mapping
- **Knowledge Base Integration**: Quick access to KB articles during ticket handling
- **Telephony Bar**: Integrated call controls and call history
- **Script Assistant**: Context-aware scripts for common customer scenarios

### Supervisor Portal
- **Supervisor Dashboard**: Team performance, workload management, SLA compliance center
- **Agent Performance Monitoring**: Real-time agent metrics and performance analytics
- **Department Metrics**: Queue statistics and departmental KPIs
- **Workload Management**: Ticket assignment and distribution controls

### Knowledge Base
- **Content Creator Portal**: Article editor with rich text, directory browser, analytics
- **Directory Search**: Hierarchical navigation and advanced filtering
- **Review Workflow**: Article approval queue and version control
- **Analytics Dashboard**: Usage statistics and effectiveness metrics

### Additional Features
- **Citizen Self-Service Portal**: Public portal for complaint submission and case tracking
- **Analytics & Reporting**: Metrics overview, ticket volume charts, SLA performance
- **System Administration**: User management, system configuration, audit trail, compliance dashboard
- **Global Navigation**: Command palette (Cmd+K), keyboard shortcuts, breadcrumbs
- **Multi-language Support**: English and Malay (Bahasa Malaysia)

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Context + Hooks
- **API Client**: Axios with JWT authentication
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running at http://localhost:8000 (see [crm-api](https://github.com/syafiqapextreasure/crm-api))

## Installation

```bash
# Clone repository
git clone https://github.com/syafiqapextreasure/crm-frontend.git
cd crm-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend API URL
# VITE_API_BASE_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

## Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Project Structure

```
crm-frontend/
├── public/                      # Static assets
│   └── assets/images/          # Image files
├── src/
│   ├── components/             # Reusable components
│   │   ├── ui/                # UI components (Button, Input, Select, etc.)
│   │   ├── AgentScriptAssistant.jsx
│   │   ├── TelephonyBar.jsx
│   │   └── ...
│   ├── pages/                 # Page components
│   │   ├── agent-dashboard/
│   │   ├── supervisor-dashboard/
│   │   ├── ticket-management/
│   │   ├── customer-360-profile/
│   │   ├── knowledge-base-portal/
│   │   ├── citizen-self-service-portal/
│   │   ├── analytics-and-reporting/
│   │   └── system-administration/
│   ├── services/              # API service layer
│   │   ├── api.ts            # Axios instance with interceptors
│   │   ├── authService.ts    # Authentication services
│   │   ├── ticketService.ts  # Ticket API calls
│   │   ├── customerService.ts
│   │   ├── agentService.ts
│   │   └── languageService.ts
│   ├── styles/               # Global styles
│   │   ├── index.css
│   │   └── tailwind.css
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main app component
│   ├── Routes.tsx            # Route definitions
│   ├── main.tsx              # App entry point
│   └── types.d.ts            # TypeScript type definitions
├── eslint.config.js
├── tailwind.config.cjs
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Key Components

### Authentication
- JWT-based authentication with token refresh
- Protected routes with role-based access control
- Login page with bilingual support

### UI Components
- **BreadcrumbNavigation**: Dynamic breadcrumb trails
- **CommandPalette**: Global search and navigation (Cmd+K)
- **NavigationSidebar**: Role-based menu system
- **NotificationCenter**: Real-time notifications
- **UserProfileDropdown**: User menu with preferences

### Services
All API calls are centralized in service files:
- Automatic JWT token injection
- Error handling and retry logic
- Request/response interceptors
- API base URL configuration

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=JKDM CRM
VITE_DEFAULT_LANGUAGE=en
```

## Development

### Adding New Pages
1. Create page component in `src/pages/[feature-name]/`
2. Add route in `src/Routes.tsx`
3. Update navigation in `src/components/ui/NavigationSidebar.jsx`

### Adding New API Services
1. Create service file in `src/services/`
2. Import API instance from `src/services/api.ts`
3. Export functions for CRUD operations

### Styling Guidelines
- Use Tailwind utility classes for styling
- Follow existing component patterns
- Maintain responsive design (mobile-first)
- Support both English and Malay text lengths

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Output will be in dist/ directory
# Deploy dist/ to your web server or CDN
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Related Repositories

- **Backend API**: [crm-api](https://github.com/syafiqapextreasure/crm-api)

## License

Proprietary - JKDM Project
