import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { Kid } from 'src/app/models/kid';
import { KidRequest } from 'src/app/models/kid-request';
import { User } from 'src/app/models/user';
import { KidService } from 'src/app/services/kid.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-kid-edit-dialog',
  templateUrl: './kid-edit-dialog.component.html',
  styleUrls: ['./kid-edit-dialog.component.css']
})
export class KidEditDialogComponent implements OnInit {
  editKidForm: FormGroup;
  parents: User[] = [];
  recurrenceIntervals = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'];

  constructor(
    private dialogRef: MatDialogRef<KidEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { kid: Kid; feeSchedules: FeeSchedule[] },
    private kidService: KidService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.editKidForm = this.fb.group({
      parentId: [data.kid.parent.userId, [Validators.required]],
      firstName: [data.kid.firstName, [Validators.required]],
      lastName: [data.kid.lastName, [Validators.required]],
      dateOfBirth: [data.kid.dateOfBirth, [Validators.required]],
      enrollmentDate: [data.kid.enrollmentDate, [Validators.required]],
      feeDetails: this.fb.array([])
    });

    this.loadParents();
  }

  ngOnInit() {
    // Populate existing fee details if needed
  }

  get feeDetails(): FormArray {
    return this.editKidForm.get('feeDetails') as FormArray;
  }

  addFeeDetail() {
    const feeDetailForm = this.fb.group({
      feeScheduleId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      chargeType: ['', [Validators.required]],
      isOneOff: [false],
      isRecurring: [false],
      recurrenceInterval: [''],
      prorate: [false]
    });

    feeDetailForm.get('isOneOff')?.valueChanges.subscribe(value => {
      if (value) {
        feeDetailForm.get('isRecurring')?.setValue(false);
        feeDetailForm.get('chargeType')?.setValue('ONE_OFF');
        feeDetailForm.get('recurrenceInterval')?.setValue(null);
        feeDetailForm.get('prorate')?.setValue(false);
        feeDetailForm.get('recurrenceInterval')?.clearValidators();
      } else if (!feeDetailForm.get('isRecurring')?.value) {
        feeDetailForm.get('chargeType')?.setValue('');
      }
      feeDetailForm.get('recurrenceInterval')?.updateValueAndValidity();
    });

    feeDetailForm.get('isRecurring')?.valueChanges.subscribe(value => {
      if (value) {
        feeDetailForm.get('isOneOff')?.setValue(false);
        feeDetailForm.get('chargeType')?.setValue('RECURRING');
        feeDetailForm.get('recurrenceInterval')?.setValidators([Validators.required]);
      } else if (!feeDetailForm.get('isOneOff')?.value) {
        feeDetailForm.get('chargeType')?.setValue('');
      }
      feeDetailForm.get('recurrenceInterval')?.updateValueAndValidity();
    });

    feeDetailForm.get('chargeType')?.valueChanges.subscribe(value => {
      if (value === 'ONE_OFF') {
        feeDetailForm.get('isOneOff')?.setValue(true);
        feeDetailForm.get('isRecurring')?.setValue(false);
        feeDetailForm.get('recurrenceInterval')?.setValue(null);
        feeDetailForm.get('prorate')?.setValue(false);
        feeDetailForm.get('recurrenceInterval')?.clearValidators();
      } else if (value === 'RECURRING') {
        feeDetailForm.get('isOneOff')?.setValue(false);
        feeDetailForm.get('isRecurring')?.setValue(true);
        feeDetailForm.get('recurrenceInterval')?.setValidators([Validators.required]);
      }
      feeDetailForm.get('recurrenceInterval')?.updateValueAndValidity();
    });

    this.feeDetails.push(feeDetailForm);
  }

  toggleChargeType(index: number, type: string, event: Event) {
    const feeDetailForm = this.feeDetails.at(index) as FormGroup;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      feeDetailForm.get('chargeType')?.setValue(type);
      feeDetailForm.get(type === 'ONE_OFF' ? 'isOneOff' : 'isRecurring')?.setValue(true);
      feeDetailForm.get(type === 'ONE_OFF' ? 'isRecurring' : 'isOneOff')?.setValue(false);
    } else {
      feeDetailForm.get('chargeType')?.setValue('');
      feeDetailForm.get(type === 'ONE_OFF' ? 'isOneOff' : 'isRecurring')?.setValue(false);
    }
  }

  removeFeeDetail(index: number) {
    this.feeDetails.removeAt(index);
  }

  loadParents() {
    this.userService.getParentUsers().subscribe({
      next: (parents) => (this.parents = parents),
      error: (err) => alert('Failed to load parents: ' + (err.error || 'Unknown error'))
    });
  }

  save() {
    if (this.editKidForm.invalid) {
      this.editKidForm.markAllAsTouched();
      return;
    }

    const kidRequest: KidRequest = {
      parentId: this.editKidForm.value.parentId,
      firstName: this.editKidForm.value.firstName,
      lastName: this.editKidForm.value.lastName,
      dateOfBirth: this.editKidForm.value.dateOfBirth,
      enrollmentDate: this.editKidForm.value.enrollmentDate,
      feeDetails: this.editKidForm.value.feeDetails.map((detail: any) => ({
        feeScheduleId: detail.feeScheduleId,
        amount: detail.amount,
        chargeType: detail.chargeType,
        recurrenceInterval: detail.recurrenceInterval,
        prorate: detail.prorate
      }))
    };

    this.kidService.updateKid(this.data.kid.kidId, kidRequest).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => alert('Failed to update kid: ' + (err.error || 'Unknown error'))
    });
  }

  close() {
    this.dialogRef.close();
  }
}