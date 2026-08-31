import { RoomKind } from '../enums/room-kind.enum';
import { Room } from '../models/room.model';
import { ThermalResult } from '../models/results.model';
import { SystemTemplate } from '../models/template.model';
import { QuoteSettings } from '../settings/quote-settings';

export function nominalBtu(btu: number, table: number[]): number {
  for (const step of table) {
    if (step >= btu) {
      return step;
    }
  }
  const last = table[table.length - 1] ?? 60000;
  return Math.ceil(btu / last) * last;
}

export function equipmentForBtu(
  nominal: number,
  ducto: boolean,
  settings: QuoteSettings,
): string {
  const rows = ducto ? settings.equipmentByBtuDuct : settings.equipmentByBtuDirect;
  for (const row of rows) {
    if (nominal <= row.maxBtu) {
      return row.code;
    }
  }
  return rows[rows.length - 1].code;
}

export function computeRoomThermal(
  room: Pick<Room, 'area' | 'tipo'>,
  template: SystemTemplate | undefined,
  settings: QuoteSettings,
): ThermalResult {
  const factor = template?.factorBtu || settings.defaultTemplateFactorBtu;
  const multiplier =
    settings.roomTypeMultiplier[room.tipo as RoomKind] ??
    settings.roomTypeMultiplier.residencial;
  const btu = room.area * factor * multiplier;
  const nominal = nominalBtu(btu, settings.nominalBtuTable);
  const ton = nominal / settings.btuPerTon;
  const cfm = Math.round(ton * settings.cfmPerTon);
  return {
    btu: Math.round(btu),
    nominal,
    ton: +ton.toFixed(1),
    cfm,
    equipo: equipmentForBtu(nominal, !!template?.ducto, settings),
  };
}
