import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * A custom hook that prefetches specified routes to improve navigation performance
 * @param routes Array of routes to prefetch
 * @param dependencies Additional dependencies that should trigger re-prefetching
 */
export function useRoutePrefetch(
  routes: string[],
  dependencies: any[] = []
): void {
  const router = useRouter();

  useEffect(() => {
    // Prefetch all specified routes
    routes.forEach((route) => {
      // Skip the current route to avoid unnecessary prefetching
      if (router.pathname !== route) {
        router.prefetch(route);
      }
    });
  }, [router, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Prefetch all main application routes
 * Use this in the sidebar or main layout to ensure fast navigation
 */
export function usePrefetchMainRoutes(): void {
  const mainRoutes = [
    '/dashboard',
    '/records',
    '/comparison',
    '/analytics',
    '/approval',
    '/export',
    '/feedback',
    '/settings',
    '/audit',
    '/users',
  ];

  useRoutePrefetch(mainRoutes);
}

export default usePrefetchMainRoutes;
