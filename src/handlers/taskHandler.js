const { COLORS } = require('../config/constants')
const { createBaseEmbed, formatDate, formatUserInfo, formatProjectInfo } = require('../utils/helpers')

const handleTaskEvent = (body) => {
  const task = body.data
  let title, color, fields = []

  switch (body.action) {
    case 'create':
      title = `📋 Created Task #${task.ref}`
      color = COLORS.CREATE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(task.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(task.owner),
          inline: true
        },
        {
          name: '📊 Status',
          value: task.status.name,
          inline: true
        }
      ]

      if (task.assigned_to) {
        fields.push({
          name: '👥 Assigned To',
          value: formatUserInfo(task.assigned_to),
          inline: true
        })
      }

      if (task.user_story) {
        fields.push({
          name: '📝 User Story',
          value: `[${task.user_story.subject}](${task.user_story.permalink})`,
          inline: true
        })
      }

      if (task.milestone) {
        fields.push({
          name: '📅 Milestone',
          value: task.milestone.name,
          inline: true
        })
      }

      if (task.tags && task.tags.length > 0) {
        fields.push({
          name: '🏷️ Tags',
          value: task.tags.join(', '),
          inline: true
        })
      }

      if (task.is_blocked) {
        fields.push({
          name: '⚠️ Blocked',
          value: `**Note**: ${task.blocked_note}`,
          inline: false
        })
      }

      if (task.is_iocaine) {
        fields.push({
          name: '💊 Iocaine',
          value: 'Yes',
          inline: true
        })
      }

      if (task.description) {
        fields.push({
          name: '📄 Description',
          value: task.description
        })
      }
      break

    case 'delete':
      title = `🗑️ Deleted Task #${task.ref}`
      color = COLORS.DELETE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(task.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(task.owner),
          inline: true
        },
        {
          name: '📊 Status',
          value: task.status.name,
          inline: true
        }
      ]

      if (task.user_story) {
        fields.push({
          name: '📝 User Story',
          value: `[${task.user_story.subject}](${task.user_story.permalink})`,
          inline: true
        })
      }

      if (task.milestone) {
        fields.push({
          name: '📅 Milestone',
          value: task.milestone.name,
          inline: true
        })
      }

      if (task.tags && task.tags.length > 0) {
        fields.push({
          name: '🏷️ Tags',
          value: task.tags.join(', '),
          inline: true
        })
      }
      break

    case 'change':
      title = `✏️ Updated Task #${task.ref}`
      color = COLORS.CHANGE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(task.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(task.owner),
          inline: true
        }
      ]

      if (body.change.diff.assigned_to) {
        fields.push({
          name: '👥 Assigned To',
          value: `${body.change.diff.assigned_to.from || 'Unassigned'} → ${body.change.diff.assigned_to.to || 'Unassigned'}`,
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

      if (body.change.diff.status) {
        fields.push({
          name: '📊 Status',
          value: `${body.change.diff.status.from} → ${body.change.diff.status.to}`,
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

      if (body.change.diff.user_story) {
        fields.push({
          name: '📝 User Story',
          value: `${body.change.diff.user_story.from || 'None'} → ${body.change.diff.user_story.to || 'None'}`,
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
    ...createBaseEmbed(title, task.permalink, color, body.date, body.by),
    fields: fields
  }
}

module.exports = handleTaskEvent 