const crypto = require('crypto')
const { COLORS, EMBED } = require('../config/constants')

const verifySignature = (key, rawBody, signature) => {
  const hmac = crypto.createHmac('sha1', key)
  hmac.update(rawBody)
  return hmac.digest('hex') === signature?.trim()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

const createBaseEmbed = (title, url, color, timestamp, by) => {
  return {
    author: {
      name: title,
      url: url,
      icon_url: EMBED.AUTHOR.ICON_URL
    },
    color: color,
    timestamp: timestamp,
    footer: {
      icon_url: by?.photo || EMBED.FOOTER.ICON_URL,
      text: by?.full_name || EMBED.FOOTER.TEXT
    }
  }
}

const formatUserInfo = (user) => {
  return `[${user.full_name}](${user.permalink})`
}

const formatProjectInfo = (project) => {
  return `[${project.name}](${project.permalink})`
}

const getStatusColor = (status) => {
  const statusMap = {
    'New': COLORS.STATUS_COLORS.NEW,
    'In progress': COLORS.STATUS_COLORS.IN_PROGRESS,
    'Ready for test': COLORS.STATUS_COLORS.READY,
    'Closed': COLORS.STATUS_COLORS.CLOSED,
    'Blocked': COLORS.STATUS_COLORS.BLOCKED
  }
  return statusMap[status] || COLORS.CHANGE
}

const getPriorityColor = (priority) => {
  const priorityMap = {
    'High': COLORS.PRIORITY_COLORS.HIGH,
    'Medium': COLORS.PRIORITY_COLORS.MEDIUM,
    'Low': COLORS.PRIORITY_COLORS.LOW
  }
  return priorityMap[priority] || COLORS.CHANGE
}

const getSeverityColor = (severity) => {
  const severityMap = {
    'Wish': COLORS.SEVERITY_COLORS.WISH,
    'Minor': COLORS.SEVERITY_COLORS.MINOR,
    'Normal': COLORS.SEVERITY_COLORS.NORMAL,
    'Major': COLORS.SEVERITY_COLORS.MAJOR,
    'Blocker': COLORS.SEVERITY_COLORS.BLOCKER
  }
  return severityMap[severity] || COLORS.CHANGE
}

module.exports = {
  verifySignature,
  formatDate,
  createBaseEmbed,
  formatUserInfo,
  formatProjectInfo,
  getStatusColor,
  getPriorityColor,
  getSeverityColor
} 