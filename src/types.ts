export type RestaurantCategory = 
  | 'Hamburgueria'
  | 'Pizzaria'
  | 'Sushi'
  | 'Restaurante'
  | 'Lanchonete'
  | 'Açaí'
  | 'Cafeteria'
  | 'Doceria'
  | 'Outro';

export type OrderType = 'delivery' | 'pickup' | 'dine_in';

export type PaymentMethodType = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'vale_refeicao' | 'outro';
export type PaymentMethod = PaymentMethodType;

export type OrderStatus = 
  | 'novo'
  | 'confirmado'
  | 'em_preparo'
  | 'saiu_para_entrega'
  | 'concluido'
  | 'cancelado';

export interface BusinessHour {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  name: string;
  isOpen: boolean;
  openTime: string; // "18:00"
  closeTime: string; // "23:00"
}
export type BusinessDayHours = BusinessHour;

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  complement?: string;
  referencePoint?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeliverySettings {
  enabled: boolean;
  feeType: 'fixed' | 'free' | 'to_agree';
  fixedFee: number;
  estimatedTimeMin: number;
  estimatedTimeMax: number;
  minimumOrderValue: number;
}

export interface PickupSettings {
  enabled: boolean;
  estimatedTimeMin: number;
  estimatedTimeMax: number;
}

export interface DineInSettings {
  enabled: boolean;
}

export interface PixPaymentSettings {
  enabled: boolean;
  keyType?: 'chave_aleatoria' | 'cpf_cnpj' | 'email' | 'telefone';
  key?: string;
}

export interface PaymentSettings {
  pix: PixPaymentSettings;
  creditCard: { enabled: boolean };
  debitCard: { enabled: boolean };
  cash: { enabled: boolean; allowChange?: boolean };
  mealVoucher: { enabled: boolean };
}

export interface ThemeCustomization {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  cardStyle: 'standard' | 'compact' | 'grid' | 'bordered' | 'elevated' | 'flat';
}

export interface RestaurantSettings {
  name: string;
  slug: string;
  category: RestaurantCategory;
  description: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  address: Address;
  logoUrl: string;
  coverUrl: string;
  isOpenManual: boolean;
  autoCloseEnabled?: boolean;
  useAutomaticHours?: boolean;
  allowOrdersWhenClosed?: boolean;
  businessHours: BusinessHour[];
  delivery: DeliverySettings;
  pickup: PickupSettings;
  dineIn: DineInSettings;
  paymentMethods: PaymentSettings;
  theme: ThemeCustomization;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Média", "Grande", "350ml", "2L"
  price: number;
  isDefault?: boolean;
}

export interface AddonOption {
  id: string;
  name: string; // e.g. "Bacon Extra"
  price: number;
  maxQuantity?: number;
}

export interface AddonGroup {
  id: string;
  restaurantId: string;
  name: string; // e.g. "Escolha seus adicionais", "Tipo de Pão"
  description?: string;
  isRequired: boolean;
  minQuantity: number;
  maxQuantity: number;
  options: AddonOption[];
}

export interface Product {
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
  variants?: ProductVariant[];
  addonGroupIds?: string[]; // IDs of linked addon groups
}

export interface SelectedAddon {
  addonId: string;
  name: string;
  price: number;
  quantity: number;
}
export type CartSelectedAddon = SelectedAddon;

export interface CartItem {
  id: string; // unique item instance id in cart
  productId: string;
  name: string;
  variantId?: string;
  variantName?: string;
  price: number;
  quantity: number;
  addons: SelectedAddon[];
  observations?: string;
  totalPrice: number;
}

export interface CustomerOrderData {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  address?: Address;
  paymentMethod: PaymentMethodType;
  needChange?: boolean;
  changeForAmount?: number;
  generalObservations?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#1024"
  restaurantId: string;
  createdAt: string; // ISO string
  customer: {
    name: string;
    phone: string;
  };
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: Address;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethodType;
  needChange?: boolean;
  changeForAmount?: number;
  generalObservations?: string;
  status: OrderStatus;
  whatsappSent?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  restaurantIds: string[];
  activeRestaurantId: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  createdAt?: string;
  settings: RestaurantSettings;
}
