import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PrintService } from './print.service';
import { Quote } from '../domain/models/quote.model';
import { DEFAULT_QUOTE_SETTINGS } from '../domain/settings/quote-settings';
import { QuoteKind } from '../domain/enums/quote-kind.enum';
import { QuoteStatus } from '../domain/enums/quote-status.enum';
import { Priority } from '../domain/enums/priority.enum';
import { ProductCategory } from '../domain/enums/product-category.enum';

describe('PrintService', () => {
  let service: PrintService;
  let mockWindow: { document: { write: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> } };

  const sampleQuote: Quote = {
    id: 'q101',
    code: 'COT-2026-001',
    name: 'Climatización Edificio Corporativo',
    cliente: 'Corporación Favorita C.A.',
    ruc: '1790016919001',
    tipo: QuoteKind.Instalacion,
    subtipo: 'Completa',
    plantilla: 'PL-02',
    area: 120,
    estado: QuoteStatus.Aprobada,
    prio: Priority.Alta,
    asignado: 'Ing. Paredes',
    vendedor: 'M. Coello',
    ingeniero: 'Ing. Paredes',
    hrs: [2, 4, 3, 1],
    fecha: '2026-09-01T10:00:00Z',
    etapa: 4,
    motivo: null,
    rooms: [
      { id: 'r1', name: 'Open Space', area: 80, tipo: 'comercial' as any, n: 1 },
      { id: 'r2', name: 'Servidores', area: 40, tipo: 'critico' as any, n: 1 },
    ],
    elements: [
      {
        uid: 'e1',
        code: 'EQ-048',
        name: 'Unidad Fan Coil Ducto 48.000 BTU',
        cat: ProductCategory.Equipos,
        unit: 'und',
        costo: 1200,
        pvp: 1650,
        qty: 2,
      },
      {
        uid: 'e2',
        code: 'MAT-CU-34',
        name: 'Tubería de Cobre Rígido 3/4"',
        cat: ProductCategory.Insumos,
        unit: 'm',
        costo: 12,
        pvp: 18,
        qty: 24,
      },
      {
        uid: 'e3',
        code: 'MO-INST',
        name: 'Instalación y Montaje Mecánico',
        cat: ProductCategory.ManoDeObra,
        unit: 'h',
        costo: 18,
        pvp: 28,
        qty: 32,
      },
      {
        uid: 'e4',
        code: 'LOG-GRUA',
        name: 'Servicio de Grúa y Maniobra en Techo',
        cat: ProductCategory.Logistica,
        unit: 'gl',
        costo: 300,
        pvp: 450,
        qty: 1,
      },
    ],
    descInsumos: 0,
    descEquipos: 0,
    descMO: 0,
    margenMin: 22,
    log: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), PrintService],
    });
    service = TestBed.inject(PrintService);

    mockWindow = {
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('printFinal (Propuesta Comercial)', () => {
    it('debe generar HTML estructurado con categorías y subtotales cuando window.open es exitoso', () => {
      vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);

      const result = service.printFinal(sampleQuote, DEFAULT_QUOTE_SETTINGS);

      expect(result).toBe(true);
      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockWindow.document.write).toHaveBeenCalled();
      expect(mockWindow.document.close).toHaveBeenCalled();

      const writtenHtml: string = mockWindow.document.write.mock.calls[0][0];

      // Verificación de Marca e Identidad Corporativa
      expect(writtenHtml).toContain('EMASESOR');
      expect(writtenHtml).toContain('Climatización &amp; Ventilación Mecánica — Ecuador');
      expect(writtenHtml).toContain('PROPUESTA TÉCNICO-COMERCIAL');
      expect(writtenHtml).toContain('COT-2026-001');

      // Verificación de Metadatos del Cliente
      expect(writtenHtml).toContain('Corporación Favorita C.A.');
      expect(writtenHtml).toContain('1790016919001');
      expect(writtenHtml).toContain('M. Coello');
      expect(writtenHtml).toContain('Ing. Paredes');

      // Verificación de Agrupación por Categorías
      expect(writtenHtml).toContain('Suministro de Equipos HVAC');
      expect(writtenHtml).toContain('Materiales e Insumos de Instalación');
      expect(writtenHtml).toContain('Mano de Obra &amp; Servicios Técnicos');
      expect(writtenHtml).toContain('Logística, Transporte y Grúas');

      // Verificación de Subtotales por Categoría
      expect(writtenHtml).toContain('Subtotal Suministro de Equipos HVAC:');
      expect(writtenHtml).toContain('Subtotal Materiales e Insumos de Instalación:');
      expect(writtenHtml).toContain('Subtotal Mano de Obra &amp; Servicios Técnicos:');
      expect(writtenHtml).toContain('Subtotal Logística, Transporte y Grúas:');

      // Verificación de Ítems
      expect(writtenHtml).toContain('Unidad Fan Coil Ducto 48.000 BTU');
      expect(writtenHtml).toContain('Tubería de Cobre Rígido 3/4&quot;');

      // Verificación de Totales y Términos Comerciales
      expect(writtenHtml).toContain('Subtotal (Base Imponible):');
      expect(writtenHtml).toContain('IVA (15%):');
      expect(writtenHtml).toContain('TOTAL PROPUESTA (USD):');
      expect(writtenHtml).toContain('Términos y Condiciones Comerciales:');
      expect(writtenHtml).toContain('Elaborado y Presentado por:');
      expect(writtenHtml).toContain('Aceptación y Aprobación del Cliente:');
    });

    it('debe retornar false si el navegador bloquea las ventanas emergentes (popup null)', () => {
      vi.spyOn(window, 'open').mockReturnValue(null);

      const result = service.printFinal(sampleQuote, DEFAULT_QUOTE_SETTINGS);

      expect(result).toBe(false);
    });
  });

  describe('printDetailed (Informe Detallado)', () => {
    it('debe generar HTML de informe técnico con KPIs de ingeniería y partidas agrupadas', () => {
      vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);

      const result = service.printDetailed(sampleQuote, DEFAULT_QUOTE_SETTINGS);

      expect(result).toBe(true);
      const writtenHtml: string = mockWindow.document.write.mock.calls[0][0];

      // Verificación de Informe Detallado
      expect(writtenHtml).toContain('INFORME TÉCNICO DETALLADO');
      expect(writtenHtml).toContain('INVERSIÓN TOTAL ESTIMADA');
      expect(writtenHtml).toContain('Área Total:');
      expect(writtenHtml).toContain('Ambientes:');
      expect(writtenHtml).toContain('DESGLOSE DE PARTIDAS TÉCNICO-ECONÓMICAS');

      // Verificación de KPI cards
      expect(writtenHtml).toContain('kpi-card');
      expect(writtenHtml).toContain('Subtotal Equipos &amp; Insumos:');
      expect(writtenHtml).toContain('Subtotal Mano de Obra &amp; Logística:');
    });
  });

  describe('printRequest (Solicitud de Cotización)', () => {
    it('debe generar HTML con los datos de solicitud, prioridad y lista de archivos adjuntos', () => {
      vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);

      const payload = {
        cliente: 'Pronaca S.A.',
        ruc: '1790005526001',
        proyecto: 'Ventilación Planta Industrial Puembo',
        tipo: 'Instalación - Completa',
        prio: 'Alta',
        observaciones: 'Requiere visita técnica urgente y toma de muestras térmicas.',
        files: [
          { name: 'Planos_Corte_A.dwg', sizeStr: '3.2 MB' },
          { name: 'Especificaciones_HVAC.pdf', sizeStr: '1.1 MB' },
        ],
        ivaRate: 15,
      };

      const result = service.printRequest(payload);

      expect(result).toBe(true);
      const writtenHtml: string = mockWindow.document.write.mock.calls[0][0];

      expect(writtenHtml).toContain('SOLICITUD DE COTIZACIÓN');
      expect(writtenHtml).toContain('REQUERIMIENTO TÉCNICO');
      expect(writtenHtml).toContain('Pronaca S.A.');
      expect(writtenHtml).toContain('1790005526001');
      expect(writtenHtml).toContain('Ventilación Planta Industrial Puembo');
      expect(writtenHtml).toContain('Planos_Corte_A.dwg');
      expect(writtenHtml).toContain('3.2 MB');
      expect(writtenHtml).toContain('Especificaciones_HVAC.pdf');
      expect(writtenHtml).toContain('Requiere visita técnica urgente y toma de muestras térmicas.');
      expect(writtenHtml).toContain('Solicitado por:');
      expect(writtenHtml).toContain('Recibido en EMASESOR:');
    });

    it('debe manejar solicitudes sin archivos adjuntos mostrando estado vacío amigable', () => {
      vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);

      const payload = {
        cliente: 'Cliente Particular',
        ruc: '',
        proyecto: 'Mantenimiento Split',
        tipo: 'Mantenimiento',
        prio: 'Normal',
        observaciones: '',
        files: [],
        ivaRate: 15,
      };

      const result = service.printRequest(payload);

      expect(result).toBe(true);
      const writtenHtml: string = mockWindow.document.write.mock.calls[0][0];

      expect(writtenHtml).toContain('Sin documentación o planos adjuntos');
      expect(writtenHtml).toContain('Sin observaciones registradas.');
    });
  });

  describe('printQuote', () => {
    it('debe delegar a printFinal', () => {
      const spy = vi.spyOn(service, 'printFinal').mockReturnValue(true);
      const res = service.printQuote(sampleQuote, DEFAULT_QUOTE_SETTINGS);
      expect(spy).toHaveBeenCalledWith(sampleQuote, DEFAULT_QUOTE_SETTINGS);
      expect(res).toBe(true);
    });
  });
});
