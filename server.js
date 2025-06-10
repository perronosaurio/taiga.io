const express = require('express')
const bodyParser = require('body-parser')
const { WebhookClient } = require('discord.js')
const { verifySignature } = require('./src/utils/helpers')
const { COLORS, EMBED } = require('./src/config/constants')
const handleWikiPageEvent = require('./src/handlers/wikiPageHandler')
const handleMilestoneEvent = require('./src/handlers/milestoneHandler')
const handleUserStoryEvent = require('./src/handlers/userStoryHandler')
const handleTaskEvent = require('./src/handlers/taskHandler')
const handleIssueEvent = require('./src/handlers/issueHandler')

const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())

app.get('/webhook', (request, response) => response.sendStatus(200))

app.post('/webhook', async (request, response) => {
  const signature = request.headers['x-taiga-webhook-signature']
  const rawBody = JSON.stringify(request.body)
  
  if (!verifySignature(process.env.WEBHOOK_SECRET, rawBody, signature)) {
    return response.status(401).send('Invalid signature')
  }

  if (request.body) {
    const discordWebhook = new WebhookClient({ url: process.env.WEBHOOK_URL })
    const body = request.body

    try {
      let embed

      if (body.type === 'test') {
        embed = {
          description: 'just a test',
          timestamp: body.date,
          footer: { 
            icon_url: body.by.photo, 
            text: body.by.full_name 
          },
          color: COLORS.TEST
        }
      } else if (body.type === 'milestone') {
        embed = handleMilestoneEvent(body)
      } else if (body.type === 'userstory') {
        embed = handleUserStoryEvent(body)
      } else if (body.type === 'task') {
        embed = handleTaskEvent(body)
      } else if (body.type === 'issue') {
        embed = handleIssueEvent(body)
      } else if (body.type === 'wikipage') {
        embed = handleWikiPageEvent(body)
      }

      if (embed) {
        await discordWebhook.send({
          username: EMBED.AUTHOR.NAME,
          avatarURL: EMBED.AUTHOR.ICON_URL,
          embeds: [embed]
        })
        response.status(200).send('Event received!')
      } else {
        response.status(404).send('Unsupported event type!')
      }
    } catch (error) {
      console.error('Error processing webhook:', error)
      response.status(500).send('Error processing webhook')
    }
  } else {
    response.status(404).send('Something went wrong!')
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Webhook listening on port ${PORT}!`))
