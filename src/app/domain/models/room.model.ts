import { RoomKind } from '../enums/room-kind.enum';

export interface Room {
  id: string;
  name: string;
  area: number;
  tipo: RoomKind;
  /** Repetición (p. ej. planta tipo × N pisos). */
  n?: number;
  /** Aforo / Ocupación de personas para ventilación ASHRAE 62.1 */
  personas?: number;
  /** Factor térmico personalizado (BTU/h / m²), si se omite usa el del tipo */
  factorBtuM2?: number;
  /** Tipo de sistema (CAC = Central / Split Ducto, VRF = Flujo Variable) */
  sistema?: 'CAC' | 'VRF';
}
