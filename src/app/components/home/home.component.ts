import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { AuthService } from '@fc-services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private tokenSubscription: Subscription;
  private token: string;
  private email: string;

  constructor(private authService: AuthService) {
    this.tokenSubscription = this.authService.tokenSubject.subscribe(token => {
        this.token = token;
        this.email = this.authService.email;
      }
    );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.tokenSubscription.unsubscribe();
  }

}
