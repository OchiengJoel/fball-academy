import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.css']
})
export class UserEditDialogComponent {

  customPassword: string = '';

  constructor(
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private userService: UserService
  ) {}

  save() {
    this.userService.updateUser(this.data.user.userId, this.data.user, this.customPassword || undefined).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => alert('Failed to update user: ' + (err.error || 'Unknown error'))
    });
  }

  close() {
    this.dialogRef.close();
  }

}
