import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '@fc-services/auth.service';
import { UsersService } from '@fc-services/users.service';
import { Recipient } from '@fc-models/Recipient';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private tokenSubscription: Subscription;
  private usersSubscription: Subscription;
  private token: string;
  private email: string;

  allUsers: Recipient[] = [];

  constructor(private authService: AuthService,
              private usersService: UsersService,
              private router: Router) {
    this.tokenSubscription = this.authService.tokenSubject.subscribe(token => {
        this.token = token;
        this.email = this.authService.email;
      }
    );
    this.usersSubscription = this.usersService.usersSubject.subscribe(users => {
      this.allUsers = users;
    });
  }

  ngOnInit(): void {
    this.usersService.retrieveUsers();
  }

  chatWith(user: Recipient) {
    this.usersService.setActive(user);
    this.router.navigate(['/chat']).then();
  }

  ngOnDestroy(): void {
    this.tokenSubscription.unsubscribe();
  }

}
