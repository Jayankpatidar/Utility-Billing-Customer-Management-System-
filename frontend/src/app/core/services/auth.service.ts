import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { AuthState, LoginRequest, LoginResponse, User, UserRole } from '@shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ubcms_token';
  private readonly USER_KEY  = 'ubcms_user';

  private authState = new BehaviorSubject<AuthState>({
    user: this.getSavedUser(),
    token: this.getSavedToken(),
    isAuthenticated: !!this.getSavedToken()
  });

  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): User | null { return this.authState.value.user; }
  get token(): string | null     { return this.authState.value.token; }
  get isLoggedIn(): boolean      { return this.authState.value.isAuthenticated; }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const role = this.currentUser?.role;
    return !!role && roles.includes(role);
  }

  getDefaultRoute(): string {
    const role = this.currentUser?.role;
    if (role === 'admin') return '/dashboard';
    if (role === 'staff') return '/customers';
    if (role === 'customer') return '/self';
    return '/auth/login';
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.authState.next({ user: res.user, token: res.token, isAuthenticated: true });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authState.next({ user: null, token: null, isAuthenticated: false });
    this.router.navigate(['/auth/login']);
  }

  private getSavedToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  private getSavedUser(): User | null {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }
}
