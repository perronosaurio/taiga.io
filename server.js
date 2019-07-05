const express = require('express')
const bodyParser = require('body-parser')

const { WebhookClient } = require('discord.js')

express()
  .use(express.static('public'))
  .use(bodyParser.json())
  .get('/webhook', (request, response) => response.sendStatus(200))
  .post('/webhook', async (request, response) => {
    if (request.body) {
      const discordWebhook = new WebhookClient(process.env.WEBHOOKID, process.env.WEBHOOKTOKEN)
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
