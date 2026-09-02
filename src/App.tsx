import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/common/Toast';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { PublicMenu } from './components/menu/PublicMenu';
import { getPublicRestaurantSlug, getTableNumberFromUrl, RESERVED_ROUTES } from './services/restaurantUrl';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  
  // Extract initial path from pathname or hash
  const getCurrentLocationPath = useCallback((): string => {
    if (typeof window === 'undefined') return '/';
    
    // Check old hash for backward compatibility (e.g. #/r/bm-lanches)
    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('r/')) {
        const slug = hash.replace(/^r\//, '').split('?')[0];
        if (slug) {
          try {
            window.history.replaceState(null, '', `/${slug}${window.location.search}`);
          } catch {
            // ignore
          }
          return `/${slug}`;
        }
      }
      if (hash && !hash.startsWith('/')) {
        return `/${hash}`;
      }
      if (hash) {
        return hash;
      }
    }

    const path = window.location.pathname;
    return path && path !== '' ? path : '/';
  }, []);

  const [currentRoute, setCurrentRoute] = useState<string>(getCurrentLocationPath());

  // Listen to popstate and hashchange changes (browser back/forward & direct links)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getCurrentLocationPath());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [getCurrentLocationPath]);

  const navigate = (route: string) => {
    const cleanRoute = route.startsWith('/') ? route : `/${route}`;
    try {
      window.history.pushState(null, '', cleanRoute);
    } catch {
      // fallback
    }
    setCurrentRoute(cleanRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando MenuZap...</p>
        </div>
      </div>
    );
  }

  // 1. Reserved System Routes: Login
  if (currentRoute === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  // 2. Reserved System Routes: Register
  if (currentRoute === '/cadastro' || currentRoute === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }

  // 3. Reserved System Routes: Onboarding
  if (currentRoute === '/onboarding') {
    return <OnboardingWizard onNavigate={navigate} />;
  }

  // 4. Reserved System Routes: Dashboard
  if (currentRoute.startsWith('/dashboard')) {
    if (!currentUser) {
      return <LoginPage onNavigate={navigate} />;
    }
    return <DashboardLayout onNavigate={navigate} />;
  }

  // 5. Public Restaurant Menu (any non-reserved pathname like /bm-lanches, /pizza-do-joao)
  const publicSlug = getPublicRestaurantSlug(currentRoute) || getPublicRestaurantSlug();
  if (publicSlug && !RESERVED_ROUTES.has(publicSlug)) {
    const tableNumber = getTableNumberFromUrl(currentRoute) || getTableNumberFromUrl();

    return (
      <CartProvider restaurantSlug={publicSlug}>
        <PublicMenu 
          key={publicSlug} 
          slug={publicSlug} 
          tableNumber={tableNumber} 
          onNavigate={navigate} 
        />
      </CartProvider>
    );
  }

  // 6. Default Landing Page for '/'
  return <LandingPage onNavigate={navigate} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
