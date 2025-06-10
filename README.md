<div align="center">
  <img src="https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png"><br>
  <b>A simple Webhook built on Express for connect <a href="https://taiga.io/">Taiga.io</a> with <a href="https://discordapp.com/">Discord</a><b>
  <br><br>

  `npm install`, `npm start`

  ## Setup
  1. Create a `.env` file in the root directory
  2. Add your Discord webhook URL and Taiga webhook secret:
     ```
     WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-id/your-webhook-token
     WEBHOOK_SECRET=your-taiga-webhook-secret
     ```
  3. Start the server with `npm start`

  ## Supported Events
  - Test events
  - Milestone (EPIC) events:
    - Create
    - Delete
    - Update (including changes to name, dates, and status)
  - User Story events:
    - Create (with points, tags, and blocking status)
    - Delete
    - Update (including changes to milestone, subject, description, status, assignment, and blocking status)
  - Task events (existing functionality)

  <a href="http://taigaio.github.io/taiga-doc/dist/webhooks.html">Read the taiga.io documentation,</a>
  <a href="http://discord.gg/7vx3S4H">Get support in our discord server</a>
</div>
