# 🗺️ Findamine - Treasure Hunting Adventure Game

Findamine is an innovative location-based treasure hunting game that transforms your city into an interactive playground. Players solve clues, discover hidden locations, and compete for prizes while building connections with fellow treasure hunters.

## ✨ Features

### 🎮 Core Gameplay
- **Real-World Adventure**: Step outside and explore your surroundings like never before
- **Clue Solving**: Each clue leads you to real locations with fascinating stories
- **Hidden Gems**: Discover exciting challenges that test your problem-solving skills
- **QR Code Scanning**: Use your smartphone to unlock secrets and progress

### 👥 Social Features
- **Team Building**: Join local groups and collaborate with other players
- **Gamer Tags**: Create unique usernames for in-game identity
- **Interactive Experience**: Connect with fellow treasure hunters
- **Local Communities**: Build relationships in your area

### 🏆 Rewards & Competition
- **Prize Winning**: Compete for exciting rewards and achievements
- **Leaderboards**: Track your progress against other players
- **Achievement System**: Unlock badges and milestones
- **Game Creation**: Design and host your own treasure hunts

## 🏗️ Architecture

This is a **monorepo** built with modern technologies:

### 📱 Mobile App (`apps/mobile/`)
- **Framework**: React Native with Expo
- **Platforms**: iOS, Android, Web
- **Bundler**: Webpack for web, Metro for mobile
- **Features**: Cross-platform treasure hunting experience

### 🌐 Web App (`apps/web/`)
- **Framework**: Next.js 14 with React 19
- **Styling**: Tailwind CSS
- **Authentication**: JWT with cookie-based sessions
- **Features**: Admin dashboard, user management, analytics

### 🔧 Backend API (`services/api/`)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Local strategies
- **Features**: User management, analytics, game logic

### 🗄️ Database
- **Type**: PostgreSQL with PostGIS extensions
- **Migrations**: Prisma-based schema management
- **Analytics**: Comprehensive tracking of user activity

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/mk-bold/findamine.git
cd findamine
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start the Database
```bash
docker-compose up -d
```

### 4. Run Database Migrations
```bash
cd services/api
npx prisma migrate dev
npx prisma generate
cd ../..
```

### 5. Start Development Servers
```bash
pnpm dev
```

This will start:
- 🌐 **Web App**: http://localhost:3000
- 🔧 **API**: http://localhost:4000
- 📱 **Mobile**: http://localhost:8081

## 📁 Project Structure

```
findamine/
├── apps/
│   ├── mobile/          # React Native mobile app
│   └── web/            # Next.js web application
├── services/
│   └── api/            # NestJS backend API
├── docker-compose.yml   # Database configuration
├── package.json         # Root package.json
└── turbo.json          # Monorepo build configuration
```

## 🛠️ Development

### Adding New Features
1. **Backend**: Add services, controllers, and modules in `services/api/src/`
2. **Database**: Update Prisma schema and run migrations
3. **Frontend**: Add components and pages in `apps/web/app/`
4. **Mobile**: Update mobile app in `apps/mobile/`

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Testing
```bash
# Run all tests
pnpm test

# Run specific app tests
pnpm --filter @findamine/web test
pnpm --filter @findamine/api test
```

## 🔐 Authentication & Security

### User Management
- **Registration**: Email, password, gamer tag, real name
- **Login**: JWT-based authentication with cookies
- **Privacy**: Real names hidden, only gamer tags visible
- **Security**: Password hashing, CORS protection

### Analytics & Tracking
- **Login Attempts**: Record all login attempts (successful/failed)
- **Page Views**: Track user navigation and engagement
- **Device Info**: Browser, OS, hardware identification
- **Geolocation**: IP-based location tracking (optional)

## 🌍 Environment Variables

Create `.env` files in the appropriate directories:

### Root `.env`
```env
NODE_ENV=development
```

### API `.env` (`services/api/.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/findamine"
JWT_SECRET="your-secret-key"
```

### Web App `.env` (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📊 Database Schema

### Core Models
- **User**: Authentication, profile, gamer tag
- **LoginAttempt**: Security tracking and analytics
- **PageView**: User engagement and navigation analytics
- **Game**: Treasure hunt definitions and rules
- **Player**: Game participation and progress

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork the Repository
1. Fork the project on GitHub
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/amazing-feature`

### 2. Make Changes
1. Implement your feature or fix
2. Add tests if applicable
3. Update documentation
4. Follow the existing code style

### 3. Submit Changes
1. Commit your changes: `git commit -m 'Add amazing feature'`
2. Push to your branch: `git push origin feature/amazing-feature`
3. Create a Pull Request

### 4. Code Review
- All PRs require review
- Ensure tests pass
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo**: For the amazing cross-platform development experience
- **Next.js**: For the powerful React framework
- **NestJS**: For the robust backend architecture
- **Prisma**: For the excellent database toolkit
- **Tailwind CSS**: For the utility-first styling approach

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mk-bold/findamine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mk-bold/findamine/discussions)
- **Documentation**: Check the [Wiki](https://github.com/mk-bold/findamine/wiki)

---

**Happy Treasure Hunting! 🗺️✨**