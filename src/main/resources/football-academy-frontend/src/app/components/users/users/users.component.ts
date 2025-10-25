import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Page } from 'src/app/models/page';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  createUserForm: FormGroup;
  searchUsersForm: FormGroup;
  page: Page<User> = {
    content: [],
    totalPages: 0,
    totalElements: 0,
    pageable: { pageNumber: 0, pageSize: 10 }
  };
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      role: ['PARENT', [Validators.required]],
      password: ['']
      // password: ['', [Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]]
    });

    this.searchUsersForm = this.fb.group({
      filterRole: [''],
      kidIds: [''],
      searchByKids: [false]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 0) {
    const { filterRole, kidIds, searchByKids } = this.searchUsersForm.value;

    if (searchByKids && kidIds) {
      const kidIdArray = kidIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
      this.userService.getUsersByKids(kidIdArray).subscribe({
        next: (users) => {
          this.users = users;
          this.page = {
            content: users,
            totalPages: 1,
            totalElements: users.length,
            pageable: { pageNumber: 0, pageSize: users.length }
          };
        },
        error: (err) => alert('Failed to load users by kids: ' + (err.error || 'Unknown error'))
      });
    } else if (filterRole) {
      this.userService.getUsersByRole(filterRole, page, this.pageSize).subscribe({
        next: (page) => {
          this.page = page;
          this.users = page.content;
          this.currentPage = page.pageable.pageNumber;
        },
        error: (err) => alert('Failed to load users: ' + (err.error || 'Unknown error'))
      });
    } else {
      this.userService.getAllUsers(page, this.pageSize).subscribe({
        next: (page) => {
          this.page = page;
          this.users = page.content;
          this.currentPage = page.pageable.pageNumber;
        },
        error: (err) => alert('Failed to load users: ' + (err.error || 'Unknown error'))
      });
    }
  }

  createUser() {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    const user: User = {
      userId: 0,
      firstName: this.createUserForm.value.firstName,
      lastName: this.createUserForm.value.lastName,
      email: this.createUserForm.value.email,
      phoneNumber: this.createUserForm.value.phoneNumber,
      role: this.createUserForm.value.role,
      createdAt: '',
      updatedAt: ''
    };

    const customPassword = this.createUserForm.value.password || undefined;

    this.userService.createUser(user, true, customPassword).subscribe({
      next: () => {
        this.loadUsers(this.currentPage);
        this.createUserForm.reset({ role: 'PARENT', password: '' });
      },
      error: (err) => alert('Failed to create user: ' + (err.error || 'Unknown error'))
    });
  }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container', // Custom class for centering
      data: { user: { ...user } }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(this.currentPage);
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => this.loadUsers(this.currentPage),
        error: (err) => alert('Failed to delete user: ' + (err.error || 'Unknown error'))
      });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.page.totalPages) {
      this.loadUsers(page);
    }
  }

  exportUsers(format: 'pdf' | 'excel') {
    const { filterRole } = this.searchUsersForm.value;
    this.userService.exportUsers(format, filterRole || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to export users: ' + (err.error || 'Unknown error'))
    });
  }

  isValidPassword(password: string): boolean {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return !password || passwordPattern.test(password);
  }
}