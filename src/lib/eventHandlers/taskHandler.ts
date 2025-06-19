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

export function handleTaskEvent(body: any) {
  const task = body.data
  let title = '', color = COLORS.CHANGE, extraFields: any[] = []
  const assignedTo = task.assigned_to
  const changer = body.by
  const sprint = task.milestone

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
      value: task.status.name,
      inline: true
    }
  }

  switch (body.action) {
    case 'create':
      title = `📋 Created Task #${task.ref}: ${task.subject}`
      color = COLORS.CREATE
      break
    case 'delete':
      title = `🗑️ Deleted Task #${task.ref}: ${task.subject}`
      color = COLORS.DELETE
      break
    case 'change':
      title = `✏️ Updated Task #${task.ref}: ${task.subject}`
      color = COLORS.CHANGE
      break
  }

  if (task.user_story) {
    extraFields.push({
      name: '📝 User Story',
      value: `[${task.user_story.subject}](${task.user_story.permalink})`,
      inline: true
    })
  }
  if (task.milestone) {
    extraFields.push({
      name: '🏃 Sprint',
      value: task.milestone.name,
      inline: true
    })
  }
  if (task.tags && task.tags.length > 0) {
    extraFields.push({
      name: '🏷️ Tags',
      value: task.tags.join(', '),
      inline: true
    })
  }
  if (task.is_blocked) {
    extraFields.push({
      name: '⚠️ Blocked',
      value: `**Note**: ${task.blocked_note}`,
      inline: false
    })
  }
  if (task.is_iocaine) {
    extraFields.push({
      name: '💊 Iocaine',
      value: 'Yes',
      inline: true
    })
  }
  if (task.description) {
    extraFields.push({
      name: '📄 Description',
      value: task.description
    })
  }

  return {
    ...createBaseEmbed(title, task.permalink, color, body.date, changer, assignedTo, sprint),
    fields: [
      {
        name: '📚 Project',
        value: `[${task.project.name}](${task.project.permalink})`,
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