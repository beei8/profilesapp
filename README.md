# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 🚀 Deployment Instructions

### Environment Setup

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Generate secure secrets**:
   ```bash
   # JWT Secret (256-bit)
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" >> .env
   
   # Setup Key (128-bit) - for initial admin creation
   node -e "console.log('SETUP_KEY=' + require('crypto').randomBytes(16).toString('hex'))" >> .env
   ```

3. **Set production environment**:
   ```bash
   echo "NODE_ENV=production" >> .env
   ```

### Initial Admin Setup

**After starting the server**, create your first admin user:

#### Option 1: Automated Setup Script (Recommended for CI/CD)
```bash
npm run setup-admin <username> <password> <setup-key>
# Example: npm run setup-admin admin MySecurePass123! abc123def456
```

#### Option 2: Using Setup Endpoint
```bash
curl -X POST http://your-server:3001/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword123!",
    "setupKey": "your-setup-key-from-env"
  }'
```

#### Option 3: Interactive Admin Creation
```bash
npm run create-admin
```

### Running in Production

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm run server
   ```

### Security Notes

- JWT tokens are generated using cryptographically secure secrets
- Admin user is NOT created automatically in production
- Setup endpoint only works when no users exist
- Setup key must match the `SETUP_KEY` environment variable
- Use `npm run create-admin` for additional admin users after initial setup
- Database file (`users.db`) is gitignored for security
