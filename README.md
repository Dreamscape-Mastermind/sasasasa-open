# Sasasasa Open

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Authentication System](#authentication-system)
- [Development](#development)
- [Contributing](#contributing)
- [Learn More](#learn-more)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Features

- Modern Next.js 14 App Router
- TypeScript support
- Authentication with Email OTP and Web3
- Role-based access control
- Optimized font loading with `next/font`
- Built-in analytics and logging
- Web3 wallet integration

## Authentication System

The application uses a comprehensive authentication system built with React Context API. Here are the key features:

### Authentication Methods

- **Email Authentication**: Uses OTP (One-Time Password) verification
- **Web3 Authentication**: Supports wallet-based authentication using SIWE (Sign-In with Ethereum)
- **Role-Based Access Control**: Implements granular access control with different user roles

### Key Features

1. **Multiple Auth Methods**
   - Email login with OTP verification
   - Web3 wallet authentication
   - Support for linking multiple wallets to an account

2. **Access Control**
   - Role-based access control (RBAC)
   - Access level management
   - Protected route handling
   - Role verification helpers

3. **Security Features**
   - Token-based authentication
   - Automatic token refresh
   - Secure session management
   - Wallet signature verification

4. **User Management**
   - User profile management
   - Role management
   - Session persistence
   - Automatic session restoration

### Usage Example

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    user,
    isAuthenticated,
    loginWithEmail,
    loginWithWallet,
    logout,
    hasRole 
  } = useAuth();

  // Check if user has specific role
  const isAdmin = hasRole('ADMIN');

  // Handle email login
  const handleEmailLogin = async (email: string) => {
    await loginWithEmail({ identifier: email });
  };

  // Handle wallet login
  const handleWalletLogin = async (address: string) => {
    await loginWithWallet(address);
  };
}
```

### Access Levels

The system supports different access levels:

- PUBLIC: Accessible to all users
- AUTHENTICATED: Requires user authentication
- ADMIN: Restricted to admin users
- EVENT_ORGANIZER: For event organizers
- EVENT_TEAM: For event team members
- CUSTOMER: For regular customers

For more details about the authentication implementation, refer to `src/contexts/AuthContext.tsx`.

## Development

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun
- Git

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/sasasasa-open.git
cd sasasasa-open
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Create a `.env.local` file in the root directory and add necessary environment variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_WEB3_PROVIDER=your_web3_provider
# Add other required environment variables
```

4. Start the development server:

```bash
npm run dev
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a PR

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if you're changing functionality
3. The PR will be merged once you have the sign-off of at least one other developer

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
