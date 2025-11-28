# Monad Dev Card

A beautiful developer card application built with Next.js 16, integrated with Privy authentication and Web3Insight API.

## Features

- 🔐 **Privy Authentication** - Secure login with GitHub, Google, email, and wallet
- 👤 **User Profiles** - Customizable developer profiles with avatars and bios  
- 🎨 **Beautiful Cards** - Flippable cards with stunning design
- 📱 **Responsive** - Works perfectly on desktop and mobile
- ⚡ **Fast** - Built with Next.js 16 and optimized for performance

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- Privy account and app ID

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web3insight-dev-card
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env.local file with the following variables:
DATA_API_URL=https://api.web3insight.ai
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your_umami_website_id
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
web3insight-dev-card/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── monad/             # Main application pages
│   └── globals.css        # Global styles
├── src/                   # Source code
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── providers/         # Context providers
│   ├── services/          # API services
│   └── types/             # TypeScript types
└── public/                # Static assets
```

## Authentication Flow

1. User visits `/monad` and clicks "Connect"
2. Privy modal opens for authentication (GitHub, Google, email, or wallet)
3. Upon successful authentication, user is redirected to `/monad/create`  
4. User can customize their profile and create a dev card
5. Card is displayed at `/monad/card/{user_id}`

## Key Components

### PrivyProvider
Wraps the app with Privy authentication context.

### PrivyAuthSync  
Automatically syncs Privy authentication with the backend API.

### useAuth Hook
Provides authentication state and user data throughout the app.

### ProfileUpdateDialog
Allows users to update their profile information by clicking their avatar.

## API Integration

The app integrates with the Web3Insight API for:
- User authentication (`/v1/auth/privy/token/auth`)
- User profile management (`/v1/auth/user`)
- Public user data (`/v1/auth/user/public/{id}`)

## Deployment

1. Build the application:
```bash
pnpm build
```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

3. Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see the LICENSE file for details.
