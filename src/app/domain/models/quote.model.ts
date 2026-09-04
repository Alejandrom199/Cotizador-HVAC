import { Priority } from '../enums/priority.enum';
import { QuoteKind } from '../enums/quote-kind.enum';
import { QuoteStatus } from '../enums/quote-status.enum';
import { DuctSegment } from './duct-segment.model';
import { QuoteLine } from './quote-line.model';
import { QuoteAttachment, QuoteLogEntry } from './quote-log.model';
import { Room } from './room.model';

export interface Quote {
  id: string;
  code: string;
  name: string;
  cliente: string;
  ruc: string;
  tipo: QuoteKind;
  subtipo: string;
  plantilla: string;
  area: number;
  estado: QuoteStatus;
  prio: Priority;
  asignado: string | null;
  vendedor: string | null;
  ingeniero: string | null;
  /** Horas reales por etapa [Revisión, Planos, Cálculos, Cotización]. */
  hrs: Array<number | null>;
  fecha: string;
  etapa: number;
  motivo: string | null;
  rooms: Room[];
  elements: QuoteLine[];
  descInsumos: number;
  descEquipos: number;
  descMO: number;
  margenMin: number;
  log: QuoteLogEntry[];
  observaciones?: string;
  adjuntos?: QuoteAttachment[];
  ductSegments?: DuctSegment[];
}
