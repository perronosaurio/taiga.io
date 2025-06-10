const { COLORS } = require('../config/constants')
const { createBaseEmbed, formatDate, formatUserInfo, formatProjectInfo, getPriorityColor, getSeverityColor } = require('../utils/helpers')

const handleIssueEvent = (body) => {
  const issue = body.data
  let title, color, fields = []

  switch (body.action) {
    case 'create':
      title = `🐛 Created Issue #${issue.ref}`
      color = getPriorityColor(issue.priority.name)
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(issue.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(issue.owner),
          inline: true
        },
        {
          name: '📊 Status',
          value: issue.status.name,
          inline: true
        },
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
        }
      ]

      if (issue.assigned_to) {
        fields.push({
          name: '👥 Assigned To',
          value: formatUserInfo(issue.assigned_to),
          inline: true
        })
      }

      if (issue.tags && issue.tags.length > 0) {
        fields.push({
          name: '🏷️ Tags',
          value: issue.tags.join(', '),
          inline: true
        })
      }

      if (issue.is_blocked) {
        fields.push({
          name: '⚠️ Blocked',
          value: `**Note**: ${issue.blocked_note}`,
          inline: false
        })
      }

      if (issue.milestone) {
        fields.push({
          name: '📅 Milestone',
          value: issue.milestone.name,
          inline: true
        })
      }

      if (issue.external_reference) {
        fields.push({
          name: '🔗 External Reference',
          value: issue.external_reference,
          inline: true
        })
      }

      if (issue.description) {
        fields.push({
          name: '📄 Description',
          value: issue.description
        })
      }
      break

    case 'delete':
      title = `🗑️ Deleted Issue #${issue.ref}`
      color = COLORS.DELETE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(issue.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(issue.owner),
          inline: true
        },
        {
          name: '📊 Status',
          value: issue.status.name,
          inline: true
        },
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
        }
      ]

      if (issue.milestone) {
        fields.push({
          name: '📅 Milestone',
          value: issue.milestone.name,
          inline: true
        })
      }

      if (issue.external_reference) {
        fields.push({
          name: '🔗 External Reference',
          value: issue.external_reference,
          inline: true
        })
      }
      break

    case 'change':
      title = `✏️ Updated Issue #${issue.ref}`
      color = COLORS.CHANGE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(issue.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(issue.owner),
          inline: true
        }
      ]

      if (body.change.diff.status) {
        fields.push({
          name: '📊 Status',
          value: `${body.change.diff.status.from} → ${body.change.diff.status.to}`,
          inline: true
        })
      }

      if (body.change.diff.subject) {
        fields.push({
          name: '📝 Subject',
          value: `${body.change.diff.subject.from} → ${body.change.diff.subject.to}`
        })
      }

      if (body.change.diff.description) {
        fields.push({
          name: '📄 Description',
          value: `${body.change.diff.description.from || 'None'} → ${body.change.diff.description.to || 'None'}`
        })
      }

      if (body.change.diff.type) {
        fields.push({
          name: '⚠️ Type',
          value: `${body.change.diff.type.from} → ${body.change.diff.type.to}`,
          inline: true
        })
      }

      if (body.change.diff.priority) {
        fields.push({
          name: '🔴 Priority',
          value: `${body.change.diff.priority.from} → ${body.change.diff.priority.to}`,
          inline: true
        })
      }

      if (body.change.diff.severity) {
        fields.push({
          name: '⚡ Severity',
          value: `${body.change.diff.severity.from} → ${body.change.diff.severity.to}`,
          inline: true
        })
      }

      if (body.change.diff.assigned_to) {
        fields.push({
          name: '👥 Assigned To',
          value: `${body.change.diff.assigned_to.from || 'Unassigned'} → ${body.change.diff.assigned_to.to || 'Unassigned'}`,
          inline: true
        })
      }

      if (body.change.diff.is_blocked) {
        fields.push({
          name: '⚠️ Blocked',
          value: `${body.change.diff.is_blocked.from ? 'Yes' : 'No'} → ${body.change.diff.is_blocked.to ? 'Yes' : 'No'}`,
          inline: true
        })
        if (body.change.diff.blocked_note) {
          fields.push({
            name: '📝 Blocked Note',
            value: `${body.change.diff.blocked_note.from || 'None'} → ${body.change.diff.blocked_note.to || 'None'}`
          })
        }
      }

      if (body.change.diff.milestone) {
        fields.push({
          name: '📅 Milestone',
          value: `${body.change.diff.milestone.from || 'None'} → ${body.change.diff.milestone.to || 'None'}`,
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
    ...createBaseEmbed(title, issue.permalink, color, body.date, body.by),
    fields: fields
  }
}

module.exports = handleIssueEvent 