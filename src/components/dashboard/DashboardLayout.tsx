import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  UtensilsCrossed, 
  Sparkles, 
  Palette, 
  QrCode, 
  Settings, 
  User, 
  ExternalLink, 
  Zap, 
  Menu as MenuIcon, 
  X,
  LogOut,
  Store,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OverviewTab } from './OverviewTab';
import { OrdersTab } from './OrdersTab';
import { CategoriesTab } from './CategoriesTab';
import { ProductsTab } from './ProductsTab';
import { AddonsTab } from './AddonsTab';
import { CustomizationTab } from './CustomizationTab';
import { QRCodeTab } from './QRCodeTab';
import { SettingsTab } from './SettingsTab';
import { AccountTab } from './AccountTab';

interface DashboardLayoutProps {
  onNavigate: (route: string) => void;
  activeTab?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onNavigate, activeTab: initialTab }) => {
  const { currentRestaurant, userRestaurants, switchRestaurant, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(initialTab || 'resumo');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);

  const menuItems = [
    { id: 'resumo', label: 'Visão Geral', icon: TrendingUp },
    { id: 'pedidos', label: 'Pedidos WhatsApp', icon: ShoppingBag },
    { id: 'categorias', label: 'Categorias', icon: Layers },
    { id: 'produtos', label: 'Produtos & Cardápio', icon: UtensilsCrossed },
    { id: 'adicionais', label: 'Adicionais & Opcionais', icon: Sparkles },
    { id: 'personalizacao', label: 'Personalização Visual', icon: Palette },
    { id: 'qrcode', label: 'QR Code & Mesas', icon: QrCode },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'conta', label: 'Minha Conta', icon: User },
  ];

  const handleOpenPublicMenu = () => {
    if (currentRestaurant?.settings.slug) {
      onNavigate(`/r/${currentRestaurant.settings.slug}`);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'resumo':
        return <OverviewTab onNavigateTab={setCurrentTab} onOpenPublicMenu={handleOpenPublicMenu} />;
      case 'pedidos':
        return <OrdersTab />;
      case 'categorias':
        return <CategoriesTab />;
      case 'produtos':
        return <ProductsTab />;
      case 'adicionais':
        return <AddonsTab />;
      case 'personalizacao':
        return <CustomizationTab />;
      case 'qrcode':
        return <QRCodeTab />;
      case 'configuracoes':
        return <SettingsTab />;
      case 'conta':
        return <AccountTab onNavigate={onNavigate} />;
      default:
        return <OverviewTab onNavigateTab={setCurrentTab} onOpenPublicMenu={handleOpenPublicMenu} />;
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center text-slate-400">
          <p className="text-sm mb-3">Carregando painel do restaurante...</p>
          <button
            onClick={() => onNavigate('/login')}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Logo & Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/25 text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-black font-display tracking-tight text-white">
              Menu<span className="text-emerald-400">Zap</span>
            </span>
          </div>
        </div>

        {/* Current Restaurant Selector */}
        <div className="p-3 border-b border-slate-800 relative">
          <button
            onClick={() => setIsStoreSwitcherOpen(!isStoreSwitcherOpen)}
            className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={currentRestaurant.settings.logoUrl}
                alt={currentRestaurant.settings.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="text-left truncate">
                <p className="text-xs font-bold text-white truncate">{currentRestaurant.settings.name}</p>
                <p className="text-[10px] text-emerald-400 truncate">/{currentRestaurant.settings.slug}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Dropdown for multi-tenant switcher */}
          {isStoreSwitcherOpen && (
            <div className="absolute top-full left-3 right-3 z-30 mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-500 px-2 py-1">Seus Estabelecimentos</p>
              {userRestaurants.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    switchRestaurant(r.id);
                    setIsStoreSwitcherOpen(false);
                  }}
                  className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between cursor-pointer ${
                    r.id === currentRestaurant.id
                      ? 'bg-emerald-950 text-emerald-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{r.settings.name}</span>
                  {r.id === currentRestaurant.id && <span className="text-[10px] text-emerald-400">✓</span>}
                </button>
              ))}
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setCurrentTab('conta');
                    setIsStoreSwitcherOpen(false);
                  }}
                  className="w-full p-2 text-[11px] font-semibold text-emerald-400 hover:bg-slate-800 rounded-lg text-center"
                >
                  + Adicionar ou Gerenciar Lojas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Public Menu Link & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={handleOpenPublicMenu}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ver Cardápio Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold font-display text-white capitalize truncate">
              {menuItems.find(m => m.id === currentTab)?.label || 'Painel'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${currentRestaurant.settings.isOpenManual ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300 font-medium text-[11px]">
                {currentRestaurant.settings.isOpenManual ? 'Loja Aberta' : 'Loja Pausada'}
              </span>
            </div>

            <button
              onClick={handleOpenPublicMenu}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <span className="hidden sm:inline">Abrir Cardápio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex">
            <div className="w-72 bg-slate-900 h-full p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white">MenuZap</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleOpenPublicMenu}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Ver Cardápio Público</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
