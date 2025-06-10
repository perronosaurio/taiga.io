const { COLORS } = require('../config/constants')
const { createBaseEmbed, formatDate, formatUserInfo, formatProjectInfo } = require('../utils/helpers')

const handleUserStoryEvent = (body) => {
  const userStory = body.data
  let title, color, extraFields = []
  const assignedTo = userStory.assigned_to
  const changer = body.by
  const sprint = userStory.milestone

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
      value: userStory.points.map(p => `${p.role}: ${p.value}`).join('\n'),
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
        name: '📊 Status',
        value: userStory.status.name,
        inline: true
      },
      ...extraFields
    ]
  }
}

module.exports = handleUserStoryEvent 