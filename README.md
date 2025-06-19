# Taiga Webhook Manager

A modern Next.js application for managing Discord webhooks for your Taiga projects. This application allows project owners to configure multiple Discord channels for different types of Taiga events.

## Features

- 🔐 **Secure Authentication**: Login with your Taiga credentials
- 👑 **Owner-Only Access**: Only project owners can manage webhooks
- 📊 **Multiple Webhooks**: Configure multiple Discord channels per project
- 🎯 **Entity Filtering**: Choose which event types to send to each webhook
- 🧪 **Test Functionality**: Test webhooks directly from the UI
- 📱 **Modern UI**: Beautiful Material UI design
- 🔄 **Real-time Updates**: Live project fetching from Taiga API

## Supported Events

- 📅 **Milestones/Epics**: Create, update, delete
- 📝 **User Stories**: Create, update, delete
- 📋 **Tasks**: Create, update, delete
- 🐛 **Issues**: Create, update, delete
- 📚 **Wiki Pages**: Create, update, delete

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Taiga instance with API access
- Discord webhook URLs

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taiga-webhook-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Base URL for the application (used for webhook URLs)
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   
   # For production, change to your actual domain
   # NEXT_PUBLIC_BASE_URL=https://your-domain.com

   # Default Taiga instance URL for login form
   NEXT_PUBLIC_TAIGA_DEFAULT_URL=https://api.taiga.io

   # Secret key for verifying incoming Taiga webhooks
   TAIGA_WEBHOOK_SECRET=your-very-secret-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Login
- Enter your Taiga URL, username, and password
- Only project owners will be able to access the system

### 2. Select Project
- Choose from your owned projects in the dropdown

### 3. Manage Webhooks
- **Add Webhook**: Click "Add Webhook" and enter Discord webhook URL
- **Configure Events**: Select which event types to send to each webhook
- **Test Webhook**: Use the test button to verify webhook functionality
- **Edit/Delete**: Modify or remove webhooks as needed

### 4. Configure Taiga Webhook
In your Taiga project settings, configure a webhook to point to:
```
${NEXT_PUBLIC_BASE_URL}/api/webhook
```

**Important:**
- Set the webhook secret/key in Taiga to exactly match your `TAIGA_WEBHOOK_SECRET` in `.env.local`.
- This ensures only authorized requests from your Taiga instance are accepted.

For example:
- Development: `http://localhost:3000/api/webhook`
- Production: `https://your-domain.com/api/webhook`

## API Endpoints

- `POST /api/auth/login` - Authenticate with Taiga
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `GET /api/webhooks/[projectId]` - Get project webhooks
- `POST /api/webhooks/[projectId]` - Add new webhook
- `PUT /api/webhooks/[projectId]/[webhookId]` - Update webhook
- `DELETE /api/webhooks/[projectId]/[webhookId]` - Delete webhook
- `POST /api/webhooks/[projectId]/[webhookId]/test` - Test webhook
- `POST /api/webhook` - Receive Taiga webhooks

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security

- **Session Management**: Secure HTTP-only cookies with 24-hour expiry
- **Owner Verification**: Only project owners can access webhook management
- **Signature Verification**: Taiga webhook signatures are verified
- **Input Validation**: All inputs are validated and sanitized

## Architecture

- **Frontend**: Next.js 14 with App Router, Material UI
- **Backend**: Next.js API Routes
- **Authentication**: Custom session-based auth with Taiga API
- **Storage**: JSON file-based configuration (can be extended to database)
- **Logging**: Console and file-based logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
