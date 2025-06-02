import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Data Steward UI. All rights reserved.
          </Typography>
          <Box>
            <Link 
              href="#" 
              color="inherit" 
              sx={{ mx: 1, fontSize: '0.875rem', color: 'text.secondary' }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              color="inherit" 
              sx={{ mx: 1, fontSize: '0.875rem', color: 'text.secondary' }}
            >
              Terms of Service
            </Link>
            <Link 
              href="#" 
              color="inherit" 
              sx={{ mx: 1, fontSize: '0.875rem', color: 'text.secondary' }}
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
