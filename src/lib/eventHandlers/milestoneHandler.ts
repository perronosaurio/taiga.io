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
  return `[${user.full_name}](${user.permalink})`
}

function formatProjectInfo(project: any) {
  return `[${project.name}](${project.permalink})`
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

export function handleMilestoneEvent(body: any) {
  const milestone = body.data
  let title = '', color = COLORS.CHANGE, fields: any[] = []
  const changer = body.by

  switch (body.action) {
    case 'create':
      title = `📅 Created Epic "${milestone.name}"`
      color = COLORS.CREATE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(milestone.project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: `[${changer.full_name}](${changer.permalink})`,
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(milestone.owner),
          inline: true
        },
        {
          name: '📅 Start Date',
          value: formatDate(milestone.estimated_start),
          inline: true
        },
        {
          name: '📅 End Date',
          value: formatDate(milestone.estimated_finish),
          inline: true
        },
        {
          name: '📊 Status',
          value: milestone.closed ? '🔒 Closed' : '🔓 Open',
          inline: true
        }
      ]
      break

    case 'delete':
      title = `🗑️ Deleted Epic "${milestone.name}"`
      color = COLORS.DELETE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(milestone.project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: `[${changer.full_name}](${changer.permalink})`,
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(milestone.owner),
          inline: true
        },
        {
          name: '📅 Start Date',
          value: formatDate(milestone.estimated_start),
          inline: true
        },
        {
          name: '📅 End Date',
          value: formatDate(milestone.estimated_finish),
          inline: true
        }
      ]
      break

    case 'change':
      title = `✏️ Updated Epic "${milestone.name}"`
      color = COLORS.CHANGE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(milestone.project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: `[${changer.full_name}](${changer.permalink})`,
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(milestone.owner),
          inline: true
        }
      ]

      if (body.change.diff.estimated_start) {
        fields.push({
          name: '📅 Start Date',
          value: `${formatDate(body.change.diff.estimated_start.from)} → ${formatDate(body.change.diff.estimated_start.to)}`,
          inline: true
        })
      }

      if (body.change.diff.estimated_finish) {
        fields.push({
          name: '📅 End Date',
          value: `${formatDate(body.change.diff.estimated_finish.from)} → ${formatDate(body.change.diff.estimated_finish.to)}`,
          inline: true
        })
      }

      if (body.change.diff.name) {
        fields.push({
          name: '📝 Name',
          value: `${body.change.diff.name.from} → ${body.change.diff.name.to}`
        })
      }

      if (body.change.diff.closed) {
        fields.push({
          name: '📊 Status',
          value: `${body.change.diff.closed.from ? '🔒 Closed' : '🔓 Open'} → ${body.change.diff.closed.to ? '🔒 Closed' : '🔓 Open'}`,
          inline: true
        })
      }

      if (body.change.comment) {
        fields.push({
          name: '💭 Comment',
          value: body.change.comment
        })
      }
      break
  }

  return {
    ...createBaseEmbed(title, milestone.permalink, color, body.date, changer),
    fields: fields
  }
} 