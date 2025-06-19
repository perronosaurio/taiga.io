const COLORS = {
  CREATE: 0x00ff00,  // Green
  DELETE: 0xff0000,  // Red
  CHANGE: 0xffff00,  // Yellow
  ERROR: 0xff0000,   // Red for errors
  PRIORITY_COLORS: {
    HIGH: 0xe74c3c,    // Red
    MEDIUM: 0xf1c40f,  // Yellow
    LOW: 0x2ecc71     // Green
  }
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

function getPriorityColor(priority: string) {
  const priorityMap: { [key: string]: number } = {
    'High': COLORS.PRIORITY_COLORS.HIGH,
    'Medium': COLORS.PRIORITY_COLORS.MEDIUM,
    'Low': COLORS.PRIORITY_COLORS.LOW
  }
  return priorityMap[priority] || COLORS.CHANGE
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

export function handleIssueEvent(body: any) {
  try {
    const issue = body.data
    let title = '', color = COLORS.CHANGE, extraFields: any[] = []
    const assignedTo = issue.assigned_to
    const changer = body.by
    const sprint = issue.milestone

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
        value: issue.status.name,
        inline: true
      }
    }

    switch (body.action) {
      case 'create':
        title = `🐛 Created Issue #${issue.ref}: ${issue.subject}`
        color = getPriorityColor(issue.priority.name)
        break
      case 'delete':
        title = `🗑️ Deleted Issue #${issue.ref}: ${issue.subject}`
        color = COLORS.DELETE
        break
      case 'change':
        title = `✏️ Updated Issue #${issue.ref}: ${issue.subject}`
        color = COLORS.CHANGE
        break
    }

    if (issue.tags && issue.tags.length > 0) {
      extraFields.push({
        name: '🏷️ Tags',
        value: issue.tags.join(', '),
        inline: true
      })
    }
    if (issue.is_blocked) {
      extraFields.push({
        name: '⚠️ Blocked',
        value: `**Note**: ${issue.blocked_note}`,
        inline: false
      })
    }
    if (issue.description) {
      extraFields.push({
        name: '📄 Description',
        value: issue.description
      })
    }
    if (issue.external_reference) {
      extraFields.push({
        name: '🔗 External Reference',
        value: issue.external_reference,
        inline: true
      })
    }

    return {
      ...createBaseEmbed(title, issue.permalink, color, body.date, changer, assignedTo, sprint),
      fields: [
        {
          name: '📚 Project',
          value: `[${issue.project.name}](${issue.project.permalink})`,
          inline: true
        },
        {
          name: '👤 Updated By',
          value: `[${changer.full_name}](${changer.permalink})`,
          inline: true
        },
        statusField,
        {
          name: '⚠️ Type',
          value: issue.type.name,
          inline: true
        },
        {
          name: '🔴 Priority',
          value: issue.priority.name,
          inline: true
        },
        {
          name: '⚡ Severity',
          value: issue.severity.name,
          inline: true
        },
        ...extraFields
      ]
    }
  } catch (error) {
    // Create error embed with relevant information
    const errorEmbed = {
      ...createBaseEmbed(
        '❌ Error Processing Issue Event',
        '',
        COLORS.ERROR,
        new Date().toISOString(),
        body?.by
      ),
      fields: [
        {
          name: '🔍 Error Details',
          value: `\`\`\`${error instanceof Error ? error.message : 'Unknown error'}\`\`\``,
          inline: false
        },
        {
          name: '📝 Action',
          value: body?.action || 'Unknown',
          inline: true
        },
        {
          name: '📚 Project',
          value: body?.data?.project?.name || 'Unknown',
          inline: true
        },
        {
          name: '🔢 Issue Reference',
          value: body?.data?.ref ? `#${body.data.ref}` : 'Unknown',
          inline: true
        }
      ]
    }

    // Log the error for debugging
    console.error('Error processing issue event:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: JSON.stringify(body, null, 2)
    })

    return errorEmbed
  }
} 