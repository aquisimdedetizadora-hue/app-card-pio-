import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';
import { Category } from '../../types';

export const CategoriesTab: React.FC = () => {
  const { currentRestaurant, refreshState } = useAuth();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const categories = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getCategories(currentRestaurant.id);
  }, [currentRestaurant]);

  const products = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getProducts(currentRestaurant.id);
  }, [currentRestaurant]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant || !name.trim()) return;

    if (editingCategory) {
      const updated: Category = {
        ...editingCategory,
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isActive,
      };
      StorageService.saveCategory(updated);
      showToast('Categoria atualizada com sucesso!');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        restaurantId: currentRestaurant.id,
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        order: categories.length + 1,
        isActive,
      };
      StorageService.saveCategory(newCat);
      showToast('Nova categoria criada!');
    }

    setIsModalOpen(false);
    refreshState();
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    const productsInCat = products.filter(p => p.categoryId === categoryId);
    if (productsInCat.length > 0) {
      if (!confirm(`A categoria "${categoryName}" possui ${productsInCat.length} produtos vinculados. Tem certeza que deseja excluí-la?`)) {
        return;
      }
    } else {
      if (!confirm(`Deseja realmente excluir a categoria "${categoryName}"?`)) {
        return;
      }
    }

    StorageService.deleteCategory(categoryId);
    showToast('Categoria excluída!');
    refreshState();
  };

  const handleToggleActive = (cat: Category) => {
    const updated = { ...cat, isActive: !cat.isActive };
    StorageService.saveCategory(updated);
    refreshState();
    showToast(updated.isActive ? `Categoria "${cat.name}" ativada!` : `Categoria "${cat.name}" ocultada.`);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!currentRestaurant) return;
    const newCats = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newCats.length) return;

    const temp = newCats[index];
    newCats[index] = newCats[targetIdx];
    newCats[targetIdx] = temp;

    StorageService.reorderCategories(currentRestaurant.id, newCats);
    refreshState();
    showToast('Ordem das categorias atualizada!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Gerenciador de Categorias</span>
          </h2>
          <p className="text-xs text-slate-400">
            Organize seu cardápio em seções claras como Hambúrgueres, Bebidas, Sobremesas, etc.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Categoria</span>
        </button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
          <h3 className="text-base font-bold text-white mb-1">Nenhuma categoria cadastrada</h3>
          <p className="text-xs text-slate-400 mb-4">
            Crie categorias para agrupar seus produtos no cardápio.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
          >
            Criar Primeira Categoria
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat, idx) => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition ${
                  cat.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-60 bg-slate-950/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Order indicator */}
                  <div className="flex flex-col gap-1 items-center">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-slate-500">{idx + 1}</span>
                    <button
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">{cat.name}</h3>
                      {!cat.isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          Inativa
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                    )}
                    <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
                      {count} {count === 1 ? 'produto' : 'produtos'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    title={cat.isActive ? 'Ocultar Categoria' : 'Ativar Categoria'}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    {cat.isActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                  </button>

                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-sky-400" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-400 border border-slate-700 hover:border-rose-800/80 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-4">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Hambúrgueres Artesanais"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição (opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ex: Preparados na brasa com carnes nobres..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Imagem / Ícone (URL opcional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Categoria ativa e visível no cardápio
                </span>
              </label>

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
                  {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
