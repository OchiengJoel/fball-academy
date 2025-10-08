import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Page } from 'src/app/models/page';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';

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

  page: Page<User> = {
    content: [],
    totalPages: 0,
    totalElements: 0,
    pageable: { pageNumber: 0, pageSize: 10 }
  };
  currentPage: number = 0;
  pageSize: number = 10;
  filterRole: string = '';
  kidIds: string = '';
  searchByKids: boolean = false;
  
  constructor(
    private userService: UserService,
    private  dialog: MatDialog
  ) {}

  // ngOnInit() {
  //   // Fetch users (requires an endpoint to list all users; not implemented in backend)
  //   this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
  //     next: (user) => (this.users = [user]), // Placeholder
  //   });
  // }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 0) {
    if (this.searchByKids && this.kidIds) {
      const kidIds = this.kidIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      this.userService.getUsersByKids(kidIds).subscribe({
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
    } else if (this.filterRole) {
      this.userService.getUsersByRole(this.filterRole, page, this.pageSize).subscribe({
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

  // createUser() {
  //   this.userService.createUser(this.user, true).subscribe({
  //     next: (newUser) => (this.users.push(newUser)),
  //   });
  // }

  createUser() {
    this.userService.createUser(this.user, true).subscribe({
      next: (newUser) => {
        this.users.push(newUser);
        this.loadUsers(this.currentPage);
        this.user = { userId: 0, firstName: '', lastName: '', email: '', phoneNumber: '', role: 'PARENT', createdAt: '', updatedAt: '' };
      },
      error: (err) => alert('Failed to create user: ' + (err.error || 'Unknown error'))
    });
  }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '500px',
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
    this.userService.exportUsers(format, this.filterRole || undefined).subscribe({
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
}