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

function createBaseEmbed(title: string, url: string, color: number, timestamp: string, changer: any, assignedTo?: any, sprint?: any) {
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
    },
    fields: [
      ...(assignedTo ? [{
        name: '👥 Assigned To',
        value: `[${assignedTo.full_name}](${assignedTo.permalink})`,
        inline: true
      }] : []),
      ...(changer ? [{
        name: '📝 Changed By',
        value: `[${changer.full_name}](${changer.permalink})`,
        inline: true
      }] : []),
      ...(sprint ? [{
        name: '🏃 Sprint',
        value: sprint.name,
        inline: true
      }] : [])
    ]
  }
}

export function handleUserStoryEvent(body: any) {
  const userStory = body.data
  let title = '', color = COLORS.CHANGE, extraFields: any[] = []
  const assignedTo = userStory.assigned_to
  const changer = body.by
  const sprint = userStory.milestone

  let statusField
  if (body.action === 'change' && body.change?.diff?.status) {
    statusField = {
      name: '📊 Status',
      value: `${body.change.diff.status.from} → ${body.change.diff.status.to}`,
      inline: true
    }
  } else {
    statusField = {
      name: '📊 Status',
      value: userStory.status.name,
      inline: true
    }
  }

  switch (body.action) {
    case 'create':
      title = `📝 Created User Story #${userStory.ref}: ${userStory.subject}`
      color = COLORS.CREATE
      break
    case 'delete':
      title = `🗑️ Deleted User Story #${userStory.ref}: ${userStory.subject}`
      color = COLORS.DELETE
      break
    case 'change':
      title = `✏️ Updated User Story #${userStory.ref}: ${userStory.subject}`
      color = COLORS.CHANGE
      break
  }

  if (userStory.points && userStory.points.length > 0) {
    extraFields.push({
      name: '🎯 Points',
      value: userStory.points.map((p: any) => `${p.role}: ${p.value}`).join('\n'),
      inline: true
    })
  }
  if (userStory.tags && userStory.tags.length > 0) {
    extraFields.push({
      name: '🏷️ Tags',
      value: userStory.tags.join(', '),
      inline: true
    })
  }
  if (userStory.is_blocked) {
    extraFields.push({
      name: '⚠️ Blocked',
      value: `**Note**: ${userStory.blocked_note}`,
      inline: false
    })
  }
  if (userStory.description) {
    extraFields.push({
      name: '📄 Description',
      value: userStory.description
    })
  }

  return {
    ...createBaseEmbed(title, userStory.permalink, color, body.date, changer, assignedTo, sprint),
    fields: [
      {
        name: '📚 Project',
        value: `[${userStory.project.name}](${userStory.project.permalink})`,
        inline: true
      },
      {
        name: '👤 Updated By',
        value: `[${changer.full_name}](${changer.permalink})`,
        inline: true
      },
      statusField,
      ...extraFields
    ]
  }
} 