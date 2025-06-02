import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  IconButton,
  Collapse,
  Typography,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  Compare as CompareIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  FileDownload as ExportIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Feedback as FeedbackIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

// Define menu item type
interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredRoles?: string[];
  submenu?: Omit<MenuItem, 'submenu'>[];
  shortcutKey?: string;
}

interface CollapsibleSidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void;
}

// Memoized menu item component with optimized rendering
const SidebarMenuItem = memo(({ 
  item, 
  collapsed, 
  active, 
  hasSubmenu, 
  submenuOpen, 
  onItemClick, 
  onSubmenuToggle 
}: { 
  item: MenuItem; 
  collapsed: boolean; 
  active: boolean; 
  hasSubmenu: boolean; 
  submenuOpen: boolean; 
  onItemClick: () => void; 
  onSubmenuToggle: () => void; 
}) => {
  const theme = useTheme();
  
  // Memoize style objects to prevent recreation on every render
  const buttonSx = useMemo(() => ({
    minHeight: 48,
    px: 2.5,
    mb: 0.5,
    justifyContent: collapsed ? 'center' : 'initial',
    borderRadius: '8px',
    mx: 1,
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
    color: active ? theme.palette.primary.main : 'inherit',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  }), [collapsed, active, theme.palette.primary.main]);
  
  const iconSx = useMemo(() => ({
    minWidth: 0,
    mr: collapsed ? 'auto' : 3,
    justifyContent: 'center',
    color: active ? theme.palette.primary.main : 'inherit',
  }), [collapsed, active, theme.palette.primary.main]);
  
  const typographyProps = useMemo(() => ({
    fontSize: 14,
    fontWeight: active ? 600 : 400,
  }), [active]);
  
  // Optimized click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (hasSubmenu) {
      onSubmenuToggle();
    } else {
      onItemClick();
    }
  }, [hasSubmenu, onItemClick, onSubmenuToggle]);
  
  return (
    <ListItemButton
      onClick={handleClick}
      sx={buttonSx}
      disableRipple={false}
    >
      <ListItemIcon sx={iconSx}>
        {item.icon}
      </ListItemIcon>
      {!collapsed && (
        <>
          <ListItemText 
            primary={item.title} 
            primaryTypographyProps={typographyProps}
          />
          {hasSubmenu && (submenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
        </>
      )}
    </ListItemButton>
  );
});

SidebarMenuItem.displayName = 'SidebarMenuItem';

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ onToggleCollapse }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Effect to set collapsed state on mobile by default
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);
  
  // Effect to recover user preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setCollapsed(savedState === 'true');
      }
    }
  }, []);
  
  // Save preference when state changes and notify parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    }
    if (onToggleCollapse) {
      onToggleCollapse(collapsed);
    }
  }, [collapsed, onToggleCollapse]);
  
  // Removed keyboard shortcuts for better performance
  
  // Toggle sidebar collapse state - memoized to prevent recreation on each render
  const toggleCollapse = useCallback(() => {
    setCollapsed(prevState => !prevState);
  }, []);
  
  // Toggle submenu open/close - memoized to prevent recreation on each render
  const toggleSubmenu = useCallback((title: string) => {
    setOpenSubmenu(prevSubmenu => prevSubmenu === title ? null : title);
  }, []);
  
  // Define menu items with shortcut keys - memoized to prevent unnecessary re-renders
  // This is critically important as menu structure shouldn't change between renders
  const menuItems: MenuItem[] = useMemo(() => [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      shortcutKey: 'd'
    },
    {
      title: 'Records',
      path: '/records',
      icon: <ListIcon />,
      shortcutKey: 'r',
      submenu: [
        {
          title: 'All Records',
          path: '/records',
          icon: <ListIcon />
        },
        {
          title: 'Pending Approval',
          path: '/records?status=pending',
          icon: <AssignmentIcon />
        },
        {
          title: 'Approved',
          path: '/records?status=approved',
          icon: <AssignmentIcon />
        },
        {
          title: 'Rejected',
          path: '/records?status=rejected',
          icon: <AssignmentIcon />
        }
      ]
    },
    // {
    //   title: 'Comparison',
    //   path: '/comparison',
    //   icon: <CompareIcon />,
    //   shortcutKey: 'c'
    // },
    {
      title: 'Approval Queue',
      path: '/approval',
      icon: <AssignmentIcon />,
      requiredRoles: ['ADMIN', 'DATA_STEWARD', 'DYNPRO_TEAM_MEMBER'],
      shortcutKey: 'a'
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: <AnalyticsIcon />,
      requiredRoles: ['ADMIN', 'DATA_STEWARD'],
      shortcutKey: 'n'
    },
    {
      title: 'Export',
      path: '/export',
      icon: <ExportIcon />,
      shortcutKey: 'e'
    },
    {
      title: 'Audit Trail',
      path: '/audit',
      icon: <HistoryIcon />,
      requiredRoles: ['ADMIN', 'DATA_STEWARD'],
      shortcutKey: 't'
    },
    {
      title: 'Feedback',
      path: '/feedback',
      icon: <FeedbackIcon />,
      shortcutKey: 'f'
    },
    {
      title: 'User Management',
      path: '/users',
      icon: <PeopleIcon />,
      requiredRoles: ['ADMIN'],
      shortcutKey: 'u'
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <SettingsIcon />,
      shortcutKey: 's'
    }
  ], []);
  
  // Function to check if a menu item should be displayed based on user role
  const shouldShowMenuItem = (item: MenuItem): boolean => {
    // Always return true since we're showing all items
    return true;
  };
  
  // Check if a path is active (current page)
  const isActivePath = (path: string): boolean => {
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };
  
  // Handle menu item click
  const handleMenuItemClick = (path: string) => {
    router.push(path);
  };
  
  return (
    <Box
      sx={{
        width: collapsed ? 64 : 240,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: '4px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <IconButton onClick={toggleCollapse} size="small">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      <List component="nav" sx={{ px: 1, py: 1 }}>
        {menuItems.map((item) => {
          // Skip items that shouldn't be shown based on user role
          if (shouldShowMenuItem(item) === false) return null;
          
          const isActive = isActivePath(item.path);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuOpen = openSubmenu === item.title;
          
          return (
            <React.Fragment key={item.title}>
              {collapsed ? (
                <Tooltip title={item.title} placement="right">
                  <ListItemButton
                    onClick={() => handleMenuItemClick(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'center',
                      px: 2.5,
                      mb: 1,
                      borderRadius: '8px',
                      backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      color: isActive ? theme.palette.primary.main : 'inherit',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 'auto',
                        justifyContent: 'center',
                        color: isActive ? theme.palette.primary.main : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ) : (
                <>
                  <SidebarMenuItem
                    item={item}
                    collapsed={collapsed}
                    active={isActive}
                    hasSubmenu={!!hasSubmenu}
                    submenuOpen={isSubmenuOpen}
                    onItemClick={() => handleMenuItemClick(item.path)}
                    onSubmenuToggle={() => toggleSubmenu(item.title)}
                  />
                  
                  {hasSubmenu && (
                    <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.submenu!.map((subItem) => {
                          const isSubItemActive = router.asPath === subItem.path;
                          
                          return (
                            <ListItemButton
                              key={subItem.title}
                              onClick={() => handleMenuItemClick(subItem.path)}
                              sx={{
                                pl: 4,
                                py: 1,
                                ml: 2,
                                borderRadius: '8px',
                                backgroundColor: isSubItemActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                color: isSubItemActive ? theme.palette.primary.main : 'inherit',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: 2,
                                  color: isSubItemActive ? theme.palette.primary.main : 'inherit',
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.title}
                                primaryTypographyProps={{
                                  fontSize: 13,
                                  fontWeight: isSubItemActive ? 600 : 400,
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default CollapsibleSidebar;
