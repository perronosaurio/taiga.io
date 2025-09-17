import { NextRequest, NextResponse } from 'next/server'
import {} from 'crypto'
import { webhookManager } from '../../../lib/webhookManager'
import { MilestoneHandler } from '../../../lib/eventHandlers/milestoneHandler'
import { UserStoryHandler } from '../../../lib/eventHandlers/userStoryHandler'
import { TaskHandler } from '../../../lib/eventHandlers/taskHandler'
import { IssueHandler } from '../../../lib/eventHandlers/issueHandler'
import { handleWikiPageEvent } from '../../../lib/eventHandlers/wikiPageHandler'
import { EpicHandler} from '../../../lib/eventHandlers/epicHandler'

const COLORS = {
  CREATE: 0x00ff00,  // Green
  DELETE: 0xff0000,  // Red
  CHANGE: 0xffff00,  // Yellow
  TEST: 0x5000,      // Blue
  ERROR: 0xff0000,   // Red for errors
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

const epicHandler = new EpicHandler()
const userStoryHandler = new UserStoryHandler()
const taskHandler = new TaskHandler()
const milestoneHandler = new MilestoneHandler()
const issueHandler = new IssueHandler()

const EVENT_HANDLERS = {
  'milestone': milestoneHandler.handleEvent.bind(milestoneHandler),
  'userstory': userStoryHandler.handleEvent.bind(userStoryHandler),
  'task': taskHandler.handleEvent.bind(taskHandler),
  'issue': issueHandler.handleEvent.bind(issueHandler),
  'wikipage': handleWikiPageEvent,
  'epic': epicHandler.handleEvent.bind(epicHandler)
}

function verifySignature(key: string, rawBody: Buffer, signature: string): boolean {
  const hmac = crypto.createHmac('sha1', key)
  hmac.update(rawBody)
  return hmac.digest('hex') === signature
}

function createErrorEmbed(error: Error, body: any) {
  return {
    author: {
      name: '❌ Error Processing Webhook',
      icon_url: EMBED.AUTHOR.ICON_URL
    },
    color: COLORS.ERROR,
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: '🔍 Error Details',
        value: `\`\`\`${error.message}\`\`\``,
        inline: false
      },
      {
        name: '📝 Event Type',
        value: body?.type || 'Unknown',
        inline: true
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
        name: '👤 Triggered By',
        value: body?.by?.full_name || 'Unknown',
        inline: true
      }
    ],
    footer: {
      icon_url: EMBED.FOOTER.ICON_URL,
      text: `Error occurred at ${new Date().toLocaleString()}`
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body || !body.type || !body.data) {
      console.log('[WEBHOOK] Invalid webhook payload received')
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    const eventType = body.type.toLowerCase()
    let actionType = body.action.toLowerCase()
    const projectId = body.data.project?.id?.toString() || body.data.project?.toString()

    if (!projectId) {
      console.log('[WEBHOOK] No project ID found in webhook payload')
      return NextResponse.json({ error: 'No project ID found' }, { status: 400 })
    }

    console.log(`[WEBHOOK] Received ${eventType} event for project ${projectId}`)

    // Get the appropriate event handler
    const handler = EVENT_HANDLERS[eventType as keyof typeof EVENT_HANDLERS]
    if (!handler) {
      console.log(`[WEBHOOK] No handler found for event type: ${eventType}`)
      return NextResponse.json({ error: 'Unsupported event type' }, { status: 400 })
    }

    // Generate Discord embed
    const embed = handler(body)

    // If the event is a new comment, we can treat the action as 'create'
    // This allows for more granular webhook control in the future.
    if (embed?.title?.startsWith('New comment on')) {
      // Currently, Taiga sends 'change' for comments. We can override it here.
      actionType = 'create'
    }
    
    // Send to all relevant webhooks
    const results = await webhookManager.sendWebhooks(projectId, eventType, actionType, embed)
    
    console.log(`[WEBHOOK] Sent ${eventType} event to ${results.length} webhooks for project ${projectId}`)

    return NextResponse.json({ 
      success: true, 
      message: `Event processed and sent to ${results.length} webhooks`,
      results 
    })

  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
