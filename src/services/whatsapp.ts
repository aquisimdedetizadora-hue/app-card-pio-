import { Order, Restaurant, RestaurantSettings, CartItem, CustomerOrderData } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function cleanPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10 || digitsOnly.length === 11) {
    return `55${digitsOnly}`;
  }
  return digitsOnly;
}

export function buildWhatsAppOrderMessage(order: Order, restaurant: Restaurant): string {
  const lines: string[] = [];

  lines.push(`Olá, *${restaurant.settings.name}*! Gostaria de fazer um pedido:`);
  lines.push(`📋 *PEDIDO ${order.orderNumber}*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

  order.items.forEach(item => {
    let itemHeader = `• *${item.quantity}x ${item.name}*`;
    if (item.variantName) {
      itemHeader += ` (${item.variantName})`;
    }
    itemHeader += ` — ${formatCurrency(item.totalPrice)}`;
    lines.push(itemHeader);

    if (item.addons && item.addons.length > 0) {
      item.addons.forEach(addon => {
        const addonTotal = addon.price * addon.quantity;
        const priceStr = addon.price > 0 ? ` (+${formatCurrency(addonTotal)})` : '';
        lines.push(`   └ + ${addon.quantity}x ${addon.name}${priceStr}`);
      });
    }

    if (item.observations && item.observations.trim()) {
      lines.push(`   └ 💬 Obs: _${item.observations.trim()}_`);
    }
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`);
  if (order.orderType === 'delivery') {
    lines.push(`Taxa de Entrega: ${order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'Grátis'}`);
  }
  lines.push(`💰 *TOTAL: ${formatCurrency(order.total)}*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

  // Payment method
  let paymentText = '';
  switch (order.paymentMethod) {
    case 'pix':
      paymentText = 'PIX';
      if (restaurant.settings.paymentMethods.pix.key) {
        paymentText += ` (Chave: ${restaurant.settings.paymentMethods.pix.key})`;
      }
      break;
    case 'dinheiro':
      paymentText = 'Dinheiro';
      if (order.needChange && order.changeForAmount) {
        paymentText += ` (Troco para ${formatCurrency(order.changeForAmount)})`;
      } else {
        paymentText += ' (Não precisa de troco)';
      }
      break;
    case 'cartao_credito':
      paymentText = 'Cartão de Crédito';
      break;
    case 'cartao_debito':
      paymentText = 'Cartão de Débito';
      break;
    case 'vale_refeicao':
      paymentText = 'Vale Refeição / Alimentação';
      break;
    default:
      paymentText = 'A Combinar';
      break;
  }
  lines.push(`💳 *Pagamento:* ${paymentText}`);

  // Order type
  if (order.orderType === 'delivery') {
    lines.push(`🚗 *Tipo:* Delivery (Entrega)`);
    if (order.deliveryAddress) {
      lines.push(`📍 *Endereço de Entrega:*`);
      lines.push(`${order.deliveryAddress.street}, ${order.deliveryAddress.number}`);
      if (order.deliveryAddress.complement) {
        lines.push(`Complemento: ${order.deliveryAddress.complement}`);
      }
      lines.push(`Bairro: ${order.deliveryAddress.neighborhood}`);
      if (order.deliveryAddress.city) {
        lines.push(`Cidade: ${order.deliveryAddress.city} - ${order.deliveryAddress.state}`);
      }
      if (order.deliveryAddress.referencePoint) {
        lines.push(`Ponto de Ref.: ${order.deliveryAddress.referencePoint}`);
      }
    }
  } else if (order.orderType === 'pickup') {
    lines.push(`🏪 *Tipo:* Retirada no Balcão`);
    lines.push(`📍 *Endereço:* ${restaurant.settings.address.street}, ${restaurant.settings.address.number}`);
  } else if (order.orderType === 'dine_in') {
    lines.push(`🍽️ *Tipo:* Consumo no Local`);
    if (order.tableNumber) {
      lines.push(`🏷️ *Mesa:* ${order.tableNumber}`);
    }
  }

  // Customer info
  lines.push('');
  lines.push(`👤 *Cliente:* ${order.customer.name}`);
  lines.push(`📱 *WhatsApp:* ${order.customer.phone}`);

  if (order.generalObservations && order.generalObservations.trim()) {
    lines.push(`📝 *Observação do Pedido:* ${order.generalObservations.trim()}`);
  }

  lines.push('');
  lines.push(`_Pedido gerado via MenuZap_ ⚡`);

  return lines.join('\n');
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const cleanNum = cleanPhone(whatsappNumber);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodedText}`;
}

// Aliases for compatibility
export const buildWhatsAppMessage = (
  restaurant: RestaurantSettings,
  items: CartItem[],
  customer: CustomerOrderData,
  subtotal: number,
  deliveryFee: number,
  total: number,
  orderNumber: string
) => {
  return buildWhatsAppOrderMessage({
    id: `ord-${Date.now()}`,
    orderNumber,
    restaurantId: '',
    createdAt: new Date().toISOString(),
    customer: { name: customer.customerName, phone: customer.customerPhone },
    orderType: customer.orderType,
    tableNumber: customer.tableNumber,
    deliveryAddress: customer.address,
    items,
    subtotal,
    deliveryFee,
    total,
    paymentMethod: customer.paymentMethod,
    needChange: customer.needChange,
    changeForAmount: customer.changeForAmount,
    generalObservations: customer.generalObservations,
    status: 'novo',
  }, { id: '', ownerId: '', settings: restaurant });
};

export const generateWhatsAppLink = buildWhatsAppUrl;
