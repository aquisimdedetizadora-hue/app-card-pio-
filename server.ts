import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialRestaurant, initialCategories, initialProducts, initialAddonGroups, initialOrders } from './src/data/initialData';
import { Restaurant, Category, Product, AddonGroup, Order, User } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  restaurants: Restaurant[];
  categories: Category[];
  products: Product[];
  addonGroups: AddonGroup[];
  orders: Order[];
}

function normalizeSlug(raw?: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const defaultUser: User = {
  id: 'user-demo-1',
  name: 'Rodrigo Medeiros',
  email: 'contato@burgerhouse.com.br',
  phone: '(11) 98765-4321',
  restaurantIds: ['rest-burger-house'],
  activeRestaurantId: 'rest-burger-house',
};

const initialDb: DatabaseSchema = {
  users: [defaultUser],
  restaurants: [initialRestaurant],
  categories: initialCategories,
  products: initialProducts,
  addonGroups: initialAddonGroups,
  orders: initialOrders,
};

// In-memory cache + file sync
let db: DatabaseSchema = { ...initialDb };

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      // Ensure initial demo restaurant exists if empty
      if (!db.restaurants || db.restaurants.length === 0) {
        db.restaurants = [initialRestaurant];
      }
      if (!db.categories || db.categories.length === 0) {
        db.categories = initialCategories;
      }
      if (!db.products || db.products.length === 0) {
        db.products = initialProducts;
      }
      if (!db.addonGroups || db.addonGroups.length === 0) {
        db.addonGroups = initialAddonGroups;
      }
      if (!db.users || db.users.length === 0) {
        db.users = [defaultUser];
      }
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      db = { ...initialDb };
    }
  } catch (err) {
    console.error('[Server DB] Error loading database file:', err);
  }
}

function saveDbToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server DB] Error persisting database file:', err);
  }
}

ensureDataDirectory();

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // RESTAURANTS
  app.get('/api/restaurants', (req: Request, res: Response) => {
    res.json(db.restaurants || []);
  });

  // Find restaurant by slug
  app.get('/api/restaurants/by-slug/:slug', (req: Request, res: Response) => {
    const slug = req.params.slug;
    const cleanSlug = normalizeSlug(slug);

    if (!cleanSlug) {
      return res.status(400).json({ error: 'Slug inválido' });
    }

    const rest = (db.restaurants || []).find(r => {
      const rSlug = normalizeSlug(r.settings?.slug);
      const directSlug = normalizeSlug((r as any).slug);
      const nameSlug = normalizeSlug(r.settings?.name);
      return rSlug === cleanSlug || directSlug === cleanSlug || nameSlug === cleanSlug;
    });

    if (!rest) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    res.json(rest);
  });

  // Full public data bundle by slug (Restaurant + Categories + Products + AddonGroups)
  app.get('/api/restaurants/data-by-slug/:slug', (req: Request, res: Response) => {
    const slug = req.params.slug;
    const cleanSlug = normalizeSlug(slug);

    if (!cleanSlug) {
      return res.status(404).json({ status: 'not_found', error: 'Slug inválido' });
    }

    const rest = (db.restaurants || []).find(r => {
      const rSlug = normalizeSlug(r.settings?.slug);
      const directSlug = normalizeSlug((r as any).slug);
      const nameSlug = normalizeSlug(r.settings?.name);
      return rSlug === cleanSlug || directSlug === cleanSlug || nameSlug === cleanSlug;
    });

    if (!rest) {
      return res.status(404).json({ status: 'not_found', error: 'Cardápio não encontrado' });
    }

    const categories = (db.categories || [])
      .filter(c => c.restaurantId === rest.id && c.isActive)
      .sort((a, b) => a.order - b.order);

    const products = (db.products || [])
      .filter(p => p.restaurantId === rest.id);

    const addonGroups = (db.addonGroups || [])
      .filter(a => a.restaurantId === rest.id);

    res.json({
      status: 'found',
      restaurant: rest,
      categories,
      products,
      addonGroups,
    });
  });

  // Get restaurant by ID
  app.get('/api/restaurants/:id', (req: Request, res: Response) => {
    const rest = (db.restaurants || []).find(r => r.id === req.params.id);
    if (!rest) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    res.json(rest);
  });

  // Save / update restaurant
  app.post('/api/restaurants', (req: Request, res: Response) => {
    const restaurant: Restaurant = req.body;
    if (!restaurant || !restaurant.id) {
      return res.status(400).json({ error: 'Dados do restaurante inválidos' });
    }

    if (!db.restaurants) db.restaurants = [];
    const idx = db.restaurants.findIndex(r => r.id === restaurant.id);
    if (idx >= 0) {
      db.restaurants[idx] = restaurant;
    } else {
      db.restaurants.push(restaurant);
    }

    saveDbToFile();
    res.json({ success: true, restaurant });
  });

  // CATEGORIES
  app.get('/api/restaurants/:id/categories', (req: Request, res: Response) => {
    const categories = (db.categories || [])
      .filter(c => c.restaurantId === req.params.id)
      .sort((a, b) => a.order - b.order);
    res.json(categories);
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const category: Category = req.body;
    if (!category || !category.id) {
      return res.status(400).json({ error: 'Categoria inválida' });
    }

    if (!db.categories) db.categories = [];
    const idx = db.categories.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      db.categories[idx] = category;
    } else {
      db.categories.push(category);
    }

    saveDbToFile();
    res.json({ success: true, category });
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    db.categories = (db.categories || []).filter(c => c.id !== req.params.id);
    saveDbToFile();
    res.json({ success: true });
  });

  // PRODUCTS
  app.get('/api/restaurants/:id/products', (req: Request, res: Response) => {
    const products = (db.products || [])
      .filter(p => p.restaurantId === req.params.id);
    res.json(products);
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const product: Product = req.body;
    if (!product || !product.id) {
      return res.status(400).json({ error: 'Produto inválido' });
    }

    if (!db.products) db.products = [];
    const idx = db.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      db.products[idx] = product;
    } else {
      db.products.push(product);
    }

    saveDbToFile();
    res.json({ success: true, product });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    db.products = (db.products || []).filter(p => p.id !== req.params.id);
    saveDbToFile();
    res.json({ success: true });
  });

  // ADDON GROUPS
  app.get('/api/restaurants/:id/addon-groups', (req: Request, res: Response) => {
    const groups = (db.addonGroups || []).filter(a => a.restaurantId === req.params.id);
    res.json(groups);
  });

  app.post('/api/addon-groups', (req: Request, res: Response) => {
    const group: AddonGroup = req.body;
    if (!group || !group.id) {
      return res.status(400).json({ error: 'Grupo de adicionais inválido' });
    }

    if (!db.addonGroups) db.addonGroups = [];
    const idx = db.addonGroups.findIndex(a => a.id === group.id);
    if (idx >= 0) {
      db.addonGroups[idx] = group;
    } else {
      db.addonGroups.push(group);
    }

    saveDbToFile();
    res.json({ success: true, group });
  });

  app.delete('/api/addon-groups/:id', (req: Request, res: Response) => {
    db.addonGroups = (db.addonGroups || []).filter(a => a.id !== req.params.id);
    saveDbToFile();
    res.json({ success: true });
  });

  // ORDERS
  app.get('/api/restaurants/:id/orders', (req: Request, res: Response) => {
    const orders = (db.orders || [])
      .filter(o => o.restaurantId === req.params.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(orders);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const order: Order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Pedido inválido' });
    }

    if (!db.orders) db.orders = [];
    const idx = db.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      db.orders[idx] = order;
    } else {
      db.orders.unshift(order);
    }

    saveDbToFile();
    res.json({ success: true, order });
  });

  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    const order = (db.orders || []).find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    order.status = status;
    saveDbToFile();
    res.json({ success: true, order });
  });

  // BATCH SYNC ENDPOINT (Client -> Server and Server -> Client)
  app.post('/api/sync', (req: Request, res: Response) => {
    const clientData: Partial<DatabaseSchema> = req.body;

    if (clientData.restaurants && Array.isArray(clientData.restaurants)) {
      clientData.restaurants.forEach(clientRest => {
        const idx = db.restaurants.findIndex(r => r.id === clientRest.id);
        if (idx >= 0) {
          db.restaurants[idx] = clientRest;
        } else {
          db.restaurants.push(clientRest);
        }
      });
    }

    if (clientData.categories && Array.isArray(clientData.categories)) {
      clientData.categories.forEach(clientCat => {
        const idx = db.categories.findIndex(c => c.id === clientCat.id);
        if (idx >= 0) {
          db.categories[idx] = clientCat;
        } else {
          db.categories.push(clientCat);
        }
      });
    }

    if (clientData.products && Array.isArray(clientData.products)) {
      clientData.products.forEach(clientProd => {
        const idx = db.products.findIndex(p => p.id === clientProd.id);
        if (idx >= 0) {
          db.products[idx] = clientProd;
        } else {
          db.products.push(clientProd);
        }
      });
    }

    if (clientData.addonGroups && Array.isArray(clientData.addonGroups)) {
      clientData.addonGroups.forEach(clientAddon => {
        const idx = db.addonGroups.findIndex(a => a.id === clientAddon.id);
        if (idx >= 0) {
          db.addonGroups[idx] = clientAddon;
        } else {
          db.addonGroups.push(clientAddon);
        }
      });
    }

    if (clientData.orders && Array.isArray(clientData.orders)) {
      clientData.orders.forEach(clientOrder => {
        const idx = db.orders.findIndex(o => o.id === clientOrder.id);
        if (idx >= 0) {
          db.orders[idx] = clientOrder;
        } else {
          db.orders.push(clientOrder);
        }
      });
    }

    if (clientData.users && Array.isArray(clientData.users)) {
      clientData.users.forEach(clientUser => {
        const idx = db.users.findIndex(u => u.id === clientUser.id);
        if (idx >= 0) {
          db.users[idx] = clientUser;
        } else {
          db.users.push(clientUser);
        }
      });
    }

    saveDbToFile();
    res.json({ success: true, db });
  });

  app.get('/api/sync', (req: Request, res: Response) => {
    res.json(db);
  });

  // ==========================================
  // VITE & STATIC FILES MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MenuZap Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
