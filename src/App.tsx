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

function AppContent() {
  const { currentUser, currentRestaurant, isLoading } = useAuth();
  
  // Parse initial route from pathname or hash
  const getInitialRoute = (): string => {
    if (window.location.hash) {
      return window.location.hash.replace(/^#/, '');
    }
    const path = window.location.pathname;
    return path && path !== '/' ? path : '/';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute());

  // Listen to hash / popstate changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        setCurrentRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
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

  // Route matching:
  // 1. /r/:slug (Public menu)
  const menuMatch = currentRoute.match(/^\/r\/([^\/?#]+)/);
  if (menuMatch) {
    const slug = menuMatch[1];
    // Extract query params for table / mesa if any
    const urlParams = new URLSearchParams(window.location.search || (currentRoute.includes('?') ? currentRoute.split('?')[1] : ''));
    const tableNumber = urlParams.get('mesa') || urlParams.get('table') || undefined;

    return (
      <CartProvider restaurantSlug={slug}>
        <PublicMenu slug={slug} tableNumber={tableNumber} onNavigate={navigate} />
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
