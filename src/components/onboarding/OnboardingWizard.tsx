import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Clock, 
  Truck, 
  PlusCircle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  Sparkles,
  Phone,
  Instagram
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { RestaurantCategory, Restaurant, Category, Product } from '../../types';
import { StorageService } from '../../services/storage';

interface OnboardingWizardProps {
  onNavigate: (route: string) => void;
}

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

const PRESET_COVERS: Record<RestaurantCategory, string> = {
  Hamburgueria: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
  Pizzaria: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  Sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
  Restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  Lanchonete: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80',
  Açaí: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=80',
  Cafeteria: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  Doceria: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
  Outro: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
};

const PRESET_LOGOS: Record<RestaurantCategory, string> = {
  Hamburgueria: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&h=200&q=80',
  Pizzaria: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=200&h=200&q=80',
  Sushi: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=200&h=200&q=80',
  Restaurante: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&h=200&q=80',
  Lanchonete: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=200&h=200&q=80',
  Açaí: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=200&h=200&q=80',
  Cafeteria: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&h=200&q=80',
  Doceria: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&h=200&q=80',
  Outro: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&h=200&q=80',
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onNavigate }) => {
  const { currentRestaurant, updateCurrentRestaurant, refreshState } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);

  // Form State initialized from currentRestaurant or defaults
  const [name, setName] = useState(currentRestaurant?.settings.name || '');
  const [category, setCategory] = useState<RestaurantCategory>(currentRestaurant?.settings.category || 'Hamburgueria');
  const [description, setDescription] = useState(currentRestaurant?.settings.description || '');
  const [logoUrl, setLogoUrl] = useState(currentRestaurant?.settings.logoUrl || PRESET_LOGOS['Hamburgueria']);
  const [coverUrl, setCoverUrl] = useState(currentRestaurant?.settings.coverUrl || PRESET_COVERS['Hamburgueria']);
  const [whatsapp, setWhatsapp] = useState(currentRestaurant?.settings.whatsapp || '');
  const [instagram, setInstagram] = useState(currentRestaurant?.settings.instagram || '');
  
  // Address
  const [street, setStreet] = useState(currentRestaurant?.settings.address.street || '');
  const [number, setNumber] = useState(currentRestaurant?.settings.address.number || '');
  const [neighborhood, setNeighborhood] = useState(currentRestaurant?.settings.address.neighborhood || '');
  const [city, setCity] = useState(currentRestaurant?.settings.address.city || 'São Paulo');
  const [state, setState] = useState(currentRestaurant?.settings.address.state || 'SP');

  // Business Hours
  const [openTime, setOpenTime] = useState('18:00');
  const [closeTime, setCloseTime] = useState('23:30');
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // Delivery settings
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [dineInEnabled, setDineInEnabled] = useState(true);
  const [feeType, setFeeType] = useState<'fixed' | 'free' | 'to_agree'>('fixed');
  const [fixedFee, setFixedFee] = useState('5.00');

  // First Category & Product
  const [categoryName, setCategoryName] = useState('Destaques da Casa');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('28.90');
  const [productImage, setProductImage] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80');

  const handleCategoryChange = (cat: RestaurantCategory) => {
    setCategory(cat);
    setLogoUrl(PRESET_LOGOS[cat] || PRESET_LOGOS['Outro']);
    setCoverUrl(PRESET_COVERS[cat] || PRESET_COVERS['Outro']);
  };

  const toggleDay = (day: number) => {
    if (activeDays.includes(day)) {
      if (activeDays.length > 1) {
        setActiveDays(activeDays.filter(d => d !== day));
      }
    } else {
      setActiveDays([...activeDays, day].sort());
    }
  };

  const handleFinish = () => {
    if (!currentRestaurant) return;

    const daysName = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const businessHours = [0, 1, 2, 3, 4, 5, 6].map(d => ({
      dayOfWeek: d,
      name: daysName[d],
      isOpen: activeDays.includes(d),
      openTime: openTime,
      closeTime: closeTime,
    }));

    const updatedRestaurant: Restaurant = {
      ...currentRestaurant,
      settings: {
        ...currentRestaurant.settings,
        name: name || currentRestaurant.settings.name,
        category: category,
        description: description || `O melhor de ${category.toLowerCase()} na sua região!`,
        whatsapp: whatsapp.replace(/\D/g, '') || currentRestaurant.settings.whatsapp,
        phone: whatsapp || currentRestaurant.settings.phone,
        instagram: instagram || undefined,
        logoUrl: logoUrl,
        coverUrl: coverUrl,
        address: {
          street: street || 'Av. Principal',
          number: number || '100',
          neighborhood: neighborhood || 'Centro',
          city: city || 'São Paulo',
          state: state || 'SP',
        },
        businessHours,
        delivery: {
          enabled: deliveryEnabled,
          feeType: feeType,
          fixedFee: feeType === 'fixed' ? parseFloat(fixedFee) || 5.0 : 0,
          estimatedTimeMin: 30,
          estimatedTimeMax: 50,
          minimumOrderValue: 0,
        },
        pickup: {
          enabled: pickupEnabled,
          estimatedTimeMin: 15,
          estimatedTimeMax: 30,
        },
        dineIn: {
          enabled: dineInEnabled,
        },
      },
    };

    // Save restaurant
    updateCurrentRestaurant(updatedRestaurant);

    // Save initial category
    const newCatId = `cat-${Date.now()}`;
    const newCategory: Category = {
      id: newCatId,
      restaurantId: currentRestaurant.id,
      name: categoryName || 'Especiais',
      description: 'Nossos produtos mais pedidos',
      order: 1,
      isActive: true,
    };
    StorageService.saveCategory(newCategory);

    // Save initial product
    if (productName) {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        restaurantId: currentRestaurant.id,
        categoryId: newCatId,
        name: productName,
        description: productDesc || 'Preparado com ingredientes selecionados e muito carinho.',
        price: parseFloat(productPrice) || 20.0,
        imageUrl: productImage || PRESET_LOGOS[category],
        isAvailable: true,
        isFeatured: true,
        order: 1,
      };
      StorageService.saveProduct(newProduct);
    }

    refreshState();

    // Trigger celebration confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast('🎉 Estabelecimento configurado com sucesso!');
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold font-display text-white text-base">
              Configuração Inicial do Restaurante
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
            Etapa {step} de 5
          </span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-between">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Etapa 1</span>
                <h2 className="text-2xl font-bold font-display text-white mt-1">
                  Vamos configurar seu estabelecimento
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Como os clientes vão conhecer o seu negócio?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome do Estabelecimento
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="ex: Burger House, Pizzaria Bella..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Segmento / Categoria Principal
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CATEGORIES_LIST.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`p-3 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between cursor-pointer ${
                          category === cat
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{cat}</span>
                        {category === cat && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Etapa 2</span>
                <h2 className="text-2xl font-bold font-display text-white mt-1">
                  Identidade Visual & Contato
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adicione sua logo, foto de capa e canais de contato para seus clientes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Foto da Logo (URL)
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                      <span className="text-[11px] text-slate-400">Prévia da Logo</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Foto de Capa (URL)
                    </label>
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={e => setCoverUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <div className="mt-2 h-12 rounded-lg overflow-hidden border border-slate-700">
                      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Descrição Curta / Slogan
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="ex: Hambúrgueres artesanais preparados na brasa com carnes nobres..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp para Receber Pedidos
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram (@perfil)
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="seurestaurante"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Endereço do Estabelecimento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Rua / Avenida"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={number}
                      onChange={e => setNumber(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Etapa 3</span>
                <h2 className="text-2xl font-bold font-display text-white mt-1">
                  Horário de Funcionamento
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Defina os dias e horários em que seu cardápio aceitará pedidos automaticamente.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Dias de Funcionamento
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { d: 0, label: 'Domingo' },
                      { d: 1, label: 'Segunda' },
                      { d: 2, label: 'Terça' },
                      { d: 3, label: 'Quarta' },
                      { d: 4, label: 'Quinta' },
                      { d: 5, label: 'Sexta' },
                      { d: 6, label: 'Sábado' },
                    ].map(item => {
                      const isSel = activeDays.includes(item.d);
                      return (
                        <button
                          key={item.d}
                          type="button"
                          onClick={() => toggleDay(item.d)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                            isSel
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Horário de Abertura
                    </label>
                    <input
                      type="time"
                      value={openTime}
                      onChange={e => setOpenTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Horário de Fechamento
                    </label>
                    <input
                      type="time"
                      value={closeTime}
                      onChange={e => setCloseTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Etapa 4</span>
                <h2 className="text-2xl font-bold font-display text-white mt-1">
                  Opções de Entrega & Taxas
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Como os clientes poderão receber os pedidos?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Modalidades aceitas:
                  </label>
                  
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Delivery (Entrega em Domicílio)</p>
                        <p className="text-[11px] text-slate-400">Cliente informa endereço completo</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={deliveryEnabled}
                      onChange={e => setDeliveryEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Retirada no Balcão</p>
                        <p className="text-[11px] text-slate-400">Cliente retira no seu endereço</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pickupEnabled}
                      onChange={e => setPickupEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Consumo no Local (Mesa)</p>
                        <p className="text-[11px] text-slate-400">Cliente informa o número da mesa</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dineInEnabled}
                      onChange={e => setDineInEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                    />
                  </label>
                </div>

                {deliveryEnabled && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Taxa de Entrega:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFeeType('fixed')}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          feeType === 'fixed'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Valor Fixo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeType('free')}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          feeType === 'free'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Grátis
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeType('to_agree')}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          feeType === 'to_agree'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        A Combinar
                      </button>
                    </div>

                    {feeType === 'fixed' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Valor da Taxa Fixa (R$)
                        </label>
                        <input
                          type="number"
                          step="0.50"
                          value={fixedFee}
                          onChange={e => setFixedFee(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Etapa 5</span>
                <h2 className="text-2xl font-bold font-display text-white mt-1">
                  Primeira Categoria & Produto
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cadastre seu primeiro item para que o cardápio já nasça pronto para vender.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    placeholder="ex: Hambúrgueres, Pizzas, Combos..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    required
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" /> Primeiro Produto
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Nome do Produto
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={e => setProductName(e.target.value)}
                        placeholder="ex: X-Burger Especial"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.50"
                        value={productPrice}
                        onChange={e => setProductPrice(e.target.value)}
                        placeholder="29.90"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Descrição do Produto
                    </label>
                    <textarea
                      rows={2}
                      value={productDesc}
                      onChange={e => setProductDesc(e.target.value)}
                      placeholder="ex: Pão brioche, burger 160g, queijo cheddar derretido e maionese verde..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Foto do Produto (URL)
                    </label>
                    <input
                      type="url"
                      value={productImage}
                      onChange={e => setProductImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Concluir e Ir para o Painel</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
