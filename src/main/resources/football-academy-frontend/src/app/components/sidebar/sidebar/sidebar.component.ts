import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from 'src/app/models/user';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnDestroy {
  user$ = this.userStateService.user$;
  private destroy$ = new Subject<void>();

  constructor(private userStateService: UserStateService) {
    // Optional: Load from localStorage if not in memory
    const cached = localStorage.getItem('user');
    if (cached && !this.userStateService.getUser()) {
      this.userStateService.setUser(JSON.parse(cached));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
