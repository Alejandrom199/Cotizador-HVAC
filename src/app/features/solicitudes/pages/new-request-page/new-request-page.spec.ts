import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { NewRequestPage } from './new-request-page';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { PrintService } from '@app/application/print.service';
import { ToastService } from '@app/core/toast.service';
import { QuoteKind } from '@app/domain/enums';
import { MOCK_PROVIDERS } from '@app/infrastructure/mock/mock.providers';
import { ICON_PROVIDERS } from '@app/shared/ui/icon';

describe('NewRequestPage - Reglas de Carga de Planos y Documentos', () => {
  let fixture: ComponentFixture<NewRequestPage>;
  let component: NewRequestPage;
  let workspace: QuoteWorkspaceService;
  let printService: PrintService;
  let toast: ToastService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRequestPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...ICON_PROVIDERS,
        ...MOCK_PROVIDERS,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewRequestPage);
    component = fixture.componentInstance;
    workspace = TestBed.inject(QuoteWorkspaceService);
    printService = TestBed.inject(PrintService);
    toast = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('debe inicializarse en tipo Instalación con dropzone visible y archivos adjuntos por defecto', () => {
    expect(component.tipo()).toBe(QuoteKind.Instalacion);
    expect(component.files().length).toBe(2);

    const compiled = fixture.nativeElement as HTMLElement;
    const dropzone = compiled.querySelector('.dropzone');
    const messageStrip = compiled.querySelector('.message-strip');

    expect(dropzone).toBeTruthy();
    expect(compiled.textContent).toContain('Subir planos o documentos técnicos');
    expect(messageStrip).toBeNull();
  });

  it('debe limpiar los planos y ocultar el dropzone cuando se cambia a Mantenimiento', async () => {
    // Al inicio tiene archivos
    expect(component.files().length).toBeGreaterThan(0);

    // Cambiar a Mantenimiento
    component.setTipo(QuoteKind.Mantenimiento);
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(component.tipo()).toBe(QuoteKind.Mantenimiento);
    expect(component.files()).toEqual([]);
    expect(component.subtipo()).toBe('Correctivo');

    const compiled = fixture.nativeElement as HTMLElement;
    const dropzone = compiled.querySelector('.dropzone');
    const messageStrip = compiled.querySelector('.message-strip');

    expect(dropzone).toBeNull();
    expect(messageStrip).toBeTruthy();
    expect(compiled.textContent).toContain('No requiere planos de obra');
    expect(compiled.textContent).toContain('Para servicios de mantenimiento no se requiere la carga de planos');
  });

  it('no debe permitir cargar archivos si el tipo es Mantenimiento', () => {
    const toastSpy = vi.spyOn(toast, 'show');
    component.setTipo(QuoteKind.Mantenimiento);

    const fakeFile = new File(['content'], 'plano.dwg', { type: 'application/octet-stream' });
    const fakeInput = {
      target: {
        files: [fakeFile],
        value: 'plano.dwg',
      },
    } as unknown as Event;

    component.onFiles(fakeInput);

    expect(component.files().length).toBe(0);
    expect(toastSpy).toHaveBeenCalledWith('Los servicios de mantenimiento no requieren planos');
  });

  it('debe permitir subir archivos válidos cuando el tipo es Instalación', () => {
    component.setTipo(QuoteKind.Instalacion);
    const initialCount = component.files().length;

    const fakeFile = new File(['plano data'], 'Plano_Nuevo.pdf', { type: 'application/pdf' });
    const fakeInput = {
      target: {
        files: [fakeFile],
        value: 'Plano_Nuevo.pdf',
      },
    } as unknown as Event;

    component.onFiles(fakeInput);

    expect(component.files().length).toBe(initialCount + 1);
    expect(component.files().some((f) => f.name === 'Plano_Nuevo.pdf')).toBe(true);
  });

  it('debe rechazar archivos con extensiones no permitidas en Instalación', () => {
    const toastSpy = vi.spyOn(toast, 'show');
    component.setTipo(QuoteKind.Instalacion);
    const initialCount = component.files().length;

    const fakeFile = new File(['exe data'], 'malware.exe', { type: 'application/x-msdownload' });
    const fakeInput = {
      target: {
        files: [fakeFile],
        value: 'malware.exe',
      },
    } as unknown as Event;

    component.onFiles(fakeInput);

    expect(component.files().length).toBe(initialCount);
    expect(toastSpy).toHaveBeenCalledWith('Formato no permitido: malware.exe');
  });

  it('debe registrar la solicitud con adjuntos vacíos al enviar solicitud de Mantenimiento', () => {
    const createSpy = vi.spyOn(workspace, 'createFromRequest');
    const navSpy = vi.spyOn(router, 'navigateByUrl');

    component.setTipo(QuoteKind.Mantenimiento);
    component.submit();

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: QuoteKind.Mantenimiento,
        adjuntos: [],
      }),
    );
    expect(navSpy).toHaveBeenCalledWith('/solicitudes');
  });

  it('debe exportar PDF con lista de archivos vacía en Mantenimiento', () => {
    const printSpy = vi.spyOn(printService, 'printRequest').mockReturnValue(true);

    component.setTipo(QuoteKind.Mantenimiento);
    component.exportPdf();

    expect(printSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: QuoteKind.Mantenimiento,
        files: [],
      }),
    );
  });
});
