# Changelog - Golden Horse Shipping

## [1.1.0] - 2024-09-22

### 🚀 New Features
- **Customer Financial Dashboard**: Added comprehensive financial data display for customers
- **Payment History**: Customers can now view their payment history with pagination
- **Financial Reports**: Added detailed financial reports with charts and statistics
- **Password Management**: Customers can now change their passwords from their profile
- **Unified Client System**: Merged duplicate client management systems into one unified system
- **Portal Access Management**: Admins can enable/disable portal access for clients with password management

### 🔧 Improvements
- **Enhanced UI**: Improved navigation bar layout and sizing
- **Better Icons**: Increased icon sizes for better visibility
- **Responsive Design**: Fixed overlapping elements in navigation
- **Database Optimization**: Cleared dummy data for better performance
- **Deployment Ready**: Fixed all deployment issues for Coolify

### 🐛 Bug Fixes
- **Build Scripts**: Fixed backend package.json build scripts
- **React Hooks**: Fixed useEffect dependency warnings
- **HTML Entities**: Fixed unescaped quotes in debug page
- **Next.js Links**: Replaced `<a>` tags with Next.js `<Link>` components
- **Navigation Overlap**: Fixed overlapping navigation bar with logo
- **Duplicate Pages**: Removed duplicate client management pages

### 🗃️ Database Changes
- **Client Entity**: Added portal access fields (trackingNumber, passwordHash, hasPortalAccess)
- **Migration**: Created migration for portal access fields
- **Data Cleanup**: Cleared all dummy data from database
- **Backup**: Created database backup before cleanup

### 🚀 Deployment
- **Dockerfile**: Created optimized multi-stage Dockerfile
- **nixpacks.toml**: Added Nixpacks configuration for Coolify
- **docker-compose.yml**: Updated for unified deployment
- **Health Check**: Added API health check endpoint
- **Environment Variables**: Documented all required environment variables

### 📁 File Changes

#### Added Files
- `frontend/src/pages/customer/financial.tsx` - Customer financial data page
- `frontend/src/pages/customer/financial-reports.tsx` - Financial reports page
- `frontend/src/pages/admin/clients/[id]/change-password.tsx` - Change client password page
- `backend/migrations/add-portal-access-to-clients.sql` - Portal access migration
- `backend/run-portal-access-migration.js` - Migration runner
- `backend/clear-database.js` - Database cleanup script
- `backend/check-database-status.js` - Database status checker
- `nixpacks.toml` - Nixpacks configuration
- `Dockerfile` - Optimized Docker configuration
- `.dockerignore` - Docker ignore file
- `DEPLOYMENT_GUIDE.md` - Deployment documentation
- `README_DEPLOYMENT.md` - Deployment README

#### Modified Files
- `backend/src/entities/client.entity.ts` - Added portal access fields
- `backend/src/modules/clients/clients.service.ts` - Added portal access methods
- `backend/src/modules/clients/clients.controller.ts` - Added portal access endpoints
- `backend/src/modules/clients/dto/create-client.dto.ts` - Added portal access fields
- `backend/src/modules/customer-portal/customer-portal.service.ts` - Added financial methods
- `backend/src/modules/customer-portal/customer-portal.controller.ts` - Added financial endpoints
- `backend/src/modules/customer-portal/customer-portal.module.ts` - Added PaymentRecord entity
- `frontend/src/pages/customer/dashboard.tsx` - Added financial data display
- `frontend/src/pages/customer/profile.tsx` - Added password change functionality
- `frontend/src/pages/admin/clients/new.tsx` - Added portal access fields
- `frontend/src/pages/admin/clients/index.tsx` - Added portal access column
- `frontend/src/pages/admin/clients/[id].tsx` - Added portal access information
- `frontend/src/components/Customer/CustomerLayout.tsx` - Added financial navigation
- `frontend/src/components/Admin/Layout/AdminLayout.tsx` - Improved navigation layout
- `frontend/src/components/Layout/Header.tsx` - Improved header layout
- `backend/package.json` - Fixed build scripts
- `docker-compose.yml` - Updated for unified deployment

#### Deleted Files
- `frontend/src/pages/admin/customer-accounts/` - Removed duplicate client system
- Various documentation files that were consolidated

### 🔄 Breaking Changes
- **Client Management**: The old customer-accounts system has been removed
- **Database Schema**: New fields added to clients table (requires migration)
- **API Endpoints**: New endpoints added for financial data and portal access

### 📋 Migration Guide

#### For Existing Deployments
1. **Backup Database**: Create a backup of your current database
2. **Run Migration**: Execute the portal access migration
3. **Update Environment**: Add new environment variables if needed
4. **Redeploy**: Deploy the updated application

#### For New Deployments
1. **Set Environment Variables**: Configure all required environment variables
2. **Deploy**: Use the provided Docker configuration
3. **Create Admin**: Use the admin creation script

### 🎯 Next Steps
- Monitor application performance after deployment
- Test all new financial features
- Verify portal access functionality
- Check health check endpoint
- Review logs for any issues

### 📞 Support
- Check `DEPLOYMENT_GUIDE.md` for deployment issues
- Review `README_DEPLOYMENT.md` for detailed deployment instructions
- Use health check endpoint to verify application status

---

## [1.0.0] - 2024-09-16

### 🎉 Initial Release
- Complete shipping management system
- Bilingual support (Arabic/English)
- Admin dashboard with full CRUD operations
- Public tracking system
- Real-time vessel tracking
- Advertisement management
- Reports and analytics
- Docker support
- PostgreSQL integration
