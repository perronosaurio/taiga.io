import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession } from '../../../../lib/sessionManager'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (sessionId) {
      await deleteSession(sessionId)
      console.log(`[AUTH] Logout for session: ${sessionId}`)
    }

    // Clear the session cookie
    cookieStore.delete('sessionId')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 