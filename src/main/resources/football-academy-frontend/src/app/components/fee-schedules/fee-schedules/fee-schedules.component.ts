import { Component, OnInit } from '@angular/core';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { User } from 'src/app/models/user';
import { FeeScheduleService } from 'src/app/services/fee-schedule.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-fee-schedules',
  templateUrl: './fee-schedules.component.html',
  styleUrls: ['./fee-schedules.component.css']
})
export class FeeSchedulesComponent implements OnInit{
  
  feeSchedules: FeeSchedule[] = [];
  feeSchedule: FeeSchedule = {
    feeScheduleId: 0,
    description: '',
    amount: 0,
    type: 'ONE_OFF',
    createdAt: '',
    updatedAt: '',
  };
  user: User | null = null;

  constructor(
    private feeScheduleService: FeeScheduleService, 
    private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadFeeSchedules();
      },
    });
  }

  createFeeSchedule() {
    this.feeScheduleService.createFeeSchedule(this.feeSchedule).subscribe({
      next: () => this.loadFeeSchedules(),
    });
  }

  loadFeeSchedules() {
    this.feeScheduleService.getActiveFeeSchedules(new Date().toISOString().split('T')[0]).subscribe({
      next: (schedules) => (this.feeSchedules = schedules),
    });
  }

}
