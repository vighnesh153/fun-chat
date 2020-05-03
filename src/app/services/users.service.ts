import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@fc-environments/environment';
import { Recipient } from '@fc-models/Recipient';
import { AuthService } from '@fc-services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private requestOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public usersSubject = new BehaviorSubject<Recipient[]>([]);

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  setActive(recipient: Recipient) {
    const users = this.usersSubject.getValue();
    if (!users) {
      return;
    }
    users.forEach(user => user.setInactive());
    recipient.setActive();
  }

  retrieveUsers(forced = false) {
    const url = environment.serverUrl + 'users';
    const email = this.authService.email;
    const token = this.authService.tokenSubject.getValue();

    if (!forced) {
      const recipients = this.usersSubject.getValue();
      if (recipients && recipients.length > 0) {
        this.usersSubject.next(recipients);
        return;
      }
    }

    this.http.post(url, {email, token}, this.requestOptions)
      .subscribe((data: { users: string[] }) => {
        const emails = data.users;
        if (!emails) {
          this.usersSubject.next(null);
          return;
        }
        const recipients = emails.map(userEmail => {
          const recipient = new Recipient();
          recipient.email = userEmail;
          return recipient;
        });
        this.usersSubject.next(recipients);
      });
  }

  retrieveChats(withEmail: string): Observable<any> {
    const url = environment.serverUrl + 'chat';
    const fromEmail = this.authService.email;
    const token = this.authService.tokenSubject.getValue();

    return this.http.post(url,
      { email: fromEmail, token, withEmail },
      this.requestOptions);
  }

  sendMessage(message: string, toEmail: string): Observable<any> {
    const url = environment.serverUrl + 'send-message';
    const fromEmail = this.authService.email;
    const token = this.authService.tokenSubject.getValue();

    return this.http.post(url,
      { email: fromEmail, token, toEmail, message,
        socketId: this.authService.socket.id },
      this.requestOptions);
  }
}
