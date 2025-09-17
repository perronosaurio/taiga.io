import { ContentPasteSearchOutlined } from '@mui/icons-material'
import fs from 'fs/promises'
import path from 'path'

interface Webhook {
  id: string
  url: string
  entities: Record<string, string[]>
  createdAt: string
  lastTested: string | null
  updatedAt?: string
}

interface WebhookConfig {
  projects: {
    [projectId: string]: Webhook[]
  }
}

class WebhookManager {
  private configPath: string
  private config: WebhookConfig

  constructor() {
    this.configPath = path.join(process.cwd(), 'data', 'webhooks.json')
    this.config = { projects: {} }
    this.ensureDataDirectory()
  }

  private async ensureDataDirectory() {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true })
    } catch (error) {
      console.error('Error creating data directory:', error)
    }
  }

  async loadConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8')
      this.config = JSON.parse(data)
    } catch (error) {
      console.log('No existing webhook config found, creating new one')
      await this.saveConfig()
    }
  }

  async saveConfig() {
    try {
      await this.ensureDataDirectory()
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.error('Error saving webhook config:', error)
      throw error
    }
  }

  async getProjectWebhooks(projectId: string): Promise<Webhook[]> {
    await this.loadConfig()
    return this.config.projects[projectId] || []
  }

  async addWebhook(projectId: string, webhookUrl: string, entities: Record<string, string[]> = {}): Promise<Webhook> {
    await this.loadConfig()
    
    if (!this.config.projects[projectId]) {
      this.config.projects[projectId] = []
    }

    const webhook: Webhook = {
      id: this.generateId(),
      url: webhookUrl,
      entities: entities,
      createdAt: new Date().toISOString(),
      lastTested: null
    }

    this.config.projects[projectId].push(webhook)
    await this.saveConfig()
    
    this.logAction('ADD_WEBHOOK', {
      projectId,
      webhookId: webhook.id,
      entities: webhook.entities
    })

    return webhook
  }

  async updateWebhook(projectId: string, webhookId: string, updates: Partial<Webhook>): Promise<Webhook> {
    await this.loadConfig()
    
    const project = this.config.projects[projectId]
    if (!project) {
      throw new Error('Project not found')
    }

    const webhookIndex = project.findIndex(w => w.id === webhookId)
    if (webhookIndex === -1) {
      throw new Error('Webhook not found')
    }

    const oldWebhook = { ...project[webhookIndex] }
    project[webhookIndex] = { ...oldWebhook, ...updates, updatedAt: new Date().toISOString() }
    
    await this.saveConfig()
    
    this.logAction('UPDATE_WEBHOOK', {
      projectId,
      webhookId,
      changes: updates
    })

    return project[webhookIndex]
  }

  async removeWebhook(projectId: string, webhookId: string): Promise<Webhook> {
    await this.loadConfig()
    
    const project = this.config.projects[projectId]
    if (!project) {
      throw new Error('Project not found')
    }

    const webhookIndex = project.findIndex(w => w.id === webhookId)
    if (webhookIndex === -1) {
      throw new Error('Webhook not found')
    }

    const removedWebhook = project.splice(webhookIndex, 1)[0]
    await this.saveConfig()
    
    this.logAction('REMOVE_WEBHOOK', {
      projectId,
      webhookId: removedWebhook.id
    })

    return removedWebhook
  }

  async testWebhook(projectId: string, webhookId: string): Promise<{ success: boolean; message: string }> {
    await this.loadConfig()
    
    const project = this.config.projects[projectId]
    if (!project) {
      throw new Error('Project not found')
    }

    const webhook = project.find(w => w.id === webhookId)
    if (!webhook) {
      throw new Error('Webhook not found')
    }

    try {
      // Dynamic import to ensure discord.js is only loaded on server
      const { WebhookClient } = await import('discord.js')
      const webhookClient = new WebhookClient({ url: webhook.url })
      const testEmbed = {
        title: '🧪 Webhook Test',
        description: 'This is a test message to verify your webhook is working correctly.',
        color: 0x00ff00,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Taiga Webhook Test'
        }
      }

      await webhookClient.send({
        username: 'Taiga',
        avatarURL: 'https://avatars.githubusercontent.com/u/6905422?s=200&v=4',
        embeds: [testEmbed]
      })

      // Update last tested timestamp
      webhook.lastTested = new Date().toISOString()
      await this.saveConfig()

      this.logAction('TEST_WEBHOOK', {
        projectId,
        webhookId,
        status: 'SUCCESS'
      })

      return { success: true, message: 'Test webhook sent successfully!' }
    } catch (error) {
      this.logAction('TEST_WEBHOOK', {
        projectId,
        webhookId,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw new Error(`Failed to send test webhook: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sendWebhooks(projectId: string, eventType: string, actionType:string, embed: any): Promise<any[]> {
    await this.loadConfig()
    
    const webhooks = await this.getProjectWebhooks(projectId)

    // Check if the entity type exists as a key and its action array includes the action type
    const relevantWebhooks = webhooks.filter(webhook =>
      webhook.entities[eventType] && webhook.entities[eventType].includes(actionType)
    )

    if (relevantWebhooks.length === 0) {
      this.logAction('SEND_WEBHOOKS', {
        projectId,
        eventType,
        status: 'NO_WEBHOOKS',
        message: 'No webhooks configured for this event type'
      })
      return []
    }

    const results = []
    
    for (const webhook of relevantWebhooks) {
      try {
        // Dynamic import to ensure discord.js is only loaded on server
        const { WebhookClient } = await import('discord.js')
        const webhookClient = new WebhookClient({ url: webhook.url })

	const embedToSend = { ...embed }; 

	// Check if the embed has a 'fields' property and if it's an array.
	if (embedToSend.fields && Array.isArray(embedToSend.fields)) {
		embedToSend.fields = embedToSend.fields.map((field: { value: string }) => {
			// Discord embed field 'value' has a maximum length of 1024 characters.
			const MAX_FIELD_VALUE_LENGTH = 1024;

			// If field.value is a string and its length exceeds the limit, truncate it.
			if (typeof field.value === 'string' && field.value.length > MAX_FIELD_VALUE_LENGTH) {
				console.warn(`Embed field value truncated due to length limit. Original length: ${field.value.length}`);
				return { ...field, value: field.value.substring(0, MAX_FIELD_VALUE_LENGTH) };
			}
			// Otherwise, return the field as is.
			return field; 
		});
	}

        await webhookClient.send({
          username: 'Taiga',
          avatarURL: 'https://avatars.githubusercontent.com/u/6905422?s=200&v=4',
          embeds: [embedToSend]
        })
        
        results.push({
          webhookId: webhook.id,
          status: 'SUCCESS'
        })

        this.logAction('SEND_WEBHOOK', {
          projectId,
          webhookId: webhook.id,
          eventType,
          status: 'SUCCESS'
        })
      } catch (error) {
        results.push({
          webhookId: webhook.id,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        this.logAction('SEND_WEBHOOK', {
          projectId,
          webhookId: webhook.id,
          eventType,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private logAction(action: string, data: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      ...data
    }

    console.log(`[WEBHOOK_MANAGER] ${JSON.stringify(logEntry)}`)
    
    // Also write to file
    const logPath = path.join(process.cwd(), 'data', 'webhook-manager.log')
    const logLine = `${logEntry.timestamp} - ${action} - ${JSON.stringify(data)}\n`
    
    fs.appendFile(logPath, logLine).catch(err => {
      console.error('Failed to write to log file:', err)
    })
  }
}

export const webhookManager = new WebhookManager() 
