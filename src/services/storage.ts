import { Restaurant, Category, Product, AddonGroup, Order, User } from '../types';
import { initialRestaurant, initialCategories, initialProducts, initialAddonGroups, initialOrders } from '../data/initialData';
import { normalizeSlug } from './restaurantUrl';
import { getSupabase, mapRowToRestaurant } from '../lib/supabase';

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
    window.dispatchEvent(new Event('menuzap_storage_update'));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Background API helper
async function apiCall(endpoint: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
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

  // Background sync with API
  try {
    const serverDb = await apiCall('/api/sync');
    if (serverDb && serverDb.restaurants && serverDb.restaurants.length > 0) {
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
    }
  } catch (e) {
    console.error('Storage sync error:', e);
  }
}

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
    const clean = normalizeSlug(slug);
    if (!clean) return undefined;

    // 1. Direct Supabase query if available
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .or(`slug.eq.${clean},id.eq.${clean}`)
          .maybeSingle();
        if (data && !error) {
          const rest = mapRowToRestaurant(data);
          this.saveRestaurant(rest);
          return rest;
        }
      } catch {}
    }

    // 2. Fetch serverless API
    try {
      const res = await fetch(`/api/restaurants/by-slug/${encodeURIComponent(clean)}`, {
        headers: { 'Accept': 'application/json' }
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const rest: Restaurant = await res.json();
        if (rest && rest.id) {
          this.saveRestaurant(rest);
          return rest;
        }
      }
    } catch {}

    return this.getRestaurantBySlug(clean);
  },

  /**
   * Primary public menu data resolution method for any anonymous visitor.
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

    // 1. Direct Supabase Query (Fastest on Client if credentials present)
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: restRow, error } = await supabase
          .from('restaurants')
          .select('*')
          .or(`slug.eq.${cleanSlug},id.eq.${cleanSlug}`)
          .maybeSingle();

        if (restRow && !error) {
          const rest = mapRowToRestaurant(restRow);
          const restId = rest.id;

          const [catsRes, prodsRes, addonsRes] = await Promise.all([
            supabase.from('categories').select('*').eq('restaurant_id', restId).eq('is_active', true).order('display_order'),
            supabase.from('products').select('*').eq('restaurant_id', restId).eq('is_available', true).order('display_order'),
            supabase.from('addon_groups').select('*').eq('restaurant_id', restId)
          ]);

          const categories: Category[] = (catsRes.data || []).map((c: any) => ({
            id: c.id,
            restaurantId: c.restaurant_id,
            name: c.name,
            description: c.description,
            imageUrl: c.image_url,
            order: c.display_order ?? 0,
            isActive: c.is_active ?? true
          }));

          const products: Product[] = (prodsRes.data || []).map((p: any) => ({
            id: p.id,
            restaurantId: p.restaurant_id,
            categoryId: p.category_id,
            name: p.name,
            description: p.description,
            price: Number(p.price) || 0,
            promotionalPrice: p.promotional_price ? Number(p.promotional_price) : undefined,
            imageUrl: p.image_url || '',
            isAvailable: p.is_available ?? true,
            isFeatured: p.is_featured ?? false,
            internalCode: p.internal_code,
            order: p.display_order ?? 0,
            variants: p.variants || [],
            addonGroupIds: p.addon_group_ids || []
          }));

          const addonGroups: AddonGroup[] = (addonsRes.data || []).map((a: any) => ({
            id: a.id,
            restaurantId: a.restaurant_id,
            name: a.name,
            description: a.description,
            isRequired: a.is_required ?? false,
            minQuantity: a.min_quantity ?? 0,
            maxQuantity: a.max_quantity ?? 1,
            options: a.options || []
          }));

          // Cache locally
          this.saveRestaurant(rest);

          return {
            status: 'found',
            restaurant: rest,
            categories,
            products,
            addonGroups
          };
        }
      } catch (err) {
        console.warn('Direct Supabase fetch error, trying API endpoint:', err);
      }
    }

    // 2. Fetch Serverless API Endpoint (/api/restaurants/data-by-slug/:slug)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`/api/restaurants/data-by-slug/${encodeURIComponent(cleanSlug)}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();

        if (res.status === 404 || data.status === 'not_found') {
          return { status: 'not_found', categories: [], products: [], addonGroups: [] };
        }

        if (res.ok && data.status === 'found' && data.restaurant) {
          this.saveRestaurant(data.restaurant);
          return {
            status: 'found',
            restaurant: data.restaurant,
            categories: data.categories || [],
            products: data.products || [],
            addonGroups: data.addonGroups || [],
          };
        }
      }
    } catch (e) {
      console.warn('Error fetching public restaurant data from API:', e);
    }

    // 3. Fallback to local storage (for offline access or creator's local device)
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
    const cleanSlug = normalizeSlug(restaurant.settings?.slug || restaurant.settings?.name || restaurant.id);
    restaurant.settings = { ...restaurant.settings, slug: cleanSlug };

    const index = restaurants.findIndex(r => r.id === restaurant.id);
    if (index >= 0) {
      restaurants[index] = restaurant;
    } else {
      restaurants.push(restaurant);
    }
    setToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);

    // Save to Serverless API & Supabase
    apiCall('/api/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurant)
    });
  },

  // Categories
  getCategories(restaurantId?: string): Category[] {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    if (restaurantId) {
      return all.filter(c => c.restaurantId === restaurantId).sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return all.sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    setToStorage(STORAGE_KEYS.CATEGORIES, categories);

    apiCall('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  },
  reorderCategories(restaurantId: string, orderedCategories: Category[]): void {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const otherCats = all.filter(c => c.restaurantId !== restaurantId);
    const updated = orderedCategories.map((c, i) => ({ ...c, order: i }));
    setToStorage(STORAGE_KEYS.CATEGORIES, [...otherCats, ...updated]);

    updated.forEach(cat => {
      apiCall('/api/categories', {
        method: 'POST',
        body: JSON.stringify(cat)
      });
    });
  },
  deleteCategory(categoryId: string): void {
    const categories = this.getCategories().filter(c => c.id !== categoryId);
    setToStorage(STORAGE_KEYS.CATEGORIES, categories);

    apiCall(`/api/categories/${categoryId}`, {
      method: 'DELETE'
    });
  },

  // Products
  getProducts(restaurantId?: string): Product[] {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    if (restaurantId) {
      return all.filter(p => p.restaurantId === restaurantId).sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return all.sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    setToStorage(STORAGE_KEYS.PRODUCTS, products);

    apiCall('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },
  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    setToStorage(STORAGE_KEYS.PRODUCTS, products);

    apiCall(`/api/products/${productId}`, {
      method: 'DELETE'
    });
  },

  // Addon Groups
  getAddonGroups(restaurantId?: string): AddonGroup[] {
    const all = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, initialAddonGroups);
    if (restaurantId) {
      return all.filter(a => a.restaurantId === restaurantId);
    }
    return all;
  },
  saveAddonGroup(group: AddonGroup): void {
    const groups = this.getAddonGroups();
    const index = groups.findIndex(g => g.id === group.id);
    if (index >= 0) {
      groups[index] = group;
    } else {
      groups.push(group);
    }
    setToStorage(STORAGE_KEYS.ADDON_GROUPS, groups);

    apiCall('/api/addon-groups', {
      method: 'POST',
      body: JSON.stringify(group)
    });
  },
  deleteAddonGroup(groupId: string): void {
    const groups = this.getAddonGroups().filter(g => g.id !== groupId);
    setToStorage(STORAGE_KEYS.ADDON_GROUPS, groups);

    apiCall(`/api/addon-groups/${groupId}`, {
      method: 'DELETE'
    });
  },

  // Orders
  getOrders(restaurantId?: string): Order[] {
    const all = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    if (restaurantId) {
      return all
        .filter(o => o.restaurantId === restaurantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  saveOrder(order: Order): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    setToStorage(STORAGE_KEYS.ORDERS, orders);

    apiCall('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  },
  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      setToStorage(STORAGE_KEYS.ORDERS, orders);

      apiCall(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  },
  resetDemoData(): void {
    setToStorage(STORAGE_KEYS.USERS, [defaultUser]);
    setToStorage(STORAGE_KEYS.RESTAURANTS, [initialRestaurant]);
    setToStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
    setToStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
    setToStorage(STORAGE_KEYS.ADDON_GROUPS, initialAddonGroups);
    setToStorage(STORAGE_KEYS.ORDERS, initialOrders);
    setToStorage(STORAGE_KEYS.CURRENT_USER_ID, defaultUser.id);
  }
};
