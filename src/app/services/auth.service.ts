import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import * as openSocket from 'socket.io-client';

import { environment } from '@fc-environments/environment';
import { LoginResponse } from '@fc-models/LoginResponse';
import { ChatMessageResponse } from '@fc-models/ChatMessageResponse';

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

  public newMessageSubject = new BehaviorSubject<ChatMessageResponse>(null);

  socket: SocketIOClient.Socket;

  constructor(private http: HttpClient) {
  }

  isLoggedIn() {
    if (this.tokenSubject.getValue() === null) {
      const email = localStorage.getItem('email') || '';
      const token = localStorage.getItem('token') || '';
      const expiresAt = new Date(localStorage.getItem('expiresAt')) || (new Date());

      if ((new Date()) >= expiresAt) {
        this.clearLoginFromLocalStorage();
        return false;
      }

      this.email = email;
      this.tokenExpiryDate = expiresAt;
      this.tokenSubject.next(token);

      const logoutAfter = expiresAt.getTime() - Date.now();
      this.logout(logoutAfter);
      this.setupSocket(email, token);

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

          this.setupSocket(email, token);

          localStorage.setItem('token', token);
          localStorage.setItem('email', email);
          localStorage.setItem('expiresAt', expiresAt.toJSON());

          const logoutAfter = expiresAt.getTime() - Date.now();
          this.logout(logoutAfter);
        }
      }));
  }


  private setupSocket(email: string, token: string) {
    this.socket = openSocket(environment.serverUrl);
    this.socket.emit('join', {email, token});

    this.socket.on('reconnect', () => {
      this.socket.emit('join', {email, token});
    });

    this.socket.on('new_message', (newMessage: ChatMessageResponse, fromSocketId: string) => {
      if (this.socket.id !== fromSocketId) {
        this.newMessageSubject.next(newMessage);
      }
    });
  }

  logout(atTime: number) {
    setTimeout(() => {
      console.log('Logging out!');
      this.tokenExpiryDate = null;
      this.email = null;
      this.tokenExpiryDate = null;
      this.clearLoginFromLocalStorage();
      this.tokenSubject.next(null);
    }, atTime);
  }

  clearLoginFromLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('email');
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
