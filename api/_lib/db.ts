import { createClient } from '@supabase/supabase-js';

// Types
export interface RestaurantData {
  id: string;
  ownerId: string;
  createdAt?: string;
  settings: any;
  slug?: string;
}

export interface CategoryData {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
}

export interface ProductData {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  internalCode?: string;
  order: number;
  variants?: any[];
  addonGroupIds?: string[];
}

export interface AddonGroupData {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minQuantity: number;
  maxQuantity: number;
  options: any[];
}

export interface OrderData {
  id: string;
  orderNumber: string;
  restaurantId: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
  orderType: string;
  tableNumber?: string;
  deliveryAddress?: any;
  items: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  needChange?: boolean;
  changeForAmount?: number;
  generalObservations?: string;
  status: string;
  whatsappSent?: boolean;
}

// Initial Real Seed Data (Preserving all 5 existing restaurants)
const SEED_RESTAURANTS: RestaurantData[] = [
  {
    id: "rest-burger-house",
    ownerId: "user-demo-1",
    createdAt: "2026-09-02T01:26:16.829Z",
    settings: {
      name: "Burger House",
      slug: "burgerhouse",
      category: "Hamburgueria",
      description: "O verdadeiro hambúrguer artesanal preparado na brasa! Ingredientes nobres e muito sabor para sua melhor experiência.",
      phone: "(11) 98765-4321",
      whatsapp: "11987654321",
      instagram: "burgerhouse.oficial",
      address: {
        street: "Av. Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
        complement: "Loja 4B"
      },
      logoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&h=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      isOpenManual: true,
      autoCloseEnabled: true,
      allowOrdersWhenClosed: true,
      businessHours: [
        { dayOfWeek: 0, name: "Domingo", isOpen: true, openTime: "18:00", closeTime: "23:00" },
        { dayOfWeek: 1, name: "Segunda-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
        { dayOfWeek: 2, name: "Terça-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
        { dayOfWeek: 3, name: "Quarta-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
        { dayOfWeek: 4, name: "Quinta-feira", isOpen: true, openTime: "18:00", closeTime: "23:00" },
        { dayOfWeek: 5, name: "Sexta-feira", isOpen: true, openTime: "18:00", closeTime: "00:00" },
        { dayOfWeek: 6, name: "Sábado", isOpen: true, openTime: "18:00", closeTime: "00:00" }
      ],
      delivery: { enabled: true, feeType: "fixed", fixedFee: 6, estimatedTimeMin: 35, estimatedTimeMax: 50, minimumOrderValue: 20 },
      pickup: { enabled: true, estimatedTimeMin: 15, estimatedTimeMax: 25 },
      dineIn: { enabled: true },
      paymentMethods: {
        pix: { enabled: true, keyType: "chave_aleatoria", key: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
        creditCard: { enabled: true },
        debitCard: { enabled: true },
        cash: { enabled: true, allowChange: true },
        mealVoucher: { enabled: true }
      },
      theme: {
        primaryColor: "#f97316",
        backgroundColor: "#020617",
        cardBackgroundColor: "#0f172a",
        textColor: "#f8fafc",
        accentColor: "#fb923c",
        buttonColor: "#f97316",
        buttonTextColor: "#020617",
        borderRadius: "16px",
        cardStyle: "standard"
      }
    }
  },
  {
    id: "rest-bm-lanches-123",
    ownerId: "user-bm-123",
    createdAt: "2026-09-02T02:00:00.000Z",
    settings: {
      name: "BM Lanches",
      slug: "bm-lanches",
      category: "Lanchonete",
      description: "Os melhores lanches, porções e combos da cidade! Tradição e qualidade em cada mordida.",
      phone: "(11) 97777-7777",
      whatsapp: "11977777777",
      instagram: "bmlanches.oficial",
      address: {
        street: "Rua do Comércio",
        number: "250",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000-000"
      },
      logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&h=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      isOpenManual: true,
      autoCloseEnabled: true,
      allowOrdersWhenClosed: true,
      businessHours: [
        { dayOfWeek: 0, name: "Domingo", isOpen: true, openTime: "18:00", closeTime: "23:30" },
        { dayOfWeek: 1, name: "Segunda-feira", isOpen: true, openTime: "18:00", closeTime: "23:30" },
        { dayOfWeek: 2, name: "Terça-feira", isOpen: true, openTime: "18:00", closeTime: "23:30" },
        { dayOfWeek: 3, name: "Quarta-feira", isOpen: true, openTime: "18:00", closeTime: "23:30" },
        { dayOfWeek: 4, name: "Quinta-feira", isOpen: true, openTime: "18:00", closeTime: "23:30" },
        { dayOfWeek: 5, name: "Sexta-feira", isOpen: true, openTime: "18:00", closeTime: "00:30" },
        { dayOfWeek: 6, name: "Sábado", isOpen: true, openTime: "18:00", closeTime: "00:30" }
      ],
      delivery: { enabled: true, feeType: "fixed", fixedFee: 5.0, estimatedTimeMin: 30, estimatedTimeMax: 45, minimumOrderValue: 15 },
      pickup: { enabled: true, estimatedTimeMin: 15, estimatedTimeMax: 25 },
      dineIn: { enabled: true },
      paymentMethods: {
        pix: { enabled: true, keyType: "telefone", key: "11977777777" },
        creditCard: { enabled: true },
        debitCard: { enabled: true },
        cash: { enabled: true, allowChange: true },
        mealVoucher: { enabled: true }
      },
      theme: {
        primaryColor: "#10b981",
        backgroundColor: "#020617",
        cardBackgroundColor: "#0f172a",
        textColor: "#f8fafc",
        accentColor: "#34d399",
        buttonColor: "#10b981",
        buttonTextColor: "#020617",
        borderRadius: "16px",
        cardStyle: "standard"
      }
    }
  },
  {
    id: "rest-teste-burger",
    ownerId: "user-t1",
    createdAt: "2026-09-02T02:30:00.000Z",
    settings: {
      name: "Teste Burger House",
      slug: "teste-burger",
      category: "Hamburgueria",
      description: "Smash burgers e batatas rústicas com queijo cheddar legítimo.",
      phone: "(11) 91111-1111",
      whatsapp: "11911111111",
      address: { street: "Av Paulista", number: "1000", neighborhood: "Bela Vista", city: "São Paulo", state: "SP" },
      logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&h=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      isOpenManual: true,
      businessHours: [],
      delivery: { enabled: true, feeType: "fixed", fixedFee: 7.5, estimatedTimeMin: 25, estimatedTimeMax: 40, minimumOrderValue: 0 },
      pickup: { enabled: true, estimatedTimeMin: 15, estimatedTimeMax: 20 },
      dineIn: { enabled: true },
      paymentMethods: { pix: { enabled: true }, creditCard: { enabled: true }, debitCard: { enabled: true }, cash: { enabled: true }, mealVoucher: { enabled: false } },
      theme: { primaryColor: "#f97316", backgroundColor: "#020617", cardBackgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#fb923c", buttonColor: "#f97316", buttonTextColor: "#020617", borderRadius: "16px", cardStyle: "standard" }
    }
  },
  {
    id: "rest-teste-pizza",
    ownerId: "user-t2",
    createdAt: "2026-09-02T02:30:00.000Z",
    settings: {
      name: "Teste Pizza & Pasta",
      slug: "teste-pizza",
      category: "Pizzaria",
      description: "Pizzas artesanais napolitanas no forno a lenha.",
      phone: "(11) 92222-2222",
      whatsapp: "11922222222",
      address: { street: "Rua Augusta", number: "500", neighborhood: "Consolação", city: "São Paulo", state: "SP" },
      logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&h=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=1200&q=80",
      isOpenManual: true,
      businessHours: [],
      delivery: { enabled: true, feeType: "fixed", fixedFee: 8.0, estimatedTimeMin: 40, estimatedTimeMax: 55, minimumOrderValue: 0 },
      pickup: { enabled: true, estimatedTimeMin: 20, estimatedTimeMax: 30 },
      dineIn: { enabled: true },
      paymentMethods: { pix: { enabled: true }, creditCard: { enabled: true }, debitCard: { enabled: true }, cash: { enabled: true }, mealVoucher: { enabled: false } },
      theme: { primaryColor: "#ef4444", backgroundColor: "#020617", cardBackgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#f87171", buttonColor: "#ef4444", buttonTextColor: "#ffffff", borderRadius: "16px", cardStyle: "standard" }
    }
  },
  {
    id: "rest-teste-sushi",
    ownerId: "user-t3",
    createdAt: "2026-09-02T02:30:00.000Z",
    settings: {
      name: "Teste Sushi Premium",
      slug: "teste-sushi",
      category: "Sushi",
      description: "Combinados frescos e sushis contemporâneos.",
      phone: "(11) 93333-3333",
      whatsapp: "11933333333",
      address: { street: "Rua dos Pinheiros", number: "789", neighborhood: "Pinheiros", city: "São Paulo", state: "SP" },
      logoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=200&h=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80",
      isOpenManual: true,
      businessHours: [],
      delivery: { enabled: true, feeType: "fixed", fixedFee: 10.0, estimatedTimeMin: 35, estimatedTimeMax: 50, minimumOrderValue: 0 },
      pickup: { enabled: true, estimatedTimeMin: 20, estimatedTimeMax: 30 },
      dineIn: { enabled: true },
      paymentMethods: { pix: { enabled: true }, creditCard: { enabled: true }, debitCard: { enabled: true }, cash: { enabled: false }, mealVoucher: { enabled: true } },
      theme: { primaryColor: "#06b6d4", backgroundColor: "#020617", cardBackgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#22d3ee", buttonColor: "#06b6d4", buttonTextColor: "#020617", borderRadius: "16px", cardStyle: "standard" }
    }
  }
];

const SEED_CATEGORIES: CategoryData[] = [
  { id: "cat-1", restaurantId: "rest-burger-house", name: "Burgers Artesanais", description: "Hambúrgueres preparados com blend especial 100% bovino", order: 1, isActive: true },
  { id: "cat-2", restaurantId: "rest-burger-house", name: "Porções & Acompanhamentos", description: "Petiscos perfeitos para compartilhar", order: 2, isActive: true },
  { id: "cat-3", restaurantId: "rest-burger-house", name: "Bebidas & Refrigerantes", description: "Sucos naturais, refrigerantes e cervejas geladas", order: 3, isActive: true },
  { id: "cat-bm-1", restaurantId: "rest-bm-lanches-123", name: "Lanches Especiais", description: "Lanches clássicos e prensados com muito recheio", order: 1, isActive: true },
  { id: "cat-bm-2", restaurantId: "rest-bm-lanches-123", name: "Porções Crocantes", description: "Batatas, anéis de cebola e frango a passarinho", order: 2, isActive: true },
  { id: "cat-tb-1", restaurantId: "rest-teste-burger", name: "Smash Burgers", order: 1, isActive: true },
  { id: "cat-tp-1", restaurantId: "rest-teste-pizza", name: "Pizzas Clássicas", order: 1, isActive: true },
  { id: "cat-ts-1", restaurantId: "rest-teste-sushi", name: "Combinados do Chef", order: 1, isActive: true }
];

const SEED_ADDON_GROUPS: AddonGroupData[] = [
  {
    id: "addon-group-1",
    restaurantId: "rest-burger-house",
    name: "Turbine seu Burger",
    description: "Escolha até 3 adicionais especiais",
    isRequired: false,
    minQuantity: 0,
    maxQuantity: 3,
    options: [
      { id: "opt-1", name: "Bacon Crocante Extra", price: 6, maxQuantity: 2 },
      { id: "opt-2", name: "Queijo Cheddar Inglês Extra", price: 5, maxQuantity: 2 },
      { id: "opt-3", name: "Cebola Caramelizada", price: 4, maxQuantity: 1 },
      { id: "opt-4", name: "Ovo Frito na Manteiga", price: 3.5, maxQuantity: 1 }
    ]
  },
  {
    id: "addon-group-bm-1",
    restaurantId: "rest-bm-lanches-123",
    name: "Adicionais do Lanche",
    description: "Deixe seu lanche ainda mais completo",
    isRequired: false,
    minQuantity: 0,
    maxQuantity: 4,
    options: [
      { id: "bm-opt-1", name: "Bacon em Fatias", price: 5.0, maxQuantity: 2 },
      { id: "bm-opt-2", name: "Catupiry Original", price: 6.0, maxQuantity: 1 },
      { id: "bm-opt-3", name: "Ovo Caipira", price: 3.0, maxQuantity: 2 },
      { id: "bm-opt-4", name: "Milho e Ervilha", price: 2.0, maxQuantity: 1 }
    ]
  }
];

const SEED_PRODUCTS: ProductData[] = [
  {
    id: "prod-1",
    restaurantId: "rest-burger-house",
    categoryId: "cat-1",
    name: "Grand Bacon Cheddar",
    description: "Blend de 180g na brasa, fatias generosas de bacon defumado crocante, creme de cheddar inglês, cebola caramelizada e maionese defumada no pão brioche tostado.",
    price: 36.9,
    promotionalPrice: 32.9,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isFeatured: true,
    internalCode: "BH-001",
    order: 1,
    addonGroupIds: ["addon-group-1"]
  },
  {
    id: "prod-2",
    restaurantId: "rest-burger-house",
    categoryId: "cat-1",
    name: "Smash Classic Salad",
    description: "Dois smash burgers de 90g ultra prensados com crostinha perfeita, queijo prato derretido, alface americana fresca, tomate caqui e molho especial no pão da casa.",
    price: 28.9,
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isFeatured: false,
    internalCode: "BH-002",
    order: 2,
    addonGroupIds: ["addon-group-1"]
  },
  {
    id: "prod-bm-1",
    restaurantId: "rest-bm-lanches-123",
    categoryId: "cat-bm-1",
    name: "X-Tudo Especial BM",
    description: "Hambúrguer bovino artesanal 150g, queijo mussarela derretido, presunto, bacon crocante, ovo, alface fresca, tomate, milho e maionese especial da casa.",
    price: 32.5,
    promotionalPrice: 28.9,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isFeatured: true,
    internalCode: "BM-001",
    order: 1,
    addonGroupIds: ["addon-group-bm-1"]
  },
  {
    id: "prod-bm-2",
    restaurantId: "rest-bm-lanches-123",
    categoryId: "cat-bm-2",
    name: "Batata Frita Suprema com Bacon e Cheddar",
    description: "500g de batatas sequinhas e crocantes cobertas com generosa camada de cheddar cremoso e cubos de bacon frito.",
    price: 26.0,
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isFeatured: true,
    internalCode: "BM-002",
    order: 1
  },
  {
    id: "prod-tb-1",
    restaurantId: "rest-teste-burger",
    categoryId: "cat-tb-1",
    name: "Duplo Smash Burger Bacon",
    description: "Dois smash de 90g com crosta perfeita, muito queijo e bacon.",
    price: 29.9,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isFeatured: true,
    order: 1
  },
  {
    id: "prod-tp-1",
    restaurantId: "rest-teste-pizza",
    categoryId: "cat-tp-1",
    name: "Pizza Margherita DOC",
    description: "Molho de tomate pelado italiano, mussarela de búfala, manjericão fresco e azeite extravirgem.",
    price: 54.0,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isFeatured: true,
    order: 1
  },
  {
    id: "prod-ts-1",
    restaurantId: "rest-teste-sushi",
    categoryId: "cat-ts-1",
    name: "Combo Salmão Supreme 20 Peças",
    description: "8 Uramakis, 4 Niguiris, 4 Hossomakis e 4 Sashimis de salmão fresco.",
    price: 68.0,
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isFeatured: true,
    order: 1
  }
];

// In-Memory Global Store (survives requests in node/serverless instance)
const memoryStore = {
  restaurants: [...SEED_RESTAURANTS],
  categories: [...SEED_CATEGORIES],
  products: [...SEED_PRODUCTS],
  addonGroups: [...SEED_ADDON_GROUPS],
  orders: [] as OrderData[]
};

export function cleanSlug(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(\/|#|\/r\/|r\/)+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Supabase Connection Helper
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return createClient(url, key);
    } catch {
      return null;
    }
  }
  return null;
}

// Database API Functions

export async function getPublicRestaurantDataBySlug(rawSlug: string) {
  const slug = cleanSlug(rawSlug);
  if (!slug) return null;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: restRow, error } = await supabase
        .from('restaurants')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();

      if (restRow && !error) {
        const restId = restRow.id;
        const [catsRes, prodsRes, addonsRes] = await Promise.all([
          supabase.from('categories').select('*').eq('restaurant_id', restId).eq('is_active', true).order('display_order'),
          supabase.from('products').select('*').eq('restaurant_id', restId).eq('is_available', true).order('display_order'),
          supabase.from('addon_groups').select('*').eq('restaurant_id', restId)
        ]);

        const settings = restRow.settings || {};
        const restaurant = {
          id: restRow.id,
          ownerId: restRow.owner_id || restRow.ownerId,
          createdAt: restRow.created_at,
          settings: {
            name: restRow.name || settings.name,
            slug: restRow.slug || settings.slug,
            category: restRow.category || settings.category || 'Outro',
            description: restRow.description || settings.description,
            phone: restRow.phone || settings.phone,
            whatsapp: restRow.whatsapp || settings.whatsapp,
            instagram: restRow.instagram || settings.instagram,
            address: restRow.address || settings.address,
            logoUrl: restRow.logo_url || settings.logoUrl,
            coverUrl: restRow.cover_url || settings.coverUrl,
            isOpenManual: restRow.is_open_manual ?? settings.isOpenManual ?? true,
            autoCloseEnabled: restRow.auto_close_enabled ?? settings.autoCloseEnabled ?? true,
            useAutomaticHours: restRow.use_automatic_hours ?? settings.useAutomaticHours ?? false,
            allowOrdersWhenClosed: restRow.allow_orders_when_closed ?? settings.allowOrdersWhenClosed ?? true,
            businessHours: restRow.business_hours || settings.businessHours || [],
            delivery: restRow.delivery || settings.delivery,
            pickup: restRow.pickup || settings.pickup,
            dineIn: restRow.dine_in || settings.dineIn,
            paymentMethods: restRow.payment_methods || settings.paymentMethods,
            theme: restRow.theme || settings.theme
          }
        };

        const categories = (catsRes.data || []).map((c: any) => ({
          id: c.id,
          restaurantId: c.restaurant_id,
          name: c.name,
          description: c.description,
          imageUrl: c.image_url,
          order: c.display_order ?? c.order ?? 0,
          isActive: c.is_active ?? true
        }));

        const products = (prodsRes.data || []).map((p: any) => ({
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
          order: p.display_order ?? p.order ?? 0,
          variants: p.variants || [],
          addonGroupIds: p.addon_group_ids || []
        }));

        const addonGroups = (addonsRes.data || []).map((a: any) => ({
          id: a.id,
          restaurantId: a.restaurant_id,
          name: a.name,
          description: a.description,
          isRequired: a.is_required ?? false,
          minQuantity: a.min_quantity ?? 0,
          maxQuantity: a.max_quantity ?? 1,
          options: a.options || []
        }));

        return { restaurant, categories, products, addonGroups };
      }
    } catch (err) {
      console.warn('Supabase query error, falling back to memory store:', err);
    }
  }

  // Memory store query
  const rest = memoryStore.restaurants.find(
    r => cleanSlug(r.settings?.slug) === slug || cleanSlug(r.slug || '') === slug || cleanSlug(r.settings?.name) === slug || r.id === slug
  );

  if (!rest) return null;

  const categories = memoryStore.categories.filter(c => c.restaurantId === rest.id && c.isActive);
  const products = memoryStore.products.filter(p => p.restaurantId === rest.id && p.isAvailable);
  const addonGroups = memoryStore.addonGroups.filter(a => a.restaurantId === rest.id);

  return {
    restaurant: rest,
    categories,
    products,
    addonGroups
  };
}

export async function getAllRestaurants() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (data && !error) {
        return data.map((row: any) => ({
          id: row.id,
          ownerId: row.owner_id,
          createdAt: row.created_at,
          settings: row.settings || {
            name: row.name,
            slug: row.slug,
            category: row.category,
            description: row.description,
            phone: row.phone,
            whatsapp: row.whatsapp,
            address: row.address,
            logoUrl: row.logo_url,
            coverUrl: row.cover_url,
            theme: row.theme
          }
        }));
      }
    } catch {}
  }
  return memoryStore.restaurants;
}

export async function saveRestaurant(rest: any) {
  if (!rest || !rest.id) return null;
  const slug = cleanSlug(rest.settings?.slug || rest.slug || rest.settings?.name || rest.id);
  rest.settings = { ...rest.settings, slug };

  const idx = memoryStore.restaurants.findIndex(r => r.id === rest.id);
  if (idx >= 0) {
    memoryStore.restaurants[idx] = rest;
  } else {
    memoryStore.restaurants.push(rest);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('restaurants').upsert({
        id: rest.id,
        owner_id: rest.ownerId || 'owner-default',
        name: rest.settings?.name || '',
        slug: slug,
        category: rest.settings?.category,
        description: rest.settings?.description,
        phone: rest.settings?.phone,
        whatsapp: rest.settings?.whatsapp,
        instagram: rest.settings?.instagram,
        address: rest.settings?.address || {},
        logo_url: rest.settings?.logoUrl,
        cover_url: rest.settings?.coverUrl,
        is_open_manual: rest.settings?.isOpenManual ?? true,
        business_hours: rest.settings?.businessHours || [],
        delivery: rest.settings?.delivery || {},
        pickup: rest.settings?.pickup || {},
        dine_in: rest.settings?.dineIn || {},
        payment_methods: rest.settings?.paymentMethods || {},
        theme: rest.settings?.theme || {},
        settings: rest.settings || {},
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase save restaurant failed:', e);
    }
  }

  return rest;
}

export async function getCategories(restaurantId: string) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('categories').select('*').eq('restaurant_id', restaurantId).order('display_order');
      if (data) {
        return data.map((c: any) => ({
          id: c.id,
          restaurantId: c.restaurant_id,
          name: c.name,
          description: c.description,
          imageUrl: c.image_url,
          order: c.display_order ?? 0,
          isActive: c.is_active ?? true
        }));
      }
    } catch {}
  }
  return memoryStore.categories.filter(c => c.restaurantId === restaurantId);
}

export async function saveCategory(cat: any) {
  if (!cat || !cat.id) return null;
  const idx = memoryStore.categories.findIndex(c => c.id === cat.id);
  if (idx >= 0) {
    memoryStore.categories[idx] = cat;
  } else {
    memoryStore.categories.push(cat);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('categories').upsert({
        id: cat.id,
        restaurant_id: cat.restaurantId,
        name: cat.name,
        description: cat.description,
        image_url: cat.imageUrl,
        display_order: cat.order ?? 0,
        is_active: cat.isActive ?? true,
        updated_at: new Date().toISOString()
      });
    } catch {}
  }
  return cat;
}

export async function deleteCategory(id: string) {
  memoryStore.categories = memoryStore.categories.filter(c => c.id !== id);
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch {}
  }
  return { success: true };
}

export async function getProducts(restaurantId: string) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('products').select('*').eq('restaurant_id', restaurantId).order('display_order');
      if (data) {
        return data.map((p: any) => ({
          id: p.id,
          restaurantId: p.restaurant_id,
          categoryId: p.category_id,
          name: p.name,
          description: p.description,
          price: Number(p.price) || 0,
          promotionalPrice: p.promotional_price ? Number(p.promotional_price) : undefined,
          imageUrl: p.image_url,
          isAvailable: p.is_available ?? true,
          isFeatured: p.is_featured ?? false,
          internalCode: p.internal_code,
          order: p.display_order ?? 0,
          variants: p.variants || [],
          addonGroupIds: p.addon_group_ids || []
        }));
      }
    } catch {}
  }
  return memoryStore.products.filter(p => p.restaurantId === restaurantId);
}

export async function saveProduct(prod: any) {
  if (!prod || !prod.id) return null;
  const idx = memoryStore.products.findIndex(p => p.id === prod.id);
  if (idx >= 0) {
    memoryStore.products[idx] = prod;
  } else {
    memoryStore.products.push(prod);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('products').upsert({
        id: prod.id,
        restaurant_id: prod.restaurantId,
        category_id: prod.categoryId,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        promotional_price: prod.promotionalPrice,
        image_url: prod.imageUrl,
        is_available: prod.isAvailable ?? true,
        is_featured: prod.isFeatured ?? false,
        internal_code: prod.internalCode,
        display_order: prod.order ?? 0,
        variants: prod.variants || [],
        addon_group_ids: prod.addonGroupIds || [],
        updated_at: new Date().toISOString()
      });
    } catch {}
  }
  return prod;
}

export async function deleteProduct(id: string) {
  memoryStore.products = memoryStore.products.filter(p => p.id !== id);
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch {}
  }
  return { success: true };
}

export async function getAddonGroups(restaurantId: string) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('addon_groups').select('*').eq('restaurant_id', restaurantId);
      if (data) {
        return data.map((a: any) => ({
          id: a.id,
          restaurantId: a.restaurant_id,
          name: a.name,
          description: a.description,
          isRequired: a.is_required ?? false,
          minQuantity: a.min_quantity ?? 0,
          maxQuantity: a.max_quantity ?? 1,
          options: a.options || []
        }));
      }
    } catch {}
  }
  return memoryStore.addonGroups.filter(a => a.restaurantId === restaurantId);
}

export async function saveAddonGroup(group: any) {
  if (!group || !group.id) return null;
  const idx = memoryStore.addonGroups.findIndex(a => a.id === group.id);
  if (idx >= 0) {
    memoryStore.addonGroups[idx] = group;
  } else {
    memoryStore.addonGroups.push(group);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('addon_groups').upsert({
        id: group.id,
        restaurant_id: group.restaurantId,
        name: group.name,
        description: group.description,
        is_required: group.isRequired ?? false,
        min_quantity: group.minQuantity ?? 0,
        max_quantity: group.maxQuantity ?? 1,
        options: group.options || [],
        updated_at: new Date().toISOString()
      });
    } catch {}
  }
  return group;
}

export async function deleteAddonGroup(id: string) {
  memoryStore.addonGroups = memoryStore.addonGroups.filter(a => a.id !== id);
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('addon_groups').delete().eq('id', id);
    } catch {}
  }
  return { success: true };
}

export async function getOrders(restaurantId: string) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('orders').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false });
      if (data) {
        return data.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          restaurantId: o.restaurant_id,
          createdAt: o.created_at,
          customer: o.customer,
          orderType: o.order_type,
          tableNumber: o.table_number,
          deliveryAddress: o.delivery_address,
          items: o.items || [],
          subtotal: Number(o.subtotal) || 0,
          deliveryFee: Number(o.delivery_fee) || 0,
          total: Number(o.total) || 0,
          paymentMethod: o.payment_method,
          needChange: o.need_change,
          changeForAmount: o.change_for_amount ? Number(o.change_for_amount) : undefined,
          generalObservations: o.general_observations,
          status: o.status,
          whatsappSent: o.whatsapp_sent
        }));
      }
    } catch {}
  }
  return memoryStore.orders.filter(o => o.restaurantId === restaurantId);
}

export async function saveOrder(order: any) {
  if (!order || !order.id) return null;
  const idx = memoryStore.orders.findIndex(o => o.id === order.id);
  if (idx >= 0) {
    memoryStore.orders[idx] = order;
  } else {
    memoryStore.orders.unshift(order);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('orders').upsert({
        id: order.id,
        order_number: order.orderNumber,
        restaurant_id: order.restaurantId,
        customer: order.customer,
        order_type: order.orderType,
        table_number: order.tableNumber,
        delivery_address: order.deliveryAddress,
        items: order.items || [],
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        total: order.total,
        payment_method: order.paymentMethod,
        need_change: order.needChange,
        change_for_amount: order.changeForAmount,
        general_observations: order.generalObservations,
        status: order.status || 'novo',
        whatsapp_sent: order.whatsappSent ?? false,
        created_at: order.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch {}
  }
  return order;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const order = memoryStore.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
  }
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    } catch {}
  }
  return { success: true, orderId, status };
}
