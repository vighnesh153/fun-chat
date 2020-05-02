import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthFormState } from './form-state.auth.component';
import { AuthService } from '@fc-services/auth.service';
import { LoginResponse } from '@fc-models/LoginResponse';
import { errorMap } from '@fc-environments/error-map';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  currentFormState: AuthFormState;

  loginForm: FormGroup;
  signUpForm: FormGroup;
  verificationForm: FormGroup;

  error = {
    exists: false,
    message: 'This is an error message.'
  };

  authTokenSubscription: Subscription;

  constructor(private authService: AuthService,
              private router: Router) {
    this.currentFormState = new AuthFormState();
    this.initializeFormsControllers();

    this.authTokenSubscription = this.authService.tokenSubject.subscribe(token => {
      if (token) {
        this.router.navigate(['/home']).then();
      }
    });
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

  switchBetweenLoginAndSignup() {
    if (this.currentFormState.login) {
      this.currentFormState.setToSignupForm();
    } else if (this.currentFormState.signup) {
      this.currentFormState.setToLoginForm();
    }
  }

  onLoginFormSubmit() {
    this.error.exists = false;

    // SetTimeout Hack to turn of error display for a while.
    setTimeout(() => {
      if (this.loginForm.valid === false) {
        this.processError('Both fields are required and should be valid.');
      } else {
        const email = this.loginForm.get('email').value;
        const password = this.loginForm.get('password').value;

        this.authService.login(email, password)
          .subscribe((response: LoginResponse) => {
            if (response.message) {
              this.processError(response.message);
            } else {
              this.authService.tokenExpiryDate = new Date(response.expiresAt);
              this.authService.email = email;
              this.authService.tokenSubject.next(response.token);
            }
          }, (error: HttpErrorResponse) => {
            this.processError(error.error?.message || error.message);
          });
      }
    }, 1000);
  }

  onSignUpFormSubmit() {
    this.error.exists = false;

    // SetTimeout Hack to turn of error display for a while.
    setTimeout(() => {
      if (this.signUpForm.valid === false) {
        this.processError('All fields are required and should be valid.');
      } else {
        const email = this.signUpForm.get('email').value;
        const password = this.signUpForm.get('password').value;
        const confirmPassword = this.signUpForm.get('confirmPassword').value;

        this.authService.signUp(email, password, confirmPassword)
          .subscribe((response: { message: string }) => {
            if (response.message !== 'VERIFICATION_CODE_SENT') {
              this.processError(response.message);
            } else {
              this.currentFormState.setToVerificationForm();
            }
          }, (error: HttpErrorResponse) => {
            this.processError(error.error?.message || error.message);
          });
      }
    }, 1000);
  }

  onVerifyRegistrationFormSubmit() {
    this.error.exists = false;

    // SetTimeout Hack to turn of error display for a while.
    setTimeout(() => {
      if (this.verificationForm.valid === false) {
        this.processError('Please enter the code.');
      } else {
        const email = this.signUpForm.get('email').value;
        const token = this.verificationForm.get('verificationToken').value;

        this.authService.verifyRegistration(email, token)
          .subscribe((response: { message: string }) => {
            if (response.message !== 'SUCCESS') {
              this.processError(response.message);
            } else {
              this.currentFormState.setToLoginForm();
            }
          }, (error: HttpErrorResponse) => {
            this.processError(error.error?.message || error.message);
          });
      }
    }, 1000);
  }

  processError(message: string) {
    this.error.exists = true;
    if (errorMap.hasOwnProperty(message)) {
      this.error.message = errorMap[message];
    } else {
      this.error.message = message;
    }
  }

  ngOnDestroy() {
    this.authTokenSubscription.unsubscribe();
  }

}
