'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import TaigaIcon from '../../components/TaigaIcon'
import { getWebhookUrl } from '../../lib/config'

interface Project {
  id: number
  name: string
  slug: string
  description: string
}

interface Webhook {
  id: string
  url: string
  entities: string[]
  createdAt: string
  lastTested: string | null
}

interface User {
  username: string
  full_name: string
}

const ENTITY_TYPES = {
  epic: '🗂️ Epics',
  userstory: '📝 User Stories',
  task: '📋 Tasks',
  issue: '🐛 Issues',
  wikipage: '📚 Wiki Pages'
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [webhookForm, setWebhookForm] = useState({
    url: '',
    entities: Object.keys(ENTITY_TYPES)
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setProjects(data.ownedProjects)
        if (data.ownedProjects.length > 0) {
          setSelectedProject(data.ownedProjects[0].id.toString())
        }
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedProject) {
      loadWebhooks()
    }
  }, [selectedProject])

  const loadWebhooks = async () => {
    try {
      const response = await fetch(`/api/webhooks/${selectedProject}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data.webhooks)
      }
    } catch (err) {
      setError('Failed to load webhooks')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      window.location.href = '/'
    } catch (err) {
      setError('Logout failed')
    }
  }

  const openWebhookDialog = (webhook?: Webhook) => {
    if (webhook) {
      setEditingWebhook(webhook)
      setWebhookForm({
        url: webhook.url,
        entities: webhook.entities
      })
    } else {
      setEditingWebhook(null)
      setWebhookForm({
        url: '',
        entities: Object.keys(ENTITY_TYPES)
      })
    }
    setWebhookDialogOpen(true)
  }

  const handleWebhookSubmit = async () => {
    try {
      const url = editingWebhook 
        ? `/api/webhooks/${selectedProject}/${editingWebhook.id}`
        : `/api/webhooks/${selectedProject}`
      
      const method = editingWebhook ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookForm),
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess(editingWebhook ? 'Webhook updated successfully!' : 'Webhook added successfully!')
        setWebhookDialogOpen(false)
        loadWebhooks()
      } else {
        const data = await response.json()
        setError(data.error || 'Operation failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(`/api/webhooks/${selectedProject}/${webhookId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess('Webhook deleted successfully!')
        loadWebhooks()
      } else {
        setError('Failed to delete webhook')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${selectedProject}/${webhookId}/test`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess('Test webhook sent successfully!')
      } else {
        const data = await response.json()
        setError(data.error || 'Test failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <TaigaIcon size={32} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Taiga Webhook Manager
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">
              {user?.full_name}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Card sx={{ mb: 4 }}>
          <CardHeader
            title="Project Selection"
            titleTypographyProps={{ variant: 'h5' }}
          />
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Select Project"
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Taiga Webhook Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure this webhook URL in your Taiga project settings:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                wordBreak: 'break-all'
              }}
            >
              {getWebhookUrl()}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This URL will receive all Taiga events and forward them to your configured Discord webhooks.
            </Typography>
            <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block', fontWeight: 'bold' }}>
              Don't forget: Set the webhook secret/key in Taiga to match <code>TAIGA_WEBHOOK_SECRET</code> in your <code>.env.local</code>!
            </Typography>
          </CardContent>
        </Card>

        {selectedProject && (
          <Card>
            <CardHeader
              title="Webhook Management"
              titleTypographyProps={{ variant: 'h5' }}
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openWebhookDialog()}
                >
                  Add Webhook
                </Button>
              }
            />
            <CardContent>
              {webhooks.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No webhooks configured for this project
                </Typography>
              ) : (
                <List>
                  {webhooks.map((webhook, index) => (
                    <Box key={webhook.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Discord Webhook
                              </Typography>
                              <Chip 
                                label={webhook.entities.length} 
                                size="small" 
                                color="primary" 
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                {webhook.url}
                              </Typography>
                              <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                                {webhook.entities.map((entity) => (
                                  <Chip
                                    key={entity}
                                    label={ENTITY_TYPES[entity as keyof typeof ENTITY_TYPES]}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" gap={1}>
                            <IconButton
                              color="primary"
                              onClick={() => handleTestWebhook(webhook.id)}
                              title="Test Webhook"
                            >
                              <SendIcon />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => openWebhookDialog(webhook)}
                              title="Edit Webhook"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              title="Delete Webhook"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < webhooks.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onClose={() => setWebhookDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Discord Webhook URL"
            value={webhookForm.url}
            onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))}
            margin="normal"
            required
            placeholder="https://discord.com/api/webhooks/..."
          />
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Event Types to Send:
          </Typography>
          
          {Object.entries(ENTITY_TYPES).map(([key, label]) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={webhookForm.entities.includes(key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setWebhookForm(prev => ({
                        ...prev,
                        entities: [...prev.entities, key]
                      }))
                    } else {
                      setWebhookForm(prev => ({
                        ...prev,
                        entities: prev.entities.filter(entity => entity !== key)
                      }))
                    }
                  }}
                />
              }
              label={label}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebhookDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleWebhookSubmit} 
            variant="contained"
            disabled={!webhookForm.url || webhookForm.entities.length === 0}
          >
            {editingWebhook ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 