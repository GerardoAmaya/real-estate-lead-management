import { HttpErrorResponse } from '@angular/common/http';
import { toMessage } from './error.interceptor';

describe('toMessage', () => {
  it('explica una caida de red de forma accionable', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(toMessage(error)).toContain('No se pudo conectar con el servidor');
  });

  it('usa el mensaje del formato de error de la API', () => {
    const error = new HttpErrorResponse({
      status: 404,
      error: { error: { code: 'NOT_FOUND', message: 'No existe el lead', timestamp: '' } },
    });

    expect(toMessage(error)).toBe('No existe el lead');
  });

  it('concatena los detalles de validacion en lugar del mensaje generico', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son validos',
          timestamp: '',
          details: [
            { field: 'budget', message: 'Debe ser mayor que cero' },
            { field: 'email', message: 'Formato invalido' },
          ],
        },
      },
    });

    expect(toMessage(error)).toBe('budget: Debe ser mayor que cero · email: Formato invalido');
  });

  it('degrada con elegancia si la respuesta no tiene el formato esperado', () => {
    const error = new HttpErrorResponse({ status: 500, error: 'texto plano' });

    expect(toMessage(error)).toBe('Ocurrio un error inesperado.');
  });
});
