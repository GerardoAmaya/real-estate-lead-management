import { failure, loading, success, type ViewState } from './view-state';

describe('ViewState', () => {
  it('construye el estado de carga', () => {
    expect(loading<number>()).toEqual({ status: 'loading' });
  });

  it('construye el estado de exito con sus datos', () => {
    expect(success(42)).toEqual({ status: 'success', data: 42 });
  });

  it('construye el estado de error con su mensaje', () => {
    expect(failure<number>('fallo')).toEqual({ status: 'error', message: 'fallo' });
  });

  it('permite estrechar el tipo por el discriminante', () => {
    const state: ViewState<number> = success(7);

    // La union discriminada garantiza que data solo existe en success.
    expect(state.status === 'success' ? state.data : null).toBe(7);
  });
});
