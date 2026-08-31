import { RoomKind } from '../enums/room-kind.enum';

export interface Room {
  id: string;
  name: string;
  area: number;
  tipo: RoomKind;
  /** Repetición (p. ej. planta tipo × N pisos). */
  n?: number;
}
