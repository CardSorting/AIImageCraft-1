# 🎨 DreamBeesArt - AI Image Generation Platform

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white" alt="Stripe" />
</div>

<p align="center">
  <strong>Create stunning AI-generated artwork with advanced models, trading card features, and a robust credit system</strong>
</p>

<p align="center">
  Transform your creative ideas into high-quality images using cutting-edge AI models including Google's Imagen 4, with professional-grade features and an intuitive interface.
</p>

---

## ✨ Features

### 🚀 **Core AI Generation**
- **Multi-Model Support**: Access to various AI models including Google's Imagen 4
- **Advanced Parameters**: Fine-tune generation with steps, CFG scale, schedulers, and more
- **Batch Generation**: Create multiple variations with a single prompt
- **Real-time Preview**: See your creations as they're generated
- **NSFW Detection**: Built-in content filtering for safe generation

### 🎮 **Trading Card System**
- **Rarity Calculator**: Y2K trading card game inspired rarity system
- **Dynamic Scoring**: Images automatically receive rarity tiers, scores, and star ratings
- **Collectible Interface**: View your generations as premium trading cards
- **Rarity Tiers**: Common, Uncommon, Rare, Epic, Legendary, and Mythic classifications

### 💳 **Credit & Payment System**
- **DreamBee Credits**: Flexible credit-based generation system
- **Stripe Integration**: Secure payment processing for credit packages
- **Package Options**: Multiple credit bundles with bonus rewards
- **Transaction History**: Complete purchase and spending tracking
- **Atomic Operations**: Guaranteed credit balance consistency

### 🎨 **Advanced Generation Options**
- **LoRA Support**: Enhance generations with specialized model adaptations
- **Custom Dimensions**: Support for various aspect ratios and sizes
- **Accelerator Options**: TEA Cache and Deep Cache optimization
- **Refiner Models**: Post-processing enhancement capabilities
- **PuLID Integration**: Advanced face consistency features

### 👤 **User Experience**
- **Auth0 Integration**: Secure OAuth authentication
- **Personalized Gallery**: Your complete generation history
- **Model Discovery**: Explore and bookmark favorite AI models
- **Social Features**: Like, bookmark, and interact with models
- **Responsive Design**: Optimized for desktop and mobile devices

### 📱 **Modern Interface**
- **Dark/Light Mode**: Seamless theme switching
- **Mobile-First**: Touch-optimized mobile experience
- **Real-time Updates**: Live generation status and progress
- **Intuitive Navigation**: Clean, professional interface design
- **Animation Effects**: Smooth transitions and micro-interactions

---

## 🏗️ Architecture

DreamBeesArt follows **Clean Architecture** principles with **CQRS** (Command Query Responsibility Segregation) patterns:

```
📁 Project Structure
├── 🖥️  client/               # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-based page components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and configurations
│
├── 🔧 server/                # Node.js Backend
│   ├── application/          # Business logic layer
│   │   ├── services/         # Application services
│   │   ├── commands/         # Command handlers
│   │   └── queries/          # Query handlers
│   ├── domain/               # Domain models and value objects
│   ├── infrastructure/       # External service implementations
│   │   └── repositories/     # Data persistence layer
│   └── presentation/         # Controllers and routes
│
└── 📊 shared/                # Shared types and schemas
    └── schema.ts             # Database schema and types
```

### 🛠️ **Technology Stack**

**Frontend:**
- **React 18** with TypeScript
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Shadcn/ui** + **Radix UI** for component library
- **Tailwind CSS** with custom theme system
- **Framer Motion** for animations
- **React Hook Form** with Zod validation

**Backend:**
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Auth0** for authentication
- **Stripe** for payment processing
- **Runware SDK** for AI model integration
- **WebSocket** support for real-time features

**Database & Infrastructure:**
- **Neon PostgreSQL** for persistent storage
- **Drizzle Kit** for schema migrations
- **Clean Architecture** with dependency injection
- **CQRS** patterns for scalable operations

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **PostgreSQL** database
- **Stripe** account for payments
- **Auth0** tenant for authentication
- **Runware** API access for AI generation

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dreambeesart
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# Authentication (Auth0)
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:5000
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# AI Generation (Runware)
RUNWARE_API_KEY=your-runware-api-key

# Application
NODE_ENV=development
SESSION_SECRET=your-session-secret
```

4. **Database Setup**
```bash
# Push schema to database
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:5000` to see your application running!

---

## 💰 Credit System

### How Credits Work
- **1 Credit = 1 AI Generation** (standard images)
- **Premium models** may require more credits
- **Batch generations** consume credits per image
- **Failed generations** don't consume credits

### Credit Packages
- **Starter Pack**: 50 credits - $4.99
- **Popular Pack**: 200 credits + 50 bonus - $19.99
- **Pro Pack**: 500 credits + 150 bonus - $39.99
- **Ultimate Pack**: 1000 credits + 400 bonus - $69.99

### Purchase Flow
1. Browse credit packages on `/dreamcredits`
2. Select desired package
3. Secure checkout via Stripe
4. Instant credit delivery
5. Start generating immediately

---

## 🎯 AI Model Features

### Supported Models
- **Google Imagen 4**: Latest high-quality generation
- **Stable Diffusion variants**: Multiple checkpoint options
- **Custom LoRA models**: Specialized style adaptations
- **Community models**: User-contributed checkpoints

### Generation Parameters
```typescript
interface GenerationOptions {
  steps: number;              // Generation steps (1-100)
  cfgScale: number;          // Guidance scale (1-30)
  seed?: number;             // Reproducible results
  scheduler?: string;        // Sampling method
  clipSkip?: number;         // CLIP layers to skip
  dimensions: {              // Output size
    width: number;
    height: number;
  };
  negativePrompt?: string;   // What to avoid
  loras?: LoRAConfig[];      // Style enhancements
}
```

### Advanced Features
- **TEA Cache**: Faster generation with quality preservation
- **Deep Cache**: Memory optimization for complex prompts
- **Refiner Models**: Post-generation enhancement
- **PuLID**: Consistent character generation

---

## 🎮 Trading Card System

### Rarity Calculation
Images are automatically assigned rarity based on:
- **Prompt complexity and creativity**
- **Model sophistication**
- **Generation parameters**
- **Aesthetic quality indicators**

### Rarity Tiers
| Tier | Stars | Letter | Probability |
|------|-------|--------|-------------|
| **Common** | ⭐ | C | 60% |
| **Uncommon** | ⭐⭐ | U | 25% |
| **Rare** | ⭐⭐⭐ | R | 10% |
| **Epic** | ⭐⭐⭐⭐ | E | 3% |
| **Legendary** | ⭐⭐⭐⭐⭐ | L | 1.5% |
| **Mythic** | ⭐⭐⭐⭐⭐⭐ | M | 0.5% |

### Card Features
- **Holographic effects** for rare cards
- **Generation metadata** preservation
- **Rarity score** calculation
- **Collection tracking**

---

## 🔧 API Reference

### Authentication
```typescript
// Get user profile
GET /api/auth/profile

// Login/logout handled by Auth0
```

### Image Generation
```typescript
// Generate new image
POST /api/generate
{
  prompt: string;
  model: string;
  width: number;
  height: number;
  steps?: number;
  cfgScale?: number;
  // ... other parameters
}

// Get generation history
GET /api/images?limit=20&userId=1
```

### Credits
```typescript
// Get credit balance
GET /api/credit-balance/:userId

// Get credit packages
GET /api/credit-packages

// Create payment intent
POST /api/create-payment-intent
{
  amount: number;
  packageId: string;
}
```

### Models
```typescript
// Get available models
GET /api/models?category=anime&sortBy=newest

// Get model details
GET /api/models/:id

// Bookmark model
POST /api/bookmarks
{
  userId: number;
  modelId: number;
}
```

---

## 🔐 Security

### Data Protection
- **Encrypted storage** for sensitive data
- **Secure session management** with Auth0
- **PCI compliance** through Stripe
- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries

### Privacy Features
- **Optional image privacy** settings
- **Secure image URLs** with expiration
- **GDPR compliance** ready
- **User data export** capabilities

---

## 🚢 Deployment

### Environment Setup
1. **Database**: Set up Neon PostgreSQL or similar
2. **Authentication**: Configure Auth0 tenant
3. **Payments**: Set up Stripe webhooks
4. **AI Service**: Configure Runware API access

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
AUTH0_BASE_URL=https://your-domain.com
# ... other production configurations
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the coding standards**:
   - Use TypeScript strictly
   - Follow Clean Architecture principles
   - Write comprehensive tests
   - Update documentation
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Auto-formatting on save
- **Testing**: Unit tests for business logic
- **Documentation**: Update README for new features

---

## 📈 Performance

### Optimization Features
- **Image lazy loading** for galleries
- **Virtual scrolling** for large lists
- **Optimistic updates** for UI responsiveness
- **Caching strategies** with TanStack Query
- **Database indexing** for fast queries
- **CDN integration** ready

### Monitoring
- **Error tracking** integration ready
- **Performance metrics** collection
- **Database query optimization**
- **Real-time user analytics**

---

## 🆘 Troubleshooting

### Common Issues

**🔴 Generation fails with "Insufficient credits"**
- Check credit balance at `/dreamcredits`
- Purchase additional credits if needed
- Verify payment completion

**🔴 Authentication errors**
- Verify Auth0 configuration
- Check environment variables
- Clear browser cookies/localStorage

**🔴 Database connection issues**
- Verify DATABASE_URL format
- Check PostgreSQL server status
- Run `npm run db:push` to sync schema

**🔴 Payment processing fails**
- Verify Stripe keys in environment
- Check webhook configuration
- Test with Stripe test cards

### Debug Mode
```bash
# Enable detailed logging
DEBUG=express:* npm run dev

# Database query logging
DEBUG=drizzle:query npm run dev
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Runware** for AI model infrastructure
- **Shadcn/ui** for beautiful component library
- **Drizzle Team** for excellent ORM experience
- **Stripe** for seamless payment processing
- **Auth0** for robust authentication
- **Vercel** for deployment platform inspiration

---

## 📞 Support
- **Discord**: [Join our community](https://discord.gg/AFCvg2JV2W)
- **GitHub Issues**: [Report bugs](https://github.com/your-org/dreambeesart/issues)

---

<div align="center">
  <p><strong>Made with ❤️ by the DreamBeesArt Team</strong></p>
  <p><em>Transforming imagination into reality, one pixel at a time</em></p>
</div>
