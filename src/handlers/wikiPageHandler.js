const { COLORS } = require('../config/constants')
const { createBaseEmbed, formatDate, formatUserInfo, formatProjectInfo } = require('../utils/helpers')

const handleWikiPageEvent = (body) => {
  const wikiPage = body.data
  let title, description, color, fields = []
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

module.exports = handleWikiPageEvent 