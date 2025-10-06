import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'football-academy-frontend';

  constructor(private authService: AuthService, private router: Router) {}

  isLoggedIn(): boolean {
    return !!this.authService.getAccessToken();
  }

  logout() {
    this.authService.clearTokens();
    this.router.navigate(['/login']);
  }
}
