import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, AuthResponseData } from '../../Services/auth.service';
import { AlertService } from '../../Services/alert.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.css'],
})
export class AuthComponent {
  isLoading = false;
  error: string = null;
  constructor(private authService: AuthService, private router: Router, private alertService: AlertService) { }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    let authObs: Observable<any>;

    this.isLoading = true;

    authObs = this.authService.login(email, password);

    authObs.subscribe(
      (resData) => {
        this.isLoading = false;
        this.router.navigate(['']);
      },
      (errorMessage) => {
        this.error = errorMessage;
        this.isLoading = false;
      }
    );

    form.reset();
  }
}
