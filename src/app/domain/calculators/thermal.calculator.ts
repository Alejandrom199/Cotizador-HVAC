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
  room: Pick<Room, 'area' | 'tipo' | 'personas' | 'factorBtuM2'>,
  template: SystemTemplate | undefined,
  settings: QuoteSettings,
): ThermalResult {
  let btu = 0;
  if (room.factorBtuM2 && room.factorBtuM2 > 0) {
    btu = room.area * room.factorBtuM2;
  } else {
    const factor = template?.factorBtu || settings.defaultTemplateFactorBtu;
    const multiplier =
      settings.roomTypeMultiplier[room.tipo as RoomKind] ??
      settings.roomTypeMultiplier.residencial ??
      1;
    btu = room.area * factor * multiplier;
  }

  const nominal = nominalBtu(btu, settings.nominalBtuTable);
  const ton = nominal / settings.btuPerTon;
  const cfm = Math.round(ton * settings.cfmPerTon);

  // Ventilación de aire exterior (ASHRAE 62.1)
  const pers = room.personas && room.personas > 0 ? room.personas : 0;
  const cfmPers = pers * (settings.ventilationCfmPerPerson ?? 6);
  const cfmArea = room.area * (settings.ventilationCfmPerM2 ?? 1.9375);
  const cfmVentilation = Math.round(cfmPers + cfmArea);
  const litersPerSec = Number((cfmVentilation / 2.11888).toFixed(1));
  const m3PerHour = Number((litersPerSec * 3.6).toFixed(1));

  // Densidad térmica (BTU/h / m²)
  const thermalDensity = room.area > 0 ? Math.round(nominal / room.area) : 0;
  let densityStatus: 'optimo' | 'subenfriado' | 'sobredimensionado' = 'optimo';
  if (thermalDensity < 800) {
    densityStatus = 'subenfriado';
  } else if (thermalDensity > 1800) {
    densityStatus = 'sobredimensionado';
  }

  // Modelo de condensador sugerido
  let condensador = 'AC036';
  if (nominal >= 96000) {
    condensador = 'AM300';
  } else if (nominal >= 76000) {
    condensador = 'AM180';
  } else if (nominal >= 60000) {
    condensador = 'AC060';
  } else if (nominal >= 48000) {
    condensador = 'AC048';
  } else {
    condensador = 'AC036';
  }

  return {
    btu: Math.round(btu),
    nominal,
    ton: +ton.toFixed(1),
    cfm,
    equipo: equipmentForBtu(nominal, !!template?.ducto, settings),
    cfmVentilation,
    litersPerSec,
    m3PerHour,
    thermalDensity,
    densityStatus,
    condensador,
  };
}
