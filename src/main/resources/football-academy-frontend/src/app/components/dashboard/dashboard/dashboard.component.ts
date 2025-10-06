import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

   user: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const email = localStorage.getItem('email');
    if (!email) {
      alert('No user email found. Please log in again.');
      return;
    }
    this.userService.getUserByEmail(email).subscribe({
      next: (user) => (this.user = user),
      error: (err) => {
        const errorMessage = err.error || 'Failed to load user data';
        alert(`Error: ${errorMessage}`);
        console.error('Failed to load user data:', err);
      }
    });
  }

}
