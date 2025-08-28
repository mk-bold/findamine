# Findamine Web Admin Dashboard

A modern, responsive web interface for managing the Findamine geo-caching game platform. Built with Next.js 14, React, and Tailwind CSS.

## 🚀 Features

### **Authentication & Authorization**
- Secure login system with JWT tokens
- Role-based access control (Admin, Game Master, Player)
- Automatic token refresh and session management

### **Admin Features**
- **User Management**: View, edit, promote, activate/deactivate, and delete users
- **System Analytics**: Platform-wide statistics and insights
- **Role Management**: Promote users between roles (Player → Game Master → Admin)

### **Game Master Features**
- **Game Management**: Create, edit, and manage geo-caching games
- **Clue Management**: Add and manage clue locations
- **Player Management**: Add/remove players from games
- **Game Analytics**: Monitor game performance and player progress

### **Player Features**
- **Game Participation**: Join/leave games and view available games
- **Leaderboards**: View rankings and achievements
- **Profile Management**: Update personal information and privacy settings

### **Modern UI/UX**
- Responsive design that works on all devices
- Beautiful, intuitive interface with Tailwind CSS
- Real-time notifications and toast messages
- Loading states and error handling
- Mobile-first responsive design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React, Heroicons
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form
- **Charts**: Recharts (for future analytics)

## 📦 Installation

1. **Navigate to the web app directory**:
   ```bash
   cd apps/web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the `apps/web` directory:
   ```bash
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

### **Demo Credentials**

The app comes with pre-configured demo accounts:

- **Admin**: `admin@findamine.com` / `password123`
- **Game Master**: `gamemaster@findamine.com` / `password123`
- **Player**: `newplayer@findamine.com` / `password123`

### **Role Hierarchy**

- **ADMIN**: Full access to all features
- **GAME_MASTER**: Access to game management and player features
- **PLAYER**: Access to game participation and profile features

## 🏗️ Project Structure

```
apps/web/
├── app/                    # Next.js 13+ app directory
│   ├── dashboard/         # Dashboard pages
│   │   ├── users/        # User management
│   │   ├── games/        # Game management
│   │   ├── clue-locations/ # Clue location management
│   │   ├── leaderboards/ # Leaderboard views
│   │   ├── analytics/    # Analytics and reports
│   │   └── settings/     # User settings
│   ├── login/            # Login page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable UI components
├── contexts/             # React contexts (Auth, etc.)
├── lib/                  # Utilities and API client
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔌 API Integration

The web app integrates with your NestJS backend API through a comprehensive API client:

- **Authentication**: Login, registration, profile management
- **Admin API**: User management, system statistics
- **Game Master API**: Game and clue management
- **Player API**: Game participation, leaderboards

## 🎨 Customization

### **Styling**
- Custom Tailwind CSS configuration with Findamine brand colors
- Reusable component classes (`.btn`, `.card`, `.input`, etc.)
- Responsive design utilities

### **Components**
- Modular component architecture
- Consistent design patterns
- Easy to extend and customize

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
npm start
```

### **Environment Variables**
Make sure to set the correct API base URL for production:
```bash
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
```

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### **Code Quality**
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Consistent component patterns

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Secure API communication
- Input validation and sanitization
- XSS protection

## 🎯 Future Enhancements

- **Real-time Updates**: WebSocket integration for live game updates
- **Advanced Analytics**: Charts and graphs for game performance
- **File Upload**: Image upload for clues and user profiles
- **Push Notifications**: Browser notifications for game events
- **Offline Support**: Service worker for offline functionality
- **Multi-language**: Internationalization support

## 🤝 Contributing

1. Follow the existing code patterns
2. Use TypeScript for all new code
3. Add proper error handling
4. Test on multiple devices
5. Update documentation as needed

## 📞 Support

For questions or issues:
1. Check the API documentation
2. Review the console for error messages
3. Ensure the backend API is running
4. Verify environment variables are set correctly

---

**Built with ❤️ for the Findamine geo-caching platform** 