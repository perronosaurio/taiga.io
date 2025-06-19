import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '../../../../lib/sessionManager'
import { webhookManager } from '../../../../lib/webhookManager'

interface TaigaProject {
  id: number
  name: string
  slug: string
  description: string
  owner: {
    username: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const session = await validateSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user owns this project
    const project = session.ownedProjects.find((p: TaigaProject) => p.id.toString() === params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      )
    }

    const webhooks = await webhookManager.getProjectWebhooks(params.projectId)

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error('Get webhooks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const session = await validateSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user owns this project
    const project = session.ownedProjects.find((p: TaigaProject) => p.id.toString() === params.projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      )
    }

    const { url, entities } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      )
    }

    const webhook = await webhookManager.addWebhook(params.projectId, url, entities || [])

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Add webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 