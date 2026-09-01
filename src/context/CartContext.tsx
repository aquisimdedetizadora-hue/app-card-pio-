import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, RestaurantSettings } from '../types';

interface CartContextType {
  items: CartItem[];
  restaurantSlug: string | null;
  setRestaurantSlug: (slug: string) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  totalItemsCount: number;
  subtotal: number;
  calculateTotal: (restaurantSettings: RestaurantSettings, orderType: 'delivery' | 'pickup' | 'dine_in') => {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_PREFIX = 'menuzap_cart_';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantSlug, setRestaurantSlugState] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart when restaurant slug changes
  const setRestaurantSlug = (slug: string) => {
    setRestaurantSlugState(slug);
    try {
      const stored = localStorage.getItem(`${CART_STORAGE_PREFIX}${slug}`);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  };

  // Save cart when items change
  useEffect(() => {
    if (restaurantSlug) {
      try {
        localStorage.setItem(`${CART_STORAGE_PREFIX}${restaurantSlug}`, JSON.stringify(items));
      } catch (e) {
        console.error('Error saving cart to storage:', e);
      }
    }
  }, [items, restaurantSlug]);

  const addItem = (itemData: CartItem) => {
    const id = itemData.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Check if identical item already exists (same product, same variant, same addons, same observations)
    const existingIndex = items.findIndex(i => {
      const sameProduct = i.productId === itemData.productId;
      const sameVariant = (i.variantId || '') === (itemData.variantId || '');
      const sameObs = (i.observations || '').trim() === (itemData.observations || '').trim();
      const sameAddons = JSON.stringify(i.addons || []) === JSON.stringify(itemData.addons || []);
      return sameProduct && sameVariant && sameObs && sameAddons;
    });

    if (existingIndex >= 0) {
      const updated = [...items];
      const existing = updated[existingIndex];
      const newQty = existing.quantity + itemData.quantity;
      const unitPrice = existing.totalPrice / existing.quantity;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: unitPrice * newQty,
      };
      setItems(updated);
    } else {
      setItems(prev => [...prev, { ...itemData, id }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const unitPrice = item.totalPrice / item.quantity;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: unitPrice * newQuantity,
          };
        }
        return item;
      });
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    if (restaurantSlug) {
      localStorage.removeItem(`${CART_STORAGE_PREFIX}${restaurantSlug}`);
    }
  };

  const totalCount = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  }, [items]);

  const calculateTotal = (restaurantSettings: RestaurantSettings, orderType: 'delivery' | 'pickup' | 'dine_in') => {
    let deliveryFee = 0;
    if (orderType === 'delivery' && restaurantSettings.delivery.enabled) {
      if (restaurantSettings.delivery.feeType === 'fixed') {
        deliveryFee = restaurantSettings.delivery.fixedFee || 0;
      } else if (restaurantSettings.delivery.feeType === 'free') {
        deliveryFee = 0;
      }
    }
    const grandTotal = subtotal + deliveryFee;
    return {
      subtotal,
      deliveryFee,
      total: grandTotal,
    };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantSlug,
        setRestaurantSlug,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        totalItemsCount: totalCount,
        subtotal,
        calculateTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
