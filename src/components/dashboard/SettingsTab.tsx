import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  MapPin, 
  Clock, 
  Truck, 
  CreditCard, 
  Save, 
  Phone, 
  Instagram, 
  QrCode,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Restaurant, BusinessHour, PaymentSettings, DeliverySettings, RestaurantCategory } from '../../types';

const CATEGORIES_LIST: RestaurantCategory[] = [
  'Hamburgueria',
  'Pizzaria',
  'Sushi',
  'Restaurante',
  'Lanchonete',
  'Açaí',
  'Cafeteria',
  'Doceria',
  'Outro',
];

export const SettingsTab: React.FC = () => {
  const { currentRestaurant, updateCurrentRestaurant } = useAuth();
  const { showToast } = useToast();

  if (!currentRestaurant) return null;

  // General Settings State
  const [name, setName] = useState(currentRestaurant.settings.name);
  const [slug, setSlug] = useState(currentRestaurant.settings.slug);
  const [category, setCategory] = useState<RestaurantCategory>(currentRestaurant.settings.category);
  const [description, setDescription] = useState(currentRestaurant.settings.description || '');
  const [logoUrl, setLogoUrl] = useState(currentRestaurant.settings.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(currentRestaurant.settings.coverUrl || '');
  const [whatsapp, setWhatsapp] = useState(currentRestaurant.settings.whatsapp || '');
  const [phone, setPhone] = useState(currentRestaurant.settings.phone || '');
  const [instagram, setInstagram] = useState(currentRestaurant.settings.instagram || '');

  // Address
  const [street, setStreet] = useState(currentRestaurant.settings.address.street);
  const [number, setNumber] = useState(currentRestaurant.settings.address.number);
  const [complement, setComplement] = useState(currentRestaurant.settings.address.complement || '');
  const [neighborhood, setNeighborhood] = useState(currentRestaurant.settings.address.neighborhood);
  const [city, setCity] = useState(currentRestaurant.settings.address.city);
  const [state, setState] = useState(currentRestaurant.settings.address.state);
  const [zipCode, setZipCode] = useState(currentRestaurant.settings.address.zipCode || '');

  // Business Hours
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    currentRestaurant.settings.businessHours
  );
  const [isOpenManual, setIsOpenManual] = useState(currentRestaurant.settings.isOpenManual ?? true);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(currentRestaurant.settings.autoCloseEnabled ?? true);
  const [allowOrdersWhenClosed, setAllowOrdersWhenClosed] = useState(
    currentRestaurant.settings.allowOrdersWhenClosed ?? true
  );

  // Delivery Settings
  const [delivery, setDelivery] = useState<DeliverySettings>(currentRestaurant.settings.delivery);
  const [pickupEnabled, setPickupEnabled] = useState(currentRestaurant.settings.pickup.enabled);
  const [pickupMin, setPickupMin] = useState(currentRestaurant.settings.pickup.estimatedTimeMin.toString());
  const [pickupMax, setPickupMax] = useState(currentRestaurant.settings.pickup.estimatedTimeMax.toString());
  const [dineInEnabled, setDineInEnabled] = useState(currentRestaurant.settings.dineIn.enabled);

  // Payments
  const [payments, setPayments] = useState<PaymentSettings>(currentRestaurant.settings.paymentMethods);

  const handleHourChange = (idx: number, field: keyof BusinessHour, val: any) => {
    const updated = [...businessHours];
    updated[idx] = { ...updated[idx], [field]: val };
    setBusinessHours(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const updatedRestaurant: Restaurant = {
      ...currentRestaurant,
      settings: {
        ...currentRestaurant.settings,
        name: name.trim(),
        slug: cleanSlug || currentRestaurant.settings.slug,
        category,
        description: description.trim(),
        logoUrl: logoUrl.trim(),
        coverUrl: coverUrl.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        phone: phone.trim(),
        instagram: instagram.trim().replace('@', ''),
        address: {
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim() || undefined,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim() || undefined,
        },
        businessHours,
        isOpenManual,
        autoCloseEnabled,
        allowOrdersWhenClosed,
        delivery: {
          ...delivery,
          fixedFee: Number(delivery.fixedFee) || 0,
          minimumOrderValue: Number(delivery.minimumOrderValue) || 0,
          estimatedTimeMin: Number(delivery.estimatedTimeMin) || 30,
          estimatedTimeMax: Number(delivery.estimatedTimeMax) || 50,
        },
        pickup: {
          enabled: pickupEnabled,
          estimatedTimeMin: parseInt(pickupMin, 10) || 15,
          estimatedTimeMax: parseInt(pickupMax, 10) || 30,
        },
        dineIn: {
          enabled: dineInEnabled,
        },
        paymentMethods: payments,
      },
    };

    updateCurrentRestaurant(updatedRestaurant);
    showToast('💾 Configurações salvas com sucesso!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            <span>Configurações do Estabelecimento</span>
          </h2>
          <p className="text-xs text-slate-400">
            Ajuste horários, formas de entrega, formas de pagamento e dados de contato.
          </p>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Dados Gerais & Contato */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Informações Gerais & Contato</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link / Slug do Cardápio
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-400">
                  <span className="text-[11px] select-none">/r/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full bg-transparent text-white focus:outline-none ml-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Segmento
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as RestaurantCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {CATEGORIES_LIST.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição Curta / Bio
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp (Pedidos)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram (@)
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="seuperfil"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL da Logo
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL da Capa
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Endereço */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Endereço Físico</span>
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rua / Avenida
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={complement}
                  onChange={e => setComplement(e.target.value)}
                  placeholder="Sala 2, Bloco B"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  UF
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Delivery & Modalidades */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Opções de Entrega & Taxas</span>
          </h3>

          <div className="space-y-4">
            {/* Delivery Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-white">Aceitar Delivery (Entrega)</span>
                <input
                  type="checkbox"
                  checked={delivery.enabled}
                  onChange={e => setDelivery({ ...delivery, enabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                />
              </label>

              {delivery.enabled && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDelivery({ ...delivery, feeType: 'fixed' })}
                      className={`p-2 rounded-lg text-xs font-medium border cursor-pointer ${
                        delivery.feeType === 'fixed'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Taxa Fixa
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelivery({ ...delivery, feeType: 'free' })}
                      className={`p-2 rounded-lg text-xs font-medium border cursor-pointer ${
                        delivery.feeType === 'free'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Grátis
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelivery({ ...delivery, feeType: 'to_agree' })}
                      className={`p-2 rounded-lg text-xs font-medium border cursor-pointer ${
                        delivery.feeType === 'to_agree'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      A Combinar
                    </button>
                  </div>

                  {delivery.feeType === 'fixed' && (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Valor da Taxa Fixa (R$)</label>
                      <input
                        type="number"
                        step="0.50"
                        value={delivery.fixedFee}
                        onChange={e => setDelivery({ ...delivery, fixedFee: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tempo Mínimo (min)</label>
                      <input
                        type="number"
                        value={delivery.estimatedTimeMin}
                        onChange={e => setDelivery({ ...delivery, estimatedTimeMin: parseInt(e.target.value) || 30 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tempo Máximo (min)</label>
                      <input
                        type="number"
                        value={delivery.estimatedTimeMax}
                        onChange={e => setDelivery({ ...delivery, estimatedTimeMax: parseInt(e.target.value) || 50 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pickup & Dine In */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-white">Permitir Retirada no Balcão</span>
                <input
                  type="checkbox"
                  checked={pickupEnabled}
                  onChange={e => setPickupEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-white">Permitir Pedidos na Mesa (Consumo no Local)</span>
                <input
                  type="checkbox"
                  checked={dineInEnabled}
                  onChange={e => setDineInEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Formas de Pagamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Formas de Pagamento Aceitas</span>
          </h3>

          <div className="space-y-3">
            {/* PIX */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-white">PIX</span>
                <input
                  type="checkbox"
                  checked={payments.pix.enabled}
                  onChange={e => setPayments({
                    ...payments,
                    pix: { ...payments.pix, enabled: e.target.checked },
                  })}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                />
              </label>
              {payments.pix.enabled && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <select
                    value={payments.pix.keyType}
                    onChange={e => setPayments({
                      ...payments,
                      pix: { ...payments.pix, keyType: e.target.value as any },
                    })}
                    className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="chave_aleatoria">Chave Aleatória</option>
                    <option value="cpf_cnpj">CPF / CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="telefone">Telefone</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Chave Pix..."
                    value={payments.pix.key || ''}
                    onChange={e => setPayments({
                      ...payments,
                      pix: { ...payments.pix, key: e.target.value },
                    })}
                    className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Cartão de Crédito */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-xs font-bold text-white">Cartão de Crédito (na entrega/balcão)</span>
              <input
                type="checkbox"
                checked={payments.creditCard.enabled}
                onChange={e => setPayments({
                  ...payments,
                  creditCard: { ...payments.creditCard, enabled: e.target.checked },
                })}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
              />
            </label>

            {/* Cartão de Débito */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-xs font-bold text-white">Cartão de Débito (na entrega/balcão)</span>
              <input
                type="checkbox"
                checked={payments.debitCard.enabled}
                onChange={e => setPayments({
                  ...payments,
                  debitCard: { ...payments.debitCard, enabled: e.target.checked },
                })}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
              />
            </label>

            {/* Dinheiro */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white">Dinheiro (com opção de troco)</span>
              </div>
              <input
                type="checkbox"
                checked={payments.cash.enabled}
                onChange={e => setPayments({
                  ...payments,
                  cash: { ...payments.cash, enabled: e.target.checked },
                })}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
              />
            </label>

            {/* VR / Vale Refeição */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-xs font-bold text-white">Vale Refeição / Alimentação (VR, VA, Sodexo, etc)</span>
              <input
                type="checkbox"
                checked={payments.mealVoucher.enabled}
                onChange={e => setPayments({
                  ...payments,
                  mealVoucher: { ...payments.mealVoucher, enabled: e.target.checked },
                })}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* Section 5: Horários de Funcionamento (Full width) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Grade de Horários de Funcionamento</span>
              </h3>
              <p className="text-xs text-slate-400">
                Seu cardápio exibirá se a loja está aberta ou fechada e calculará os pedidos conforme estes horários.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCloseEnabled}
                  onChange={e => setAutoCloseEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700"
                />
                <span>Fechar automaticamente fora do horário</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {businessHours.map((bh, idx) => (
              <div
                key={bh.dayOfWeek}
                className={`p-3 rounded-xl border transition ${
                  bh.isOpen ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{bh.name}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-[11px] text-slate-400">{bh.isOpen ? 'Aberto' : 'Fechado'}</span>
                    <input
                      type="checkbox"
                      checked={bh.isOpen}
                      onChange={e => handleHourChange(idx, 'isOpen', e.target.checked)}
                      className="w-3.5 h-3.5 text-emerald-500 rounded bg-slate-900 border-slate-700"
                    />
                  </label>
                </div>

                {bh.isOpen && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={bh.openTime}
                      onChange={e => handleHourChange(idx, 'openTime', e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <span className="text-slate-500 text-xs">às</span>
                    <input
                      type="time"
                      value={bh.closeTime}
                      onChange={e => handleHourChange(idx, 'closeTime', e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};
