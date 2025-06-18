'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader
} from '@mui/material'
import { Login as LoginIcon, GitHub as GitHubIcon } from '@mui/icons-material'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    taigaUrl: '',
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setTimeout(() => {
          window.location.replace('/dashboard')
        }, 200)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                <GitHubIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Taiga Webhook Manager
                </Typography>
              </Box>
            }
            subheader={
              <Typography variant="body1" textAlign="center" color="text.secondary">
                Manage Discord webhooks for your Taiga projects
              </Typography>
            }
            sx={{ textAlign: 'center', pb: 0 }}
          />
          
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit} autoComplete="on">
              <TextField
                id="taiga-url"
                label="Taiga URL"
                placeholder="https://api.taiga.io"
                value={formData.taigaUrl}
                onChange={handleChange('taigaUrl')}
                margin="normal"
                required
                variant="outlined"
                helperText="Enter your Taiga instance URL"
                autoComplete="url"
                fullWidth
                autoFocus
              />
              
              <TextField
                id="username"
                label="Username"
                value={formData.username}
                onChange={handleChange('username')}
                margin="normal"
                required
                variant="outlined"
                autoComplete="username"
                fullWidth
              />
              
              <TextField
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                margin="normal"
                required
                variant="outlined"
                autoComplete="current-password"
                fullWidth
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Only project owners can access webhook management
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
