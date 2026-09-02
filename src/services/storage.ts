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

// Initial bootstrap check
export function initializeStorage() {
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
    await new Promise(resolve => setTimeout(resolve, 30));
    return this.getRestaurantBySlug(slug);
  },
  async getPublicRestaurantData(slug: string): Promise<{
    status: 'found' | 'not_found' | 'error';
    restaurant?: Restaurant;
    categories: Category[];
    products: Product[];
    addonGroups: AddonGroup[];
  }> {
    try {
      const cleanSlug = normalizeSlug(slug);
      if (!cleanSlug) {
        return { status: 'not_found', categories: [], products: [], addonGroups: [] };
      }

      const rest = await this.getRestaurantBySlugAsync(cleanSlug);
      if (!rest) {
        return { status: 'not_found', categories: [], products: [], addonGroups: [] };
      }

      const categories = this.getCategories(rest.id).filter(c => c.isActive);
      const products = this.getProducts(rest.id);
      const addonGroups = this.getAddonGroups(rest.id);

      return {
        status: 'found',
        restaurant: rest,
        categories,
        products,
        addonGroups,
      };
    } catch (e) {
      console.error('Error fetching public restaurant data for slug:', slug, e);
      return { status: 'error', categories: [], products: [], addonGroups: [] };
    }
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
  },
  deleteCategory(categoryId: string): void {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    setToStorage(STORAGE_KEYS.CATEGORIES, all.filter(c => c.id !== categoryId));
  },
  reorderCategories(restaurantId: string, orderedCategories: Category[]): void {
    const all = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const otherRestaurantsCats = all.filter(c => c.restaurantId !== restaurantId);
    const updated = orderedCategories.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    setToStorage(STORAGE_KEYS.CATEGORIES, [...otherRestaurantsCats, ...updated]);
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
  },
  deleteProduct(productId: string): void {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    setToStorage(STORAGE_KEYS.PRODUCTS, all.filter(p => p.id !== productId));
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
  },
  deleteAddonGroup(groupId: string): void {
    const all = getFromStorage<AddonGroup[]>(STORAGE_KEYS.ADDON_GROUPS, initialAddonGroups);
    setToStorage(STORAGE_KEYS.ADDON_GROUPS, all.filter(g => g.id !== groupId));
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
  },
  updateOrderStatus(orderId: string, status: Order['status']): void {
    const all = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const order = all.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      setToStorage(STORAGE_KEYS.ORDERS, all);
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
