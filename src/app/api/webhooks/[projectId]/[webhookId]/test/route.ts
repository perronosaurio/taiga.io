import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '../../../../../../lib/sessionManager'
import { webhookManager } from '../../../../../../lib/webhookManager'

interface TaigaProject {
  id: number
  name: string
  slug: string
  description: string
  owner: {
    username: string
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; webhookId: string } }
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

    const result = await webhookManager.testWebhook(params.projectId, params.webhookId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test webhook error:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to test webhook' 
      },
      { status: 500 }
    )
  }
} 