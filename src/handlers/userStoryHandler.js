const { COLORS } = require('../config/constants')
const { createBaseEmbed, formatDate, formatUserInfo, formatProjectInfo } = require('../utils/helpers')

const handleUserStoryEvent = (body) => {
  const userStory = body.data
  let title, color, fields = []

  switch (body.action) {
    case 'create':
      title = `📝 Created User Story #${userStory.ref}`
      color = COLORS.CREATE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(userStory.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(userStory.owner),
          inline: true
        },
        {
          name: '📊 Status',
          value: userStory.status.name,
          inline: true
        }
      ]

      if (userStory.assigned_to) {
        fields.push({
          name: '👥 Assigned To',
          value: formatUserInfo(userStory.assigned_to),
          inline: true
        })
      }

      if (userStory.points && userStory.points.length > 0) {
        fields.push({
          name: '🎯 Points',
          value: userStory.points.map(p => `${p.role}: ${p.value}`).join('\n'),
          inline: true
        })
      }

      if (userStory.tags && userStory.tags.length > 0) {
        fields.push({
          name: '🏷️ Tags',
          value: userStory.tags.join(', '),
          inline: true
        })
      }

      if (userStory.is_blocked) {
        fields.push({
          name: '⚠️ Blocked',
          value: `**Note**: ${userStory.blocked_note}`,
          inline: false
        })
      }

      if (userStory.description) {
        fields.push({
          name: '📄 Description',
          value: userStory.description
        })
      }
      break

    case 'delete':
      title = `🗑️ Deleted User Story #${userStory.ref}`
      color = COLORS.DELETE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(userStory.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(userStory.owner),
          inline: true
        },
        {
          name: '📊 Status',
          value: userStory.status.name,
          inline: true
        }
      ]

      if (userStory.points && userStory.points.length > 0) {
        fields.push({
          name: '🎯 Points',
          value: userStory.points.map(p => `${p.role}: ${p.value}`).join('\n'),
          inline: true
        })
      }

      if (userStory.tags && userStory.tags.length > 0) {
        fields.push({
          name: '🏷️ Tags',
          value: userStory.tags.join(', '),
          inline: true
        })
      }

      if (userStory.milestone) {
        fields.push({
          name: '📅 Milestone',
          value: userStory.milestone.name,
          inline: true
        })
      }
      break

    case 'change':
      title = `✏️ Updated User Story #${userStory.ref}`
      color = COLORS.CHANGE
      fields = [
        {
          name: '📚 Project',
          value: formatProjectInfo(userStory.project),
          inline: true
        },
        {
          name: '👤 Owner',
          value: formatUserInfo(userStory.owner),
          inline: true
        }
      ]

      if (body.change.diff.milestone) {
        fields.push({
          name: '📅 Milestone',
          value: `${body.change.diff.milestone.from || 'None'} → ${body.change.diff.milestone.to || 'None'}`,
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

      if (body.change.comment) {
        fields.push({
          name: '💭 Comment',
          value: body.change.comment
        })
      }
      break
  }

  return {
    ...createBaseEmbed(title, userStory.permalink, color, body.date, body.by),
    fields: fields
  }
}

module.exports = handleUserStoryEvent 