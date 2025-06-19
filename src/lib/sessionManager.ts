import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const SESSIONS_PATH = path.join(process.cwd(), 'data', 'sessions.json')

interface Session {
  id: string
  userId: number
  username: string
  fullName: string
  token: string
  taigaUrl: string
  ownedProjects: any[]
  createdAt: string
  lastActivity: string
}

async function loadSessions(): Promise<Record<string, Session>> {
  try {
    const data = await fs.readFile(SESSIONS_PATH, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    if ((e as any).code === 'ENOENT') {
      await saveSessions({})
      return {}
    }
    throw e
  }
}

async function saveSessions(sessions: Record<string, Session>) {
  await fs.mkdir(path.dirname(SESSIONS_PATH), { recursive: true })
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(sessions, null, 2))
}

export async function validateSession(sessionId: string): Promise<Session | null> {
  const sessions = await loadSessions()
  const session = sessions[sessionId]
  if (!session) return null

  // Check if session is expired (24 hours)
  const now = new Date()
  const sessionAge = now.getTime() - new Date(session.createdAt).getTime()
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours

  if (sessionAge > maxAge) {
    delete sessions[sessionId]
    await saveSessions(sessions)
    console.log(`[AUTH] Session expired: ${sessionId}`)
    return null
  }

  // Update last activity
  session.lastActivity = new Date().toISOString()
  sessions[sessionId] = session
  await saveSessions(sessions)

  return session
}

export async function createSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'lastActivity'>): Promise<Session> {
  const sessionId = crypto.randomUUID()
  const session: Session = {
    ...sessionData,
    id: sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  }
  const sessions = await loadSessions()
  sessions[sessionId] = session
  await saveSessions(sessions)
  return session
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const sessions = await loadSessions()
  const existed = !!sessions[sessionId]
  delete sessions[sessionId]
  await saveSessions(sessions)
  return existed
} 