# الحصان الذهبي للشحن (Golden Horse Shipping)

A comprehensive shipping management system for China-Libya shipping operations with bilingual support (Arabic/English).

## 🌟 Features

### Public Features
- **Bilingual Support**: Full Arabic (RTL) and English (LTR) support
- **Public Tracking**: Track shipments and client orders without login
- **Service Pages**: Comprehensive information about shipping services
- **Pricing Calculator**: Interactive shipping cost calculator
- **Contact System**: Multi-channel contact options with form submission
- **Advertisements**: Public ads display with search and filtering

### Admin Dashboard
- **Authentication**: JWT-based secure admin authentication
- **Client Management**: Full CRUD operations for client data
- **Shipment Management**: Track and manage all shipments
- **Ads Management**: Create and manage advertisements with image upload
- **Vessel Tracking**: Real-time AIS vessel tracking integration
- **Reports & Analytics**: Comprehensive reporting with CSV export
- **User Management**: Admin and operator role management

### Technical Features
- **Responsive Design**: Mobile-first responsive UI
- **Real-time Updates**: Live data updates and notifications
- **File Upload**: Secure image upload for advertisements
- **API Documentation**: Comprehensive Swagger documentation
- **Docker Ready**: Full containerization support
- **Database**: PostgreSQL with optimized schema
- **Caching**: Redis integration for performance
- **Security**: Rate limiting, CORS, and input validation

## 🏗️ Architecture

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Admin/          # Admin dashboard components
│   │   ├── Layout/         # Layout components
│   │   └── UI/             # Common UI elements
│   ├── pages/              # Next.js pages
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── api/            # API routes (if needed)
│   │   └── public/         # Public pages
│   ├── lib/                # Utilities and configurations
│   │   ├── api.ts          # API client
│   │   ├── auth.ts         # Authentication context
│   │   └── utils.ts        # Helper functions
│   └── styles/             # Global styles
├── public/
│   ├── locales/            # i18n translation files
│   │   ├── ar/             # Arabic translations
│   │   └── en/             # English translations
│   └── images/             # Static images
└── next.config.js          # Next.js configuration
```

### Backend (NestJS)
```
backend/
├── src/
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication module
│   │   ├── clients/        # Client management
│   │   ├── shipments/      # Shipment management
│   │   ├── ads/            # Advertisement system
│   │   ├── vessel-tracking/ # AIS vessel tracking
│   │   ├── reports/        # Analytics and reports
│   │   └── users/          # User management
│   ├── common/             # Shared utilities
│   │   ├── guards/         # Authentication guards
│   │   ├── decorators/     # Custom decorators
│   │   └── filters/        # Exception filters
│   ├── database/           # Database configuration
│   │   ├── entities/       # TypeORM entities
│   │   └── migrations/     # Database migrations
│   └── config/             # Application configuration
├── uploads/                # File upload directory
└── dist/                   # Compiled output
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd golden-horse-shipping
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment Configuration**

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=golden_horse_shipping

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# AIS API (optional - uses mock data if not provided)
AIS_API_URL=https://api.vesselfinder.com/api/v1
AIS_API_KEY=your-ais-api-key

# SMTP (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp API (optional)
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_TOKEN=your-whatsapp-token
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Database Setup**
```bash
cd backend

# Create database
createdb golden_horse_shipping

# Run migrations
npm run migration:run

# Seed initial data (optional)
npm run seed
```

5. **Start Development Servers**
```bash
# Backend (Terminal 1)
cd backend
npm run start:dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment with Cloud PostgreSQL

#### 1. Set up Cloud PostgreSQL Database
Create a PostgreSQL database on a cloud provider (AWS RDS, Google Cloud SQL, Azure Database, etc.) and note the connection details:
- Host/Endpoint
- Port (usually 5432)
- Database name
- Username
- Password

#### 2. Configure Environment Variables
Create `.env` file in the backend directory based on `.env.prod.example`:

```bash
cd backend
cp .env.prod.example .env
```

Edit the `.env` file with your cloud database details. You can use either DATABASE_URL or individual variables:

**Option 1: Using DATABASE_URL (Recommended)**
```env
# Database - Cloud PostgreSQL
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
DB_SYNCHRONIZE=false

# Other required variables...
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

**Option 2: Using Individual Variables**
```env
# Database - Cloud PostgreSQL
DB_TYPE=postgres
DB_HOST=your-cloud-postgres-host.com
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_SYNCHRONIZE=false

# Other required variables...
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

#### 3. Test Database Connection
```bash
cd backend
npm run test-db
```

#### 4. Run Database Migrations
```bash
cd backend
npm run migration:run-prod
```

#### 5. Build and Deploy
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 6. Verify Deployment
- Frontend: `http://your-server-ip`
- Backend API: `http://your-server-ip:3001/api`
- API Docs: `http://your-server-ip:3001/api/docs`

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Complete PostgreSQL connection string (recommended) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `DB_HOST` | PostgreSQL cloud host | `postgres-instance.region.rds.amazonaws.com` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your-secure-password` |
| `DB_NAME` | Database name | `golden_horse_shipping` |
| `DB_SSL` | Enable SSL connection | `true` |
| `DB_SSL_REJECT_UNAUTHORIZED` | SSL certificate validation | `false` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `FRONTEND_URL` | Production frontend URL | `https://goldenhorse.ly` |

## 📊 Database Schema

### Core Entities

**Users**
- id, username, email, password, role, isActive
- createdAt, updatedAt

**Clients**
- id, clientId, name, email, phone, address
- contactPerson, notes, isActive
- createdAt, updatedAt

**Shipments**
- id, trackingNumber, clientId, origin, destination
- status, paymentStatus, totalCost, estimatedDelivery
- vesselInfo, containerNumber, notes
- createdAt, updatedAt

**Advertisements**
- id, title, description, imageUrl, link
- startDate, endDate, isActive, targetAudience
- clickCount, impressionCount, tags
- createdAt, updatedAt

**Vessel Tracking**
- id, mmsi, imo, name, vesselType, flag
- latitude, longitude, course, speed, status
- destination, eta, lastUpdate

## 🔐 Authentication & Authorization

### Roles
- **Admin**: Full system access
- **Operator**: Limited access to shipments and clients
- **Viewer**: Read-only access

### JWT Token Structure
```json
{
  "sub": "user-id",
  "username": "admin",
  "role": "admin",
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Protected Routes
- `/admin/*` - Requires authentication
- `/api/admin/*` - Requires admin role
- `/api/reports/*` - Requires admin or operator role

## 🌐 API Documentation

### Public Endpoints
```
GET /api/shipments/:trackingNumber/public - Track shipment
GET /api/clients/:clientId/shipments - Get client shipments
GET /api/ads/public - Get active advertisements
POST /api/contact - Submit contact form
```

### Admin Endpoints
```
POST /api/auth/login - Admin login
GET /api/clients - List clients
POST /api/clients - Create client
PUT /api/clients/:id - Update client
DELETE /api/clients/:id - Delete client

GET /api/shipments - List shipments
POST /api/shipments - Create shipment
PUT /api/shipments/:id - Update shipment
DELETE /api/shipments/:id - Delete shipment

GET /api/ads - List advertisements
POST /api/ads - Create advertisement
PUT /api/ads/:id - Update advertisement
DELETE /api/ads/:id - Delete advertisement

GET /api/vessels - List vessels
GET /api/vessels/:mmsi - Get vessel details
GET /api/vessels/:mmsi/track - Get vessel tracking data

GET /api/reports/dashboard - Dashboard statistics
GET /api/reports/shipments - Shipment reports
GET /api/reports/clients - Client reports
GET /api/reports/export/:type - Export data as CSV
```

## 🎨 UI Components

### Design System
- **Colors**: Amber primary, Gray secondary
- **Typography**: Arabic-friendly fonts
- **Icons**: Lucide React icons
- **Layout**: Responsive grid system
- **Forms**: Consistent validation and error handling

### Key Components
- `AdminLayout` - Admin dashboard layout
- `PublicLayout` - Public pages layout
- `DataTable` - Sortable, filterable tables
- `SearchFilter` - Advanced search and filtering
- `FileUpload` - Drag-and-drop file upload
- `StatusBadge` - Status indicators
- `LoadingSpinner` - Loading states
- `Modal` - Confirmation dialogs

## 🌍 Internationalization (i18n)

### Supported Languages
- Arabic (ar) - RTL, primary language
- English (en) - LTR, secondary language

### Translation Files
```
public/locales/
├── ar/
│   └── common.json
└── en/
    └── common.json
```

### Usage
```tsx
import { useTranslation } from 'next-i18next';

const { t } = useTranslation('common');
return <h1>{t('site.title')}</h1>;
```

## 📈 Performance Optimization

### Frontend
- Next.js SSG/SSR for optimal loading
- Image optimization with Next.js Image
- Code splitting and lazy loading
- React Query for data caching
- Tailwind CSS purging for smaller bundles

### Backend
- Database query optimization
- Redis caching for frequently accessed data
- File upload optimization
- API response compression
- Rate limiting for security

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier configuration
- Consistent naming conventions
- Component-based architecture
- Custom hooks for reusable logic

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request for review
```

### Testing
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# E2E tests
npm run test:e2e
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**File Upload Issues**
```bash
# Check upload directory permissions
chmod 755 backend/uploads

# Create uploads directory if missing
mkdir -p backend/uploads
```

**i18n Translation Missing**
- Check translation keys in `public/locales/`
- Restart development server after adding translations
- Verify `next-i18next.config.js` configuration

## 📞 Support & Contact

### Development Team
- **Project Lead**: [Your Name]
- **Frontend Developer**: [Developer Name]
- **Backend Developer**: [Developer Name]
- **DevOps Engineer**: [Engineer Name]

### Documentation
- API Documentation: http://localhost:3001/api
- Component Storybook: http://localhost:6006
- Database Schema: `/docs/database-schema.md`
- Deployment Guide: `/docs/deployment.md`

## 📄 License

This project is proprietary software developed for Golden Horse Shipping Company. All rights reserved.

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete frontend and backend implementation
- ✅ Admin dashboard with full CRUD operations
- ✅ Public tracking system
- ✅ Bilingual support (Arabic/English)
- ✅ Vessel tracking integration
- ✅ Advertisement system with image upload
- ✅ Docker containerization
- ✅ API documentation

### Upcoming Features (v1.1.0)
- 🔄 Advanced reporting and analytics
- 🔄 Mobile app development
- 🔄 SMS/WhatsApp notifications
- 🔄 Payment gateway integration
- 🔄 Advanced vessel tracking with maps
- 🔄 Multi-tenant support
- 🔄 Advanced security features

---

**Built with ❤️ for Golden Horse Shipping Company**
