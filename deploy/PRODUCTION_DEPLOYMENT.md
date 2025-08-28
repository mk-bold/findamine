# 🚀 Production Deployment Guide

This guide will walk you through deploying Findamine to production environments like Vercel, Railway, or your own servers.

## 🎯 **Deployment Options**

### **Option 1: Vercel (Recommended for Web App)**
Vercel provides the best experience for Next.js applications with automatic deployments, preview environments, and global CDN.

### **Option 2: Railway**
Railway offers easy deployment for both web apps and APIs with automatic scaling and database management.

### **Option 3: Self-Hosted**
Deploy to your own servers or cloud providers (AWS, Google Cloud, DigitalOcean) for full control.

## 🌐 **Web App Deployment (Vercel)**

### **1. Prepare Your Repository**
```bash
# Ensure your repository is pushed to GitHub
git push origin main

# Verify your Next.js config has the correct settings
# apps/web/next.config.js should have:
# - output: 'standalone'
# - Correct image domains
```

### **2. Deploy to Vercel**
1. **Visit [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Import your repository**: `mk-bold/findamine`
3. **Configure the project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### **3. Set Environment Variables**
In your Vercel project settings, add these environment variables:

```env
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.findamine.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=your-production-analytics-id
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_DEBUG=false

# Next.js Configuration
NEXTAUTH_URL=https://findamine.com
NEXTAUTH_SECRET=your-production-nextauth-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true
NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=true

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-production-google-maps-api-key
NEXT_PUBLIC_GEOLOCATION_API_KEY=your-production-geolocation-api-key
```

### **4. Deploy**
- Vercel will automatically deploy on every push to `main`
- Preview deployments are created for pull requests
- Custom domains can be configured in project settings

## 🔧 **API Deployment (Railway)**

### **1. Prepare Your API**
```bash
# Ensure your API builds successfully
cd services/api
npm run build
```

### **2. Deploy to Railway**
1. **Visit [railway.app](https://railway.app)** and sign in with GitHub
2. **Create a new project** and select "Deploy from GitHub repo"
3. **Select your repository**: `mk-bold/findamine`
4. **Configure the service**:
   - **Root Directory**: `services/api`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### **3. Set Environment Variables**
In Railway, add these environment variables:

```env
# Database
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=24h
PORT=4000
HOST=0.0.0.0

# CORS and Security
CORS_ORIGIN=https://findamine.com
COOKIE_SECRET=your-production-cookie-secret
BCRYPT_ROUNDS=12
LOG_LEVEL=info
ENABLE_SWAGGER=false

# Performance
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
```

### **4. Add Database Service**
1. **Add a new service** → "Database" → "PostgreSQL"
2. **Connect your API service** to the database
3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## 🗄️ **Database Setup**

### **Production Database Options**

#### **Option A: Railway PostgreSQL**
- **Pros**: Easy setup, automatic backups, scaling
- **Cons**: Limited to Railway ecosystem
- **Cost**: Pay-per-use pricing

#### **Option B: Supabase**
- **Pros**: Open source, generous free tier, real-time features
- **Cons**: Learning curve for advanced features
- **Cost**: Free tier + affordable paid plans

#### **Option C: PlanetScale**
- **Pros**: Serverless, branching, excellent performance
- **Cons**: MySQL (not PostgreSQL), some feature differences
- **Cost**: Free tier + usage-based pricing

#### **Option D: AWS RDS**
- **Pros**: Full control, enterprise features, compliance
- **Cons**: Complex setup, requires DevOps knowledge
- **Cost**: Pay-per-use + instance costs

### **Database Migration Strategy**
```bash
# 1. Create production database
# 2. Run migrations
npx prisma migrate deploy

# 3. Seed initial data (if needed)
npx prisma db seed

# 4. Verify connection
npx prisma studio
```

## 🔒 **Security Configuration**

### **SSL/TLS Certificates**
- **Vercel**: Automatic HTTPS with Let's Encrypt
- **Railway**: Automatic HTTPS
- **Custom Domains**: Use Let's Encrypt or your provider's certificates

### **Environment Variable Security**
```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For COOKIE_SECRET
openssl rand -base64 32  # For NEXTAUTH_SECRET
```

### **CORS Configuration**
```typescript
// services/api/src/main.ts
app.enableCors({
  origin: [
    'https://findamine.com',
    'https://www.findamine.com',
    'https://staging.findamine.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Cookie-Consent']
});
```

## 📊 **Monitoring and Analytics**

### **Application Monitoring**
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking

### **Database Monitoring**
- **Railway Insights**: Built-in database monitoring
- **pgAdmin**: PostgreSQL administration
- **Prisma Studio**: Database management interface

### **Health Checks**
```typescript
// Add health check endpoint
@Get('health')
getHealth() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  };
}
```

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] **Code Review**: All changes reviewed and approved
- [ ] **Testing**: All tests pass locally and in CI
- [ ] **Build Verification**: Applications build successfully
- [ ] **Environment Variables**: All required variables configured
- [ ] **Database**: Production database created and accessible
- [ ] **Migrations**: Database schema up to date

### **Deployment**
- [ ] **Web App**: Deployed to Vercel with correct configuration
- [ ] **API**: Deployed to Railway with environment variables
- [ ] **Database**: Connected and migrations run
- [ ] **Domain**: Custom domain configured and SSL working
- [ ] **CORS**: API accessible from web app domain

### **Post-Deployment**
- [ ] **Health Checks**: All services responding correctly
- [ ] **Authentication**: Login/registration working
- [ ] **Database**: Data persistence working
- [ ] **Performance**: Page load times acceptable
- [ ] **Monitoring**: Analytics and error tracking working

## 🔄 **Continuous Deployment**

### **GitHub Actions Integration**
Your CI/CD pipeline will automatically:
- Run tests on every PR
- Deploy to staging on merge to `develop`
- Deploy to production on merge to `main`

### **Deployment Triggers**
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [ main, develop ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
```

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Check build logs
npm run build

# Verify dependencies
npm install

# Check TypeScript errors
npx tsc --noEmit
```

#### **Database Connection Issues**
```bash
# Test database connection
npx prisma db pull

# Check environment variables
echo $DATABASE_URL

# Verify network access
telnet your-db-host 5432
```

#### **CORS Errors**
- Verify `CORS_ORIGIN` includes your web app domain
- Check that `credentials: true` is set
- Ensure preflight requests are handled

#### **Authentication Issues**
- Verify JWT secrets are set correctly
- Check cookie domain and secure settings
- Ensure CORS allows credentials

## 📚 **Additional Resources**

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**Happy Deploying! 🚀✨**

Remember to test thoroughly in staging before deploying to production!
