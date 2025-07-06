# 🌟 Equify - AI-Powered Relationship Management

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Latest-green" alt="Supabase" />
  <img src="https://img.shields.io/badge/DeepSeek-AI-purple" alt="DeepSeek AI" />
  <img src="https://img.shields.io/badge/Mobile-First-orange" alt="Mobile First" />
</div>

## ✨ Overview

Equify is a sophisticated, mobile-first relationship management application that helps users build and maintain meaningful connections through AI-powered insights. Track favors, understand relationship dynamics, and receive personalized advice to strengthen your social bonds.

## 🚀 Key Features

### 📱 Mobile-First Experience

- **Responsive Design**: Optimized for all screen sizes with mobile-priority
- **Touch Gestures**: Swipe actions for quick favor logging and contact
- **Native-like UX**: Smooth animations and haptic feedback simulation
- **Safe Area Support**: Proper handling for notched and dynamic island devices

### 🤖 AI-Powered Insights

- **Conversational AI**: Chat with your personal relationship advisor
- **Smart Recommendations**: Get personalized suggestions based on your patterns
- **Relationship Analysis**: Understand your interaction dynamics
- **Personality Assessment**: Discover your unique relationship style

### 💫 Relationship Management

- **Favor Tracking**: Log and balance give-and-take interactions
- **Relationship Types**: Organize family, friends, colleagues, and more
- **Importance Levels**: Prioritize your most meaningful connections
- **Balance Monitoring**: Visualize reciprocity in your relationships

### 📊 Advanced Analytics

- **Visual Insights**: Beautiful charts showing relationship patterns
- **Trend Analysis**: Track how your relationships evolve over time
- **Goal Setting**: Set and monitor relationship improvement targets
- **Progress Tracking**: See your growth in building connections

### 🎯 Smart Features

- **Onboarding Flow**: Guided setup with personality assessment
- **Real-time Updates**: Live data synchronization across devices
- **Smart Notifications**: Contextual reminders and insights
- **Offline Support**: Core functionality works without internet

## 🏗️ Technical Architecture

### Frontend Stack

```
React 18.3.1 + TypeScript 5.5.3
├── 🎨 UI Framework: Tailwind CSS + Shadcn/UI
├── ⚡ Build Tool: Vite 5.4.1
├── 🔄 State Management: React Query + Context
├── 🎭 Animations: Framer Motion
├── 📱 Routing: React Router 6.26.2
└── 🎯 Mobile-First: PWA Ready
```

### Backend Stack

```
Supabase (Backend-as-a-Service)
├── 🗄️ Database: PostgreSQL with RLS
├── 🔐 Authentication: JWT-based auth
├── ⚡ Edge Functions: Serverless API
├── 📡 Real-time: WebSocket subscriptions
└── 🤖 AI Integration: DeepSeek API
```

### Database Schema

```sql
Core Tables:
├── profiles (user data + personality)
├── relationships (connections + metadata)
├── favors (interaction tracking)
├── ai_insights (generated insights)
├── notifications (smart alerts)
└── activity_feed (timeline)
```

## ���️ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- DeepSeek AI API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd equify

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your DeepSeek API key to .env.local
```

### Configuration

1. **DeepSeek AI Setup**:
   - Get API key from [DeepSeek Platform](https://platform.deepseek.com/)
   - Add to Supabase Edge Functions environment variables

2. **Supabase Configuration**:
   - Database is pre-configured
   - Edge Functions handle AI integration
   - RLS policies ensure data security

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Feature Highlights

### 1. **Smart Dashboard**

- Real-time relationship statistics
- Quick action buttons
- AI-generated insights
- Activity timeline
- Goal progress tracking

### 2. **Relationship Manager**

- Gesture-based interactions
- Advanced filtering and search
- Relationship type categorization
- Balance visualization
- Contact integration

### 3. **AI Chat Assistant**

- Contextual conversation memory
- Personality-aware responses
- Relationship pattern analysis
- Actionable advice generation
- Conversation history

### 4. **Analytics Engine**

- Relationship type distribution
- Monthly activity trends
- Balance analysis over time
- Personality insights
- Goal achievement tracking

### 5. **Mobile Optimizations**

- Touch-friendly interface
- Swipe gestures for actions
- Bottom navigation
- Safe area handling
- Haptic feedback simulation

## 🧠 AI Capabilities

### DeepSeek Integration

- **Conversational AI**: Natural relationship advice
- **Pattern Recognition**: Identify relationship trends
- **Personalized Insights**: Based on user personality
- **Smart Recommendations**: Actionable relationship tips
- **Context Awareness**: Considers full relationship history

### AI Features

```typescript
✨ Chat Assistant: Personal relationship advisor
🎯 Smart Recommendations: Automated suggestions
📈 Pattern Analysis: Relationship trend detection
🧭 Personality Assessment: Relationship style analysis
⚡ Real-time Insights: Live relationship scoring
```

## 📱 Mobile Experience

### Touch Interactions

- **Swipe Right**: Quick favor logging
- **Swipe Left**: Instant contact/call
- **Long Press**: Context menus
- **Pull to Refresh**: Data updates
- **Haptic Feedback**: Tactile responses

### Responsive Design

- **Mobile First**: 320px+ support
- **Tablet Optimized**: Enhanced layouts
- **Desktop Ready**: Full feature parity
- **Dynamic Scaling**: Adaptive UI elements

## 🔐 Security & Privacy

### Data Protection

- **Row Level Security**: Supabase RLS policies
- **JWT Authentication**: Secure user sessions
- **API Key Management**: Environment-based secrets
- **Data Encryption**: In-transit and at-rest

### Privacy Features

- **Data Control**: User-controlled sharing
- **Local Processing**: Sensitive data stays local
- **Anonymization**: Optional analytics sharing
- **Export Options**: User data portability

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connect to Vercel
vercel

# Configure environment variables
vercel env add DEEPSEEK_API_KEY
```

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist/
```

### Environment Variables

```env
DEEPSEEK_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Conventional Commits**: Semantic versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/UI**: Beautiful, accessible components
- **Supabase**: Powerful backend infrastructure
- **DeepSeek**: Advanced AI capabilities
- **Framer Motion**: Smooth animations
- **React Query**: Excellent data management

---

<div align="center">
  <p>Built with ❤️ for better relationships</p>
  <p>© 2024 Equify. All rights reserved.</p>
</div>
