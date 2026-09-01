import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  Tag,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { formatCurrency } from '../../services/whatsapp';
import { useToast } from '../common/Toast';
import { Product, ProductVariant } from '../../types';

export const ProductsTab: React.FC = () => {
  const { currentRestaurant, refreshState } = useAuth();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [internalCode, setInternalCode] = useState('');
  
  // Variations state
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');

  // Addon groups linking state
  const [selectedAddonGroupIds, setSelectedAddonGroupIds] = useState<string[]>([]);

  const categories = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getCategories(currentRestaurant.id);
  }, [currentRestaurant]);

  const addonGroups = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getAddonGroups(currentRestaurant.id);
  }, [currentRestaurant]);

  const products = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getProducts(currentRestaurant.id);
  }, [currentRestaurant]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setPromotionalPrice('');
    setCategoryId(categories[0]?.id || '');
    setImageUrl('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80');
    setIsAvailable(true);
    setIsFeatured(false);
    setInternalCode('');
    setHasVariants(false);
    setVariants([]);
    setSelectedAddonGroupIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setPromotionalPrice(prod.promotionalPrice ? prod.promotionalPrice.toString() : '');
    setCategoryId(prod.categoryId);
    setImageUrl(prod.imageUrl);
    setIsAvailable(prod.isAvailable);
    setIsFeatured(prod.isFeatured);
    setInternalCode(prod.internalCode || '');
    setHasVariants(!!(prod.variants && prod.variants.length > 0));
    setVariants(prod.variants || []);
    setSelectedAddonGroupIds(prod.addonGroupIds || []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!newVarName.trim() || !newVarPrice) return;
    const priceNum = parseFloat(newVarPrice);
    if (isNaN(priceNum)) return;

    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      name: newVarName.trim(),
      price: priceNum,
      isDefault: variants.length === 0,
    };

    setVariants([...variants, newVar]);
    setNewVarName('');
    setNewVarPrice('');
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const toggleAddonGroup = (groupId: string) => {
    if (selectedAddonGroupIds.includes(groupId)) {
      setSelectedAddonGroupIds(selectedAddonGroupIds.filter(id => id !== groupId));
    } else {
      setSelectedAddonGroupIds([...selectedAddonGroupIds, groupId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant || !name.trim()) return;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert('Por favor, informe um preço válido.');
      return;
    }

    const parsedPromo = promotionalPrice ? parseFloat(promotionalPrice) : undefined;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        promotionalPrice: parsedPromo,
        categoryId: categoryId || categories[0]?.id || '',
        imageUrl: imageUrl.trim(),
        isAvailable,
        isFeatured,
        internalCode: internalCode.trim() || undefined,
        variants: hasVariants && variants.length > 0 ? variants : undefined,
        addonGroupIds: selectedAddonGroupIds,
      };
      StorageService.saveProduct(updated);
      showToast(`Produto "${updated.name}" atualizado!`);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        restaurantId: currentRestaurant.id,
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        promotionalPrice: parsedPromo,
        categoryId: categoryId || categories[0]?.id || '',
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        isAvailable,
        isFeatured,
        internalCode: internalCode.trim() || undefined,
        order: products.length + 1,
        variants: hasVariants && variants.length > 0 ? variants : undefined,
        addonGroupIds: selectedAddonGroupIds,
      };
      StorageService.saveProduct(newProduct);
      showToast(`Produto "${newProduct.name}" cadastrado!`);
    }

    setIsModalOpen(false);
    refreshState();
  };

  const handleDelete = (prodId: string, prodName: string) => {
    if (!confirm(`Deseja realmente excluir o produto "${prodName}"?`)) return;
    StorageService.deleteProduct(prodId);
    showToast('Produto excluído com sucesso!');
    refreshState();
  };

  const handleToggleAvailability = (prod: Product) => {
    const updated = { ...prod, isAvailable: !prod.isAvailable };
    StorageService.saveProduct(updated);
    refreshState();
    showToast(updated.isAvailable ? `"${prod.name}" marcado como disponível!` : `"${prod.name}" marcado como indisponível.`);
  };

  const handleToggleFeatured = (prod: Product) => {
    const updated = { ...prod, isFeatured: !prod.isFeatured };
    StorageService.saveProduct(updated);
    refreshState();
    showToast(updated.isFeatured ? `"${prod.name}" adicionado aos destaques!` : `"${prod.name}" removido dos destaques.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
              <span>Gerenciador de Produtos</span>
            </h2>
            <p className="text-xs text-slate-400">
              Cadastre lanches, pratos, bebidas, fotos, adicionais e variações de tamanho.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Produto</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, ingrediente ou código..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as Categorias ({products.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({products.filter(p => p.categoryId === c.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-400 mb-4">
            {searchTerm ? 'Tente buscar com outro termo.' : 'Adicione itens ao seu cardápio.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
          >
            Cadastrar Produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(prod => {
            const cat = categories.find(c => c.id === prod.categoryId);
            return (
              <div
                key={prod.id}
                className={`bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-4 transition ${
                  prod.isAvailable ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-60 bg-slate-950/40'
                }`}
              >
                <div className="flex gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-800"
                    />
                    {!prod.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/80 rounded-xl flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-bold text-rose-300 uppercase leading-tight">
                          Indisponível
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {cat && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                          {cat.name}
                        </span>
                      )}
                      {prod.isFeatured && (
                        <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" /> Destaque
                        </span>
                      )}
                      {prod.internalCode && (
                        <span className="text-[10px] font-mono text-slate-500">
                          #{prod.internalCode}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white truncate mt-1">
                      {prod.name}
                    </h3>
                    
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {prod.description}
                    </p>

                    <div className="flex items-baseline gap-2 mt-2">
                      {prod.promotionalPrice ? (
                        <>
                          <span className="text-sm font-bold text-emerald-400">
                            {formatCurrency(prod.promotionalPrice)}
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            {formatCurrency(prod.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-emerald-400">
                          {formatCurrency(prod.price)}
                        </span>
                      )}
                      {prod.variants && prod.variants.length > 0 && (
                        <span className="text-[10px] text-slate-400">
                          ({prod.variants.length} opções de tamanho)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeatured(prod)}
                      title={prod.isFeatured ? 'Remover dos Destaques' : 'Destacar Produto'}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        prod.isFeatured
                          ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${prod.isFeatured ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleToggleAvailability(prod)}
                      title={prod.isAvailable ? 'Marcar como Indisponível' : 'Marcar como Disponível'}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {prod.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Disponível</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                          <span>Pausado</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="ex: X-Bacon Artesanal"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Código Interno
                  </label>
                  <input
                    type="text"
                    value={internalCode}
                    onChange={e => setInternalCode(e.target.value)}
                    placeholder="BUR-01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição dos Ingredientes & Detalhes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ex: Burger artesanal 180g, queijo cheddar inglês, fatias de bacon crocante e molho barbecue..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço Normal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="29.90"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço Promocional (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={promotionalPrice}
                    onChange={e => setPromotionalPrice(e.target.value)}
                    placeholder="25.90"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL da Foto do Produto
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                    <span className="text-[11px] text-slate-400">Prévia da imagem</span>
                  </div>
                )}
              </div>

              {/* Variations Toggle & Editor */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Variações de Tamanho / Opções</p>
                    <p className="text-[11px] text-slate-400">Ex: Broto, Média, Grande ou 350ml, 2L</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={e => setHasVariants(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                  />
                </div>

                {hasVariants && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nome (ex: Grande)"
                        value={newVarName}
                        onChange={e => setNewVarName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="number"
                        step="0.50"
                        placeholder="Preço (R$)"
                        value={newVarPrice}
                        onChange={e => setNewVarPrice(e.target.value)}
                        className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {variants.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded bg-slate-900 text-xs text-white">
                          <span>{v.name} — <strong>{formatCurrency(v.price)}</strong></span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Addon Groups Linker */}
              {addonGroups.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-white">Grupos de Adicionais Permitidos:</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {addonGroups.map(ag => (
                      <label key={ag.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs cursor-pointer">
                        <span className="text-slate-300">{ag.name} ({ag.options.length} opções)</span>
                        <input
                          type="checkbox"
                          checked={selectedAddonGroupIds.includes(ag.id)}
                          onChange={() => toggleAddonGroup(ag.id)}
                          className="w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={e => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs text-slate-300">Disponível no cardápio</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs text-slate-300">Produto em Destaque</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
