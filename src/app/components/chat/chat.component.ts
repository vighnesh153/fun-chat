import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '@fc-services/auth.service';
import { UsersService } from '@fc-services/users.service';

import { Recipient } from '@fc-models/Recipient';
import { ChatMessageResponse } from '@fc-models/ChatMessageResponse';

import { ngxLoadingAnimationTypes } from 'ngx-loading';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  recipient: Recipient;
  messageText: string;
  previousMessages: ChatMessageResponse[];

  newMessageSubjectSubscription: Subscription;

  isLoadingMessagesFromServer = false;
  isSendingMessage = false;

  animationType = ngxLoadingAnimationTypes.circleSwish;

  constructor(private router: Router,
              private authService: AuthService,
              private usersService: UsersService) {}

  ngOnInit(): void {
    const users = this.usersService.usersSubject.getValue();
    if (!users) {
      this.router.navigate(['/home']).then();
      return;
    }
    users.forEach(recipient => {
      if (recipient.isActiveOnChat) {
        this.recipient = recipient;
        this.retrieveChats();
      }
    });
    if (!this.recipient) {
      this.router.navigate(['/home']).then();
      return;
    }
    this.previousMessages = [];
    this.newMessageSubjectSubscription = this.authService.newMessageSubject
      .subscribe(newMessage => {
        if (newMessage && this.isLoadingMessagesFromServer === false) {
          this.previousMessages.push(newMessage);
        }
      });
  }

  retrieveChats() {
    this.isLoadingMessagesFromServer = true;
    this.usersService.retrieveChats(this.recipient.email)
      .subscribe((response: { chats: ChatMessageResponse[] }) => {
        this.previousMessages = response.chats;
        this.isLoadingMessagesFromServer = false;
      });
  }

  sendMessage() {
    if (this.isSendingMessage) {
      return;
    }

    this.isSendingMessage = true;
    const messageText = this.messageText;
    this.usersService.sendMessage(messageText, this.recipient.email)
      .subscribe((response: { message: string }) => {
        if (response.message === 'SUCCESS') {
          const message = new ChatMessageResponse();
          message.from = 'current user';
          message.body = messageText;
          message.timestamp = new Date();
          this.previousMessages.push(message);
          this.messageText = '';
        } else {
          console.log('Failed');
        }
        this.isSendingMessage = false;
      });
  }

  ngOnDestroy() {
    if (this.newMessageSubjectSubscription) {
      this.newMessageSubjectSubscription.unsubscribe();
    }
    if (this.recipient) {
      this.recipient.setInactive();
      this.recipient.hasUnreadMessages = false;
    }
  }

}
