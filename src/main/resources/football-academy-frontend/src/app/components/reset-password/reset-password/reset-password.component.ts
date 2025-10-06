import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordResetConfirmRequest } from 'src/app/models/password-reset-confirm-request';
import { PasswordResetRequest } from 'src/app/models/password-reset-request';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetRequest: PasswordResetRequest = { email: '' };
  confirmRequest: PasswordResetConfirmRequest = { token: '', newPassword: '' };
  token: string | null = null;

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) {
      this.confirmRequest.token = this.token;
    }
  }

  requestReset() {
    this.authService.requestPasswordReset(this.resetRequest).subscribe({
      next: () => alert('Password reset link sent to your email.'),
      error: (err) => alert('Error: ' + err.error),
    });
  }

  resetPassword() {
    this.authService.resetPassword(this.confirmRequest).subscribe({
      next: () => {
        alert('Password reset successfully. Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => alert('Error: ' + err.error),
    });
  }

}
