import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '@fc-environments/environment';
import { LoginResponse } from '@fc-models/LoginResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private requestOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public tokenSubject = new BehaviorSubject<string>(null);
  public tokenExpiryDate: Date;
  public email: string;

  constructor(private http: HttpClient) {
  }

  isLoggedIn() {
    if (this.tokenSubject.getValue() === null) {
      const email = localStorage.getItem('email') || '';
      const token = localStorage.getItem('token') || '';
      const expiresAt = new Date(localStorage.getItem('token')) || (new Date());

      if ((new Date()) >= expiresAt) {
        this.clearLoginFromLocalStorage();
        return false;
      }

      this.email = email;
      this.tokenExpiryDate = expiresAt;
      this.tokenSubject.next(token);

      return true;
    }

    return this.tokenSubject.getValue() !== null;
  }

  login(email: string, password: string): Observable<any> {
    const url = environment.serverUrl + 'login';

    return this.http.post(url, {email, password}, this.requestOptions)
      .pipe(tap((response: LoginResponse) => {
        if (!response.message) {
          const token = response.token;
          const expiresAt = new Date(response.expiresAt);

          localStorage.setItem('token', token);
          localStorage.setItem('email', email);
          localStorage.setItem('expiresAt', expiresAt.toJSON());
        }
      }));
  }

  logout() {
    this.tokenExpiryDate = null;
    this.email = null;
    this.tokenExpiryDate = null;
    this.clearLoginFromLocalStorage();
    this.tokenSubject.next(null);
  }

  clearLoginFromLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresAt');
  }

  signUp(email: string, password: string, confirmPassword: string): Observable<any> {
    const url = environment.serverUrl + 'sign-up';

    return this.http.post(url,
      {email, password, confirmPassword},
      this.requestOptions);
  }

  verifyRegistration(email: string, verificationCode: string): Observable<any> {
    const url = environment.serverUrl + 'verify-registration';

    return this.http.post(url,
      {email, verificationToken: verificationCode},
      this.requestOptions);
  }
}
