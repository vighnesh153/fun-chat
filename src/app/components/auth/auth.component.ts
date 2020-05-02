import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthFormState } from './form-state.auth.component';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  currentFormState: AuthFormState;

  loginForm: FormGroup;
  signUpForm: FormGroup;
  verificationForm: FormGroup;

  constructor() {
    this.currentFormState = new AuthFormState();
    this.initializeFormsControllers();
  }

  initializeFormsControllers() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
    });
    this.signUpForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
      confirmPassword: new FormControl(null, Validators.required),
    });
    this.verificationForm = new FormGroup({
      verificationToken: new FormControl(null, Validators.required),
    });
  }

  ngOnInit(): void {
  }

  onSubmitForm() {
    console.log('Form submitted.');
  }

  switchBetweenLoginAndSignup() {
    if (this.currentFormState.login) {
      this.currentFormState.setToSignupForm();
    } else if (this.currentFormState.signup) {
      this.currentFormState.setToLoginForm();
    }
  }

}
