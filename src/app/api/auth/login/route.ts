import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSession } from '../../../../lib/sessionManager'

interface TaigaUser {
  id: number
  username: string
  full_name: string
}

interface TaigaProject {
  id: number
  name: string
  slug: string
  description: string
  owner: {
    username: string
  }
}

async function authenticateWithTaiga(taigaUrl: string, username: string, password: string) {
  try {
    // Normalize the Taiga URL (remove trailing slash)
    const baseUrl = taigaUrl.replace(/\/$/, '')
    const authEndpoint = `${baseUrl}/api/v1/auth`
    const projectsEndpoint = `${baseUrl}/api/v1/projects`
    
    const authResponse = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        type: 'normal'
      })
    })

    if (!authResponse.ok) {
      const errorData = await authResponse.json()
      return { success: false, error: errorData.error || 'Authentication failed' }
    }

    const authData = await authResponse.json()
    const token = authData.auth_token

    // Fetch projects
    const projectsResponse = await fetch(projectsEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!projectsResponse.ok) {
      return { success: false, error: 'Failed to fetch projects' }
    }

    const projects: TaigaProject[] = await projectsResponse.json()
    
    // Filter to only owned projects
    const ownedProjects = projects.filter(
      p => p.owner && p.owner.username === username
    )

    if (ownedProjects.length === 0) {
      return { success: false, error: 'You are not the owner of any projects.' }
    }

    return {
      success: true,
      user: authData,
      token,
      ownedProjects,
      taigaUrl: baseUrl
    }
  } catch (error) {
    console.error('Taiga authentication error:', error)
    return { success: false, error: 'Authentication error' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taigaUrl, username, password } = await request.json()

    if (!taigaUrl || !username || !password) {
      return NextResponse.json(
        { error: 'Taiga URL, username and password are required' },
        { status: 400 }
      )
    }

    const result = await authenticateWithTaiga(taigaUrl, username, password)

    if (result.success) {
      const session = await createSession({
        userId: result.user.id,
        username: result.user.username,
        fullName: result.user.full_name,
        token: result.token,
        taigaUrl: result.taigaUrl!,
        ownedProjects: result.ownedProjects!
      })

      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set('sessionId', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })

      console.log(`[AUTH] Login success for user: ${username} on ${result.taigaUrl}`)

      return NextResponse.json({
        success: true,
        user: result.user,
        ownedProjects: result.ownedProjects
      })
    } else {
      console.log(`[AUTH] Login failed for user: ${username}, error: ${result.error}`)
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 