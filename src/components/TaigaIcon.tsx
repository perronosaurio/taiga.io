import { Box, Typography } from '@mui/material'

interface TaigaIconProps {
  size?: number
  showText?: boolean
}

export default function TaigaIcon({ size = 32, showText = false }: TaigaIconProps) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        component="img"
        src="https://avatars.githubusercontent.com/u/6905422?s=200&v=4"
        alt="Taiga Logo"
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          boxShadow: 2,
          background: 'white',
        }}
      />
      {showText && (
        <Typography 
          variant="h6" 
          component="span" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            fontSize: size * 0.4
          }}
        >
        </Typography>
      )}
    </Box>
  )
} 