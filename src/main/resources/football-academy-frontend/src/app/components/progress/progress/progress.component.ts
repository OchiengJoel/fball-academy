import { Component, OnInit } from '@angular/core';
import { Kid } from 'src/app/models/kid';
import { Page } from 'src/app/models/page';
import { Progress } from 'src/app/models/progress';
import { User } from 'src/app/models/user';
import { KidService } from 'src/app/services/kid.service';
import { ProgressService } from 'src/app/services/progress.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

  progressPage: Page<Progress> = { content: [], pageable: { pageNumber: 0, pageSize: 10 }, totalElements: 0, totalPages: 0 };
  kids: Kid[] = [];
  user: User | null = null;
  selectedKidId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  pageable = { pageNumber: 0, pageSize: 10 };
  totalPages: number = 0;
  pages: number[] = [];
  progress: Progress = { 
    progressId: 0,
    kid: { kidId: 0 } as Kid, 
    date: '', 
    createdAt: '' };

  constructor(
    private progressService: ProgressService, 
    private kidService: KidService, 
    private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.kidService.getKidsByParent(user.userId).subscribe({
          next: (kids) => (this.kids = kids),
        });
      },
    });
  }

  addProgress() {
    this.progressService.addProgress(this.progress).subscribe({
      next: () => this.loadProgress(),
    });
  }

  loadProgress() {
    if (this.selectedKidId && this.startDate && this.endDate) {
      this.progressService.getProgressForKid(this.selectedKidId, this.startDate, this.endDate, this.pageable.pageNumber, this.pageable.pageSize).subscribe({
        next: (page) => {
          this.progressPage = page;
          this.totalPages = page.totalPages;
          this.pages = Array.from({ length: page.totalPages }, (_, i) => i);
        },
      });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageable.pageNumber = page;
      this.loadProgress();
    }
  }

}
