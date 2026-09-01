import { RestaurantSettings, BusinessHour } from '../types';

export interface StoreStatusResult {
  isOpen: boolean;
  message: string;
  reason: 'manual' | 'schedule' | 'open';
  nextOpenTime?: string;
}

export function getStoreStatus(settings: RestaurantSettings): StoreStatusResult {
  // If owner manually set to closed
  if (settings.isOpenManual === false) {
    return {
      isOpen: false,
      message: 'O estabelecimento pausou o recebimento de pedidos no momento.',
      reason: 'manual',
    };
  }

  // Check if auto-close by hours is enabled
  if (settings.autoCloseEnabled === false && settings.useAutomaticHours === false) {
    return {
      isOpen: true,
      message: 'Aberto para pedidos',
      reason: 'open',
    };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeMinutes = currentHours * 60 + currentMinutes;

  const todaySchedule = settings.businessHours.find(h => h.dayOfWeek === currentDay);

  if (!todaySchedule || !todaySchedule.isOpen) {
    return {
      isOpen: false,
      message: 'Fechado hoje. Consulte nossa grade de horários.',
      reason: 'schedule',
    };
  }

  const [openH, openM] = todaySchedule.openTime.split(':').map(Number);
  const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number);

  const openTimeMinutes = openH * 60 + openM;
  const closeTimeMinutes = closeH * 60 + closeM;

  // Handle past midnight closing (e.g. 18:00 to 02:00)
  if (closeTimeMinutes <= openTimeMinutes) {
    if (currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes) {
      return {
        isOpen: true,
        message: `Aberto até ${todaySchedule.closeTime}`,
        reason: 'open',
      };
    }
  } else {
    // Normal same-day shift
    if (currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes) {
      return {
        isOpen: true,
        message: `Aberto hoje das ${todaySchedule.openTime} às ${todaySchedule.closeTime}`,
        reason: 'open',
      };
    }
  }

  return {
    isOpen: false,
    message: `Fechado no momento. Abre às ${todaySchedule.openTime}.`,
    reason: 'schedule',
    nextOpenTime: todaySchedule.openTime,
  };
}

export function isRestaurantCurrentlyOpen(settings: RestaurantSettings) {
  return getStoreStatus(settings);
}

export function getTodaySchedule(settings: RestaurantSettings): string {
  const now = new Date();
  const currentDay = now.getDay();
  const today = settings.businessHours.find(h => h.dayOfWeek === currentDay);

  if (!today || !today.isOpen) {
    return 'Fechado hoje';
  }
  return `${today.openTime} às ${today.closeTime}`;
}
