import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';
import { LoginDialogComponent } from './login-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import type { LoginResponse } from '../../../core/models/auth.model';

const RESPONSE: LoginResponse = {
  accessToken: 'token',
  expiresIn: '1h',
  user: { id: '1', name: 'Admin Demo', email: 'admin@example.com', role: 'admin' },
};

describe('LoginDialogComponent', () => {
  let fixture: ComponentFixture<LoginDialogComponent>;
  let component: LoginDialogComponent;
  let dialogRef: jasmine.SpyObj<DialogRef<boolean>>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<DialogRef<boolean>>('DialogRef', ['close']);
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginDialogComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidCredentials(): void {
    component['form'].setValue({ email: 'admin@example.com', password: 'Admin123!' });
  }

  it('arranca invalido', () => {
    expect(component['form'].invalid).toBe(true);
  });

  it('valida el formato del correo', () => {
    component['form'].controls.email.setValue('no-es-correo');

    expect(component['form'].controls.email.hasError('email')).toBe(true);
  });

  it('no llama al servicio si el formulario es invalido', () => {
    component['submit']();

    expect(auth.login).not.toHaveBeenCalled();
  });

  it('cierra con exito cuando las credenciales son validas', () => {
    auth.login.and.returnValue(of(RESPONSE));
    fillValidCredentials();

    component['submit']();

    expect(auth.login).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'Admin123!',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('muestra el error y permite reintentar cuando el login falla', () => {
    auth.login.and.returnValue(throwError(() => new Error('Credenciales invalidas')));
    fillValidCredentials();

    component['submit']();
    fixture.detectChanges();

    expect(component['error']()).toBe('Credenciales invalidas');
    // El dialogo sigue abierto para que el usuario corrija.
    expect(dialogRef.close).not.toHaveBeenCalled();
    // Y el boton vuelve a estar disponible.
    expect(component['loading']()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Credenciales invalidas');
  });

  it('cierra con false al cancelar', () => {
    component['close']();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
