# Taiga Webhook Server

A simple webhook server for Taiga that forwards events to Discord.

## Features

- Forwards Taiga events to Discord webhooks
- Supports milestone, user story, task, issue, and wiki page events
- Verifies webhook signatures for security
- Includes detailed event information in Discord messages

## Supported Events

### Milestones
- Create
- Delete
- Change

### User Stories
- Create
- Delete
- Change

### Tasks
- Create
- Delete
- Change

### Issues
- Create
- Delete
- Change

### Wiki Pages
- Create
- Delete
- Change

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   export WEBHOOK_SECRET="your-taiga-webhook-secret"
   export WEBHOOK_URL="your-discord-webhook-url"
   export PORT=3000
   ```
4. Start the server:
   ```bash
   node server.js
   ```

## Configuration

The server requires the following environment variables:

- `WEBHOOK_SECRET`: The secret key used to verify Taiga webhook signatures
- `WEBHOOK_URL`: The Discord webhook URL to forward events to
- `PORT`: The port number to run the server on (default: 3000)

## Event Details

### Milestone Events
- Create: Shows milestone name, project, owner, and estimated dates
- Delete: Shows milestone name, project, and owner
- Change: Shows changes to name, estimated dates, and status

### User Story Events
- Create: Shows story subject, project, owner, and points
- Delete: Shows story subject, project, and owner
- Change: Shows changes to subject, points, and status

### Task Events
- Create: Shows task subject, project, owner, and status
- Delete: Shows task subject, project, and owner
- Change: Shows changes to subject, status, and assignee

### Issue Events
- Create: Shows issue subject, project, owner, priority, and severity
- Delete: Shows issue subject, project, and owner
- Change: Shows changes to subject, status, priority, and severity

### Wiki Page Events
- Create: Shows page slug, project, content, owner, and last modifier
- Delete: Shows page slug, project, content, and owner
- Change: Shows changes to content with diff information

## Security

The server verifies webhook signatures using HMAC-SHA1 to ensure that events are coming from your Taiga instance.

## License

MIT
