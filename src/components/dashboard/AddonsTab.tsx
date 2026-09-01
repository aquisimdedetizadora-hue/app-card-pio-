import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  Layers,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { formatCurrency } from '../../services/whatsapp';
import { useToast } from '../common/Toast';
import { AddonGroup, AddonOption } from '../../types';

export const AddonsTab: React.FC = () => {
  const { currentRestaurant, refreshState } = useAuth();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AddonGroup | null>(null);

  // Group Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [minQuantity, setMinQuantity] = useState('0');
  const [maxQuantity, setMaxQuantity] = useState('3');
  const [options, setOptions] = useState<AddonOption[]>([]);

  // New Option inside modal
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('');

  const addonGroups = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getAddonGroups(currentRestaurant.id);
  }, [currentRestaurant]);

  const openCreateModal = () => {
    setEditingGroup(null);
    setName('');
    setDescription('');
    setIsRequired(false);
    setMinQuantity('0');
    setMaxQuantity('3');
    setOptions([
      { id: 'opt-demo-1', name: 'Bacon Extra', price: 5.0, maxQuantity: 2 },
      { id: 'opt-demo-2', name: 'Cheddar Cremoso', price: 4.0, maxQuantity: 2 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (group: AddonGroup) => {
    setEditingGroup(group);
    setName(group.name);
    setDescription(group.description || '');
    setIsRequired(group.isRequired);
    setMinQuantity(group.minQuantity.toString());
    setMaxQuantity(group.maxQuantity.toString());
    setOptions(group.options || []);
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    if (!optionName.trim()) return;
    const priceNum = parseFloat(optionPrice) || 0;

    const newOpt: AddonOption = {
      id: `opt-${Date.now()}`,
      name: optionName.trim(),
      price: priceNum,
    };

    setOptions([...options, newOpt]);
    setOptionName('');
    setOptionPrice('');
  };

  const handleRemoveOption = (optId: string) => {
    setOptions(options.filter(o => o.id !== optId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant || !name.trim()) return;

    if (options.length === 0) {
      alert('Adicione pelo menos 1 opção a este grupo.');
      return;
    }

    const minQ = parseInt(minQuantity, 10) || 0;
    const maxQ = parseInt(maxQuantity, 10) || 1;

    if (editingGroup) {
      const updated: AddonGroup = {
        ...editingGroup,
        name: name.trim(),
        description: description.trim() || undefined,
        isRequired,
        minQuantity: minQ,
        maxQuantity: maxQ,
        options,
      };
      StorageService.saveAddonGroup(updated);
      showToast('Grupo de adicionais atualizado!');
    } else {
      const newGroup: AddonGroup = {
        id: `addon-grp-${Date.now()}`,
        restaurantId: currentRestaurant.id,
        name: name.trim(),
        description: description.trim() || undefined,
        isRequired,
        minQuantity: minQ,
        maxQuantity: maxQ,
        options,
      };
      StorageService.saveAddonGroup(newGroup);
      showToast('Novo grupo de adicionais criado!');
    }

    setIsModalOpen(false);
    refreshState();
  };

  const handleDelete = (groupId: string, groupName: string) => {
    if (!confirm(`Deseja realmente excluir o grupo de adicionais "${groupName}"?`)) return;
    StorageService.deleteAddonGroup(groupId);
    showToast('Grupo excluído!');
    refreshState();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Adicionais & Complementos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Crie grupos como "Escolha até 2 adicionais", "Ponto da Carne", "Molhos Extras" e turbine suas vendas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Grupo de Adicionais</span>
        </button>
      </div>

      {/* Addon Groups List */}
      {addonGroups.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum grupo de adicionais criado</h3>
          <p className="text-xs text-slate-400 mb-4">
            Aumente seu ticket médio oferecendo queijo extra, bacon, molhos e opções personalizadas.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
          >
            Criar Primeiro Grupo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addonGroups.map(group => (
            <div
              key={group.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">{group.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    group.isRequired
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {group.isRequired ? 'Obrigatório' : 'Opcional'}
                  </span>
                </div>

                {group.description && (
                  <p className="text-xs text-slate-400 mb-3">{group.description}</p>
                )}

                <div className="text-[11px] text-slate-400 mb-3">
                  Quantidade: <strong>mín {group.minQuantity}</strong> / <strong>máx {group.maxQuantity}</strong>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  {group.options.map(opt => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950 text-xs text-slate-200"
                    >
                      <span>{opt.name}</span>
                      <span className="font-bold text-emerald-400">
                        {opt.price > 0 ? `+ ${formatCurrency(opt.price)}` : 'Grátis'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => openEditModal(group)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(group.id, group.name)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-4">
              {editingGroup ? 'Editar Grupo de Adicionais' : 'Novo Grupo de Adicionais'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Escolha seus Adicionais, Ponto da Carne..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instrução / Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ex: Escolha até 2 opções para turbinar seu lanche"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Obrigatório?
                  </label>
                  <select
                    value={isRequired ? 'yes' : 'no'}
                    onChange={e => {
                      const req = e.target.value === 'yes';
                      setIsRequired(req);
                      if (req && parseInt(minQuantity) === 0) setMinQuantity('1');
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="no">Opcional</option>
                    <option value="yes">Obrigatório</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Qtd Mínima
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minQuantity}
                    onChange={e => setMinQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Qtd Máxima
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxQuantity}
                    onChange={e => setMaxQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* Options list inside modal */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-white">Opções Cadastradas ({options.length})</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do adicional (ex: Bacon 50g)"
                    value={optionName}
                    onChange={e => setOptionName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="number"
                    step="0.50"
                    placeholder="Preço (R$)"
                    value={optionPrice}
                    onChange={e => setOptionPrice(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {options.map(opt => (
                    <div key={opt.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-white">
                      <span>{opt.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">
                          {opt.price > 0 ? formatCurrency(opt.price) : 'Grátis'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="text-rose-400 hover:text-rose-300 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                  {editingGroup ? 'Salvar Alterações' : 'Criar Grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
