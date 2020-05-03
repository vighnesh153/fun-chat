export class Recipient {
  email: string;
  isActiveOnChat = false;

  setActive() {
    this.isActiveOnChat = true;
  }

  setInactive() {
    this.isActiveOnChat = false;
  }
}
