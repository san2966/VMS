# Visitor Management System

A modern, production-ready visitor management system built with React, TypeScript, and Supabase.

## 🚀 Features

### 🎯 **Core Functionality**
- **Visitor Registration**: Complete visitor onboarding with photo capture
- **Employee Management**: Add, edit, and delete employee records
- **Organization Management**: Multi-organization support
- **Real-time Dashboard**: Live analytics and visitor trends
- **QR Code Generation**: Digital receipts with QR codes
- **Offline Support**: Works offline with automatic sync

### 🔐 **Security & Access Control**
- **Role-based Access**: Admin and Super User roles
- **Row Level Security**: Database-level security policies
- **Secure Authentication**: Protected admin areas
- **Data Isolation**: Organization-specific data access

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on all devices
- **Dark/Light Theme**: Automatic theme switching
- **Smooth Animations**: Modern micro-interactions
- **Glass Morphism**: Beautiful modern design
- **Accessibility**: WCAG compliant

### 📊 **Analytics & Reporting**
- **Real-time Charts**: Weekly visitor trends
- **System Metrics**: Performance monitoring
- **Data Export**: CSV export functionality
- **Live Updates**: Real-time dashboard updates

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **QR Codes**: QRCode library
- **PDF Generation**: jsPDF
- **Image Capture**: HTML5 Canvas

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd visitor-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Database Migrations

1. Install Supabase CLI:
```bash
npm install -g @supabase/cli
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Run migrations:
```bash
supabase db push
```

### 5. Start Development Server
```bash
npm run dev
```

## 🗄️ Database Schema

### Tables
- **admin_users**: System administrators and super users
- **organizations**: Company/government organizations
- **employees**: Organization employees
- **visitors**: Visitor records and check-ins

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Secure authentication flow

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Default Super User
- **Username**: User2966
- **Password**: Admin@2966

## 🚀 Deployment

### Netlify Deployment
1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
- Connect your GitHub repository
- Set environment variables
- Deploy from `dist` folder

### Vercel Deployment
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Manual Deployment
1. Build the project:
```bash
npm run build
```

2. Upload `dist` folder to your hosting provider

## 📱 Usage

### For Visitors
1. **New Registration**: Complete personal and visit details
2. **Existing Visitor**: Login with Aadhar number
3. **Photo Capture**: Optional photo for security
4. **Digital Receipt**: QR code receipt generation

### For Admins
1. **Organization Setup**: Add organization details
2. **Employee Management**: Add, edit, delete employees
3. **Dashboard**: View visitor analytics
4. **Data Export**: Export visitor data

### For Super Users
1. **User Management**: Create and manage admin users
2. **System Overview**: Complete system analytics
3. **Global Access**: Access all organizations
4. **System Monitoring**: Performance metrics

## 🔄 Offline Support

The system includes robust offline functionality:
- **Local Storage**: Data cached locally
- **Automatic Sync**: Syncs when connection restored
- **Offline Indicators**: Clear online/offline status
- **Queue Management**: Offline actions queued for sync

## 📊 Analytics Features

### Dashboard Metrics
- Organization count
- Employee count
- Total visitors
- Today's visits

### Charts & Graphs
- Weekly visitor trends
- Real-time updates
- System performance metrics
- Custom date ranges

## 🛡️ Security Features

### Data Protection
- Encrypted data transmission
- Secure file uploads
- Input validation
- XSS protection

### Access Control
- Role-based permissions
- Session management
- Secure authentication
- Data isolation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## 🔮 Future Enhancements

- **Mobile App**: React Native mobile application
- **Advanced Analytics**: More detailed reporting
- **Integration APIs**: Third-party integrations
- **Multi-language**: Internationalization support
- **Advanced Security**: Biometric authentication
- **Notification System**: Real-time notifications

---

Built with ❤️ for modern organizations