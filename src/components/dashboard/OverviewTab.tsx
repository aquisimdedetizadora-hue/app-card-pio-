import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  ExternalLink, 
  Copy, 
  Share2, 
  Store, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Sparkles,
  QrCode,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { formatCurrency } from '../../services/whatsapp';
import { getRestaurantPublicUrl, getRestaurantWhatsAppShareUrl } from '../../services/restaurantUrl';
import { useToast } from '../common/Toast';
import { Order } from '../../types';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenPublicMenu: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab, onOpenPublicMenu }) => {
  const { currentRestaurant, updateCurrentRestaurant } = useAuth();
  const { showToast } = useToast();

  const orders = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getOrders(currentRestaurant.id);
  }, [currentRestaurant]);

  const products = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getProducts(currentRestaurant.id);
  }, [currentRestaurant]);

  // Statistics calculation
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const ordersThisWeek = orders.filter(o => new Date(o.createdAt) >= oneWeekAgo);

    const validOrders = orders.filter(o => o.status !== 'cancelado');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    return {
      todayCount: ordersToday.length,
      weekCount: ordersThisWeek.length,
      estimatedRevenue: totalRevenue,
      averageTicket: avgTicket,
    };
  }, [orders]);

  // Top products
  const topProducts = useMemo(() => {
    const productCounts: Record<string, { name: string; count: number; revenue: number; image?: string }> = {};
    
    orders.forEach(order => {
      if (order.status === 'cancelado') return;
      order.items.forEach(item => {
        if (!productCounts[item.productId]) {
          const prod = products.find(p => p.id === item.productId);
          productCounts[item.productId] = {
            name: item.name,
            count: 0,
            revenue: 0,
            image: prod?.imageUrl,
          };
        }
        productCounts[item.productId].count += item.quantity;
        productCounts[item.productId].revenue += item.totalPrice;
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [orders, products]);

  const handleToggleManualStatus = () => {
    if (!currentRestaurant) return;
    const newStatus = !currentRestaurant.settings.isOpenManual;
    const updated = {
      ...currentRestaurant,
      settings: {
        ...currentRestaurant.settings,
        isOpenManual: newStatus,
      },
    };
    updateCurrentRestaurant(updated);
    showToast(newStatus ? '🟢 Estabelecimento aberto para pedidos!' : '🔴 Estabelecimento fechado para pedidos.');
  };

  const menuUrl = getRestaurantPublicUrl(currentRestaurant);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    showToast('📋 Link do cardápio copiado para a área de transferência!');
  };

  const handleShare = () => {
    if (!currentRestaurant) return;
    const shareData = {
      title: `${currentRestaurant.settings.name} — Cardápio Digital`,
      text: `Confira nosso cardápio digital e faça seu pedido pelo WhatsApp:`,
      url: menuUrl,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    if (!currentRestaurant) return;
    const shareUrl = getRestaurantWhatsAppShareUrl(currentRestaurant);
    window.open(shareUrl, '_blank');
  };

  if (!currentRestaurant) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Status Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Olá, {currentRestaurant.settings.name}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Acompanhe o desempenho do seu cardápio e gerencie pedidos em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge & Switch */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentRestaurant.settings.isOpenManual ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-bold text-white">
              {currentRestaurant.settings.isOpenManual ? 'Aberto para Pedidos' : 'Fechado no Momento'}
            </span>
            <button
              onClick={handleToggleManualStatus}
              className={`ml-2 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                currentRestaurant.settings.isOpenManual
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {currentRestaurant.settings.isOpenManual ? 'Pausar' : 'Abrir'}
            </button>
          </div>

          <button
            onClick={onOpenPublicMenu}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span>Ver meu cardápio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Share / Link Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-400">Link exclusivo do seu cardápio:</p>
            <p className="text-xs sm:text-sm font-mono text-white truncate max-w-xs sm:max-w-md mt-0.5" title={menuUrl}>
              {menuUrl}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Compartilhar no WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copiar link</span>
          </button>
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pedidos Hoje</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {stats.todayCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats.weekCount} nesta semana
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pedidos Esta Semana</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {stats.weekCount}
          </p>
          <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Alta demanda
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Faturamento Estimado</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-display text-emerald-400">
            {formatCurrency(stats.estimatedRevenue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            0% de taxas retidas
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Ticket Médio</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-display text-white">
            {formatCurrency(stats.averageTicket)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Por pedido enviado
          </span>
        </div>
      </div>

      {/* Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-display text-white">Últimos Pedidos</h3>
              <p className="text-xs text-slate-400">Pedidos gerados pelos clientes</p>
            </div>
            <button
              onClick={() => onNavigateTab('pedidos')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              Ver todos ({orders.length}) →
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nenhum pedido recebido ainda.</p>
              <p className="text-[11px] mt-1">Divulgue seu link para começar a vender!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 4).map(order => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{order.orderNumber}</span>
                      <span className="text-[11px] text-slate-400">• {order.customer.name}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        order.status === 'novo' ? 'bg-amber-500/20 text-amber-300' :
                        order.status === 'em_preparo' ? 'bg-blue-500/20 text-blue-300' :
                        order.status === 'concluido' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">{formatCurrency(order.total)}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{order.orderType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Sellers */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-display text-white">Produtos Mais Vendidos</h3>
                <p className="text-xs text-slate-400">Favoritos dos seus clientes</p>
              </div>
              <button
                onClick={() => onNavigateTab('produtos')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
              >
                Gerenciar →
              </button>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Os produtos mais vendidos aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topProducts.map((tp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      {tp.image ? (
                        <img src={tp.image} alt={tp.name} className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {idx + 1}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[150px]">{tp.name}</p>
                        <p className="text-[10px] text-slate-400">{tp.count} pedidos</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      {formatCurrency(tp.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('qrcode')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Baixar QR Code para Mesas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
