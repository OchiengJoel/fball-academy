
import { Component, OnInit } from '@angular/core';
import { Kid } from 'src/app/models/kid';
import { Statement } from 'src/app/models/statement';
import { User } from 'src/app/models/user';
import { KidService } from 'src/app/services/kid.service';
import { StatementService } from 'src/app/services/statement.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.css']
})
export class StatementsComponent implements OnInit {
  statement: { kidId: number; periodStart: string; periodEnd: string; includeDetails: boolean } = {
    kidId: 0,
    periodStart: '',
    periodEnd: '',
    includeDetails: false,
  };
  statementResult: Statement | null = null;
  kids: Kid[] = [];
  user: User | null = null;

  constructor(
    private statementService: StatementService, 
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

  generateStatement() {
    this.statementService
      .generateStatement(this.statement.kidId, this.statement.periodStart, this.statement.periodEnd, this.statement.includeDetails)
      .subscribe({
        next: (statement) => (this.statementResult = statement),
      });
  }
}
