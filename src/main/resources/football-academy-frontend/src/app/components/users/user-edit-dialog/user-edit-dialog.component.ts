import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.css']
})
export class UserEditDialogComponent {

 editUserForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.editUserForm = this.fb.group({
      firstName: [data.user.firstName, [Validators.required]],
      lastName: [data.user.lastName, [Validators.required]],
      email: [data.user.email, [Validators.required, Validators.email]],
      phoneNumber: [data.user.phoneNumber, [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      role: [data.user.role, [Validators.required]],
      customPassword: ['']
    });
  }

  ngOnInit() {}

  save() {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    const updatedUser: User = {
      userId: this.data.user.userId,
      firstName: this.editUserForm.value.firstName,
      lastName: this.editUserForm.value.lastName,
      email: this.editUserForm.value.email,
      phoneNumber: this.editUserForm.value.phoneNumber,
      role: this.editUserForm.value.role,
      createdAt: this.data.user.createdAt,
      updatedAt: this.data.user.updatedAt
    };

    const customPassword = this.editUserForm.value.customPassword || undefined;

    this.userService.updateUser(this.data.user.userId, updatedUser, customPassword).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => alert('Failed to update user: ' + (err.error || 'Unknown error'))
    });
  }

  close() {
    this.dialogRef.close();
  }

  isValidPassword(password: string): boolean {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return !password || passwordPattern.test(password);
}
}
