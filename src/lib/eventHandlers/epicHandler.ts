const COLORS = {
  CREATE: 0x00ff00,  // Green
  DELETE: 0xff0000,  // Red
  CHANGE: 0xffff00,  // Yellow
}

const EMBED = {
  FOOTER: {
    ICON_URL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
    TEXT: 'Taiga.io'
  },
  AUTHOR: {
    ICON_URL: 'https://cdn.discordapp.com/attachments/596130529129005056/596406037859401738/favicon.png',
    NAME: 'Taiga'
  }
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatUserInfo(user: any) {
  if (!user) return 'Unknown'
  if (user.permalink && user.full_name) {
    return `[${user.full_name}](${user.permalink})`
  }
  return user.full_name || user.username || 'Unknown'
}

function formatProjectInfo(project: any) {
  if (!project) return 'Unknown'
  if (project.permalink && project.name) {
    return `[${project.name}](${project.permalink})`
  }
  return project.name || 'Unknown'
}

function createBaseEmbed(title: string, url: string, color: number, timestamp: string, changer: any) {
  return {
    author: {
      name: title,
      url: url
    },
    color: color,
    timestamp: timestamp,
    thumbnail: changer?.photo ? { url: changer.photo } : undefined,
    footer: {
      icon_url: EMBED.FOOTER.ICON_URL,
      text: `Managed by Koders • ${formatDate(timestamp)}`
    }
  }
}

export function handleEpicEvent(body: any) {
  const epic = body.data.epic || body.data || {}
  let title = '', color = COLORS.CHANGE, fields: any[] = []
  const changer = body.by
  const project = body.data.project || {}
  const epicName = epic.subject || epic.name || 'Unknown'
  const epicLink = epic.permalink || ''

  switch (body.action) {
    case 'create':
      title = `🗂️ Created Epic "${epicName}"`
      color = COLORS.CREATE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: formatUserInfo(changer),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(epic.owner),
          inline: true
        },
        {
          name: '📅 Start Date',
          value: formatDate(epic.estimated_start),
          inline: true
        },
        {
          name: '📅 End Date',
          value: formatDate(epic.estimated_finish),
          inline: true
        },
        {
          name: '📊 Status',
          value: epic.closed ? '🔒 Closed' : '🔓 Open',
          inline: true
        },
        {
          name: '📝 Description',
          value: epic.description || 'No description',
          inline: false
        }
      ]
      break

    case 'delete':
      title = `🗑️ Deleted Epic "${epicName}"`
      color = COLORS.DELETE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: formatUserInfo(changer),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(epic.owner),
          inline: true
        },
        {
          name: '📅 Start Date',
          value: formatDate(epic.estimated_start),
          inline: true
        },
        {
          name: '📅 End Date',
          value: formatDate(epic.estimated_finish),
          inline: true
        },
        {
          name: '📝 Description',
          value: epic.description || 'No description',
          inline: false
        }
      ]
      break

    case 'change':
      title = `✏️ Updated Epic "${epicName}"`
      color = COLORS.CHANGE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: formatUserInfo(changer),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(epic.owner),
          inline: true
        },
        {
          name: '📝 Description',
          value: epic.description || 'No description',
          inline: false
        }
      ]

      if (body.change?.diff?.estimated_start) {
        fields.push({
          name: '📅 Start Date',
          value: `${formatDate(body.change.diff.estimated_start.from)} → ${formatDate(body.change.diff.estimated_start.to)}`,
          inline: true
        })
      }

      if (body.change?.diff?.estimated_finish) {
        fields.push({
          name: '📅 End Date',
          value: `${formatDate(body.change.diff.estimated_finish.from)} → ${formatDate(body.change.diff.estimated_finish.to)}`,
          inline: true
        })
      }

      if (body.change?.diff?.subject || body.change?.diff?.name) {
        const from = body.change?.diff?.subject?.from || body.change?.diff?.name?.from || 'Unknown'
        const to = body.change?.diff?.subject?.to || body.change?.diff?.name?.to || 'Unknown'
        fields.push({
          name: '📝 Name',
          value: `${from} → ${to}`
        })
      }

      if (body.change?.diff?.status) {
        fields.push({
          name: '📊 Status',
          value: `${body.change.diff.status.from} → ${body.change.diff.status.to}`,
          inline: true
        })
      } else if (body.change?.diff?.closed) {
        fields.push({
          name: '📊 Status',
          value: `${body.change.diff.closed.from ? '🔒 Closed' : '🔓 Open'} → ${body.change.diff.closed.to ? '🔒 Closed' : '🔓 Open'}`,
          inline: true
        })
      }

      if (body.change?.comment) {
        fields.push({
          name: '💭 Comment',
          value: body.change.comment
        })
      }
      break
  }

  // Add a direct link to the epic in the embed description if available
  let description = ''
  if (epicLink) {
    description = `[🔗 View Epic](${epicLink})`
  }

  return {
    ...createBaseEmbed(title, epicLink, color, body.date, changer),
    fields: fields,
    description
  }
} 