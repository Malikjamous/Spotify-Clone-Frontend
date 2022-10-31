import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/Services/alert.service';
import { AuthService } from 'src/app/Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.css'],
})
export class AuthSigninComponent implements OnInit {
  isLoading = false;
  error: string = null;
  passwordForm: FormControl;
  emailForm: FormControl;
  constructor(private authService: AuthService, private alertService: AlertService, private router: Router) { }
  ngOnInit(): void { }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    let authObs: Observable<any>;

    this.isLoading = true;
    const email = form.value.email;
    const password = form.value.password;
    const passwordRepeated = form.value.passwordRepeated;
    if (passwordRepeated === password) {
      authObs = this.authService.signup(email, password);

      authObs.subscribe(
        (resData) => {
          this.isLoading = false;
          this.alertService.success('Registration successful', true);
          this.authService.login(email, password).subscribe(() => {
            this.router.navigate(['']);
          });
        },
        (errorMessage) => {
          this.error = errorMessage;
          this.isLoading = false;
        }
      );
    } else {
      this.error = 'password is not same in Repeat password';
      this.isLoading = false;
    }

    form.reset();
  }
}
