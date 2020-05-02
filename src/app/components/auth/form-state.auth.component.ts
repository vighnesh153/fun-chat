export class AuthFormState {
  login = false;
  signup = false;
  verificationForm = false;

  constructor() {
    this.setToLoginForm();
  }

  unsetAll() {
    this.login = this.signup = this.verificationForm = false;
  }

  setToLoginForm() {
    this.unsetAll();
    this.login = true;
  }

  setToSignupForm() {
    this.unsetAll();
    this.signup = true;
  }

  setToVerificationForm() {
    this.unsetAll();
    this.verificationForm = true;
  }

}
