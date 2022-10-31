export class User {
  constructor(public email: string, public userId: number, public token: string, public tokenExpirationDate: number, public userRole: string) { }
}
