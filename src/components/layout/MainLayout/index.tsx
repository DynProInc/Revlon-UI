import React, { ReactNode, useState, useEffect, memo, useCallback, useMemo, Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, useMediaQuery, useTheme, alpha } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import NotificationContainer from '@/components/common/Notification';

// Dynamically import components with code splitting and optimized loading
const Header = dynamic(() => import('@/components/layout/Header'), {
  ssr: false,
  loading: () => <Box sx={{ height: 64, backgroundColor: 'background.paper', boxShadow: 1 }} />,
  // Higher priority loading
  suspense: true
});

const Footer = dynamic(() => import('@/components/layout/Footer'), {
  ssr: false,
  // Lower priority loading since footer is less critical
  suspense: true
});

const CollapsibleSidebar = dynamic(() => import('@/components/layout/CollapsibleSidebar'), {
  ssr: false,
  loading: () => <Box sx={{ width: 64, backgroundColor: 'background.paper' }} />,
  // Higher priority loading
  suspense: true
});

interface MainLayoutProps {
  children: ReactNode;
  /**
   * Set to true to disable the sidebar in a specific page
   */
  noSidebar?: boolean;
}

// Create a memoized version of the main content area for better performance
const MainContent = memo(({ children }: { children: ReactNode }) => {
  return (
    <Box className="main-content-wrapper" sx={{ width: '100%', height: '100%' }}>
      <NotificationContainer />
      {children}
    </Box>
  );
});

MainContent.displayName = 'MainContent';

const MainLayout: React.FC<MainLayoutProps> = ({ children, noSidebar = false }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Public routes that don't require auth
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const isPublicRoute = publicRoutes.includes(router.pathname);
  
  // IMPORTANT: Declare ALL useMemo hooks at the top level, before any conditional returns
  // Calculate sidebar width for smooth transitions - memoized to prevent recalculation
  const sidebarWidth = useMemo(() => sidebarCollapsed ? 64 : 240, [sidebarCollapsed]);

  // Memoize style objects to prevent recreation on every render
  const mainBoxStyle = useMemo(() => ({
    display: 'flex', 
    flexDirection: 'column', 
    height: '100vh',
    maxWidth: '100vw',
    overflow: 'hidden'
  }), []);
  
  // Memoize all style objects used in the component
  const headerBoxStyle = useMemo(() => ({ 
    position: 'sticky',
    top: 0,
    zIndex: 1200,
    width: '100%',
    boxShadow: 2
  }), []);
  
  const contentBoxStyle = useMemo(() => ({ 
    display: 'flex', 
    flex: 1,
    height: 'calc(100vh - 64px)', // Subtract header height
    overflow: 'hidden'
  }), []);
  
  const sidebarBoxStyle = useMemo(() => ({
    width: sidebarWidth,
    flexShrink: 0,
    position: 'sticky',
    height: '100%',
    top: 64, // Header height
    left: 0,
    zIndex: 1100,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
    boxShadow: 1,
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
  }), [sidebarWidth, theme.transitions, theme.palette.divider]);
  
  const mainContentStyle = useMemo(() => ({
    flexGrow: 1,
    p: { xs: 2, sm: 3 },
    width: '100%',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.standard,
    }),
    marginLeft: { xs: 0, md: !noSidebar ? 0 : 0 },
    backgroundColor: 'background.default',
    height: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    overflowY: 'auto'
  }), [theme.transitions, noSidebar]);
  
  const loadingBoxStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%'
  }), []);
  
  const publicLayoutStyle = useMemo(() => ({
    minHeight: '100vh',
    backgroundColor: 'background.default',
    display: 'flex',
    flexDirection: 'column'
  }), []);
  
  const publicContentStyle = useMemo(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 6,
    px: { xs: 2, sm: 3, md: 4 }
  }), []);
  
  // Handle sidebar collapsed state from CollapsibleSidebar component - memoized to prevent recreation
  const handleSidebarCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);
  
  // Effect to collapse sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Memoize the toggle function to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prevState => !prevState);
  }, []);
  
  // Prefetch pages for faster navigation
  useEffect(() => {
    // Prefetch main pages that are likely to be accessed
    const pagesToPrefetch = [
      '/dashboard',
      '/records',
      '/comparison',
      '/analytics',
      '/approval',
      '/export',
      '/feedback',
      '/settings'
    ];
    
    // Use Next.js router to prefetch these pages
    pagesToPrefetch.forEach(path => {
      router.prefetch(path);
    });
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <Box sx={loadingBoxStyle}>
        <CircularProgress size={40} thickness={4} color="primary" />
      </Box>
    );
  }

  // Public layout (login, register, etc.)
  if (!isAuthenticated && !isPublicRoute) {
    // Redirect to login if not authenticated and not on a public route
    router.push('/auth/login');
    return null;
  }

  if (isPublicRoute) {
    return (
      <Box sx={publicLayoutStyle}>
        <NotificationContainer />
        <Box sx={publicContentStyle}>
          <Suspense fallback={<CircularProgress size={30} />}>
            {children}
          </Suspense>
        </Box>
        <Footer />
      </Box>
    );
  }
  
  // Main authenticated layout with fixed positioning for header and sidebar
  return (
    <Box sx={mainBoxStyle}>
      {/* Fixed header */}
      <Box sx={headerBoxStyle}>
        <Header toggleSidebar={toggleSidebar} />
      </Box>
      
      {/* Content area with sidebar and main content */}
      <Box sx={contentBoxStyle}>
        {/* Sticky sidebar */}
        {!noSidebar && (
          <Box sx={sidebarBoxStyle}>
            <CollapsibleSidebar onToggleCollapse={handleSidebarCollapse} />
          </Box>
        )}
        
        {/* Scrollable main content */}
        <Box
          component="main"
          sx={mainContentStyle}
        >
          <Suspense fallback={<CircularProgress size={30} />}>
            <MainContent>
              {children}
            </MainContent>
          </Suspense>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
