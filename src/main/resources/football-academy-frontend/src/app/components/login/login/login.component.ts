import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from 'src/app/models/login-request';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

   loginRequest: LoginRequest = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.authService.storeTokens(response);
        // Fetch user data to get email
        this.authService.getCurrentUser(this.loginRequest.email).subscribe({
          next: (user) => {
            localStorage.setItem('email', user.email);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Failed to fetch user data:', err);
            alert('Login succeeded, but failed to fetch user data.');
          },
        });
      },
      error: (err) => {
        let errorMessage = 'An error occurred during login. Please try again.';
        if (err.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
        } else if (err.error) {
          errorMessage = err.error || 'Invalid email or password';
        }
        alert('Login failed: ' + errorMessage);
        console.error('Login error:', err);
      },
    });
  }

}
