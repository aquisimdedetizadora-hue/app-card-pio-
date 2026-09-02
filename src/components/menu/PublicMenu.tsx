import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Instagram, 
  Sparkles, 
  Star, 
  Plus, 
  AlertCircle,
  MessageSquare,
  Share2,
  Copy,
  Info,
  ArrowLeft,
  UtensilsCrossed
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { StorageService } from '../../services/storage';
import { getStoreStatus, getTodaySchedule } from '../../services/storeStatus';
import { formatCurrency, cleanPhone } from '../../services/whatsapp';
import { getRestaurantPublicUrl, getRestaurantWhatsAppShareUrl, updateRestaurantMetaTags } from '../../services/restaurantUrl';
import { ProductModal } from './ProductModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { Restaurant, Category, Product, AddonGroup, CartItem } from '../../types';
import { useToast } from '../common/Toast';

interface PublicMenuProps {
  slug: string;
  tableNumber?: string;
  onNavigate?: (route: string) => void;
}

type MenuStatus = 'loading' | 'found' | 'not_found' | 'error';

export const PublicMenu: React.FC<PublicMenuProps> = ({ slug, tableNumber, onNavigate }) => {
  const { addItem, totalCount, subtotal } = useCart();
  const { showToast } = useToast();

  const [status, setStatus] = useState<MenuStatus>('loading');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);

  const loadMenuData = async () => {
    setStatus('loading');
    setErrorMessage('');

    if (!slug) {
      setRestaurant(null);
      updateRestaurantMetaTags(null);
      setStatus('not_found');
      return;
    }

    try {
      const data = await StorageService.getPublicRestaurantData(slug);
      
      if (data.status === 'found' && data.restaurant) {
        setRestaurant(data.restaurant);
        setCategories(data.categories);
        setProducts(data.products);
        setAddonGroups(data.addonGroups);
        updateRestaurantMetaTags(data.restaurant, { tableNumber });
        setStatus('found');
      } else if (data.status === 'not_found') {
        setRestaurant(null);
        setCategories([]);
        setProducts([]);
        setAddonGroups([]);
        updateRestaurantMetaTags(null);
        setStatus('not_found');
      } else {
        setRestaurant(null);
        setCategories([]);
        setProducts([]);
        setAddonGroups([]);
        updateRestaurantMetaTags(null);
        setStatus('error');
        setErrorMessage('Ocorreu um erro ao consultar os dados do cardápio.');
      }
    } catch (err: any) {
      console.error('Error loading menu:', err);
      setRestaurant(null);
      setCategories([]);
      setProducts([]);
      setAddonGroups([]);
      updateRestaurantMetaTags(null);
      setStatus('error');
      setErrorMessage(err?.message || 'Falha ao carregar dados do restaurante.');
    }
  };

  // Load data for this restaurant slug without any fallback to demo
  useEffect(() => {
    loadMenuData();

    const handleStorageUpdate = () => {
      loadMenuData();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('menuzap_storage_update', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('menuzap_storage_update', handleStorageUpdate);
    };
  }, [slug, tableNumber]);

  const storeStatus = useMemo(() => {
    if (!restaurant) return { isOpen: false, message: 'Carregando...', reason: 'manual' as const };
    return getStoreStatus(restaurant.settings);
  }, [restaurant]);

  const todaySchedule = useMemo(() => {
    if (!restaurant) return '';
    return getTodaySchedule(restaurant.settings);
  }, [restaurant]);

  // Featured products
  const featuredProducts = useMemo(() => {
    return products.filter(p => p.isFeatured && p.isAvailable);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      const matchesSearch = 
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || prod.categoryId === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const handleAddToCart = (item: CartItem) => {
    addItem(item);
    showToast(`🛒 "${item.name}" adicionado à sacola!`);
  };

  const handleShareMenu = () => {
    if (!restaurant) return;
    const shareUrl = getRestaurantPublicUrl(restaurant, { tableNumber });
    const shareData = {
      title: `${restaurant.settings.name} — Cardápio Digital`,
      text: `Confira o cardápio digital de ${restaurant.settings.name}:`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        showToast('📋 Link do cardápio copiado!');
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('📋 Link do cardápio copiado!');
    }
  };

  const handleWhatsAppContact = () => {
    if (!restaurant) return;
    const cleanNum = cleanPhone(restaurant.settings.whatsapp);
    const msg = encodeURIComponent(`Olá! Estou vendo o cardápio de vocês e gostaria de tirar uma dúvida.`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanNum}&text=${msg}`, '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold font-display text-white">
              Erro ao carregar cardápio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              {errorMessage || 'Não foi possível carregar os dados deste cardápio no momento.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={loadMenuData}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('/') : (window.location.hash = '/')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir para a Página Inicial</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'not_found' || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold font-display text-white">
              Cardápio não encontrado
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              O estabelecimento com o endereço <span className="text-emerald-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">/r/{slug}</span> não foi encontrado ou não está disponível.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => onNavigate ? onNavigate('/') : (window.location.hash = '/')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('/cadastro') : (window.location.hash = '/cadastro')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Criar meu Cardápio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const theme = restaurant.settings.theme;

  return (
    <div 
      className="min-h-screen font-sans selection:bg-emerald-500 selection:text-white pb-32"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      {/* Cover Header Banner */}
      <div className="relative h-44 sm:h-56 md:h-64 w-full bg-slate-900 overflow-hidden">
        <img
          src={restaurant.settings.coverUrl}
          alt={restaurant.settings.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Top actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleShareMenu}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
            title="Compartilhar Cardápio"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Info Card (Overlapping Banner) */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
        <div 
          className="p-5 sm:p-6 shadow-xl border border-white/10"
          style={{ 
            backgroundColor: theme.cardBackgroundColor,
            borderRadius: theme.borderRadius 
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={restaurant.settings.logoUrl}
                alt={restaurant.settings.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0 -mt-10 sm:-mt-12 bg-slate-900"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-display" style={{ color: theme.textColor }}>
                    {restaurant.settings.name}
                  </h1>
                  {tableNumber && (
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                    >
                      Mesa {tableNumber}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-xl">
                  {restaurant.settings.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {restaurant.settings.address.neighborhood}, {restaurant.settings.address.city}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {todaySchedule}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Badge & WhatsApp Contact */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <button
                onClick={() => setShowHoursModal(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  storeStatus.isOpen 
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span>{storeStatus.isOpen ? 'Aberto Agora' : 'Fechado no Momento'}</span>
                <Info className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              <div className="flex items-center gap-2">
                {restaurant.settings.instagram && (
                  <a
                    href={`https://instagram.com/${restaurant.settings.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-pink-400 border border-white/10 transition"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={handleWhatsAppContact}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>Chamar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Closed Store Alert Banner */}
        {!storeStatus.isOpen && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold">O estabelecimento está fechado no momento.</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">{storeStatus.message}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por lanches, pizzas, bebidas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition backdrop-blur-md"
          />
        </div>

        {/* Categories Sticky Bar */}
        <div className="mt-5 sticky top-3 z-20 py-2 bg-slate-950/80 backdrop-blur-md -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            Todos os Itens
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Items Carousel (if any and on 'all' view) */}
        {activeCategory === 'all' && !searchTerm && featuredProducts.length > 0 && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Destaques da Casa
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="p-4 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition cursor-pointer flex gap-4 shadow-sm group"
                  style={{ backgroundColor: theme.cardBackgroundColor }}
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition duration-300"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span 
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                      >
                        Mais Pedido
                      </span>
                      <h3 className="text-sm font-bold text-white truncate mt-1">{prod.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{prod.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs sm:text-sm font-bold" style={{ color: theme.primaryColor }}>
                        {formatCurrency(prod.promotionalPrice || prod.price)}
                      </span>
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }}
                      >
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Categorized Products Feed */}
        <div className="mt-10 space-y-10">
          {(activeCategory === 'all' ? categories : categories.filter(c => c.id === activeCategory)).map(category => {
            const catProducts = filteredProducts.filter(p => p.categoryId === category.id);
            if (catProducts.length === 0) return null;

            return (
              <div key={category.id} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold font-display text-white">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => product.isAvailable && setSelectedProduct(product)}
                      className={`p-4 border transition flex gap-3.5 shadow-sm group ${
                        product.isAvailable
                          ? 'border-white/10 hover:border-emerald-500/50 cursor-pointer'
                          : 'border-white/5 opacity-50 cursor-not-allowed bg-slate-950/40'
                      }`}
                      style={{ 
                        backgroundColor: theme.cardBackgroundColor,
                        borderRadius: theme.borderRadius,
                      }}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover group-hover:scale-105 transition duration-300"
                          style={{ borderRadius: `calc(${theme.borderRadius} - 4px)` }}
                        />
                        {!product.isAvailable && (
                          <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center p-1 text-center">
                            <span className="text-[10px] font-bold text-rose-300 uppercase">Esgotado</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1">
                          <div className="flex items-baseline gap-1.5">
                            {product.promotionalPrice ? (
                              <>
                                <span className="text-xs sm:text-sm font-bold" style={{ color: theme.primaryColor }}>
                                  {formatCurrency(product.promotionalPrice)}
                                </span>
                                <span className="text-[10px] text-slate-500 line-through">
                                  {formatCurrency(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs sm:text-sm font-bold" style={{ color: theme.primaryColor }}>
                                {formatCurrency(product.price)}
                              </span>
                            )}
                          </div>

                          {product.isAvailable && (
                            <div 
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                              style={{ 
                                backgroundColor: theme.buttonColor, 
                                color: theme.buttonTextColor,
                                borderRadius: `calc(${theme.borderRadius} - 6px)` 
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button at the Bottom */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-5 font-bold text-sm flex items-center justify-between shadow-2xl transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: theme.buttonColor,
              color: theme.buttonTextColor,
              borderRadius: theme.borderRadius,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-xs font-extrabold">
                {totalCount}
              </div>
              <span>Ver Sacola</span>
            </div>
            <span>{formatCurrency(subtotal)}</span>
          </button>
        </div>
      )}

      {/* Product Selection Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          restaurant={restaurant}
          addonGroups={addonGroups}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        restaurant={restaurant}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        restaurant={restaurant}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        defaultTableNumber={tableNumber}
      />

      {/* Business Hours Info Modal */}
      {showHoursModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowHoursModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Horários de Atendimento</h3>
            </div>

            <div className="space-y-2 text-xs">
              {restaurant.settings.businessHours.map(bh => (
                <div key={bh.dayOfWeek} className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{bh.name}:</span>
                  <span className="font-semibold text-white">
                    {bh.isOpen ? `${bh.openTime} às ${bh.closeTime}` : 'Fechado'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHoursModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
