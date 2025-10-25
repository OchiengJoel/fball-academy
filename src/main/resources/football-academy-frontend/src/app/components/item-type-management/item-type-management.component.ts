import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator } from '@angular/material/paginator';
import { ItemTypeService } from 'src/app/services/item-type.service';
import { ToastrService } from 'ngx-toastr';
import { ItemType } from 'src/app/models/item-type';

@Component({
  selector: 'app-item-type-management',
  templateUrl: './item-type-management.component.html',
  styleUrls: ['./item-type-management.component.css']
})
export class ItemTypeManagementComponent implements OnInit {
    displayedColumns: string[] = ['name', 'description', 'actions'];
    dataSource = new MatTableDataSource<ItemType>([]);
    itemTypeForm: FormGroup;
    editingItemType: ItemType | null = null;
    loading: boolean = false;
    error: string | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private itemTypeService: ItemTypeService,
        private fb: FormBuilder,
        private toastr: ToastrService
    ) {
        this.itemTypeForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: ['']
        });
    }

    ngOnInit() {
        this.loadItemTypes();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    loadItemTypes() {
        this.loading = true;
        this.itemTypeService.getAllItemTypes().subscribe({
            next: (itemTypes) => {
                this.dataSource.data = itemTypes;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load item types: ' + (err.error?.message || 'Unknown error');
                this.toastr.error(this.error, 'Error');
                this.loading = false;
            }
        });
    }

    submitForm() {
        if (this.itemTypeForm.invalid) {
            this.itemTypeForm.markAllAsTouched();
            this.toastr.warning('Please fill out all required fields.', 'Warning');
            return;
        }
        this.loading = true;
        const itemType: ItemType = this.itemTypeForm.value;
        if (this.editingItemType) {
            this.itemTypeService.updateItemType(this.editingItemType.id, itemType).subscribe({
                next: () => {
                    this.toastr.success('Item type updated successfully!', 'Success');
                    this.loadItemTypes();
                    this.resetForm();
                },
                error: (err) => {
                    this.error = 'Failed to update item type: ' + (err.error?.message || 'Unknown error');
                    this.toastr.error(this.error, 'Error');
                    this.loading = false;
                }
            });
        } else {
            this.itemTypeService.createItemType(itemType).subscribe({
                next: () => {
                    this.toastr.success('Item type created successfully!', 'Success');
                    this.loadItemTypes();
                    this.resetForm();
                },
                error: (err) => {
                    this.error = 'Failed to create item type: ' + (err.error?.message || 'Unknown error');
                    this.toastr.error(this.error, 'Error');
                    this.loading = false;
                }
            });
        }
    }

    editItemType(itemType: ItemType) {
        this.editingItemType = itemType;
        this.itemTypeForm.patchValue(itemType);
    }

    deleteItemType(id: number) {
        if (confirm('Are you sure you want to delete this item type?')) {
            this.loading = true;
            this.itemTypeService.deleteItemType(id).subscribe({
                next: () => {
                    this.toastr.success('Item type deleted successfully!', 'Success');
                    this.loadItemTypes();
                },
                error: (err) => {
                    this.error = 'Failed to delete item type: ' + (err.error?.message || 'Unknown error');
                    this.toastr.error(this.error, 'Error');
                    this.loading = false;
                }
            });
        }
    }

    resetForm() {
        this.itemTypeForm.reset();
        this.editingItemType = null;
        this.error = null;
    }
}