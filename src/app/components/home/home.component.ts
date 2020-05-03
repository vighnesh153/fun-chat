import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '@fc-services/auth.service';
import { UsersService } from '@fc-services/users.service';
import { Recipient } from '@fc-models/Recipient';
import { ngxLoadingAnimationTypes } from 'ngx-loading';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private tokenSubscription: Subscription;
  private usersSubscription: Subscription;
  private newMessagesSubscription: Subscription;
  private token: string;
  private email: string;

  allUsers: Recipient[] = [];
  isLoadingUsersFromServer = false;

  animationType = ngxLoadingAnimationTypes.wanderingCubes;

  constructor(private authService: AuthService,
              private usersService: UsersService,
              private router: Router) {
    this.tokenSubscription = this.authService.tokenSubject.subscribe(token => {
        if (!token) {
          this.router.navigate(['/auth']).then();
          return;
        }
        this.token = token;
        this.email = this.authService.email;
      }
    );
    this.usersSubscription = this.usersService.usersSubject.subscribe(users => {
      this.isLoadingUsersFromServer = false;
      this.allUsers = [...users];
      this.allUsers.forEach(user => user.hasUnreadMessages = false);
    });
  }

  ngOnInit(): void {
    this.isLoadingUsersFromServer = true;
    this.usersService.retrieveUsers();
    this.newMessagesSubscription = this.authService.newMessageSubject
      .subscribe(newMessage => {
        if (newMessage) {
          this.allUsers.forEach(user => {
            user.hasUnreadMessages = user.email === newMessage.from;
          });
          this.authService.newMessageSubject.next(null);
        }
      });
  }

  chatWith(user: Recipient) {
    this.usersService.setActive(user);
    this.router.navigate(['/chat']).then();
  }

  ngOnDestroy(): void {
    this.tokenSubscription?.unsubscribe();
    this.usersSubscription?.unsubscribe();
    this.newMessagesSubscription?.unsubscribe();
  }

}
