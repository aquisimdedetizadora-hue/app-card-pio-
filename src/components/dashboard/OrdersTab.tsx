import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Eye, 
  AlertCircle,
  Truck,
  Store,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { formatCurrency, cleanPhone } from '../../services/whatsapp';
import { useToast } from '../common/Toast';
import { Order, OrderStatus } from '../../types';

export const OrdersTab: React.FC = () => {
  const { currentRestaurant, refreshState } = useAuth();
  const { showToast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders = useMemo(() => {
    if (!currentRestaurant) return [];
    return StorageService.getOrders(currentRestaurant.id);
  }, [currentRestaurant]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = selectedStatus === 'todos' || order.status === selectedStatus;
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchTerm]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    refreshState();
    showToast(`Status do pedido atualizado para: ${newStatus.replace('_', ' ')}`);
  };

  const handleWhatsAppContact = (customerPhone: string, orderNumber: string) => {
    const cleanNum = cleanPhone(customerPhone);
    const msg = encodeURIComponent(`Olá! Aqui é do *${currentRestaurant?.settings.name}*. Estamos entrando em contato sobre o seu pedido *${orderNumber}*!`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanNum}&text=${msg}`, '_blank');
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head>
          <title>Comprovante ${order.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; padding: 10px; font-size: 13px; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 8px 0; }
            .item { display: flex; justify-content: space-between; margin: 4px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center bold">${currentRestaurant?.settings.name}</div>
          <div class="center">${new Date(order.createdAt).toLocaleString('pt-BR')}</div>
          <div class="center bold">PEDIDO ${order.orderNumber}</div>
          <div class="line"></div>
          <div><strong>Cliente:</strong> ${order.customer.name}</div>
          <div><strong>Telefone:</strong> ${order.customer.phone}</div>
          <div><strong>Tipo:</strong> ${order.orderType.toUpperCase()}</div>
          ${order.deliveryAddress ? `<div><strong>Endereço:</strong> ${order.deliveryAddress.street}, ${order.deliveryAddress.number}${order.deliveryAddress.complement ? ` (${order.deliveryAddress.complement})` : ''} - ${order.deliveryAddress.neighborhood}${order.deliveryAddress.city ? `, ${order.deliveryAddress.city}/${order.deliveryAddress.state}` : ''}${order.deliveryAddress.zipCode ? ` (CEP: ${order.deliveryAddress.zipCode})` : ''}</div>` : ''}
          ${order.tableNumber ? `<div><strong>Mesa:</strong> ${order.tableNumber}</div>` : ''}
          <div class="line"></div>
          <div class="bold">ITENS:</div>
          ${order.items.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.name} ${item.variantName ? `(${item.variantName})` : ''}</span>
              <span>${formatCurrency(item.totalPrice)}</span>
            </div>
            ${item.addons && item.addons.length > 0 ? item.addons.map(a => `<div>+ ${a.quantity}x ${a.name}</div>`).join('') : ''}
            ${item.observations ? `<div>Obs: ${item.observations}</div>` : ''}
          `).join('')}
          <div class="line"></div>
          <div class="item"><span>Subtotal:</span><span>${formatCurrency(order.subtotal)}</span></div>
          ${order.deliveryFee > 0 ? `<div class="item"><span>Entrega:</span><span>${formatCurrency(order.deliveryFee)}</span></div>` : ''}
          <div class="item bold"><span>TOTAL:</span><span>${formatCurrency(order.total)}</span></div>
          <div class="line"></div>
          <div><strong>Pagamento:</strong> ${order.paymentMethod.toUpperCase()} ${order.needChange ? `(Troco para ${formatCurrency(order.changeForAmount || 0)})` : ''}</div>
          ${order.generalObservations ? `<div class="line"></div><div><strong>Obs Geral:</strong> ${order.generalObservations}</div>` : ''}
          <div class="line"></div>
          <div class="center">Obrigado pela preferência!</div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'novo':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Novo</span>;
      case 'confirmado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">Confirmado</span>;
      case 'em_preparo':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Em Preparo</span>;
      case 'saiu_para_entrega':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Saiu p/ Entrega</span>;
      case 'concluido':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Concluído</span>;
      case 'cancelado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Gerenciador de Pedidos</span>
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie os pedidos enviados pelos clientes via WhatsApp e acompanhe o fluxo de produção.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por cliente, número..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'todos', label: 'Todos os Pedidos' },
            { id: 'novo', label: 'Novos' },
            { id: 'em_preparo', label: 'Em Preparo' },
            { id: 'saiu_para_entrega', label: 'Em Entrega' },
            { id: 'concluido', label: 'Concluídos' },
            { id: 'cancelado', label: 'Cancelados' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum pedido encontrado</h3>
          <p className="text-xs text-slate-400">
            {searchTerm ? 'Tente buscar com outro termo.' : 'Assim que os clientes finalizarem pedidos, eles aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Left Column: Details */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-bold text-white">{order.orderNumber}</span>
                  <span className="text-xs font-semibold text-slate-300">• {order.customer.name}</span>
                  {getStatusBadge(order.status)}
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  {order.items.map((item, idx) => (
                    <span key={idx}>
                      <strong className="text-slate-200">{item.quantity}x {item.name}</strong>
                      {item.variantName && ` (${item.variantName})`}
                      {idx < order.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    {order.orderType === 'delivery' && <Truck className="w-3.5 h-3.5 text-emerald-400" />}
                    {order.orderType === 'pickup' && <Store className="w-3.5 h-3.5 text-amber-400" />}
                    {order.orderType === 'dine_in' && <Sparkles className="w-3.5 h-3.5 text-sky-400" />}
                    <span className="uppercase font-medium">{order.orderType}</span>
                  </span>

                  <span>•</span>
                  <span>Pagamento: <strong className="text-slate-300 uppercase">{order.paymentMethod}</strong></span>
                  
                  {order.deliveryAddress && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">📍 {order.deliveryAddress.neighborhood}</span>
                    </>
                  )}
                  {order.tableNumber && (
                    <>
                      <span>•</span>
                      <span>Mesa {order.tableNumber}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Total & Quick Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-400">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleWhatsAppContact(order.customer.phone, order.orderNumber)}
                    title="Chamar cliente no WhatsApp"
                    className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handlePrint(order)}
                    title="Imprimir Comprovante"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Detalhes</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Pedido {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Change Status Selector */}
            <div className="mb-5 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Alterar Status:</span>
              <select
                value={selectedOrder.status}
                onChange={e => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="novo">Novo</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_preparo">Em Preparo</option>
                <option value="saiu_para_entrega">Saiu para Entrega</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Customer Details */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-bold text-white">{selectedOrder.customer.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Telefone:</span>
                <span className="font-bold text-white">{selectedOrder.customer.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tipo de Pedido:</span>
                <span className="font-bold text-emerald-400 uppercase">{selectedOrder.orderType}</span>
              </div>
              {selectedOrder.deliveryAddress && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">Endereço de Entrega:</span>
                  <p className="text-slate-200">
                    {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.number}
                    {selectedOrder.deliveryAddress.complement ? ` (${selectedOrder.deliveryAddress.complement})` : ''}
                    {' - '}{selectedOrder.deliveryAddress.neighborhood}
                  </p>
                  {(selectedOrder.deliveryAddress.city || selectedOrder.deliveryAddress.zipCode) && (
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {selectedOrder.deliveryAddress.city ? `${selectedOrder.deliveryAddress.city}/${selectedOrder.deliveryAddress.state || ''}` : ''}
                      {selectedOrder.deliveryAddress.zipCode ? ` • CEP: ${selectedOrder.deliveryAddress.zipCode}` : ''}
                    </p>
                  )}
                  {selectedOrder.deliveryAddress.referencePoint && (
                    <p className="text-slate-400 text-[11px] mt-0.5">Ref: {selectedOrder.deliveryAddress.referencePoint}</p>
                  )}
                  {selectedOrder.deliveryAddress.latitude && selectedOrder.deliveryAddress.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.deliveryAddress.latitude},${selectedOrder.deliveryAddress.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-1.5"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Abrir localização no Google Maps</span>
                    </a>
                  )}
                </div>
              )}
              {selectedOrder.tableNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mesa:</span>
                  <span className="font-bold text-white">{selectedOrder.tableNumber}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-semibold text-slate-300 block">Itens do Pedido:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex justify-between font-bold text-white">
                      <span>{item.quantity}x {item.name} {item.variantName ? `(${item.variantName})` : ''}</span>
                      <span className="text-emerald-400">{formatCurrency(item.totalPrice)}</span>
                    </div>
                    {item.addons && item.addons.length > 0 && (
                      <div className="text-[11px] text-slate-400 mt-1 pl-2">
                        {item.addons.map((a, ai) => (
                          <div key={ai}>+ {a.quantity}x {a.name} ({formatCurrency(a.price * a.quantity)})</div>
                        ))}
                      </div>
                    )}
                    {item.observations && (
                      <div className="text-[11px] text-amber-300/90 mt-1 italic pl-2">
                        Obs: "{item.observations}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Taxa de Entrega:</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total:</span>
                <span className="text-emerald-400">{formatCurrency(selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Forma de Pagamento:</span>
                <span className="text-white font-medium uppercase">{selectedOrder.paymentMethod}</span>
              </div>
              {selectedOrder.needChange && (
                <div className="flex justify-between text-amber-300 text-[11px]">
                  <span>Troco para:</span>
                  <span>{formatCurrency(selectedOrder.changeForAmount || 0)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleWhatsAppContact(selectedOrder.customer.phone, selectedOrder.orderNumber)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </button>
              <button
                onClick={() => handlePrint(selectedOrder)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
