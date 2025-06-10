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
      } else if (body.type === 'task' && body.action === 'create') {
        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: `Created subtask #${body.data.ref} on ${body.data.project.name}`,
              url: `${body.data.project.permalink}/task/${body.data.ref}`
            },
            'description': [
              `**Subject**: ${body.data.subject}`,
              `**Instance**: [${body.data.user_story.subject}](https://tree.taiga.io/project/naedian-hythelia/task/${body.data.ref})`,
              `**Description**: ${body.data.description ? body.data.description : 'Nothing'}`,
              `**Assigned to**: ${body.data.assigned_to ? body.data.assigned_to.username : 'Nobody'}`,
              `**Status**: ${body.data.status.name}`
            ].join('\n'),
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.username },
            'color': parseInt(body.data.status.color.replace('#', ''), 16)
          }]
        })
      } else if (body.type === 'userstory' && body.action === 'create') {
        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: `Created task #${body.data.ref} on ${body.data.project.name}`,
              url: `${body.data.project.permalink}/us/${body.data.ref}`
            },
            'description': [
              `**Subject**: ${body.data.subject}`,
              `**Description**: ${body.data.description ? body.data.description : 'Nothing'}`,
              `**Assigned to**: ${body.data.assigned_to ? body.data.assigned_to.username : 'Nobody'}`,
              `**Status**: ${body.data.status.name}`
            ].join('\n'),
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.username },
            'color': parseInt(body.data.status.color.replace('#', ''), 16)
          }]
        })
      } else if (body.type === 'task' && body.action === 'delete') {
        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: `Deleted subtask #${body.data.ref} on ${body.data.project.name}`,
              url: body.data.project.permalink
            },
            'description': [
              `**Subject**: ${body.data.subject}`,
              `**Instance**: [${body.data.user_story.subject}](${body.data.project.permalink}/task/${body.data.ref})`,
              `**Description**: ${body.data.description ? body.data.description : 'Nothing'}`,
              `**Old status**: ${body.data.status.name}`
            ].join('\n'),
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.username },
            'color': parseInt(body.data.status.color.replace('#', ''), 16)
          }]
        })
      } else if (body.type === 'userstory' && body.action === 'delete') {
        await discordWebhook.send({
          username: 'Taiga',
          avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
          embeds: [{
            'author': {
              name: `Deleted task #${body.data.ref} on ${body.data.project.name}`,
              url: body.data.project.permalink
            },
            'description': [
              `**Subject**: ${body.data.subject}`,
              `**Description**: ${body.data.description ? body.data.description : 'Nothing'}`,
              `**Old status**: ${body.data.status.name}`
            ].join('\n'),
            'timestamp': body.date,
            'footer': { icon_url: body.by.photo, text: body.by.username },
            'color': parseInt(body.data.status.color.replace('#', ''), 16)
          }]
        })
      } else if ((body.type === 'task' || body.type === 'userstory') && body.action === 'change') {
        const description = [ '' ]
        if (body.change.diff.status) description.push(`**Old status**: ${body.change.diff.status.from}`)
        if (body.change.diff.subject) description.push(`**Old subject**: ${body.change.diff.subject.from}`)
        if (body.change.diff.assigned_to) description.push(`**Old assigned**: ${body.change.diff.assigned_to.from ? body.change.diff.assigned_to.from : 'Nobody'}`)
        if (body.change.diff.description_diff) description.push(`**Old description**: ${body.change.diff.description_diff.from ? body.change.diff.description_diff.from : 'Nothing'}`)
        if (body.change.diff.assigned_users) description.push(`**Old assigned**: ${body.change.diff.assigned_users.from ? body.change.diff.assigned_users.from : 'Nobody'}`)

        Object.keys(body.change.diff).map(d => {
          switch (d) {
            case 'subject':
              description.push(`**New subject**: ${body.change.diff.subject.to}`)
              break
            case 'status':
              description.push(`**New status**: ${body.change.diff.status.to}`)
              break
            case 'assigned_to':
              description.push(`**New assigned**: ${body.change.diff.assigned_to.to ? body.change.diff.assigned_to.to : 'Nobody'} `)
              break
            case 'description_diff':
              description.push(`**New description**: ${body.change.diff.description_diff.to ? body.change.diff.description_diff.to : 'Nothing'}`)
              break
            case 'assigned_users':
              description.push(`**New assigned**: ${body.change.diff.assigned_users.to ? body.change.diff.assigned_users.to : 'Nobody'}`)
          }
        })

        if (description.length !== 0) {
          await discordWebhook.send({
            username: 'Taiga',
            avatarURL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
            embeds: [{
              'author': {
                name: `Updated ${body.type === 'task' ? 'subtask' : 'task'} #${body.data.ref} on ${body.data.project.name}`,
                url: `${body.data.project.permalink}/task/${body.data.ref}`
              },
              'description': description.join('\n'),
              'timestamp': body.date,
              'footer': { icon_url: body.by.photo, text: body.by.username },
              'color': parseInt(body.data.status.color.replace('#', ''), 16)
            }]
          })
        }
      }
      response.status(200).send('Event received!')
    } else {
      response.status(404).send('Something went wrong!')
    }
  })
  .listen(process.env.PORT, () => console.log(`Webhook listening on port ${process.env.PORT}!`))
