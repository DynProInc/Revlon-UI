import '@/styles/globals.css';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useContext, useMemo, memo } from 'react';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ThemeProvider, ThemeContext } from '@/context/ThemeContext';
import { usePrefetchMainRoutes } from '@/hooks/useRoutePrefetch';

// Dynamically import MainLayout with optimized loading
const MainLayout = dynamic(() => import('@/components/layout/MainLayout'), {
  ssr: true,
  suspense: true,
});

// Create a client for React Query with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // Increased stale time for better caching
      cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
    },
  },
});

// Define the AppContent component type for proper typing
type AppContentProps = AppProps;

// Memoize the AppContent component to prevent unnecessary re-renders
const AppContent = memo(function AppContent({ Component, pageProps }: AppContentProps) {
  const { darkMode } = useContext(ThemeContext);
  
  // Prefetch main routes for faster navigation
  usePrefetchMainRoutes();
  
  // Create theme based on dark mode preference - memoized to prevent recreation on each render
  const theme: Theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#E4002B', // Revlon red
        dark: '#B8001F', // Darker red for hover states
        light: '#FF4D6D', // Lighter red for backgrounds
        contrastText: '#FFFFFF', // White text on red background
      },
      secondary: {
        main: '#000000', // Revlon black
        light: '#333333', // Dark gray
        dark: '#000000', // Black
        contrastText: '#FFFFFF', // White text on black background
      },
      error: {
        main: '#E4002B', // Using Revlon red for error as well
      },
      warning: {
        main: '#FF9800', // Orange for warnings
      },
      success: {
        main: '#4CAF50', // Green for success
      },
      background: {
        default: '#FFFFFF', // White background
        paper: '#F5F5F5', // Light gray for paper elements
      },
      text: {
        primary: '#000000', // Black text
        secondary: '#333333', // Dark gray text
      },
    },
    // Optimize component defaults for better performance
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: false, // Keep ripple but optimize it
        },
      },
      MuiList: {
        defaultProps: {
          dense: true, // Use dense lists for better performance
        },
      },
    },
  }), [darkMode]);
  
  // Check if route is login or other auth pages - memoized to prevent recalculation
  const isAuthPage = useMemo(() => {
    return Component.displayName === 'Login' || 
           (pageProps.router?.pathname && pageProps.router.pathname.startsWith('/auth/'));
  }, [Component.displayName, pageProps.router?.pathname]);
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthPage ? (
        <Component {...pageProps} />
      ) : (
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      )}
    </MuiThemeProvider>
  );
});

export default function App(props: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <AppContent {...props} />
          </QueryClientProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
