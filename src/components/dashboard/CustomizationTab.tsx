import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Check, 
  Layout, 
  Sun, 
  Moon, 
  Smartphone, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { ThemeCustomization } from '../../types';

interface PresetTheme {
  id: string;
  name: string;
  description: string;
  theme: ThemeCustomization;
}

const PRESETS: PresetTheme[] = [
  {
    id: 'modern_dark',
    name: 'Modern Dark',
    description: 'Fundo escuro elegante com detalhes em esmeralda vibrante.',
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
  {
    id: 'clean_light',
    name: 'Clean Minimalist',
    description: 'Visual claro, limpo e super legível estilo iFood/Rappi.',
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      backgroundColor: '#f8fafc',
      cardBackgroundColor: '#ffffff',
      textColor: '#0f172a',
      accentColor: '#10b981',
      buttonColor: '#059669',
      buttonTextColor: '#ffffff',
      borderRadius: '16px',
      cardStyle: 'standard',
    },
  },
  {
    id: 'premium_gold',
    name: 'Premium Gold & Black',
    description: 'Sofisticação com tons de preto nobre e dourado.',
    theme: {
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      backgroundColor: '#09090b',
      cardBackgroundColor: '#18181b',
      textColor: '#fafafa',
      accentColor: '#facc15',
      buttonColor: '#eab308',
      buttonTextColor: '#000000',
      borderRadius: '12px',
      cardStyle: 'compact',
    },
  },
  {
    id: 'vibrant_food',
    name: 'Burger & Flame (Laranja)',
    description: 'Cores quentes que estimulam o apetite, ideal para hamburguerias.',
    theme: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      backgroundColor: '#0c0a09',
      cardBackgroundColor: '#1c1917',
      textColor: '#fafaf9',
      accentColor: '#fb923c',
      buttonColor: '#f97316',
      buttonTextColor: '#000000',
      borderRadius: '20px',
      cardStyle: 'grid',
    },
  },
  {
    id: 'pizzeria_red',
    name: 'Pizzaria Napolitana',
    description: 'Vermelho clássico italiano com tons quentes.',
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#dc2626',
      backgroundColor: '#0f0a0a',
      cardBackgroundColor: '#1c1313',
      textColor: '#fef2f2',
      accentColor: '#f87171',
      buttonColor: '#ef4444',
      buttonTextColor: '#ffffff',
      borderRadius: '16px',
      cardStyle: 'standard',
    },
  },
];

export const CustomizationTab: React.FC = () => {
  const { currentRestaurant, updateCurrentRestaurant } = useAuth();
  const { showToast } = useToast();

  const [theme, setTheme] = useState<ThemeCustomization>(
    currentRestaurant?.settings.theme || PRESETS[0].theme
  );

  const applyPreset = (preset: PresetTheme) => {
    setTheme(preset.theme);
    showToast(`Tema "${preset.name}" aplicado!`);
  };

  const handleSave = () => {
    if (!currentRestaurant) return;
    const updated = {
      ...currentRestaurant,
      settings: {
        ...currentRestaurant.settings,
        theme,
      },
    };
    updateCurrentRestaurant(updated);
    showToast('✨ Personalização visual salva com sucesso!');
  };

  const handleReset = () => {
    setTheme(PRESETS[0].theme);
    showToast('Tema restaurado para o padrão.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            <span>Personalização & Identidade Visual</span>
          </h2>
          <p className="text-xs text-slate-400">
            Personalize as cores, botões, bordas e formato dos cards do seu cardápio público.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrão</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Cores</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset & Color controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Presets Gallery */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Temas Predefinidos de 1 Clique</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 text-left transition flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                      {preset.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.theme.primaryColor }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.theme.backgroundColor }} />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Color Pickers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Ajuste Fino de Cores</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cor Primária / Destaque
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={e => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={e => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cor do Fundo da Página
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={e => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={e => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cor dos Cards de Produtos
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.cardBackgroundColor}
                    onChange={e => setTheme({ ...theme, cardBackgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.cardBackgroundColor}
                    onChange={e => setTheme({ ...theme, cardBackgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cor dos Botões de Ação
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.buttonColor}
                    onChange={e => setTheme({ ...theme, buttonColor: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.buttonColor}
                    onChange={e => setTheme({ ...theme, buttonColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Layout & Border Radius */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Estilo dos Cards no Cardápio:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Padrão (Horizontal)' },
                    { id: 'compact', label: 'Compacto' },
                    { id: 'grid', label: 'Grid com Foto Grande' },
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, cardStyle: style.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        theme.cardStyle === style.id
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Arredondamento das Bordas:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: '8px', label: 'Reto (8px)' },
                    { val: '12px', label: 'Suave (12px)' },
                    { val: '16px', label: 'Moderno (16px)' },
                    { val: '24px', label: 'Redondo (24px)' },
                  ].map(r => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setTheme({ ...theme, borderRadius: r.val })}
                      className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        theme.borderRadius === r.val
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Prévia ao Vivo no Cardápio</span>
              </span>
            </div>

            {/* Simulated Phone Shell */}
            <div 
              className="w-full rounded-3xl p-4 border-4 border-slate-800 shadow-2xl transition-colors duration-300"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              {/* Fake Restaurant Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: theme.primaryColor, color: theme.buttonTextColor }}
                >
                  MZ
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: theme.textColor }}>
                    {currentRestaurant?.settings.name || 'Seu Restaurante'}
                  </h4>
                  <span className="text-[10px] opacity-70" style={{ color: theme.textColor }}>
                    🟢 Aberto agora
                  </span>
                </div>
              </div>

              {/* Fake Product Card Preview */}
              <div 
                className="p-3.5 border transition-all duration-300 shadow-sm"
                style={{ 
                  backgroundColor: theme.cardBackgroundColor,
                  borderRadius: theme.borderRadius,
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="flex gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"
                    alt="Sample"
                    className="w-16 h-16 object-cover"
                    style={{ borderRadius: `calc(${theme.borderRadius} - 4px)` }}
                  />
                  <div className="flex-1 min-w-0">
                    <span 
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${theme.primaryColor}20`,
                        color: theme.primaryColor 
                      }}
                    >
                      Destaque
                    </span>
                    <h5 className="text-xs font-bold mt-1 truncate" style={{ color: theme.textColor }}>
                      Burger Supreme Artesanal
                    </h5>
                    <p className="text-[10px] opacity-70 line-clamp-1" style={{ color: theme.textColor }}>
                      Pão brioche, 180g carne Angus, queijo cheddar...
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold" style={{ color: theme.primaryColor }}>
                        R$ 34,90
                      </span>
                      <button
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg transition"
                        style={{
                          backgroundColor: theme.buttonColor,
                          color: theme.buttonTextColor,
                          borderRadius: `calc(${theme.borderRadius} - 6px)`
                        }}
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake Floating Cart Button */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  className="w-full py-2.5 text-xs font-bold flex items-center justify-between px-4 transition shadow-md"
                  style={{
                    backgroundColor: theme.buttonColor,
                    color: theme.buttonTextColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <span>Ver Sacola (2 itens)</span>
                  <span>R$ 69,80</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
