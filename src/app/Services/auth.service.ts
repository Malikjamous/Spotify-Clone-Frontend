import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';

export interface AuthResponseData {
  exp: number;
  email: string;
  userId: string;
  token: string;
  userRole: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private router: Router, private alertService: AlertService) { }
  signup(email: string, password: string): Observable<AuthResponseData> {
    return this.http
      .post<AuthResponseData>('http://localhost:8080/api/user/signup', {
        email,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http
      .post<any>('http://localhost:8080/api/user/login', {
        email,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          // console.log(resData, 'hhhhh');
          const decodedToken = this.parseJwt(resData.token);
          this.handleAuthentication(decodedToken.email, +decodedToken.userId, resData.token, decodedToken.exp, resData.user.userRole);
        })
      );
  }

  autoLogin(): void {
    const userData: {
      email: string;
      userId: number;
      token: string;
      tokenExpirationDate: number;
      userRole: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    this.handleAuthentication(userData.email, userData.userId, userData.token, userData.tokenExpirationDate, userData.userRole);
  }

  logout(): void {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    this.alertService.success('logout is successful', true);
  }

  authUser(): boolean {
    let isUserAuth = false;
    const lastLoggedUser = this.user.getValue();
    if (!lastLoggedUser) {
      this.logout();
    }
    const isAuth = !!lastLoggedUser;
    const now = new Date();
    const expiryDate = new Date(lastLoggedUser.tokenExpirationDate * 1000);
    if (isAuth && expiryDate > now) {
      isUserAuth = true;
    } else {
      this.logout();
    }
    return isUserAuth;
  }

  private handleAuthentication(email: string, userId: number, token: string, expiresIn: number, userRole: string): void {
    const user = new User(email, userId, token, expiresIn, userRole);
    this.user.next(user);
    localStorage.setItem(
      'userData',
      JSON.stringify(
        user,
      )
    );
  }

  private handleError(errorRes: HttpErrorResponse): Observable<AuthResponseData> {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error.message) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.message) {
      case 'Mail exists':
        errorMessage = 'This email exists already';
        break;
      case 'Auth failed':
        errorMessage = 'password or email is not correct.';
        break;
      case 'token is expired':
        this.router.navigate(['/auth']);
        errorMessage = 'auth failed';
        break;
    }
    return throwError(errorMessage);
  }
  parseJwt(token: string): AuthResponseData {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }
}
