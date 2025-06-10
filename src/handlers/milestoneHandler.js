const { COLORS } = require('../config/constants')
const { createBaseEmbed, formatDate, formatUserInfo, formatProjectInfo } = require('../utils/helpers')

const handleMilestoneEvent = (body) => {
  const milestone = body.data
  let title, color, fields = []

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
    ...createBaseEmbed(title, milestone.permalink, color, body.date, body.by),
    fields: fields
  }
}

module.exports = handleMilestoneEvent 