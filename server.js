const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const { WebhookClient } = require('discord.js')

const verifySignature = (key, data, signature) => {
  const hmac = crypto.createHmac('sha1', key)
  hmac.update(data)
  return hmac.digest('hex') === signature
}

express()
  .use(express.static('public'))
  .use(bodyParser.json())
  .get('/webhook', (request, response) => response.sendStatus(200))
  .post('/webhook', async (request, response) => {
    const signature = request.headers['x-taiga-webhook-signature']
    const rawBody = JSON.stringify(request.body)
    
    if (!verifySignature(process.env.WEBHOOK_SECRET, rawBody, signature)) {
      return response.status(401).send('Invalid signature')
    }

    if (request.body) {
      const discordWebhook = new WebhookClient({ url: process.env.WEBHOOK_URL })
      const body = request.body

      if (body.type === 'test') {
        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'description': 'just a test',
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.full_name },
            'color': 0x5000
          }]
        })
      } else if (body.type === 'milestone') {
        const milestone = body.data
        let title, description, color

        switch (body.action) {
          case 'create':
            title = `Created Epic "${milestone.name}" in ${milestone.project.name}`
            description = [
              `**Name**: ${milestone.name}`,
              `**Start Date**: ${milestone.estimated_start}`,
              `**End Date**: ${milestone.estimated_finish}`,
              `**Owner**: ${milestone.owner.full_name}`,
              `**Status**: ${milestone.closed ? 'Closed' : 'Open'}`
            ].join('\n')
            color = 0x00ff00 // Green
            break

          case 'delete':
            title = `Deleted Epic "${milestone.name}" from ${milestone.project.name}`
            description = [
              `**Name**: ${milestone.name}`,
              `**Start Date**: ${milestone.estimated_start}`,
              `**End Date**: ${milestone.estimated_finish}`,
              `**Owner**: ${milestone.owner.full_name}`
            ].join('\n')
            color = 0xff0000 // Red
            break

          case 'change':
            title = `Updated Epic "${milestone.name}" in ${milestone.project.name}`
            description = []
            
            if (body.change.diff.estimated_start) {
              description.push(`**Start Date**: ${body.change.diff.estimated_start.from} → ${body.change.diff.estimated_start.to}`)
            }
            if (body.change.diff.estimated_finish) {
              description.push(`**End Date**: ${body.change.diff.estimated_finish.from} → ${body.change.diff.estimated_finish.to}`)
            }
            if (body.change.diff.name) {
              description.push(`**Name**: ${body.change.diff.name.from} → ${body.change.diff.name.to}`)
            }
            if (body.change.diff.closed) {
              description.push(`**Status**: ${body.change.diff.closed.from ? 'Closed' : 'Open'} → ${body.change.diff.closed.to ? 'Closed' : 'Open'}`)
            }
            
            color = 0xffff00 // Yellow
            break
        }

        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: title,
              url: milestone.permalink
            },
            'description': description,
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.full_name },
            'color': color
          }]
        })
      } else if (body.type === 'userstory') {
        const userStory = body.data
        let title, description, color

        switch (body.action) {
          case 'create':
            title = `Created User Story #${userStory.ref} in ${userStory.project.name}`
            description = [
              `**Subject**: ${userStory.subject}`,
              `**Description**: ${userStory.description || 'No description'}`,
              `**Status**: ${userStory.status.name}`,
              `**Points**: ${userStory.points.map(p => `${p.role}: ${p.value}`).join(', ') || 'No points'}`,
              `**Tags**: ${userStory.tags.join(', ') || 'No tags'}`,
              userStory.is_blocked ? `**Blocked**: Yes\n**Blocked Note**: ${userStory.blocked_note}` : '',
              `**Owner**: ${userStory.owner.full_name}`,
              userStory.assigned_to ? `**Assigned to**: ${userStory.assigned_to.full_name}` : '**Assigned to**: Unassigned'
            ].filter(Boolean).join('\n')
            color = 0x00ff00 // Green
            break

          case 'delete':
            title = `Deleted User Story #${userStory.ref} from ${userStory.project.name}`
            description = [
              `**Subject**: ${userStory.subject}`,
              `**Description**: ${userStory.description || 'No description'}`,
              `**Status**: ${userStory.status.name}`,
              `**Points**: ${userStory.points.map(p => `${p.role}: ${p.value}`).join(', ') || 'No points'}`,
              `**Tags**: ${userStory.tags.join(', ') || 'No tags'}`,
              userStory.milestone ? `**Milestone**: ${userStory.milestone.name}` : '**Milestone**: None'
            ].filter(Boolean).join('\n')
            color = 0xff0000 // Red
            break

          case 'change':
            title = `Updated User Story #${userStory.ref} in ${userStory.project.name}`
            description = []
            
            if (body.change.diff.milestone) {
              description.push(`**Milestone**: ${body.change.diff.milestone.from || 'None'} → ${body.change.diff.milestone.to || 'None'}`)
            }
            if (body.change.diff.subject) {
              description.push(`**Subject**: ${body.change.diff.subject.from} → ${body.change.diff.subject.to}`)
            }
            if (body.change.diff.description) {
              description.push(`**Description**: ${body.change.diff.description.from || 'None'} → ${body.change.diff.description.to || 'None'}`)
            }
            if (body.change.diff.status) {
              description.push(`**Status**: ${body.change.diff.status.from} → ${body.change.diff.status.to}`)
            }
            if (body.change.diff.assigned_to) {
              description.push(`**Assigned to**: ${body.change.diff.assigned_to.from || 'Unassigned'} → ${body.change.diff.assigned_to.to || 'Unassigned'}`)
            }
            if (body.change.diff.is_blocked) {
              description.push(`**Blocked**: ${body.change.diff.is_blocked.from ? 'Yes' : 'No'} → ${body.change.diff.is_blocked.to ? 'Yes' : 'No'}`)
              if (body.change.diff.blocked_note) {
                description.push(`**Blocked Note**: ${body.change.diff.blocked_note.from || 'None'} → ${body.change.diff.blocked_note.to || 'None'}`)
              }
            }
            
            color = 0xffff00 // Yellow
            break
        }

        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: title,
              url: userStory.permalink
            },
            'description': description,
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.full_name },
            'color': color
          }]
        })
      } else if (body.type === 'task') {
        const task = body.data
        let title, description, color

        switch (body.action) {
          case 'create':
            title = `Created Task #${task.ref} in ${task.project.name}`
            description = [
              `**Subject**: ${task.subject}`,
              `**Description**: ${task.description || 'No description'}`,
              `**Status**: ${task.status.name}`,
              `**Tags**: ${task.tags.join(', ') || 'No tags'}`,
              task.is_blocked ? `**Blocked**: Yes\n**Blocked Note**: ${task.blocked_note}` : '',
              `**Owner**: ${task.owner.full_name}`,
              task.assigned_to ? `**Assigned to**: ${task.assigned_to.full_name}` : '**Assigned to**: Unassigned',
              task.user_story ? `**User Story**: [${task.user_story.subject}](${task.user_story.permalink})` : '',
              task.milestone ? `**Milestone**: ${task.milestone.name}` : '',
              task.is_iocaine ? '**Iocaine**: Yes' : ''
            ].filter(Boolean).join('\n')
            color = 0x00ff00 // Green
            break

          case 'delete':
            title = `Deleted Task #${task.ref} from ${task.project.name}`
            description = [
              `**Subject**: ${task.subject}`,
              `**Description**: ${task.description || 'No description'}`,
              `**Status**: ${task.status.name}`,
              `**Tags**: ${task.tags.join(', ') || 'No tags'}`,
              task.user_story ? `**User Story**: [${task.user_story.subject}](${task.user_story.permalink})` : '',
              task.milestone ? `**Milestone**: ${task.milestone.name}` : ''
            ].filter(Boolean).join('\n')
            color = 0xff0000 // Red
            break

          case 'change':
            title = `Updated Task #${task.ref} in ${task.project.name}`
            description = []
            
            if (body.change.diff.assigned_to) {
              description.push(`**Assigned to**: ${body.change.diff.assigned_to.from || 'Unassigned'} → ${body.change.diff.assigned_to.to || 'Unassigned'}`)
            }
            if (body.change.diff.subject) {
              description.push(`**Subject**: ${body.change.diff.subject.from} → ${body.change.diff.subject.to}`)
            }
            if (body.change.diff.description) {
              description.push(`**Description**: ${body.change.diff.description.from || 'None'} → ${body.change.diff.description.to || 'None'}`)
            }
            if (body.change.diff.status) {
              description.push(`**Status**: ${body.change.diff.status.from} → ${body.change.diff.status.to}`)
            }
            if (body.change.diff.is_blocked) {
              description.push(`**Blocked**: ${body.change.diff.is_blocked.from ? 'Yes' : 'No'} → ${body.change.diff.is_blocked.to ? 'Yes' : 'No'}`)
              if (body.change.diff.blocked_note) {
                description.push(`**Blocked Note**: ${body.change.diff.blocked_note.from || 'None'} → ${body.change.diff.blocked_note.to || 'None'}`)
              }
            }
            if (body.change.diff.milestone) {
              description.push(`**Milestone**: ${body.change.diff.milestone.from || 'None'} → ${body.change.diff.milestone.to || 'None'}`)
            }
            if (body.change.diff.user_story) {
              description.push(`**User Story**: ${body.change.diff.user_story.from || 'None'} → ${body.change.diff.user_story.to || 'None'}`)
            }
            
            color = 0xffff00 // Yellow
            break
        }

        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: title,
              url: task.permalink
            },
            'description': description,
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.full_name },
            'color': color
          }]
        })
      } else if (body.type === 'issue') {
        const issue = body.data
        let title, description, color

        switch (body.action) {
          case 'create':
            title = `Created Issue #${issue.ref} in ${issue.project.name}`
            description = [
              `**Subject**: ${issue.subject}`,
              `**Description**: ${issue.description || 'No description'}`,
              `**Type**: ${issue.type.name}`,
              `**Status**: ${issue.status.name}`,
              `**Priority**: ${issue.priority.name}`,
              `**Severity**: ${issue.severity.name}`,
              `**Tags**: ${issue.tags.join(', ') || 'No tags'}`,
              issue.is_blocked ? `**Blocked**: Yes\n**Blocked Note**: ${issue.blocked_note}` : '',
              `**Owner**: ${issue.owner.full_name}`,
              issue.assigned_to ? `**Assigned to**: ${issue.assigned_to.full_name}` : '**Assigned to**: Unassigned',
              issue.milestone ? `**Milestone**: ${issue.milestone.name}` : '',
              issue.external_reference ? `**External Reference**: ${issue.external_reference}` : ''
            ].filter(Boolean).join('\n')
            color = 0x00ff00 // Green
            break

          case 'delete':
            title = `Deleted Issue #${issue.ref} from ${issue.project.name}`
            description = [
              `**Subject**: ${issue.subject}`,
              `**Description**: ${issue.description || 'No description'}`,
              `**Type**: ${issue.type.name}`,
              `**Status**: ${issue.status.name}`,
              `**Priority**: ${issue.priority.name}`,
              `**Severity**: ${issue.severity.name}`,
              `**Tags**: ${issue.tags.join(', ') || 'No tags'}`,
              issue.milestone ? `**Milestone**: ${issue.milestone.name}` : '',
              issue.external_reference ? `**External Reference**: ${issue.external_reference}` : ''
            ].filter(Boolean).join('\n')
            color = 0xff0000 // Red
            break

          case 'change':
            title = `Updated Issue #${issue.ref} in ${issue.project.name}`
            description = []
            
            if (body.change.diff.status) {
              description.push(`**Status**: ${body.change.diff.status.from} → ${body.change.diff.status.to}`)
            }
            if (body.change.diff.subject) {
              description.push(`**Subject**: ${body.change.diff.subject.from} → ${body.change.diff.subject.to}`)
            }
            if (body.change.diff.description) {
              description.push(`**Description**: ${body.change.diff.description.from || 'None'} → ${body.change.diff.description.to || 'None'}`)
            }
            if (body.change.diff.type) {
              description.push(`**Type**: ${body.change.diff.type.from} → ${body.change.diff.type.to}`)
            }
            if (body.change.diff.priority) {
              description.push(`**Priority**: ${body.change.diff.priority.from} → ${body.change.diff.priority.to}`)
            }
            if (body.change.diff.severity) {
              description.push(`**Severity**: ${body.change.diff.severity.from} → ${body.change.diff.severity.to}`)
            }
            if (body.change.diff.assigned_to) {
              description.push(`**Assigned to**: ${body.change.diff.assigned_to.from || 'Unassigned'} → ${body.change.diff.assigned_to.to || 'Unassigned'}`)
            }
            if (body.change.diff.is_blocked) {
              description.push(`**Blocked**: ${body.change.diff.is_blocked.from ? 'Yes' : 'No'} → ${body.change.diff.is_blocked.to ? 'Yes' : 'No'}`)
              if (body.change.diff.blocked_note) {
                description.push(`**Blocked Note**: ${body.change.diff.blocked_note.from || 'None'} → ${body.change.diff.blocked_note.to || 'None'}`)
              }
            }
            if (body.change.diff.milestone) {
              description.push(`**Milestone**: ${body.change.diff.milestone.from || 'None'} → ${body.change.diff.milestone.to || 'None'}`)
            }
            
            color = 0xffff00 // Yellow
            break
        }

        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: title,
              url: issue.permalink
            },
            'description': description,
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.full_name },
            'color': color
          }]
        })
      }
      response.status(200).send('Event received!')
    } else {
      response.status(404).send('Something went wrong!')
    }
  })
  .listen(process.env.PORT, () => console.log(`Webhook listening on port ${process.env.PORT}!`))
