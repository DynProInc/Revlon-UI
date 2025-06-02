import React, { useState, useCallback, memo } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip,
  Badge,
  useTheme as useMuiTheme,
  alpha,
  Divider,
  Button,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/router';

interface HeaderProps {
  toggleSidebar: () => void;
}

// Memoized notification item for better performance
const NotificationItem = memo(({ title, time, onClick }: { title: string; time: string; onClick: () => void }) => (
  <MenuItem onClick={onClick} sx={{ py: 1, px: 2 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {time}
      </Typography>
    </Box>
  </MenuItem>
));

NotificationItem.displayName = 'NotificationItem';

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  
  const handleNotificationOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  }, []);
  
  const handleNotificationClose = useCallback(() => {
    setNotificationAnchorEl(null);
  }, []);
  
  const handleSearchOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSearchAnchorEl(event.currentTarget);
  }, []);
  
  const handleSearchClose = useCallback(() => {
    setSearchAnchorEl(null);
  }, []);
  
  const handleProfile = useCallback(() => {
    router.push('/settings/profile');
    handleMenuClose();
  }, [router, handleMenuClose]);
  
  const handleLogout = useCallback(() => {
    logout();
    handleMenuClose();
  }, [logout, handleMenuClose]);
  
  const handleViewAllNotifications = useCallback(() => {
    handleNotificationClose();
    router.push('/notifications');
  }, [handleNotificationClose, router]);
  
  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0}
      sx={{ 
        backgroundColor: darkMode ? alpha(muiTheme.palette.background.default, 0.9) : alpha(muiTheme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        color: darkMode ? muiTheme.palette.text.primary : muiTheme.palette.text.primary,
        borderBottom: `1px solid ${alpha(muiTheme.palette.divider, 0.7)}`,
        zIndex: muiTheme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleSidebar}
          sx={{ 
            mr: 2,
            color: muiTheme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            color: muiTheme.palette.primary.main,
            letterSpacing: '0.02em',
          }}
        >
          <span style={{ fontWeight: 700, color: muiTheme.palette.primary.main }}>Data</span>
          <span style={{ fontWeight: 300 }}>Steward</span>
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1}>
          {!isMobile && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<SearchIcon />}
              onClick={handleSearchOpen}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                mr: 1,
                borderColor: alpha(muiTheme.palette.primary.main, 0.5),
                '&:hover': {
                  borderColor: muiTheme.palette.primary.main,
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.04),
                },
              }}
            >
              Quick search
            </Button>
          )}
          
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton 
              color="inherit" 
              onClick={toggleTheme} 
              sx={{ 
                color: darkMode ? muiTheme.palette.primary.light : muiTheme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
                }
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Help & Resources">
            <IconButton 
              color="inherit" 
              sx={{ 
                color: muiTheme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
                }
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationOpen}
              sx={{ 
                color: muiTheme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
                }
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                width: 320,
                maxHeight: 480,
                overflow: 'auto',
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                },
              },
            }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle1" fontWeight="600">
                Notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You have 3 unread notifications
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <NotificationItem 
              title="New record needs approval" 
              time="2 minutes ago" 
              onClick={handleNotificationClose} 
            />
            
            <NotificationItem 
              title="AI model training complete" 
              time="1 hour ago" 
              onClick={handleNotificationClose} 
            />
            
            <NotificationItem 
              title="Your feedback was processed" 
              time="3 hours ago" 
              onClick={handleNotificationClose} 
            />
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button 
                size="small" 
                onClick={handleViewAllNotifications}
                sx={{ textTransform: 'none' }}
              >
                View all notifications
              </Button>
            </Box>
          </Menu>
          
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ 
                  ml: 1,
                  border: `1px solid ${alpha(muiTheme.palette.divider, 0.5)}`,
                  p: 0.5,
                }}
                aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
              >
                <Avatar 
                  alt={user?.name || "User"} 
                  src={user?.avatar}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: muiTheme.palette.primary.main,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              width: 250,
              overflow: 'visible',
              mt: 1.5,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
          
          <Divider />
          
          <MenuItem onClick={handleProfile} sx={{ mt: 1 }}>
            Profile
          </MenuItem>
          
          <MenuItem onClick={() => {
            router.push('/settings');
            handleMenuClose();
          }}>
            Settings
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout} sx={{ color: muiTheme.palette.error.main }}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
