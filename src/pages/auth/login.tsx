import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Link as MuiLink,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Paper,
  Container,
  useMediaQuery,
  Avatar
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Lock as LockIcon,
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { login, error, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Add animation effect when component mounts
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login(email, password);
      } catch (err) {
        console.error('Login error:', err);
      }
    }
  };
  
  // Demo login credentials for quick access
  const demoCredentials = [
    { role: 'Data Steward', email: 'steward@example.com', password: 'password' },
    { role: 'QA', email: 'dynpro@example.com', password: 'password' },
    { role: 'Viewer', email: 'viewer@example.com', password: 'password' },
    { role: 'Admin', email: 'admin@example.com', password: 'password' }
  ];
  
  // Quick login with demo credentials
  const handleQuickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Submit the form after a short delay to show the filled credentials
    setTimeout(() => {
      login(demoEmail, demoPassword);
    }, 300);
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : alpha(theme.palette.primary.main, 0.03),
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left side - Branding and background */}
      {!isMobile && (
        <Box
          sx={{
            flex: { md: '0 0 45%', lg: '0 0 50%' },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            position: 'relative',
            p: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.8),
            color: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: alpha(theme.palette.primary.dark, 0.85),
              zIndex: 1,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: '80%' }}>
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom
              sx={{
                fontSize: { md: '2.5rem', lg: '3rem' },
                mb: 3,
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
              }}
            >
              <span style={{ color: alpha('#fff', 0.9) }}>Data</span>
              <span style={{ fontWeight: 300 }}> Steward Console</span>
            </Typography>
            <Typography variant="h6" sx={{ 
              mb: 4, 
              maxWidth: '500px',
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
              transition: 'opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s',
            }}>
              Streamline your data management workflow with our powerful platform
            </Typography>
            
            <Box sx={{ 
              mt: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
              transition: 'opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s',
            }}>
              {/* <Typography variant="body1" fontWeight="medium">
                Key Features:
              </Typography> */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                  <Typography variant="body2">Advanced data record management</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                  <Typography variant="body2">Streamlined approval workflows</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                  <Typography variant="body2">Comprehensive analytics and reporting</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Right side - Login form */}
      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        width: '100%',
        height: '100%',
      }}>
        <Box sx={{ 
          maxWidth: '450px', 
          width: '100%', 
          mx: 'auto',
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        }}>
          <Paper 
            elevation={isMobile ? 2 : 0} 
            sx={{ 
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: isMobile ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Logo and title for mobile */}
            {isMobile && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  <LockIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" component="h1" fontWeight="bold">
                  <span style={{ color: theme.palette.primary.main }}>Data</span>
                  <span style={{ fontWeight: 300 }}>Steward</span>
                </Typography>
              </Box>
            )}
            
            {/* Desktop title */}
            {!isMobile && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your account to continue
                </Typography>
              </Box>
            )}
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 1,
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
              >
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  }
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                <Link href="/auth/forgot-password" passHref legacyBehavior>
                  <MuiLink 
                    variant="body2" 
                    underline="hover"
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      '&:hover': {
                        color: theme.palette.primary.dark
                      }
                    }}
                  >
                    Forgot password?
                  </MuiLink>
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2, 
                  mb: 3, 
                  py: 1.5,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon />}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
              
              <Divider sx={{ 
                my: 3,
                '&::before, &::after': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                }
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  Quick Access
                </Typography>
              </Divider>
              
              <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                Demo accounts for testing:
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mt: 2
              }}>
                {demoCredentials.map((cred) => (
                  <Button
                    key={cred.role}
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickLogin(cred.email, cred.password)}
                    disabled={loading}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 1.5,
                      justifyContent: 'flex-start',
                      borderColor: alpha(theme.palette.divider, 0.5),
                      color: theme.palette.text.primary,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    {cred.role}
                  </Button>
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
