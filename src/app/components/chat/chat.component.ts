import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsersService } from '@fc-services/users.service';
import { Recipient } from '@fc-models/Recipient';
import { ChatMessageResponse } from '@fc-models/ChatMessageResponse';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  recipient: Recipient;

  messageText: string;

  previousMessages: ChatMessageResponse[];

  constructor(private router: Router,
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
    }
  }

  retrieveChats() {
    this.usersService.retrieveChats(this.recipient.email)
      .subscribe((response: { chats: ChatMessageResponse[] }) => {
        this.previousMessages = response.chats;
      });
  }

  sendMessage() {
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
      });
  }

}
