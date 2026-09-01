import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { Product, ProductVariant, AddonGroup, SelectedAddon, CartItem, Restaurant } from '../../types';
import { formatCurrency } from '../../services/whatsapp';

interface ProductModalProps {
  product: Product;
  restaurant: Restaurant;
  addonGroups: AddonGroup[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  restaurant,
  addonGroups,
  onClose,
  onAddToCart,
}) => {
  const theme = restaurant.settings.theme;

  // Selected variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0
      ? product.variants.find(v => v.isDefault) || product.variants[0]
      : undefined
  );

  // Selected addons map: groupId -> array of { optionId, name, price, quantity }
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Record<string, number>>>({});

  // Quantity of this product
  const [quantity, setQuantity] = useState<number>(1);

  // Observations
  const [observations, setObservations] = useState<string>('');

  // Filter addon groups attached to this product
  const applicableAddonGroups = useMemo(() => {
    if (!product.addonGroupIds || product.addonGroupIds.length === 0) {
      return [];
    }
    return addonGroups.filter(g => product.addonGroupIds?.includes(g.id));
  }, [product, addonGroups]);

  // Base price
  const basePrice = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.promotionalPrice || product.price;
  }, [product, selectedVariant]);

  // Addons total price per unit
  const addonsTotalPerUnit = useMemo(() => {
    let total = 0;
    applicableAddonGroups.forEach(group => {
      const groupSelections = selectedAddons[group.id] || {};
      group.options.forEach(opt => {
        const qty = groupSelections[opt.id] || 0;
        total += opt.price * qty;
      });
    });
    return total;
  }, [applicableAddonGroups, selectedAddons]);

  // Total unit price
  const unitPrice = basePrice + addonsTotalPerUnit;
  const totalPrice = unitPrice * quantity;

  // Validation: check if all required addon groups have minimum selections
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    applicableAddonGroups.forEach(group => {
      const groupSelections = selectedAddons[group.id] || {};
      const totalSelected = (Object.values(groupSelections) as number[]).reduce((a: number, b: number) => a + b, 0);

      if (group.isRequired && totalSelected < group.minQuantity) {
        errors.push(`Selecione pelo menos ${group.minQuantity} em "${group.name}".`);
      }
      if (totalSelected > group.maxQuantity) {
        errors.push(`Você pode escolher no máximo ${group.maxQuantity} em "${group.name}".`);
      }
    });
    return errors;
  }, [applicableAddonGroups, selectedAddons]);

  const isValid = validationErrors.length === 0;

  // Addon selection handlers
  const handleAddonQuantityChange = (groupId: string, optionId: string, delta: number, maxPerOption?: number) => {
    const group = applicableAddonGroups.find(g => g.id === groupId);
    if (!group) return;

    const currentGroupSelections = { ...(selectedAddons[groupId] || {}) };
    const currentQty = currentGroupSelections[optionId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    // Check group max limit
    const currentGroupTotal = (Object.entries(currentGroupSelections) as [string, number][]).reduce(
      (sum: number, [id, qty]: [string, number]) => sum + (id === optionId ? 0 : qty),
      0
    );

    if (delta > 0 && currentGroupTotal + newQty > group.maxQuantity) {
      return; // Reached group maximum
    }

    if (maxPerOption && newQty > maxPerOption) {
      return;
    }

    if (newQty === 0) {
      delete currentGroupSelections[optionId];
    } else {
      currentGroupSelections[optionId] = newQty;
    }

    setSelectedAddons({
      ...selectedAddons,
      [groupId]: currentGroupSelections,
    });
  };

  const handleToggleSingleAddon = (groupId: string, optionId: string) => {
    const group = applicableAddonGroups.find(g => g.id === groupId);
    if (!group) return;

    const currentGroupSelections = { ...(selectedAddons[groupId] || {}) };
    const isCurrentlySelected = (currentGroupSelections[optionId] || 0) > 0;

    if (group.maxQuantity === 1) {
      // Radio mode
      if (isCurrentlySelected && !group.isRequired) {
        setSelectedAddons({
          ...selectedAddons,
          [groupId]: {},
        });
      } else {
        setSelectedAddons({
          ...selectedAddons,
          [groupId]: { [optionId]: 1 },
        });
      }
    } else {
      // Checkbox mode
      handleAddonQuantityChange(groupId, optionId, isCurrentlySelected ? -1 : 1);
    }
  };

  const handleAdd = () => {
    if (!isValid) return;

    // Collect flattened selected addons list
    const addonsList: SelectedAddon[] = [];
    applicableAddonGroups.forEach(group => {
      const groupSelections = selectedAddons[group.id] || {};
      group.options.forEach(opt => {
        const qty = groupSelections[opt.id] || 0;
        if (qty > 0) {
          addonsList.push({
            addonId: opt.id,
            name: opt.name,
            price: opt.price,
            quantity: qty,
          });
        }
      });
    });

    const cartItem: CartItem = {
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      name: product.name,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      price: basePrice,
      quantity,
      addons: addonsList,
      observations: observations.trim() || undefined,
      totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full sm:max-w-xl min-h-screen sm:min-h-0 bg-slate-900 border border-slate-800 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative my-auto"
        style={{ backgroundColor: theme.cardBackgroundColor }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Header */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-950 shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {product.isFeatured && (
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                >
                  Destaque da Casa
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {product.description}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold" style={{ color: theme.primaryColor }}>
                {formatCurrency(basePrice)}
              </span>
              {product.promotionalPrice && !selectedVariant && (
                <span className="text-xs text-slate-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Escolha o Tamanho / Opção *
                </h3>
                <p className="text-[11px] text-slate-400">Selecione 1 opção</p>
              </div>

              <div className="space-y-2">
                {product.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-white/10 bg-slate-950/40 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                        <span className="text-xs font-bold text-white">{variant.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: theme.primaryColor }}>
                        {formatCurrency(variant.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Addon Groups */}
          {applicableAddonGroups.map(group => {
            const groupSelections = selectedAddons[group.id] || {};
            const totalSelected = (Object.values(groupSelections) as number[]).reduce((a: number, b: number) => a + b, 0);
            const isRadio = group.maxQuantity === 1;

            return (
              <div key={group.id} className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {group.name} {group.isRequired && <span className="text-emerald-400">*</span>}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {group.description || (isRadio ? 'Escolha 1 opção' : `Escolha até ${group.maxQuantity} opções`)}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    group.isRequired && totalSelected < group.minQuantity
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    {totalSelected} / {group.maxQuantity}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.options.map(option => {
                    const currentQty = groupSelections[option.id] || 0;
                    const isSelected = currentQty > 0;

                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          isSelected
                            ? 'border-emerald-500/80 bg-emerald-950/20'
                            : 'border-white/10 bg-slate-950/40'
                        }`}
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleToggleSingleAddon(group.id, option.id)}
                        >
                          <p className="text-xs font-bold text-white">{option.name}</p>
                          <p className="text-[11px] font-semibold" style={{ color: theme.primaryColor }}>
                            {option.price > 0 ? `+ ${formatCurrency(option.price)}` : 'Grátis'}
                          </p>
                        </div>

                        {/* Controls: Radio vs Multi-quantity Counter */}
                        {isRadio ? (
                          <div 
                            onClick={() => handleToggleSingleAddon(group.id, option.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAddonQuantityChange(group.id, option.id, -1)}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold text-white w-4 text-center">
                                  {currentQty}
                                </span>
                              </>
                            )}
                            <button
                              type="button"
                              disabled={totalSelected >= group.maxQuantity}
                              onClick={() => handleAddonQuantityChange(group.id, option.id, 1, option.maxQuantity)}
                              className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Observations */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              Alguma Observação?
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="ex: Sem cebola, molho à parte, carne bem passada..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Validation Errors Notice */}
        {validationErrors.length > 0 && (
          <div className="px-6 py-2 bg-amber-950/80 border-t border-amber-800/80 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{validationErrors[0]}</span>
          </div>
        )}

        {/* Footer Actions: Quantity & Add Button */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/60 flex items-center gap-4 shrink-0">
          {/* Main Quantity Counter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-2 py-1.5 rounded-2xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center disabled:opacity-30 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-white w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={!isValid}
            className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm transition flex items-center justify-between shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.buttonColor,
              color: theme.buttonTextColor,
              borderRadius: theme.borderRadius,
            }}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar</span>
            </span>
            <span>{formatCurrency(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
