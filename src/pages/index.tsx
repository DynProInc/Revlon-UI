import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

const Home: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If not loading and user is authenticated, redirect to dashboard
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        <span className="text-primary-600 font-bold">Data</span>
        <span className="font-light">Steward Console</span>
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 4 }}>
        AI-powered data review and management platform
      </Typography>
      
      <CircularProgress />
      
      <Typography variant="body1" sx={{ mt: 4 }}>
        Redirecting to the appropriate page...
      </Typography>
    </Box>
  );
};

export default Home;
