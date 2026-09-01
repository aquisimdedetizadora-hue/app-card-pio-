import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  Store, 
  Sparkles, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  Copy, 
  MessageSquare,
  AlertCircle,
  Clock,
  Phone,
  User,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { Restaurant, OrderType, PaymentMethodType, Order, Address } from '../../types';
import { StorageService } from '../../services/storage';
import { buildWhatsAppOrderMessage, buildWhatsAppUrl, formatCurrency } from '../../services/whatsapp';
import { useToast } from '../common/Toast';

interface CheckoutModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  defaultTableNumber?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  defaultTableNumber,
}) => {
  const { items, subtotal, totalCount, clearCart } = useCart();
  const { showToast } = useToast();
  const theme = restaurant.settings.theme;

  const [step, setStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState<string>('');

  // Step 1: Identification & Order Type
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>(
    restaurant.settings.delivery.enabled ? 'delivery' :
    restaurant.settings.pickup.enabled ? 'pickup' : 'dine_in'
  );

  // Step 2: Address / Table
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [tableNumber, setTableNumber] = useState(defaultTableNumber || '');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix');
  const [needChange, setNeedChange] = useState(false);
  const [changeForAmount, setChangeForAmount] = useState('');
  const [generalObservations, setGeneralObservations] = useState('');

  if (!isOpen) return null;

  // Calculate Delivery Fee
  const deliveryFee = orderType === 'delivery' 
    ? (restaurant.settings.delivery.feeType === 'fixed' ? restaurant.settings.delivery.fixedFee : 0)
    : 0;

  const finalTotal = subtotal + deliveryFee;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, informe seu nome e telefone WhatsApp.');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        alert('Por favor, preencha os dados de endereço para entrega.');
        return;
      }
    } else if (orderType === 'dine_in') {
      if (!tableNumber.trim()) {
        alert('Por favor, informe o número da mesa.');
        return;
      }
    }
    setStep(3);
  };

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryAddress: Address | undefined = orderType === 'delivery' ? {
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      neighborhood: neighborhood.trim(),
      city: restaurant.settings.address.city,
      state: restaurant.settings.address.state,
      referencePoint: referencePoint.trim() || undefined,
    } : undefined;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      restaurantId: restaurant.id,
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      },
      orderType,
      items,
      deliveryAddress,
      tableNumber: orderType === 'dine_in' ? tableNumber.trim() : undefined,
      paymentMethod,
      needChange: paymentMethod === 'dinheiro' ? needChange : undefined,
      changeForAmount: (paymentMethod === 'dinheiro' && needChange) ? parseFloat(changeForAmount) : undefined,
      subtotal,
      deliveryFee,
      total: finalTotal,
      status: 'novo',
      whatsappSent: true,
      generalObservations: generalObservations.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // 1. Save in local database
    StorageService.saveOrder(newOrder);

    // 2. Build WhatsApp formatted message & URL
    const message = buildWhatsAppOrderMessage(newOrder, restaurant);
    const waUrl = buildWhatsAppUrl(restaurant.settings.whatsapp, message);

    setCreatedOrder(newOrder);
    setGeneratedWhatsAppUrl(waUrl);
    setIsCompleted(true);

    // 3. Clear cart
    clearCart();

    // 4. Trigger celebration confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });

    // 5. Open WhatsApp directly in new window
    window.open(waUrl, '_blank');
  };

  const handleCopyPixKey = () => {
    const key = restaurant.settings.paymentMethods.pix.key || 'chave-pix-restaurante';
    navigator.clipboard.writeText(key);
    showToast('Chave PIX copiada para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-auto"
        style={{ backgroundColor: theme.cardBackgroundColor }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {isCompleted ? 'Pedido Enviado com Sucesso!' : 'Finalizar Pedido'}
            </h3>
            {!isCompleted && (
              <p className="text-xs text-slate-400">Etapa {step} de 3</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed State */}
        {isCompleted && createdOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Pedido {createdOrder.orderNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                Pronto para Enviar no WhatsApp!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
                Uma janela com a sua mensagem pré-formatada foi aberta. Caso ela não tenha aberto automaticamente, clique no botão verde abaixo:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400 font-bold text-sm">{formatCurrency(createdOrder.total)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Forma de Pagamento:</span>
                <span className="text-white font-semibold uppercase">{createdOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tipo:</span>
                <span className="text-white font-semibold uppercase">{createdOrder.orderType}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={generatedWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Abrir Mensagem no WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition"
              >
                Voltar ao Cardápio
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Step 1: Identification & Order Type */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    1. Como podemos te chamar?
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="ex: Carlos Silva"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Seu WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    2. Onde você vai saborear?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {restaurant.settings.delivery.enabled && (
                      <button
                        type="button"
                        onClick={() => setOrderType('delivery')}
                        className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          orderType === 'delivery'
                            ? 'border-emerald-500 bg-emerald-950/30 text-white'
                            : 'border-white/10 bg-slate-950/40 text-slate-400'
                        }`}
                      >
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span>Delivery</span>
                      </button>
                    )}

                    {restaurant.settings.pickup.enabled && (
                      <button
                        type="button"
                        onClick={() => setOrderType('pickup')}
                        className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          orderType === 'pickup'
                            ? 'border-emerald-500 bg-emerald-950/30 text-white'
                            : 'border-white/10 bg-slate-950/40 text-slate-400'
                        }`}
                      >
                        <Store className="w-4 h-4 text-amber-400" />
                        <span>Retirada</span>
                      </button>
                    )}

                    {restaurant.settings.dineIn.enabled && (
                      <button
                        type="button"
                        onClick={() => setOrderType('dine_in')}
                        className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          orderType === 'dine_in'
                            ? 'border-emerald-500 bg-emerald-950/30 text-white'
                            : 'border-white/10 bg-slate-950/40 text-slate-400'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        <span>Na Mesa</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                    style={{
                      backgroundColor: theme.buttonColor,
                      color: theme.buttonTextColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <span>Avançar para Detalhes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Delivery Address or Table Number */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                {orderType === 'delivery' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Endereço de Entrega
                    </h4>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Rua / Av *</label>
                        <input
                          type="text"
                          value={street}
                          onChange={e => setStreet(e.target.value)}
                          placeholder="Rua das Flores"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Número *</label>
                        <input
                          type="text"
                          value={number}
                          onChange={e => setNumber(e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Bairro *</label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={e => setNeighborhood(e.target.value)}
                          placeholder="Centro"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Complemento</label>
                        <input
                          type="text"
                          value={complement}
                          onChange={e => setComplement(e.target.value)}
                          placeholder="Apto 42, Bloco C"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ponto de Referência</label>
                      <input
                        type="text"
                        value={referencePoint}
                        onChange={e => setReferencePoint(e.target.value)}
                        placeholder="ex: Próximo à padaria central"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs flex items-center justify-between">
                      <span className="text-slate-400">Taxa de Entrega:</span>
                      <span className="text-emerald-400 font-bold">
                        {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}
                      </span>
                    </div>
                  </div>
                )}

                {orderType === 'pickup' && (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 text-xs space-y-2 text-center">
                    <Store className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                    <h4 className="font-bold text-white">Retirada no Balcão</h4>
                    <p className="text-slate-300">
                      {restaurant.settings.address.street}, {restaurant.settings.address.number} - {restaurant.settings.address.neighborhood}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      Tempo estimado de preparo: {restaurant.settings.pickup.estimatedTimeMin} a {restaurant.settings.pickup.estimatedTimeMax} min
                    </p>
                  </div>
                )}

                {orderType === 'dine_in' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Consumo no Local
                    </h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Qual é o número da sua Mesa? *
                      </label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={e => setTableNumber(e.target.value)}
                        placeholder="ex: 04"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-white font-bold"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-5 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                    style={{
                      backgroundColor: theme.buttonColor,
                      color: theme.buttonTextColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <span>Ir para Pagamento</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Payment & Observations */}
            {step === 3 && (
              <form onSubmit={handleFinalizeOrder} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Forma de Pagamento
                  </h4>

                  <div className="space-y-2">
                    {/* Pix */}
                    {restaurant.settings.paymentMethods.pix.enabled && (
                      <div
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition ${
                          paymentMethod === 'pix'
                            ? 'border-emerald-500 bg-emerald-950/30'
                            : 'border-white/10 bg-slate-950/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white">PIX (Rápido e sem taxas)</span>
                          </div>
                          <input
                            type="radio"
                            name="pay"
                            checked={paymentMethod === 'pix'}
                            onChange={() => setPaymentMethod('pix')}
                            className="text-emerald-500"
                          />
                        </div>

                        {paymentMethod === 'pix' && restaurant.settings.paymentMethods.pix.key && (
                          <div className="p-2 rounded-lg bg-slate-950 text-[11px] flex items-center justify-between border border-white/5">
                            <span className="font-mono text-emerald-400 truncate max-w-[200px]">
                              {restaurant.settings.paymentMethods.pix.key}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyPixKey}
                              className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                            >
                              <Copy className="w-3 h-3 text-emerald-400" />
                              <span>Copiar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Credit Card */}
                    {restaurant.settings.paymentMethods.creditCard.enabled && (
                      <label 
                        onClick={() => setPaymentMethod('cartao_credito')}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          paymentMethod === 'cartao_credito'
                            ? 'border-emerald-500 bg-emerald-950/30'
                            : 'border-white/10 bg-slate-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-bold text-white">Cartão de Crédito</span>
                        </div>
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMethod === 'cartao_credito'}
                          onChange={() => setPaymentMethod('cartao_credito')}
                        />
                      </label>
                    )}

                    {/* Debit Card */}
                    {restaurant.settings.paymentMethods.debitCard.enabled && (
                      <label 
                        onClick={() => setPaymentMethod('cartao_debito')}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          paymentMethod === 'cartao_debito'
                            ? 'border-emerald-500 bg-emerald-950/30'
                            : 'border-white/10 bg-slate-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-white">Cartão de Débito</span>
                        </div>
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMethod === 'cartao_debito'}
                          onChange={() => setPaymentMethod('cartao_debito')}
                        />
                      </label>
                    )}

                    {/* Cash */}
                    {restaurant.settings.paymentMethods.cash.enabled && (
                      <div
                        onClick={() => setPaymentMethod('dinheiro')}
                        className={`p-3 rounded-xl border space-y-2 cursor-pointer transition ${
                          paymentMethod === 'dinheiro'
                            ? 'border-emerald-500 bg-emerald-950/30'
                            : 'border-white/10 bg-slate-950/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <DollarSign className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-white">Dinheiro</span>
                          </div>
                          <input
                            type="radio"
                            name="pay"
                            checked={paymentMethod === 'dinheiro'}
                            onChange={() => setPaymentMethod('dinheiro')}
                          />
                        </div>

                        {paymentMethod === 'dinheiro' && (
                          <div className="pt-2 border-t border-white/10 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                              <input
                                type="checkbox"
                                checked={needChange}
                                onChange={e => setNeedChange(e.target.checked)}
                                className="w-3.5 h-3.5 text-emerald-500"
                              />
                              <span>Precisa de troco?</span>
                            </label>
                            {needChange && (
                              <input
                                type="number"
                                step="1"
                                placeholder="Troco para quanto? (ex: 50)"
                                value={changeForAmount}
                                onChange={e => setChangeForAmount(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Observations */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Observação Geral do Pedido (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={generalObservations}
                    onChange={e => setGeneralObservations(e.target.value)}
                    placeholder="ex: Tocar o interfone 302, deixar na portaria..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white"
                  />
                </div>

                {/* Totals Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Taxa de Entrega:</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                    <span>Total a Pagar:</span>
                    <span style={{ color: theme.primaryColor }}>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-5 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                    style={{
                      backgroundColor: theme.buttonColor,
                      color: theme.buttonTextColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>Enviar Pedido pelo WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
