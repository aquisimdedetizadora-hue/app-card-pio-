import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Restaurant } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  currentRestaurant: Restaurant | null;
  allRestaurants: Restaurant[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (restaurantSlug?: string) => void;
  register: (name: string, restaurantName: string, email: string, pass: string, phone: string) => Promise<{ success: boolean; error?: string; restaurantId?: string }>;
  logout: () => void;
  switchRestaurant: (restaurantId: string) => void;
  updateCurrentRestaurant: (updated: Restaurant) => void;
  refreshState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);

  const loadState = useCallback(() => {
    const users = StorageService.getUsers();
    const restaurants = StorageService.getRestaurants();
    setAllRestaurants(restaurants);

    const currentUserId = StorageService.getCurrentUserId();
    if (currentUserId) {
      const user = users.find(u => u.id === currentUserId) || null;
      setCurrentUser(user);
      if (user && user.activeRestaurantId) {
        const rest = restaurants.find(r => r.id === user.activeRestaurantId) || restaurants[0] || null;
        setCurrentRestaurant(rest);
      } else if (restaurants.length > 0) {
        setCurrentRestaurant(restaurants[0]);
      } else {
        setCurrentRestaurant(null);
      }
    } else {
      setCurrentUser(null);
      setCurrentRestaurant(null);
    }
  }, []);

  useEffect(() => {
    loadState();
    const handleStorageUpdate = () => {
      loadState();
    };
    window.addEventListener('menuzap_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('menuzap_storage_update', handleStorageUpdate);
  }, [loadState]);

  const login = async (email: string, _pass: string) => {
    const users = StorageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      StorageService.setCurrentUserId(user.id);
      loadState();
      return { success: true };
    }
    return { success: false, error: 'Usuário não encontrado. Verifique seu e-mail ou utilize o login de demonstração.' };
  };

  const loginAsDemo = (restaurantSlug?: string) => {
    const restaurants = StorageService.getRestaurants();
    const targetRest = restaurantSlug
      ? restaurants.find(r => r.settings.slug === restaurantSlug) || restaurants[0]
      : restaurants[0];

    const users = StorageService.getUsers();
    const user = users.find(u => u.id === targetRest?.ownerId) || users[0];

    if (user && targetRest) {
      const updatedUser = { ...user, activeRestaurantId: targetRest.id };
      StorageService.saveUser(updatedUser);
      StorageService.setCurrentUserId(updatedUser.id);
      loadState();
    }
  };

  const register = async (name: string, restaurantName: string, email: string, _pass: string, phone: string) => {
    const users = StorageService.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Já existe uma conta com este e-mail.' };
    }

    const newUserId = `user-${Date.now()}`;
    const newRestaurantId = `rest-${Date.now()}`;
    const slug = restaurantName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `rest-${Date.now().toString().slice(-4)}`;

    const newRestaurant: Restaurant = {
      id: newRestaurantId,
      ownerId: newUserId,
      createdAt: new Date().toISOString(),
      settings: {
        name: restaurantName,
        slug: slug,
        category: 'Hamburgueria',
        description: `Bem-vindo ao ${restaurantName}! Peça pelo WhatsApp com rapidez e praticidade.`,
        phone: phone,
        whatsapp: phone.replace(/\D/g, ''),
        address: {
          street: 'Rua Principal',
          number: '100',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        },
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&h=200&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        isOpenManual: true,
        useAutomaticHours: true,
        businessHours: [
          { dayOfWeek: 0, name: 'Domingo', isOpen: true, openTime: '18:00', closeTime: '23:00' },
          { dayOfWeek: 1, name: 'Segunda-feira', isOpen: true, openTime: '18:00', closeTime: '23:00' },
          { dayOfWeek: 2, name: 'Terça-feira', isOpen: true, openTime: '18:00', closeTime: '23:00' },
          { dayOfWeek: 3, name: 'Quarta-feira', isOpen: true, openTime: '18:00', closeTime: '23:00' },
          { dayOfWeek: 4, name: 'Quinta-feira', isOpen: true, openTime: '18:00', closeTime: '23:00' },
          { dayOfWeek: 5, name: 'Sexta-feira', isOpen: true, openTime: '18:00', closeTime: '00:00' },
          { dayOfWeek: 6, name: 'Sábado', isOpen: true, openTime: '18:00', closeTime: '00:00' },
        ],
        delivery: {
          enabled: true,
          feeType: 'fixed',
          fixedFee: 5.0,
          estimatedTimeMin: 30,
          estimatedTimeMax: 50,
          minimumOrderValue: 0,
        },
        pickup: {
          enabled: true,
          estimatedTimeMin: 15,
          estimatedTimeMax: 25,
        },
        dineIn: {
          enabled: true,
        },
        paymentMethods: {
          pix: { enabled: true, keyType: 'telefone', key: phone },
          creditCard: { enabled: true },
          debitCard: { enabled: true },
          cash: { enabled: true, allowChange: true },
          mealVoucher: { enabled: false },
        },
        theme: {
          primaryColor: '#10b981',
          secondaryColor: '#059669',
          backgroundColor: '#020617',
          cardBackgroundColor: '#0f172a',
          textColor: '#f8fafc',
          accentColor: '#34d399',
          buttonColor: '#10b981',
          buttonTextColor: '#020617',
          borderRadius: '16px',
          cardStyle: 'standard',
        },
      },
    };

    const newUser: User = {
      id: newUserId,
      name: name,
      email: email,
      phone: phone,
      restaurantIds: [newRestaurantId],
      activeRestaurantId: newRestaurantId,
    };

    StorageService.saveRestaurant(newRestaurant);
    StorageService.saveUser(newUser);
    StorageService.setCurrentUserId(newUserId);

    loadState();
    return { success: true, restaurantId: newRestaurantId };
  };

  const logout = () => {
    StorageService.setCurrentUserId(null);
    setCurrentUser(null);
    setCurrentRestaurant(null);
  };

  const switchRestaurant = (restaurantId: string) => {
    if (!currentUser) return;
    const rest = allRestaurants.find(r => r.id === restaurantId);
    if (rest) {
      const updatedUser = { ...currentUser, activeRestaurantId: restaurantId };
      StorageService.saveUser(updatedUser);
      setCurrentUser(updatedUser);
      setCurrentRestaurant(rest);
    }
  };

  const updateCurrentRestaurant = (updated: Restaurant) => {
    StorageService.saveRestaurant(updated);
    setCurrentRestaurant(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRestaurant,
        allRestaurants,
        isAuthenticated: !!currentUser,
        login,
        loginAsDemo,
        register,
        logout,
        switchRestaurant,
        updateCurrentRestaurant,
        refreshState: loadState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
