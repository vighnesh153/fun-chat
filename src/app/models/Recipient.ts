export class Recipient {
  email: string;
  isActiveOnChat = false;

  hasUnreadMessages = false;

  setActive() {
    this.isActiveOnChat = true;
  }

  setInactive() {
    this.isActiveOnChat = false;
  }
}
