import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/common/Toast';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { PublicMenu } from './components/menu/PublicMenu';
import { getRestaurantSlugFromUrl, getTableNumberFromUrl } from './services/restaurantUrl';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  
  // Parse initial route from hash or pathname
  const getInitialRoute = (): string => {
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        return window.location.hash.replace(/^#/, '');
      }
      const path = window.location.pathname;
      return path && path !== '/' ? path : '/';
    }
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute());

  // Listen to hash and popstate changes
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        setCurrentRoute(hash);
      } else {
        const path = window.location.pathname;
        setCurrentRoute(path && path !== '/' ? path : '/');
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
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

  // 1. /r/:slug (Public menu for any restaurant slug)
  const publicSlug = getRestaurantSlugFromUrl(currentRoute);
  if (publicSlug) {
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

  // 2. /login
  if (currentRoute === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  // 3. /cadastro or /register
  if (currentRoute === '/cadastro' || currentRoute === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }

  // 4. /onboarding
  if (currentRoute === '/onboarding') {
    return <OnboardingWizard onNavigate={navigate} />;
  }

  // 5. /dashboard
  if (currentRoute.startsWith('/dashboard')) {
    if (!currentUser) {
      return <LoginPage onNavigate={navigate} />;
    }
    return <DashboardLayout onNavigate={navigate} />;
  }

  // Default: Landing Page
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
