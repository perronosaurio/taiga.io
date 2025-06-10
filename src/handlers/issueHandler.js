const { COLORS } = require('../config/constants')
const { createBaseEmbed, formatDate, formatUserInfo, formatProjectInfo, getPriorityColor, getSeverityColor } = require('../utils/helpers')

const handleIssueEvent = (body) => {
  const issue = body.data
  let title, color, extraFields = []
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
}

module.exports = handleIssueEvent 