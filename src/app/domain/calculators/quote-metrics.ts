import { Quote } from '../models/quote.model';
import { Room } from '../models/room.model';

export function roomCount(quote: Quote): number {
  return (quote.rooms ?? []).reduce((acc, room) => acc + (room.n || 1), 0);
}

export function roomsArea(rooms: Room[]): number {
  return rooms.reduce((acc, room) => acc + room.area * (room.n || 1), 0);
}

export function effectiveArea(quote: Quote): number {
  return Math.max(roomsArea(quote.rooms ?? []), quote.area || 0);
}

export function formatMoney(value: number): string {
  return (
    '$' +
    Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function hoursLabel(hours: number | null, hoursPerDay: number): string {
  if (hours == null) {
    return '—';
  }
  if (hours < hoursPerDay) {
    return hours.toFixed(1) + ' h';
  }
  return (hours / hoursPerDay).toFixed(1) + ' d';
}

export function businessDaysFromHours(hours: number, hoursPerDay: number): number {
  return Math.max(1, Math.ceil(hours / hoursPerDay));
}

export function promisedDate(
  slaHours: number,
  hoursPerDay: number,
  from: Date = new Date(),
): Date {
  const days = businessDaysFromHours(slaHours, hoursPerDay);
  const cursor = new Date(from);
  let added = 0;
  while (added < days) {
    cursor.setDate(cursor.getDate() + 1);
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) {
      added += 1;
    }
  }
  return cursor;
}

export function promisedDateLabel(date: Date): string {
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
}

export function cycleHours(quote: Quote): number | null {
  const logged = (quote.hrs ?? []).filter((h): h is number => h != null);
  return logged.length ? logged.reduce((a, b) => a + b, 0) : null;
}

export function newId(prefix: string): string {
  return prefix + Math.floor(100 + Math.random() * 899);
}

export function newUid(code: string): string {
  return code + '_' + Math.random().toString(36).slice(2, 6);
}
