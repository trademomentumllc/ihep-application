# Health Insight Platform

## Overview
This is a comprehensive healthcare platform specifically designed for HIV patient management and support. The platform provides HIPAA-compliant healthcare services including appointment scheduling, resource management, community support, AI-powered wellness tips, and telehealth capabilities. Built with modern web technologies and focused on patient engagement and regulatory compliance.

## System Architecture
The application follows a serverless architecture with React frontend and BigQuery database:

### Current (Replit Platform)
- **Frontend**: React with TypeScript, Vite build system, Tailwind CSS for styling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Deployment**: Replit platform with autoscale deployment strategy
- **Session Management**: Express sessions with memory store
- **Authentication**: Passport.js with local strategy and bcrypt password hashing

### Target (Google Cloud Platform - High Availability)
- **Frontend**: React SPA with multi-zone load balancing and CDN
- **Backend**: Multi-tier architecture with 6 load balancers and auto-scaling
- **Database**: Regional PostgreSQL cluster with read replicas
- **Infrastructure**: Terraform-managed multi-zone deployment
- **Load Balancing**: 2 external + 4 internal load balancers for complete redundancy
- **Scaling**: Auto-scaling from 10-25 instances across web and app tiers
- **Monitoring**: Comprehensive monitoring with alerting and custom dashboards

## Key Components

### Frontend Architecture
- **Component Library**: Radix UI components with shadcn/ui styling system
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design tokens for healthcare branding

### Backend Architecture
- **API Design**: RESTful API endpoints organized by feature modules
- **Database Layer**: Drizzle ORM with PostgreSQL for HIPAA-compliant data storage
- **Security**: Custom middleware for vulnerability protection, structured audit logging
- **Service Layer**: Modular services for gamification, AI moderation, wellness tips, and healthcare integrations

### Core Features
1. **Patient Management**: User profiles, appointment scheduling, medication tracking
2. **Resource Directory**: Healthcare provider listings with search and filtering
3. **Community Support**: Forum system with AI moderation and support groups
4. **Educational Content**: Health information and resources management
5. **AI-Powered Services**: Wellness tips generation, healthcare guidance, content moderation
6. **Gamification**: Health activity tracking with points, achievements, and rewards
7. **Telehealth Integration**: Twilio Video for virtual appointments
8. **Notification System**: SMS and email reminders for appointments and medication

## Data Flow
1. **User Authentication**: Passport.js handles login/logout with session persistence
2. **API Requests**: Frontend makes authenticated requests to Express endpoints
3. **Database Operations**: Drizzle ORM handles all database interactions with type safety
4. **Real-time Features**: WebSocket connections for live chat and notifications
5. **External Integrations**: Twilio for SMS/video, OpenAI for AI services, SendGrid for email
6. **Audit Trail**: All PHI access logged to audit_logs table for HIPAA compliance

## External Dependencies
- **Twilio**: SMS messaging, phone verification, video calls for telehealth
- **OpenAI**: AI-powered wellness tips, content moderation, healthcare guidance
- **SendGrid**: Transactional email delivery for notifications and reminders
- **Google Cloud Platform**: Serverless hosting, BigQuery database, Cloud Functions
- **Anthropic Claude**: Alternative AI provider for healthcare AI assistant

## Deployment Strategy

### Current (Replit)
- **Environment**: Replit platform with Node.js 20 runtime
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.js`
- **Database**: PostgreSQL 17 with automatic migrations via Drizzle
- **Scaling**: Autoscale deployment target for handling variable load
- **Security**: Environment variables for API keys, HIPAA audit logging, vulnerability protection middleware

### Target (GCP High Availability)
- **Frontend**: Multi-zone web server clusters with global load balancing
- **Backend**: 6-15 auto-scaling app servers with internal load balancers
- **Database**: Regional PostgreSQL cluster with automatic failover and read replicas
- **Infrastructure**: Terraform-managed multi-zone deployment across us-central1-a/b
- **Load Balancers**: 6-layer architecture (2 external + 4 internal) for zero downtime
- **Security**: VPC isolation, Cloud Armor protection, encrypted connections
- **Monitoring**: Real-time health checks, auto-healing, and comprehensive alerting

## Changelog
- June 13, 2025. Initial setup
- June 13, 2025. Updated header logo to new Health Insight Ventures banner design with tree logo
- June 13, 2025. Updated to refined logo version with golden frame, doubled header height (py-6) and logo size (h-24) for better visibility
- August 13, 2025. Created GCP migration architecture with serverless React frontend and BigQuery database
- August 13, 2025. Configured Terraform infrastructure, Cloud Functions backend, and BigQuery schema for serverless deployment
- August 13, 2025. Added comprehensive migration guide and deployment scripts for GCP transition
- August 13, 2025. Implemented enterprise-grade high availability architecture with 6-layer load balancing
- August 13, 2025. Added multi-zone deployment, auto-scaling, database clustering, and comprehensive monitoring

## User Preferences
Preferred communication style: Simple, everyday language.
Production domain: ihep.app (configured for all production deployments)