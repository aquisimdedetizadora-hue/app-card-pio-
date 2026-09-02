import React, { useState } from 'react';
import { 
  User, 
  Store, 
  Plus, 
  LogOut, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { generateUniqueSlug } from '../../services/restaurantUrl';
import { useToast } from '../common/Toast';
import { Restaurant, Category, Product } from '../../types';

interface AccountTabProps {
  onNavigate: (route: string) => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    currentRestaurant, 
    userRestaurants, 
    switchRestaurant, 
    logout, 
    updateCurrentUser,
    refreshState 
  } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // New restaurant modal
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreWhatsapp, setNewStoreWhatsapp] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateCurrentUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    showToast('👤 Dados de perfil atualizados com sucesso!');
  };

  const handleCreateNewRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newStoreName.trim()) return;

    const existingSlugs = StorageService.getRestaurants().map(r => r.settings?.slug || '');
    const uniqueSlug = generateUniqueSlug(newStoreName, existingSlugs);
    const newRestaurantId = `rest-${Date.now()}`;

    const newRestaurant: Restaurant = {
      id: newRestaurantId,
      ownerId: currentUser.id,
      settings: {
        name: newStoreName.trim(),
        slug: uniqueSlug,
        category: 'Hamburgueria',
        description: 'Bem-vindo ao nosso cardápio digital!',
        logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&h=200&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
        whatsapp: (newStoreWhatsapp || currentUser.phone || '11999999999').replace(/\D/g, ''),
        phone: newStoreWhatsapp || currentUser.phone || '',
        address: {
          street: 'Av. Brasil',
          number: '500',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        },
        businessHours: [0, 1, 2, 3, 4, 5, 6].map(d => ({
          dayOfWeek: d,
          name: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d],
          isOpen: true,
          openTime: '18:00',
          closeTime: '23:30',
        })),
        isOpenManual: true,
        autoCloseEnabled: true,
        allowOrdersWhenClosed: true,
        delivery: {
          enabled: true,
          feeType: 'fixed',
          fixedFee: 5.0,
          estimatedTimeMin: 30,
          estimatedTimeMax: 50,
          minimumOrderValue: 0,
        },
        pickup: {
          enabled: true,
          estimatedTimeMin: 15,
          estimatedTimeMax: 30,
        },
        dineIn: {
          enabled: true,
        },
        paymentMethods: {
          pix: { enabled: true, keyType: 'chave_aleatoria' },
          creditCard: { enabled: true },
          debitCard: { enabled: true },
          cash: { enabled: true, allowChange: true },
          mealVoucher: { enabled: false },
        },
        theme: {
          primaryColor: '#10b981',
          secondaryColor: '#059669',
          backgroundColor: '#020617',
          cardBackgroundColor: '#0f172a',
          textColor: '#f8fafc',
          accentColor: '#34d399',
          buttonColor: '#10b981',
          buttonTextColor: '#020617',
          borderRadius: '16px',
          cardStyle: 'standard',
        },
      },
    };

    StorageService.saveRestaurant(newRestaurant);

    // Initialize starter category and product for this store
    const initialCat: Category = {
      id: `cat-${newRestaurantId}-1`,
      restaurantId: newRestaurantId,
      name: 'Destaques',
      description: 'Nossos produtos mais pedidos',
      order: 1,
      isActive: true,
    };
    StorageService.saveCategory(initialCat);

    const initialProd: Product = {
      id: `prod-${newRestaurantId}-1`,
      restaurantId: newRestaurantId,
      categoryId: initialCat.id,
      name: `${newStoreName.trim()} Especial`,
      description: 'Preparado artesanalmente com ingredientes de primeira qualidade.',
      price: 28.90,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      order: 1,
    };
    StorageService.saveProduct(initialProd);

    switchRestaurant(newRestaurant.id);
    setIsNewStoreModalOpen(false);
    showToast(`🏪 Estabelecimento "${newRestaurant.settings.name}" criado com sucesso!`);
    onNavigate('/dashboard');
  };

  const handleResetData = () => {
    if (!confirm('Atenção: Isso irá restaurar todos os dados do MenuZap para o padrão inicial de demonstração. Deseja continuar?')) {
      return;
    }
    StorageService.resetDemoData();
    refreshState();
    showToast('Dados restaurados para o padrão de demonstração!');
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    showToast('Desconectado com sucesso.');
    onNavigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Minha Conta & Estabelecimentos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie seus dados de acesso e alterne entre seus restaurantes cadastrados (SaaS Multi-tenant).
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-300 font-semibold text-xs border border-slate-700 hover:border-rose-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Restaurant Switcher Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Seus Estabelecimentos ({userRestaurants.length})</span>
            </h3>
            <button
              onClick={() => setIsNewStoreModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Local</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {userRestaurants.map(rest => {
              const isCurrent = rest.id === currentRestaurant?.id;
              return (
                <div
                  key={rest.id}
                  onClick={() => switchRestaurant(rest.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isCurrent
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rest.settings.logoUrl}
                      alt={rest.settings.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">{rest.settings.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {rest.settings.category} • /{rest.settings.slug}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Responsible Profile Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dados do Responsável</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Responsável
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail de Login
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telefone de Contato
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
              >
                Salvar Alterações de Perfil
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone: Demo Reset */}
        <div className="lg:col-span-2 bg-slate-900 border border-rose-900/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold">Zona de Manutenção & Dados Demo</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Precisa recomeçar os testes do MenuZap do zero? O botão abaixo restaura todo o banco de dados simulado para a hamburgueria demo com produtos e categorias de exemplo.
          </p>

          <div className="pt-2">
            <button
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Dados Iniciais de Demonstração</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Restaurant Modal */}
      {isNewStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-2">
              Adicionar Novo Estabelecimento
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Crie uma filial ou outro negócio com cardápio e WhatsApp totalmente independentes.
            </p>

            <form onSubmit={handleCreateNewRestaurant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Estabelecimento *
                </label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  placeholder="ex: Pizzaria Bella Napoli"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp para Pedidos
                </label>
                <input
                  type="tel"
                  value={newStoreWhatsapp}
                  onChange={e => setNewStoreWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewStoreModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  Criar Estabelecimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
