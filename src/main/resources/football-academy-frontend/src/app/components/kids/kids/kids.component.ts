import { Component } from '@angular/core';
import { Kid } from 'src/app/models/kid';
import { KidRequest } from 'src/app/models/kid-request';
import { User } from 'src/app/models/user';
import { KidService } from 'src/app/services/kid.service';
import { UserService } from 'src/app/services/user.service';
import { KidDetailsDialogComponent } from '../kid-details-dialog/kid-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-kids',
  templateUrl: './kids.component.html',
  styleUrls: ['./kids.component.css']
})
export class KidsComponent {

  kids: Kid[] = [];
  kidRequest: KidRequest = { parentId: 0, firstName: '', lastName: '', dateOfBirth: '', feeScheduleIds: [] };
  user: User | null = null;

  constructor(
    private kidService: KidService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadKids();
      },
      error: (err) => alert('Failed to load user: ' + (err.error || 'Unknown error'))
    });
  }

  loadKids() {
    this.kidService.getKidsByParent(this.user!.userId).subscribe({
      next: (kids) => (this.kids = kids),
      error: (err) => alert('Failed to load kids: ' + (err.error || 'Unknown error'))
    });
  }

  addKid() {
    this.kidService.addKid(this.kidRequest).subscribe({
      next: () => {
        this.loadKids();
        this.kidRequest = { parentId: 0, firstName: '', lastName: '', dateOfBirth: '', feeScheduleIds: [] };
      },
      error: (err) => alert('Failed to add kid: ' + (err.error || 'Unknown error'))
    });
  }

  updateStatus(kid: Kid) {
    this.kidService.updateKidStatus(kid.kidId, kid.status).subscribe({
      next: () => this.loadKids(),
      error: (err) => alert('Failed to update status: ' + (err.error || 'Unknown error'))
    });
  }

  openDetailsDialog(kid: Kid) {
    this.dialog.open(KidDetailsDialogComponent, {
      width: '800px',
      data: { kid }
    });
  }

}
