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

export function handleWikiPageEvent(body: any) {
  const wikiPage = body.data
  let title = '', color = COLORS.CHANGE, fields: any[] = []
  const changer = body.by

  switch (body.action) {
    case 'create':
      title = `📝 Created Wiki Page "${wikiPage.slug}"`
      color = COLORS.CREATE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(wikiPage.project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: `[${changer.full_name}](${changer.permalink})`,
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(wikiPage.owner),
          inline: true
        },
        {
          name: '📅 Created',
          value: formatDate(wikiPage.created_date),
          inline: true
        },
        {
          name: '📝 Content',
          value: wikiPage.content || 'No content'
        }
      ]
      break

    case 'delete':
      title = `🗑️ Deleted Wiki Page "${wikiPage.slug}"`
      color = COLORS.DELETE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(wikiPage.project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: `[${changer.full_name}](${changer.permalink})`,
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(wikiPage.owner),
          inline: true
        },
        {
          name: '📅 Last Modified',
          value: formatDate(wikiPage.modified_date),
          inline: true
        },
        {
          name: '📝 Last Content',
          value: wikiPage.content || 'No content'
        }
      ]
      break

    case 'change':
      title = `✏️ Updated Wiki Page "${wikiPage.slug}"`
      color = COLORS.CHANGE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(wikiPage.project),
          inline: true
        },
        {
          name: '👤 Updated By',
          value: `[${changer.full_name}](${changer.permalink})`,
          inline: true
        },
        {
          name: '👤 Last Modified By',
          value: formatUserInfo(wikiPage.last_modifier),
          inline: true
        },
        {
          name: '📅 Last Modified',
          value: formatDate(wikiPage.modified_date),
          inline: true
        }
      ]

      if (body.change.diff.content_html) {
        fields.push({
          name: '📝 Content Changes',
          value: `**From:**\n${body.change.diff.content_html.from}\n\n**To:**\n${body.change.diff.content_html.to}`
        })
      }

      if (body.change.diff.content_diff) {
        fields.push({
          name: '🔍 Diff View',
          value: body.change.diff.content_diff.to
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
    ...createBaseEmbed(title, wikiPage.permalink, color, body.date, changer),
    fields: fields
  }
} 