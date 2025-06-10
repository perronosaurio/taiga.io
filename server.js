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

// First: Save raw body for signature verification
app.use('/webhook', express.raw({
  type: 'application/json',
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

// Then: Parse JSON for body processing
app.use('/webhook', bodyParser.json())

app.get('/webhook', (request, response) => response.sendStatus(200))

app.post('/webhook', async (request, response) => {
  const signature = request.headers['x-taiga-webhook-signature']
  const rawBody = request.rawBody
  const parsedBody = JSON.parse(rawBody.toString('utf8'))
  
  if (!verifySignature(process.env.KEY, rawBody, signature)) {
    console.error('Invalid signature:', {
      computed: crypto.createHmac('sha1', process.env.KEY).update(rawBody).digest('hex'),
      received: signature
    })
    return response.status(401).send('Invalid signature')
  }

  if (parsedBody) {
    try {
      let embed

      if (parsedBody.type === 'test') {
        embed = {
          description: 'just a test',
          timestamp: parsedBody.date,
          footer: { 
            icon_url: parsedBody.by.photo, 
            text: parsedBody.by.full_name 
          },
          color: COLORS.TEST
        }
      } else if (parsedBody.type === 'milestone') {
        embed = handleMilestoneEvent(parsedBody)
      } else if (parsedBody.type === 'userstory') {
        embed = handleUserStoryEvent(parsedBody)
      } else if (parsedBody.type === 'task') {
        embed = handleTaskEvent(parsedBody)
      } else if (parsedBody.type === 'issue') {
        embed = handleIssueEvent(parsedBody)
      } else if (parsedBody.type === 'wikipage') {
        embed = handleWikiPageEvent(parsedBody)
      }

      if (embed) {
        const webhookClient = new WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN)

        await webhookClient.send({
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
