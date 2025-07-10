export class User {
  UserId: number;
  Name: string;
  PasswordHash: string;
  
  constructor(UserId, Name, PasswordHash) {
    this.UserId = UserId;
    this.Name = Name;
    this.PasswordHash = PasswordHash;
  }
}