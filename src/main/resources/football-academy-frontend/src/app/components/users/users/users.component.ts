import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit{

  users: User[] = [];
  user: User = {
    userId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'PARENT',
    createdAt: '',
    updatedAt: '',
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Fetch users (requires an endpoint to list all users; not implemented in backend)
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => (this.users = [user]), // Placeholder
    });
  }

  createUser() {
    this.userService.createUser(this.user, true).subscribe({
      next: (newUser) => (this.users.push(newUser)),
    });
  }

}
