import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  CompareArrows as CompareIcon,
  Approval as ApprovalIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Storage as DataIcon,
  Group as UserIcon,
  Analytics as AnalyticsIcon,
  PublishedWithChanges as FeedbackIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useState } from 'react';

interface SidebarProps {
  open: boolean;
}

interface NavItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  requiredRoles?: UserRole[];
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    records: true,
  });

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      title: 'Data Records',
      icon: <DataIcon />,
      children: [
        {
          title: 'All Records',
          icon: <DescriptionIcon />,
          path: '/records',
        },
        {
          title: 'Pending Review',
          icon: <ApprovalIcon />,
          path: '/records/pending',
        },
        {
          title: 'Approved',
          icon: <ApprovalIcon />,
          path: '/records/approved',
        },
        {
          title: 'Rejected',
          icon: <ApprovalIcon />,
          path: '/records/rejected',
        },
      ],
    },
    {
      title: 'Data Comparison',
      icon: <CompareIcon />,
      path: '/comparison',
    },
    {
      title: 'Approval Workflow',
      icon: <ApprovalIcon />,
      path: '/approval',
      requiredRoles: [UserRole.ADMIN, UserRole.DATA_STEWARD, UserRole.DYNPRO_TEAM_MEMBER],
    },
    {
      title: 'AI Feedback',
      icon: <FeedbackIcon />,
      path: '/feedback',
      requiredRoles: [UserRole.ADMIN, UserRole.DATA_STEWARD],
    },
    {
      title: 'Export Data',
      icon: <ExportIcon />,
      path: '/export',
    },
    {
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      requiredRoles: [UserRole.ADMIN, UserRole.DATA_STEWARD],
    },
    {
      title: 'Administration',
      icon: <SettingsIcon />,
      requiredRoles: [UserRole.ADMIN],
      children: [
        {
          title: 'User Management',
          icon: <UserIcon />,
          path: '/settings/users',
          requiredRoles: [UserRole.ADMIN],
        },
        {
          title: 'Settings',
          icon: <SettingsIcon />,
          path: '/settings',
        },
      ],
    },
  ];

  const toggleExpand = (item: string) => {
    setExpandedItems({
      ...expandedItems,
      [item]: !expandedItems[item],
    });
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item, index) => {
      // Skip items the user doesn't have permission for
      if (item.requiredRoles && !hasPermission(item.requiredRoles)) {
        return null;
      }

      const isActive = item.path ? router.pathname === item.path : false;
      const isParentOfActive = item.children
        ? item.children.some((child) => router.pathname === child.path)
        : false;
      const isExpanded = expandedItems[item.title.toLowerCase()] || isParentOfActive;

      const listItemProps = {
        button: true as const,
        onClick: item.path
          ? () => router.push(item.path!)
          : () => toggleExpand(item.title.toLowerCase()),
        selected: isActive,
        sx: {
          pl: level * 2 + 2,
          py: 1,
          color: isActive ? 'primary.main' : 'inherit',
          '&.Mui-selected': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(14, 165, 233, 0.2)'
                : 'rgba(14, 165, 233, 0.1)',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(14, 165, 233, 0.3)'
                  : 'rgba(14, 165, 233, 0.2)',
            },
          },
          '&:hover': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
          },
        },
      };

      const listItem = (
        <React.Fragment key={index}>
          <ListItem {...listItemProps}>
            <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontWeight: isActive ? 'medium' : 'normal',
              }}
            />
            {item.children && (expandedItems[item.title.toLowerCase()] ? <ExpandLess /> : <ExpandMore />)}
          </ListItem>
          
          {item.children && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNavItems(item.children, level + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
      
      return listItem;
    });
  };

  const drawer = (
    <div className="h-full flex flex-col">
      <Box
        sx={{
          py: 2,
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          height: 64,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            width: 40,
            height: 40,
            backgroundColor: 'primary.main',
            color: 'white',
            mr: 1,
            fontWeight: 'bold',
          }}
        >
          DS
        </Box>
        <Box sx={{ typography: 'h6', fontWeight: 'bold' }}>
          <span className="text-primary-600">Data</span>
          <span className="font-light">Steward</span>
        </Box>
      </Box>
      
      <List component="nav" sx={{ width: '100%', mt: 1, overflowY: 'auto', flex: 1 }}>
        {renderNavItems(navItems)}
      </List>
      
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Data Steward UI v0.1
        </div>
      </Box>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: open ? 240 : 0 },
        flexShrink: 0,
        transition: 'width 0.2s',
      }}
    >
      <Drawer
        variant="temporary"
        open={open}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
