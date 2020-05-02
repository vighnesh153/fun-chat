import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@fc-environments/environment';

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

  constructor(private http: HttpClient) { }

  isLoggedIn() {
    return this.tokenSubject.getValue() !== null;
  }

  login(email: string, password: string): Observable<any> {
    const url = environment.serverUrl + 'login';

    return this.http.post(url, { email, password }, this.requestOptions);
  }

  logout() {
    this.tokenSubject.next(null);
    this.tokenExpiryDate = null;
    this.email = null;
  }

  signUp(email: string, password: string, confirmPassword: string): Observable<any> {
    const url = environment.serverUrl + 'sign-up';

    return this.http.post(url,
      { email, password, confirmPassword },
      this.requestOptions);
  }

  verifyRegistration(email: string, verificationCode: string): Observable<any> {
    const url = environment.serverUrl + 'verify-registration';

    return this.http.post(url,
      { email, verificationToken: verificationCode },
      this.requestOptions);
  }
}
