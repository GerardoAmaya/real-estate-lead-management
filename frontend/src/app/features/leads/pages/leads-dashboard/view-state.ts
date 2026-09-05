// Modela los cuatro estados de la pantalla en un solo tipo, para que la
// plantilla no tenga que combinar banderas sueltas de loading y error.
export type ViewState<T> =
  { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; data: T };

export const loading = <T>(): ViewState<T> => ({ status: 'loading' });
export const success = <T>(data: T): ViewState<T> => ({ status: 'success', data });
export const failure = <T>(message: string): ViewState<T> => ({ status: 'error', message });
