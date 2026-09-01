import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Restaurant } from '../../types';
import { formatCurrency } from '../../services/whatsapp';

interface CartDrawerProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  restaurant,
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalCount } = useCart();
  const theme = restaurant.settings.theme;

  if (!isOpen) return null;

  const minOrder = restaurant.settings.delivery.minimumOrderValue || 0;
  const isBelowMin = minOrder > 0 && subtotal < minOrder;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between"
        style={{ backgroundColor: theme.cardBackgroundColor }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
            >
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sua Sacola</h3>
              <p className="text-[11px] text-slate-400">{totalCount} {totalCount === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded hover:bg-rose-950/40 transition cursor-pointer"
              >
                Limpar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 divide-y divide-white/10">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-16 h-16 mb-3 opacity-30 text-slate-500" />
              <h4 className="text-base font-bold text-white mb-1">Sua sacola está vazia</h4>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Adicione produtos deliciosos do cardápio para fazer seu pedido!
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md"
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonTextColor,
                  borderRadius: theme.borderRadius,
                }}
              >
                Explorar Cardápio
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="pt-3.5 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <span className="text-[11px] font-semibold text-emerald-400 block">
                        Tamanho: {item.variantName}
                      </span>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <div className="text-[11px] text-slate-400 mt-0.5 space-y-0.5">
                        {item.addons.map((addon, aIdx) => (
                          <p key={aIdx}>
                            + {addon.quantity}x {addon.name} ({formatCurrency(addon.price * addon.quantity)})
                          </p>
                        ))}
                      </div>
                    )}
                    {item.observations && (
                      <p className="text-[11px] text-amber-300/80 italic mt-1">
                        Obs: "{item.observations}"
                      </p>
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-bold shrink-0" style={{ color: theme.primaryColor }}>
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>

                  <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 px-2 py-1 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/80 space-y-3 shrink-0">
            {isBelowMin && (
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Pedido mínimo para entrega: {formatCurrency(minOrder)}. Adicione mais itens!</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({totalCount} itens)</span>
                <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxa de Entrega</span>
                <span className="text-emerald-400 font-semibold">Calculada no checkout</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Total Estimado</span>
                <span style={{ color: theme.primaryColor }}>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              disabled={isBelowMin}
              className="w-full py-3.5 px-5 font-bold text-sm transition flex items-center justify-between shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.buttonColor,
                color: theme.buttonTextColor,
                borderRadius: theme.borderRadius,
              }}
            >
              <span>Continuar para Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
