import { Restaurant, Category, Product, AddonGroup, Order, User } from '../types';
import { initialRestaurant, initialCategories, initialProducts, initialAddonGroups, initialOrders } from '../data/initialData';
import { normalizeSlug } from './restaurantUrl';

const STORAGE_KEYS = {
  USERS: 'menuzap_users_v1',
  RESTAURANTS: 'menuzap_restaurants_v1',
  CATEGORIES: 'menuzap_categories_v1',
  PRODUCTS: 'menuzap_products_v1',
  ADDON_GROUPS: 'menuzap_addon_groups_v1',
  ORDERS: 'menuzap_orders_v1',
  CURRENT_USER_ID: 'menuzap_current_user_id_v1',
};

const defaultUser: User = {
  id: 'user-demo-1',
  name: 'Rodrigo Medeiros',
  email: 'contato@burgerhouse.com.br',
  phone: '(11) 98765-4321',
  restaurantIds: ['rest-burger-house'],
  activeRestaurantId: 'rest-burger-house',
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger custom event for reactive tab updates
    window.dispatchEvent(new Event('menuzap_storage_update'));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Helper to safely send background API calls to server without breaking UI if offline
async function apiCall(endpoint: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Initial bootstrap check & server sync
export async function initializeStorage() {
  const existingRestaurants = getFromStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, []);
  if (existingRestaurants.length === 0) {
    setToStorage(STORAGE_KEYS.USERS, [defaultUser]);
    setToStorage(STORAGE_KEYS.RESTAURANTS, [initialRestaurant]);
    setToStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
    setToStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
    setToStorage(STORAGE_KEYS.ADDON_GROUPS, initialAddonGroups);
    setToStorage(STORAGE_KEYS.ORDERS, initialOrders);
    setToStorage(STORAGE_KEYS.CURRENT_USER_ID, defaultUser.id);
  }

  // Bidirectional background sync with server
  try {
    // 1. Fetch server state
    const serverDb = await apiCall('/api/sync');
    if (serverDb && serverDb.restaurants && serverDb.restaurants.length > 0) {
      // Merge server restaurants into local storage
      const localRestaurants = getFromStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, []);
      const mergedRestaurants = [...localRestaurants];

      for (const serverRest of serverDb.restaurants) {
        const idx = mergedRestaurants.findIndex(r => r.id === serverRest.id);
        if (idx >= 0) {
          mergedRestaurants[idx] = serverRest;
        } else {
          mergedRestaurants.push(serverRest);
        }
      }
      setToStorage(STORAGE_KEYS.RESTAURANTS, mergedRestaurants);

      // Merge categories
      if (serverDb.categories) {
        const localCats = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
        const mergedCats = [...localCats];
        for (const cat of serverDb.categories) {
          const idx = mergedCats.findIndex(c => c.id === cat.id);
          if (idx >= 0) mergedCats[idx] = cat;
          else mergedCats.push(cat);
        }
        setToStorage(STORAGE_KEYS.CATEGORIES, mergedCats);
      }

      // Merge products
      if (serverDb.products) {
        const localProds = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
        const mergedProds = [...localProds];
        for (const prod of serverDb.products) {
          const idx = mergedProds.findIndex(p => p.id === prod.id);
          if (idx >= 0) mergedProds[idx] = prod;
          else mergedProds.push(prod);
        }
        setToStorage(STORAGE_KEYS.PRODUCTS, mergedProds);
      }

      // Merge addons
      if (serverDb.addonGroups) {
        const localAddons = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, []);
        const mergedAddons = [...localAddons];
        for (const addon of serverDb.addonGroups) {
          const idx = mergedAddons.findIndex(a => a.id === addon.id);
          if (idx >= 0) mergedAddons[idx] = addon;
          else mergedAddons.push(addon);
        }
        setToStorage(STORAGE_KEYS.ADDON_GROUPS, mergedAddons);
      }
    }

    // 2. Sync local restaurants to server
    const currentLocalRestaurants = getFromStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, []);
    const currentLocalCats = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const currentLocalProds = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const currentLocalAddons = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, []);
    const currentLocalOrders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
    const currentLocalUsers = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);

    apiCall('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        restaurants: currentLocalRestaurants,
        categories: currentLocalCats,
        products: currentLocalProds,
        addonGroups: currentLocalAddons,
        orders: currentLocalOrders,
        users: currentLocalUsers,
      }),
    });
  } catch (e) {
    console.error('Storage sync error:', e);
  }
}

// Ensure storage is initialized
initializeStorage();

export const StorageService = {
  // Users
  getUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, [defaultUser]);
  },
  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setToStorage(STORAGE_KEYS.USERS, users);
  },
  getCurrentUserId(): string | null {
    return getFromStorage<string | null>(STORAGE_KEYS.CURRENT_USER_ID, defaultUser.id);
  },
  setCurrentUserId(userId: string | null): void {
    setToStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  // Restaurants
  getRestaurants(): Restaurant[] {
    return getFromStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, [initialRestaurant]);
  },
  getRestaurantById(id: string): Restaurant | undefined {
    return this.getRestaurants().find(r => r.id === id);
  },
  getRestaurantBySlug(slug: string): Restaurant | undefined {
    if (!slug) return undefined;
    const cleanSlug = normalizeSlug(slug);
    if (!cleanSlug) return undefined;
    const all = this.getRestaurants();
    return all.find(r => {
      const rSlug = normalizeSlug(r.settings?.slug);
      const directSlug = normalizeSlug((r as any).slug);
      const nameSlug = normalizeSlug(r.settings?.name);
      return rSlug === cleanSlug || directSlug === cleanSlug || nameSlug === cleanSlug;
    });
  },
  async getRestaurantBySlugAsync(slug: string): Promise<Restaurant | undefined> {
    if (!slug) return undefined;
    const cleanSlug = normalizeSlug(slug);
    if (!cleanSlug) return undefined;

    // 1. First check server endpoint
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`/api/restaurants/by-slug/${encodeURIComponent(cleanSlug)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const rest: Restaurant = await res.json();
        if (rest && rest.id) {
          // Cache locally
          this.saveRestaurant(rest);
          return rest;
        }
      }
    } catch {
      // Fall through to local cache
    }

    // 2. Fallback to local storage
    return this.getRestaurantBySlug(cleanSlug);
  },

  /**
   * Primary public menu data resolution method.
   * Resolves restaurant, categories, products and addons for ANY visitor on ANY device.
   */
  async getPublicRestaurantData(slug: string): Promise<{
    status: 'found' | 'not_found' | 'error';
    restaurant?: Restaurant;
    categories: Category[];
    products: Product[];
    addonGroups: AddonGroup[];
  }> {
    const cleanSlug = normalizeSlug(slug);
    if (!cleanSlug) {
      return { status: 'not_found', categories: [], products: [], addonGroups: [] };
    }

    try {
      // 1. Request public data bundle directly from server API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`/api/restaurants/data-by-slug/${encodeURIComponent(cleanSlug)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'found' && data.restaurant) {
          // Update local cache seamlessly
          this.saveRestaurant(data.restaurant);
          if (Array.isArray(data.categories)) {
            const allCats = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
            for (const c of data.categories) {
              const idx = allCats.findIndex(x => x.id === c.id);
              if (idx >= 0) allCats[idx] = c;
              else allCats.push(c);
            }
            setToStorage(STORAGE_KEYS.CATEGORIES, allCats);
          }
          if (Array.isArray(data.products)) {
            const allProds = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
            for (const p of data.products) {
              const idx = allProds.findIndex(x => x.id === p.id);
              if (idx >= 0) allProds[idx] = p;
              else allProds.push(p);
            }
            setToStorage(STORAGE_KEYS.PRODUCTS, allProds);
          }
          if (Array.isArray(data.addonGroups)) {
            const allAddons = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, []);
            for (const a of data.addonGroups) {
              const idx = allAddons.findIndex(x => x.id === a.id);
              if (idx >= 0) allAddons[idx] = a;
              else allAddons.push(a);
            }
            setToStorage(STORAGE_KEYS.ADDON_GROUPS, allAddons);
          }

          return {
            status: 'found',
            restaurant: data.restaurant,
            categories: data.categories || [],
            products: data.products || [],
            addonGroups: data.addonGroups || [],
          };
        }
      }

      if (res.status === 404) {
        // Double check local storage just in case it was created locally seconds ago
        const localRest = this.getRestaurantBySlug(cleanSlug);
        if (localRest) {
          const categories = this.getCategories(localRest.id).filter(c => c.isActive);
          const products = this.getProducts(localRest.id);
          const addonGroups = this.getAddonGroups(localRest.id);
          return {
            status: 'found',
            restaurant: localRest,
            categories,
            products,
            addonGroups,
          };
        }

        return { status: 'not_found', categories: [], products: [], addonGroups: [] };
      }
    } catch (e) {
      console.warn('Network error fetching from server, attempting local storage fallback:', e);
    }

    // 2. Fallback to local storage (e.g. offline)
    const localRest = this.getRestaurantBySlug(cleanSlug);
    if (localRest) {
      const categories = this.getCategories(localRest.id).filter(c => c.isActive);
      const products = this.getProducts(localRest.id);
      const addonGroups = this.getAddonGroups(localRest.id);
      return {
        status: 'found',
        restaurant: localRest,
        categories,
        products,
        addonGroups,
      };
    }

    return { status: 'not_found', categories: [], products: [], addonGroups: [] };
  },

  saveRestaurant(restaurant: Restaurant): void {
    const restaurants = this.getRestaurants();
    const index = restaurants.findIndex(r => r.id === restaurant.id);
    if (index >= 0) {
      restaurants[index] = restaurant;
    } else {
      restaurants.push(restaurant);
    }
    setToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);

    // Sync to server API in background
    apiCall('/api/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurant),
    });
  },

  // Categories
  getCategories(restaurantId: string): Category[] {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    return all
      .filter(c => c.restaurantId === restaurantId)
      .sort((a, b) => a.order - b.order);
  },
  saveCategory(category: Category): void {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const index = all.findIndex(c => c.id === category.id);
    if (index >= 0) {
      all[index] = category;
    } else {
      all.push(category);
    }
    setToStorage(STORAGE_KEYS.CATEGORIES, all);

    apiCall('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
  deleteCategory(categoryId: string): void {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    setToStorage(STORAGE_KEYS.CATEGORIES, all.filter(c => c.id !== categoryId));

    apiCall(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
  reorderCategories(restaurantId: string, orderedCategories: Category[]): void {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const otherRestaurantsCats = all.filter(c => c.restaurantId !== restaurantId);
    const updated = orderedCategories.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    setToStorage(STORAGE_KEYS.CATEGORIES, [...otherRestaurantsCats, ...updated]);

    updated.forEach(cat => {
      apiCall('/api/categories', {
        method: 'POST',
        body: JSON.stringify(cat),
      });
    });
  },

  // Products
  getProducts(restaurantId: string): Product[] {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return all
      .filter(p => p.restaurantId === restaurantId)
      .sort((a, b) => a.order - b.order);
  },
  getProductById(productId: string): Product | undefined {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return all.find(p => p.id === productId);
  },
  saveProduct(product: Product): void {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const index = all.findIndex(p => p.id === product.id);
    if (index >= 0) {
      all[index] = product;
    } else {
      all.push(product);
    }
    setToStorage(STORAGE_KEYS.PRODUCTS, all);

    apiCall('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  deleteProduct(productId: string): void {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    setToStorage(STORAGE_KEYS.PRODUCTS, all.filter(p => p.id !== productId));

    apiCall(`/api/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Addon Groups
  getAddonGroups(restaurantId: string): AddonGroup[] {
    const all = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, initialAddonGroups);
    return all.filter(ag => ag.restaurantId === restaurantId);
  },
  saveAddonGroup(group: AddonGroup): void {
    const all = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, initialAddonGroups);
    const index = all.findIndex(g => g.id === group.id);
    if (index >= 0) {
      all[index] = group;
    } else {
      all.push(group);
    }
    setToStorage(STORAGE_KEYS.ADDON_GROUPS, all);

    apiCall('/api/addon-groups', {
      method: 'POST',
      body: JSON.stringify(group),
    });
  },
  deleteAddonGroup(groupId: string): void {
    const all = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, initialAddonGroups);
    setToStorage(STORAGE_KEYS.ADDON_GROUPS, all.filter(g => g.id !== groupId));

    apiCall(`/api/addon-groups/${groupId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  getOrders(restaurantId: string): Order[] {
    const all = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    return all
      .filter(o => o.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  saveOrder(order: Order): void {
    const all = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const index = all.findIndex(o => o.id === order.id);
    if (index >= 0) {
      all[index] = order;
    } else {
      all.unshift(order);
    }
    setToStorage(STORAGE_KEYS.ORDERS, all);

    apiCall('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },
  updateOrderStatus(orderId: string, status: Order['status']): void {
    const all = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const order = all.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      setToStorage(STORAGE_KEYS.ORDERS, all);

      apiCall(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
  },

  // Reset to default demo data
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.RESTAURANTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ADDON_GROUPS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    initializeStorage();
    window.dispatchEvent(new Event('menuzap_storage_update'));
  }
};
